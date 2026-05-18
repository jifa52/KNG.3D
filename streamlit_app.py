"""3D Project Tracker — Streamlit + SQLite (projects + printed parts / filament log)."""

from __future__ import annotations

import html
import re
import sqlite3
import uuid
from datetime import date, datetime
from io import BytesIO
from pathlib import Path
from typing import Any

import streamlit as st

DB_PATH = Path(__file__).resolve().parent / "filament_usage.db"

STATUSES = ("Planned", "Queue", "WIP", "Done")
MATERIAL_PRESETS = ("PLA", "PETG", "ABS", "TPU")
STATUS_BADGE: dict[str, tuple[str, str]] = {
    "Planned": ("#9e9e9e", "#121212"),
    "Queue": ("#fdd835", "#121212"),
    "WIP": ("#7e57c2", "#f5f5f5"),
    "Done": ("#43a047", "#f5f5f5"),
}

PART_FORM_KEYS = (
    "fm_part_name",
    "fm_brand",
    "fm_material",
    "fm_color",
    "fm_quantity",
    "fm_hours",
    "fm_minutes",
    "fm_description",
    "fm_image",
    "fm_stl",
)


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def migrate_legacy(c: sqlite3.Cursor) -> None:
    cur = c.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='entries'"
    )
    if not cur.fetchone():
        return
    cur = c.execute("SELECT COUNT(*) FROM parts")
    if cur.fetchone()[0] > 0:
        c.execute("DROP TABLE IF EXISTS entries")
        return

    pid = str(uuid.uuid4())
    now = datetime.now().timestamp()
    today = date.today().isoformat()
    c.execute(
        """
        INSERT INTO projects (
            id, name, notes, status, started_date, ended_date, created_at, updated_at,
            opened_by_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            pid,
            "Imported filament log",
            "Migrated from the previous single-table filament log.",
            "Done",
            today,
            today,
            now,
            now,
            "You",
        ),
    )
    for row in c.execute("SELECT * FROM entries").fetchall():
        d = dict(row)
        desc = (d.get("description") or "").strip()
        part_name = (desc.split("\n")[0][:120] if desc else "") or "Imported part"
        c.execute(
            """
            INSERT INTO parts (
                id, project_id, part_name, brand, material_type, color_hex, description,
                quantity_grams, print_time_minutes, created_at, updated_at,
                image_blob, image_name, stl_blob, stl_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                d["id"],
                pid,
                part_name,
                d["brand"],
                d["material_type"],
                d["color_hex"],
                d.get("description") or "",
                d["quantity_grams"],
                d["print_time_minutes"],
                d["created_at"],
                d["updated_at"],
                d.get("image_blob"),
                d.get("image_name"),
                d.get("stl_blob"),
                d.get("stl_name"),
            ),
        )
    c.execute("DROP TABLE entries")


def _table_columns(c: sqlite3.Cursor, table: str) -> set[str]:
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", table):
        raise ValueError("invalid table name")
    cur = c.execute(f"PRAGMA table_info({table})")
    return {str(r[1]) for r in cur.fetchall()}


def ensure_project_profile_columns(c: sqlite3.Cursor) -> None:
    cols = _table_columns(c, "projects")
    if "opened_by_name" not in cols:
        c.execute("ALTER TABLE projects ADD COLUMN opened_by_name TEXT")
    if "opened_by_avatar" not in cols:
        c.execute("ALTER TABLE projects ADD COLUMN opened_by_avatar BLOB")
    if "opened_by_avatar_name" not in cols:
        c.execute("ALTER TABLE projects ADD COLUMN opened_by_avatar_name TEXT")


def init_db() -> None:
    with _conn() as c:
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'Planned',
                started_date TEXT NOT NULL,
                ended_date TEXT,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                opened_by_name TEXT,
                opened_by_avatar BLOB,
                opened_by_avatar_name TEXT
            )
            """
        )
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS parts (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                part_name TEXT NOT NULL,
                brand TEXT NOT NULL,
                material_type TEXT NOT NULL,
                color_hex TEXT NOT NULL,
                description TEXT,
                quantity_grams REAL NOT NULL,
                print_time_minutes INTEGER NOT NULL,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                image_blob BLOB,
                image_name TEXT,
                stl_blob BLOB,
                stl_name TEXT,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
            """
        )
        ensure_project_profile_columns(c)
        migrate_legacy(c)
        c.execute(
            "UPDATE projects SET opened_by_name = 'You' WHERE opened_by_name IS NULL OR TRIM(opened_by_name) = ''"
        )
        c.commit()


def list_projects() -> list[dict[str, Any]]:
    with _conn() as c:
        cur = c.execute(
            """
            SELECT p.*,
                   (SELECT COUNT(*) FROM parts x WHERE x.project_id = p.id) AS part_count,
                   (SELECT COALESCE(SUM(quantity_grams), 0) FROM parts x WHERE x.project_id = p.id) AS total_grams
            FROM projects p
            ORDER BY p.updated_at DESC, p.id DESC
            """
        )
        return [dict(r) for r in cur.fetchall()]


def get_project(project_id: str) -> dict[str, Any] | None:
    with _conn() as c:
        cur = c.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def upsert_project(row: dict[str, Any]) -> None:
    row = dict(row)
    row.setdefault("opened_by_name", "You")
    if "opened_by_avatar" not in row:
        row["opened_by_avatar"] = None
    if "opened_by_avatar_name" not in row:
        row["opened_by_avatar_name"] = None
    with _conn() as c:
        c.execute(
            """
            INSERT INTO projects (
                id, name, notes, status, started_date, ended_date, created_at, updated_at,
                opened_by_name, opened_by_avatar, opened_by_avatar_name
            ) VALUES (
                :id, :name, :notes, :status, :started_date, :ended_date, :created_at, :updated_at,
                :opened_by_name, :opened_by_avatar, :opened_by_avatar_name
            )
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                notes = excluded.notes,
                status = excluded.status,
                started_date = excluded.started_date,
                ended_date = excluded.ended_date,
                updated_at = excluded.updated_at,
                opened_by_name = excluded.opened_by_name,
                opened_by_avatar = excluded.opened_by_avatar,
                opened_by_avatar_name = excluded.opened_by_avatar_name
            """,
            row,
        )


def delete_project(project_id: str) -> None:
    with _conn() as c:
        c.execute("DELETE FROM projects WHERE id = ?", (project_id,))


def list_parts(project_id: str) -> list[dict[str, Any]]:
    with _conn() as c:
        cur = c.execute(
            "SELECT * FROM parts WHERE project_id = ? ORDER BY created_at DESC, id DESC",
            (project_id,),
        )
        return [dict(r) for r in cur.fetchall()]


def get_part(part_id: str) -> dict[str, Any] | None:
    with _conn() as c:
        cur = c.execute("SELECT * FROM parts WHERE id = ?", (part_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def upsert_part(row: dict[str, Any]) -> None:
    with _conn() as c:
        c.execute(
            """
            INSERT INTO parts (
                id, project_id, part_name, brand, material_type, color_hex, description,
                quantity_grams, print_time_minutes, created_at, updated_at,
                image_blob, image_name, stl_blob, stl_name
            ) VALUES (
                :id, :project_id, :part_name, :brand, :material_type, :color_hex, :description,
                :quantity_grams, :print_time_minutes, :created_at, :updated_at,
                :image_blob, :image_name, :stl_blob, :stl_name
            )
            ON CONFLICT(id) DO UPDATE SET
                part_name = excluded.part_name,
                brand = excluded.brand,
                material_type = excluded.material_type,
                color_hex = excluded.color_hex,
                description = excluded.description,
                quantity_grams = excluded.quantity_grams,
                print_time_minutes = excluded.print_time_minutes,
                updated_at = excluded.updated_at,
                image_blob = excluded.image_blob,
                image_name = excluded.image_name,
                stl_blob = excluded.stl_blob,
                stl_name = excluded.stl_name
            """,
            row,
        )


def delete_part(part_id: str) -> None:
    with _conn() as c:
        c.execute("DELETE FROM parts WHERE id = ?", (part_id,))


def touch_project_updated(project_id: str) -> None:
    with _conn() as c:
        c.execute(
            "UPDATE projects SET updated_at = ? WHERE id = ?",
            (datetime.now().timestamp(), project_id),
        )


def unique_brands_for_project(project_id: str) -> list[str]:
    parts = list_parts(project_id)
    brands = {p["brand"] for p in parts if p.get("brand")}
    return sorted(brands, key=str.lower)


def format_grams(n: float | int) -> str:
    v = float(n)
    if v >= 100:
        s = f"{v:.0f}"
    else:
        s = f"{v:.1f}".rstrip("0").rstrip(".")
    return f"{s} g"


def format_duration(total_minutes: int) -> str:
    m = max(0, int(total_minutes or 0))
    h, mm = divmod(m, 60)
    if h == 0:
        return f"{mm} min"
    if mm == 0:
        return f"{h} h"
    return f"{h} h {mm} min"


def safe_hex_color(value: Any) -> str:
    hx = str(value or "").strip()
    if re.fullmatch(r"#[0-9A-Fa-f]{6}", hx):
        return hx
    m = re.fullmatch(r"#([0-9A-Fa-f]{3})", hx)
    if m:
        a, b, c = m.group(1)
        return f"#{a}{a}{b}{b}{c}{c}".lower()
    return "#888888"


def status_badge_html(status: str) -> str:
    stt = status if status in STATUS_BADGE else "Planned"
    bg, fg = STATUS_BADGE[stt]
    return (
        f"<span style='display:inline-block;padding:0.2rem 0.55rem;border-radius:999px;"
        f"font-size:0.78rem;font-weight:700;background:{bg};color:{fg};"
        f"border:1px solid rgba(0,0,0,0.25);'>{stt}</span>"
    )


def filter_parts(parts: list[dict[str, Any]], q: str) -> list[dict[str, Any]]:
    q = (q or "").strip().lower()
    if not q:
        return parts

    def hay(p: dict[str, Any]) -> str:
        parts_ = [
            str(p.get("part_name") or ""),
            str(p.get("brand") or ""),
            str(p.get("material_type") or ""),
            str(p.get("description") or ""),
            str(p.get("color_hex") or ""),
        ]
        return " ".join(parts_).lower()

    return [p for p in parts if q in hay(p)]


def clear_part_form_state() -> None:
    for k in PART_FORM_KEYS:
        if k in st.session_state:
            del st.session_state[k]
    st.session_state.edit_part_id = None
    st.session_state._last_synced_part = None


def apply_part_row_to_form(row: dict[str, Any]) -> None:
    st.session_state.fm_part_name = row["part_name"]
    st.session_state.fm_brand = row["brand"]
    st.session_state.fm_material = row["material_type"]
    hexv = row["color_hex"] or "#6366f1"
    if not str(hexv).startswith("#"):
        hexv = f"#{hexv}"
    st.session_state.fm_color = hexv
    st.session_state.fm_quantity = float(row["quantity_grams"])
    total = int(row["print_time_minutes"] or 0)
    st.session_state.fm_hours = total // 60
    st.session_state.fm_minutes = total % 60
    st.session_state.fm_description = row["description"] or ""
    if "fm_image" in st.session_state:
        del st.session_state.fm_image
    if "fm_stl" in st.session_state:
        del st.session_state.fm_stl


def inject_css() -> None:
    st.markdown(
        """
        <style>
          :root {
            --saas-border: #e2e8f0;
            --saas-border-strong: #cbd5e1;
            --saas-muted: #64748b;
            --saas-muted-2: #94a3b8;
            --saas-surface: #ffffff;
            --saas-indigo: #4338ca;
            --saas-indigo-hover: #3730a3;
            --saas-slate-700: #334155;
          }
          .block-container {
            padding-top: 1.5rem;
            max-width: 1180px;
          }
          h1 {
            letter-spacing: -0.035em;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.15rem;
            font-size: 2rem;
          }
          .saas-page-lead {
            margin: 0 0 1.35rem 0;
            color: var(--saas-muted);
            font-size: 0.95rem;
            line-height: 1.5;
          }
          .saas-section-title {
            margin: 0 0 0.35rem 0;
            font-size: 1.15rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.02em;
          }
          .saas-section-hint {
            margin: 0 0 1rem 0;
            color: var(--saas-muted-2);
            font-size: 0.82rem;
            line-height: 1.45;
          }
          /* Stats — equal visual weight, strict card grid */
          div[data-testid="stMetric"] {
            background: var(--saas-surface);
            border: 1px solid var(--saas-border);
            border-radius: 12px;
            padding: 1rem 1.2rem 1.15rem;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
            min-height: 5.5rem;
            box-sizing: border-box;
          }
          div[data-testid="stMetric"] label {
            color: var(--saas-muted) !important;
            font-size: 0.72rem !important;
            font-weight: 600 !important;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          div[data-testid="stMetricValue"] {
            font-weight: 700 !important;
            font-size: 1.55rem !important;
            color: #0f172a !important;
            letter-spacing: -0.02em;
          }
          /* Primary CTA — deep indigo (not red) */
          button[data-testid="baseButton-primary"] {
            background-color: var(--saas-indigo) !important;
            border-color: var(--saas-indigo-hover) !important;
            color: #f8fafc !important;
            font-weight: 600 !important;
            border-radius: 10px !important;
            padding: 0.5rem 1.1rem !important;
          }
          button[data-testid="baseButton-primary"]:hover {
            background-color: var(--saas-indigo-hover) !important;
            border-color: #312e81 !important;
            color: #ffffff !important;
          }
          /* Secondary / neutral — industrial slate */
          button[data-testid="baseButton-secondary"] {
            background-color: #f8fafc !important;
            color: var(--saas-slate-700) !important;
            border: 1px solid var(--saas-border-strong) !important;
            font-weight: 600 !important;
            border-radius: 10px !important;
            padding: 0.5rem 1rem !important;
          }
          button[data-testid="baseButton-secondary"]:hover {
            background-color: #e2e8f0 !important;
            border-color: #94a3b8 !important;
            color: #0f172a !important;
          }
          /* Project & selection cards */
          div[data-testid="stVerticalBlockBorderWrapper"] {
            background: var(--saas-surface) !important;
            border: 1px solid var(--saas-border) !important;
            border-radius: 14px !important;
            padding: 1.15rem 1.3rem 1.25rem !important;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
            margin-bottom: 0.85rem;
          }
          .saas-grid-head {
            display: grid;
            grid-template-columns: 2fr 1.05fr 0.95fr 1.15fr 0.95fr 1.1fr;
            gap: 10px;
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: #94a3b8;
            margin: 0 0 12px 0;
            background: #f8fafc;
            border-radius: 10px;
            padding: 10px 12px;
            border: 1px solid var(--saas-border);
            box-sizing: border-box;
          }
          p.saas-project-title {
            margin: 0 0 0.35rem 0;
            font-size: 1.08rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.02em;
            line-height: 1.25;
          }
          p.saas-meta-notes {
            margin: 0;
            font-size: 0.8rem;
            color: var(--saas-muted);
            line-height: 1.4;
          }
          p.saas-meta-dim {
            margin: 0;
            font-size: 0.78rem;
            color: var(--saas-muted-2);
            font-weight: 500;
          }
          p.saas-meta-strong {
            margin: 0;
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--saas-muted);
          }
          div[data-testid="stMultiSelect"] {
            margin-bottom: 1rem !important;
          }
          div[data-testid="stMultiSelect"] label p {
            font-size: 0.78rem !important;
            font-weight: 600 !important;
            color: var(--saas-muted) !important;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .hint {
            color: var(--saas-muted) !important;
            font-size: 0.85rem;
            margin-top: -0.35rem;
          }
          h2.saas-h2-project {
            margin: 0 0 0.35rem 0;
            font-size: 1.65rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            color: #0f172a;
          }
          /* Status popover trigger — Tailwind palette parity:
             Planned: bg-slate-100 text-slate-700 | Queue: bg-yellow-100 text-yellow-800
             WIP: bg-purple-100 text-purple-800 | Done: bg-green-100 text-green-800 */
          div[data-testid="stVerticalBlockBorderWrapper"]:has(span.proj-status-anchor.proj-status-Planned)
            [data-testid="stPopover"] button {
            background-color: #f1f5f9 !important;
            color: #334155 !important;
            border-color: #e2e8f0 !important;
          }
          div[data-testid="stVerticalBlockBorderWrapper"]:has(span.proj-status-anchor.proj-status-Queue)
            [data-testid="stPopover"] button {
            background-color: #fef9c3 !important;
            color: #854d0e !important;
            border-color: #fde047 !important;
          }
          div[data-testid="stVerticalBlockBorderWrapper"]:has(span.proj-status-anchor.proj-status-WIP)
            [data-testid="stPopover"] button {
            background-color: #f3e8ff !important;
            color: #6b21a8 !important;
            border-color: #e9d5ff !important;
          }
          div[data-testid="stVerticalBlockBorderWrapper"]:has(span.proj-status-anchor.proj-status-Done)
            [data-testid="stPopover"] button {
            background-color: #dcfce7 !important;
            color: #166534 !important;
            border-color: #bbf7d0 !important;
          }
          div[data-testid="stVerticalBlockBorderWrapper"] [data-testid="stPopover"] button {
            border-radius: 8px !important;
            font-weight: 600 !important;
          }
        </style>
        """,
        unsafe_allow_html=True,
    )


def format_started_display(iso: str | None) -> str:
    s = (iso or "").strip()
    if not s:
        return "—"
    try:
        d = date.fromisoformat(s[:10])
        return d.strftime("%b %d, %Y")
    except ValueError:
        return s


def initials_from_name(name: str) -> str:
    parts = [x for x in (name or "").strip().split() if x]
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def toggle_expanded_project_row(project_id: str) -> None:
    cur = st.session_state.get("expanded_project_id")
    st.session_state.expanded_project_id = None if cur == project_id else project_id
    st.rerun()


def save_project_status_if_changed(project_id: str, new_status: str) -> None:
    old = get_project(project_id)
    if not old or old.get("status") == new_status:
        return
    d = dict(old)
    d["status"] = new_status
    d["updated_at"] = datetime.now().timestamp()
    upsert_project(d)
    st.toast("Status updated", icon="✔")


def render_part_side_panel(part: dict[str, Any]) -> None:
    st.markdown(
        f'<p class="saas-section-title" style="font-size:1.05rem">{html.escape(part["part_name"])}</p>',
        unsafe_allow_html=True,
    )
    st.markdown(
        f'<p class="saas-meta-dim">{html.escape(part["brand"])} · {html.escape(part["material_type"])} · '
        f'<code style="color:#64748b">{html.escape(str(part.get("color_hex") or ""))}</code></p>',
        unsafe_allow_html=True,
    )
    st.markdown(
        f'<p class="saas-meta-strong">{html.escape(format_grams(part["quantity_grams"]))} · '
        f'{html.escape(format_duration(part["print_time_minutes"]))}</p>',
        unsafe_allow_html=True,
    )
    st.markdown(
        f'<p class="saas-meta-notes">{html.escape(part.get("description") or "—")}</p>',
        unsafe_allow_html=True,
    )

    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<p class="saas-meta-dim">Logged</p>', unsafe_allow_html=True)
        st.markdown(
            f'<p class="saas-meta-strong">{html.escape(datetime.fromtimestamp(part["created_at"]).strftime("%Y-%m-%d %H:%M"))}</p>',
            unsafe_allow_html=True,
        )
    with c2:
        if part.get("updated_at") and part["updated_at"] != part.get("created_at"):
            st.markdown('<p class="saas-meta-dim">Updated</p>', unsafe_allow_html=True)
            st.markdown(
                f'<p class="saas-meta-strong">{html.escape(datetime.fromtimestamp(part["updated_at"]).strftime("%Y-%m-%d %H:%M"))}</p>',
                unsafe_allow_html=True,
            )

    if part.get("image_blob"):
        st.image(BytesIO(part["image_blob"]), caption=part.get("image_name") or "Photo")

    if part.get("stl_blob") and part.get("stl_name"):
        st.download_button(
            label=f"Download STL ({part['stl_name']})",
            data=part["stl_blob"],
            file_name=part["stl_name"],
            mime="model/stl",
            key=f"side_dl_stl_{part['id']}",
        )

    b1, b2, b3 = st.columns([1, 1, 1])
    with b1:
        if st.button("Edit in workspace", type="primary", key=f"side_edit_{part['id']}"):
            st.session_state.current_project_id = part["project_id"]
            st.session_state.detail_part_id = None
            st.session_state.detail_part_project_id = None
            st.session_state.edit_part_id = part["id"]
            st.session_state.needs_part_form_sync = True
            st.session_state.expanded_project_id = None
            st.rerun()
    with b2:
        if st.button("Close", key=f"side_close_{part['id']}", type="secondary"):
            st.session_state.detail_part_id = None
            st.session_state.detail_part_project_id = None
            st.rerun()
    with b3:
        if st.button("Delete", type="secondary", key=f"side_del_{part['id']}"):
            delete_part(part["id"])
            if st.session_state.get("edit_part_id") == part["id"]:
                clear_part_form_state()
            touch_project_updated(part["project_id"])
            st.session_state.detail_part_id = None
            st.session_state.detail_part_project_id = None
            st.toast("Part deleted.", icon="🗑️")
            st.rerun()


@st.dialog("Printed part")
def part_dialog(part: dict[str, Any]) -> None:
    st.markdown(f"### {part['part_name']}")
    st.caption(f"{part['brand']} · {part['material_type']} · `{part['color_hex']}`")
    st.caption(f"{format_grams(part['quantity_grams'])} · {format_duration(part['print_time_minutes'])}")
    st.write(part.get("description") or "—")

    c1, c2 = st.columns(2)
    with c1:
        st.caption("Logged")
        st.write(datetime.fromtimestamp(part["created_at"]).strftime("%Y-%m-%d %H:%M"))
    with c2:
        if part.get("updated_at") and part["updated_at"] != part.get("created_at"):
            st.caption("Updated")
            st.write(datetime.fromtimestamp(part["updated_at"]).strftime("%Y-%m-%d %H:%M"))

    if part.get("image_blob"):
        st.image(BytesIO(part["image_blob"]), caption=part.get("image_name") or "Photo")

    if part.get("stl_blob") and part.get("stl_name"):
        st.download_button(
            label=f"Download STL ({part['stl_name']})",
            data=part["stl_blob"],
            file_name=part["stl_name"],
            mime="model/stl",
            key=f"dl_stl_{part['id']}",
        )

    b1, b2, _ = st.columns([1, 1, 3])
    with b1:
        if st.button("Edit in form", type="primary", key=f"pdlg_edit_{part['id']}"):
            st.session_state.edit_part_id = part["id"]
            st.session_state.needs_part_form_sync = True
            st.rerun()
    with b2:
        if st.button("Delete part", type="secondary", key=f"pdlg_del_{part['id']}"):
            delete_part(part["id"])
            if st.session_state.get("edit_part_id") == part["id"]:
                clear_part_form_state()
            touch_project_updated(part["project_id"])
            st.toast("Part deleted.", icon="🗑️")
            st.rerun()


@st.dialog("Edit project")
def edit_project_dialog(project: dict[str, Any]) -> None:
    with st.form(f"edit_proj_{project['id']}"):
        name = st.text_input("Project name", value=project["name"])
        notes = st.text_area("Notes", value=project.get("notes") or "", height=90)
        status = st.selectbox("Status", STATUSES, index=STATUSES.index(project["status"]) if project["status"] in STATUSES else 0)
        sd = st.date_input("Start date", value=date.fromisoformat(project["started_date"]))
        has_end = st.checkbox("Project has ended", value=bool(project.get("ended_date")))
        ed_val = date.fromisoformat(project["ended_date"]) if project.get("ended_date") else date.today()
        ed = st.date_input("End date", value=ed_val) if has_end else None
        opened_by = st.text_input(
            "Opened by",
            value=(project.get("opened_by_name") or "You").strip() or "You",
        )
        new_av = st.file_uploader(
            "Replace opened-by photo (optional)",
            type=["png", "jpg", "jpeg", "webp", "gif"],
        )
        save = st.form_submit_button("Save project", type="primary")

    if save:
        if not (name or "").strip():
            st.error("Project name is required.")
            return
        now = datetime.now().timestamp()
        ended = ed.isoformat() if has_end and ed else None
        av_bytes = new_av.getvalue() if new_av else None
        av_name = new_av.name if new_av else None
        merged_av = av_bytes if av_bytes is not None else project.get("opened_by_avatar")
        merged_av_name = av_name if av_name is not None else project.get("opened_by_avatar_name")
        upsert_project(
            {
                "id": project["id"],
                "name": name.strip(),
                "notes": (notes or "").strip(),
                "status": status,
                "started_date": sd.isoformat(),
                "ended_date": ended,
                "created_at": project["created_at"],
                "updated_at": now,
                "opened_by_name": (opened_by or "").strip() or "You",
                "opened_by_avatar": merged_av,
                "opened_by_avatar_name": merged_av_name,
            }
        )
        st.toast("Project saved.", icon="✔")
        st.rerun()


def render_project_list() -> None:
    projects = list_projects()
    total_parts = sum(int(p.get("part_count") or 0) for p in projects)
    total_g = sum(float(p.get("total_grams") or 0) for p in projects)

    g1, g2, g3 = st.columns(3, gap="large")
    with g1:
        st.metric("Projects", len(projects))
    with g2:
        st.metric("Printed parts", total_parts)
    with g3:
        st.metric("Filament logged", format_grams(total_g))

    detail_id = st.session_state.get("detail_part_id")
    if detail_id:
        main_zone, side_zone = st.columns([3.0, 1.05], gap="medium")
    else:
        main_zone = st.container()
        side_zone = None

    with main_zone:
        st.markdown('<p class="saas-section-title">Your projects</p>', unsafe_allow_html=True)
        st.markdown(
            '<p class="saas-section-hint">Click the <strong>chevron</strong> or <strong>project name</strong> to expand '
            "a row. Use <strong>Status</strong> for a popover menu. <strong>View</strong> opens the detail panel. "
            "<strong>Workspace</strong> opens the full printed-part form.</p>",
            unsafe_allow_html=True,
        )

        if st.button("New project", type="primary", key="btn_new_project"):
            st.session_state.new_project_open = True
            st.rerun()

        fstat = st.multiselect(
            "Filter by status",
            list(STATUSES),
            default=[],
            key="filter_status_projects",
            help="Show only projects in these statuses. Leave empty to show all.",
        )

        if st.session_state.get("new_project_open"):
            with st.expander("Create project", expanded=True):
                c_disc, _ = st.columns([1, 4])
                with c_disc:
                    if st.button("Close", key="close_new_project", type="secondary"):
                        st.session_state.new_project_open = False
                        st.rerun()
                with st.form("create_project_form"):
                    pn = st.text_input("Project name", placeholder="e.g. Voron 2.4 build")
                    pnotes = st.text_area("Notes (optional)", height=80)
                    pst = st.selectbox("Starting status", STATUSES, index=0)
                    psd = st.date_input("Start date", value=date.today())
                    opened_by = st.text_input("Opened by", value="You")
                    pavatar = st.file_uploader(
                        "Opened-by photo (optional)",
                        type=["png", "jpg", "jpeg", "webp", "gif"],
                    )
                    has_end = st.checkbox("Set end date now", value=False)
                    ped = st.date_input("End date", value=date.today()) if has_end else None
                    if st.form_submit_button("Create", type="primary"):
                        if not (pn or "").strip():
                            st.error("Project name is required.")
                        else:
                            pid = str(uuid.uuid4())
                            now = datetime.now().timestamp()
                            av_bytes = pavatar.getvalue() if pavatar else None
                            av_name = pavatar.name if pavatar else None
                            upsert_project(
                                {
                                    "id": pid,
                                    "name": pn.strip(),
                                    "notes": (pnotes or "").strip(),
                                    "status": pst,
                                    "started_date": psd.isoformat(),
                                    "ended_date": ped.isoformat() if has_end and ped else None,
                                    "created_at": now,
                                    "updated_at": now,
                                    "opened_by_name": (opened_by or "").strip() or "You",
                                    "opened_by_avatar": av_bytes,
                                    "opened_by_avatar_name": av_name,
                                }
                            )
                            st.session_state.new_project_open = False
                            st.session_state.expanded_project_id = pid
                            st.session_state.detail_part_id = None
                            st.session_state.detail_part_project_id = None
                            st.rerun()

        rows = projects
        if fstat:
            rows = [p for p in rows if p["status"] in fstat]

        exp = st.session_state.get("expanded_project_id")
        if exp and not any(r["id"] == exp for r in rows):
            st.session_state.expanded_project_id = None

        if not projects:
            st.info("No projects yet — click **New project** above to create your first build.")
        elif not rows:
            st.info("No projects match the selected status filters.")
        else:
            st.markdown(
                '<div class="saas-grid-head">'
                "<span>Project</span><span>Status</span><span>Date</span>"
                "<span>Opened by</span><span>Parts</span><span>Actions</span>"
                "</div>",
                unsafe_allow_html=True,
            )

            for p in rows:
                pid = p["id"]
                exp_id = st.session_state.get("expanded_project_id")
                is_open = exp_id == pid
                st_current = p["status"] if p["status"] in STATUSES else "Planned"
                anchor_cls = html.escape(st_current.replace(" ", "-"))

                with st.container(border=True):
                    c1, c2, c3, c4, c5, c6 = st.columns([2.0, 1.05, 0.95, 1.15, 0.95, 1.1])
                    with c1:
                        ch_lbl = "▼" if is_open else "▶"
                        r1, r2 = st.columns([0.11, 0.89], gap="small")
                        with r1:
                            if st.button(
                                ch_lbl,
                                key=f"proj_row_chev_{pid}",
                                type="tertiary",
                                help="Expand or collapse row",
                            ):
                                toggle_expanded_project_row(pid)
                        with r2:
                            name_plain = (p.get("name") or "Untitled").strip() or "Untitled"
                            short = name_plain if len(name_plain) <= 60 else name_plain[:57] + "…"
                            if st.button(
                                short,
                                key=f"proj_row_name_{pid}",
                                type="tertiary",
                                use_container_width=True,
                                help="Expand or collapse row",
                            ):
                                toggle_expanded_project_row(pid)
                        snip = (p.get("notes") or "").strip()
                        if len(snip) > 100:
                            snip = snip[:97] + "…"
                        st.markdown(
                            f'<p class="saas-meta-notes">{html.escape(snip or "—")}</p>',
                            unsafe_allow_html=True,
                        )
                    with c2:
                        st.markdown(
                            f'<span class="proj-status-anchor proj-status-{anchor_cls}" aria-hidden="true"></span>',
                            unsafe_allow_html=True,
                        )
                        with st.popover(
                            f"{st_current} ▾",
                            type="secondary",
                            use_container_width=True,
                            key=f"status_pop_{pid}",
                            help="Change project status",
                        ):
                            st.caption("Set status")
                            for opt in STATUSES:
                                if st.button(
                                    opt,
                                    key=f"status_opt_{pid}_{opt}",
                                    use_container_width=True,
                                ):
                                    save_project_status_if_changed(pid, opt)
                                    st.rerun()
                    with c3:
                        st.markdown(
                            f'<p class="saas-meta-strong">{html.escape(format_started_display(p.get("started_date")))}</p>',
                            unsafe_allow_html=True,
                        )
                    with c4:
                        ob = (p.get("opened_by_name") or "").strip() or "You"
                        av = p.get("opened_by_avatar")
                        avc1, avc2 = st.columns([0.35, 0.65])
                        with avc1:
                            if av:
                                st.image(BytesIO(av), width=34)
                            else:
                                ini = html.escape(initials_from_name(ob))
                                st.markdown(
                                    "<div style='width:34px;height:34px;border-radius:50%;display:flex;"
                                    "align-items:center;justify-content:center;background:#e2e8f0;"
                                    f"border:1px solid #cbd5e1;font-weight:800;font-size:0.68rem;color:#475569'>{ini}</div>",
                                    unsafe_allow_html=True,
                                )
                        with avc2:
                            st.markdown(
                                f'<p class="saas-meta-dim">{html.escape(ob)}</p>',
                                unsafe_allow_html=True,
                            )
                    with c5:
                        n_parts = int(p.get("part_count") or 0)
                        st.markdown(
                            f'<p class="saas-meta-strong" style="margin-top:0.35rem">{n_parts}</p>'
                            '<p class="saas-meta-dim" style="margin:0">parts logged</p>',
                            unsafe_allow_html=True,
                        )
                    with c6:
                        if st.button("Workspace", key=f"ws_{pid}", type="secondary", help="Full printed-part form"):
                            st.session_state.current_project_id = pid
                            st.session_state.confirm_delete_project_id = None
                            st.session_state.expanded_project_id = None
                            st.session_state.detail_part_id = None
                            st.session_state.detail_part_project_id = None
                            clear_part_form_state()
                            st.rerun()
                        if st.button("Edit", key=f"row_edit_{pid}", type="secondary"):
                            edit_project_dialog(p)

                    if is_open:
                        total_pg = float(p.get("total_grams") or 0)
                        st.metric("Project Filament Log", format_grams(total_pg))
                        if st.button(
                            "Add part",
                            type="primary",
                            key=f"inline_add_part_{pid}",
                            use_container_width=True,
                        ):
                            st.session_state.current_project_id = pid
                            st.session_state.confirm_delete_project_id = None
                            st.session_state.expanded_project_id = None
                            st.session_state.detail_part_id = None
                            st.session_state.detail_part_project_id = None
                            clear_part_form_state()
                            st.rerun()

                        plist = list_parts(pid)
                        st.markdown(
                            '<p class="saas-meta-dim" style="margin:0.75rem 0 0.5rem 0">Printed parts</p>',
                            unsafe_allow_html=True,
                        )
                        if not plist:
                            st.markdown(
                                '<p class="saas-meta-notes">No parts yet — use <strong>Add part</strong> above or '
                                "<strong>Workspace</strong>.</p>",
                                unsafe_allow_html=True,
                            )
                        else:
                            gh = st.columns([0.1, 0.3, 0.24, 0.13, 0.13, 0.1])
                            headers = ("", "Part", "Brand / material", "Filament", "Time", "")
                            for i, h in enumerate(headers):
                                with gh[i]:
                                    st.markdown(
                                        '<p class="saas-meta-dim" style="margin:0;font-size:0.72rem;font-weight:700;'
                                        'text-transform:uppercase;letter-spacing:0.06em">'
                                        f"{html.escape(h)}</p>",
                                        unsafe_allow_html=True,
                                    )
                            for pr in plist:
                                pc1, pc2, pc3, pc4, pc5, pc6 = st.columns(
                                    [0.1, 0.3, 0.24, 0.13, 0.13, 0.1]
                                )
                                with pc1:
                                    hx = safe_hex_color(pr.get("color_hex"))
                                    st.markdown(
                                        f"<div style='width:32px;height:32px;border-radius:8px;background:{hx};"
                                        "border:1px solid #e2e8f0;margin-top:4px'></div>",
                                        unsafe_allow_html=True,
                                    )
                                with pc2:
                                    st.markdown(
                                        f'<p class="saas-project-title" style="font-size:0.95rem;margin:0">'
                                        f"{html.escape(pr['part_name'])}</p>",
                                        unsafe_allow_html=True,
                                    )
                                with pc3:
                                    st.markdown(
                                        f'<p class="saas-meta-dim" style="margin:0">'
                                        f"{html.escape(pr['brand'])} · {html.escape(pr['material_type'])}</p>",
                                        unsafe_allow_html=True,
                                    )
                                with pc4:
                                    st.markdown(
                                        f'<p class="saas-meta-strong" style="margin:0">'
                                        f"{html.escape(format_grams(pr['quantity_grams']))}</p>",
                                        unsafe_allow_html=True,
                                    )
                                with pc5:
                                    st.markdown(
                                        f'<p class="saas-meta-dim" style="margin:0">'
                                        f"{html.escape(format_duration(pr['print_time_minutes']))}</p>",
                                        unsafe_allow_html=True,
                                    )
                                with pc6:
                                    if st.button("View", key=f"pv_{pr['id']}", type="secondary"):
                                        st.session_state.detail_part_id = pr["id"]
                                        st.session_state.detail_part_project_id = pid
                                        st.rerun()

    if side_zone is not None:
        with side_zone:
            with st.container(border=True):
                st.markdown('<p class="saas-section-title" style="font-size:1rem">Selection</p>', unsafe_allow_html=True)
                part = get_part(str(detail_id)) if detail_id else None
                if not part:
                    st.warning("That part could not be loaded.")
                    if st.button("Close", key="side_close_missing", type="secondary"):
                        st.session_state.detail_part_id = None
                        st.session_state.detail_part_project_id = None
                        st.rerun()
                else:
                    render_part_side_panel(part)


def render_project_workspace(project: dict[str, Any]) -> None:
    pid = project["id"]
    parts = list_parts(pid)
    brands = unique_brands_for_project(pid)
    total_g = sum(float(x["quantity_grams"] or 0) for x in parts)

    b1, b2, _ = st.columns([1, 1, 4])
    with b1:
        if st.button("← All projects", key="back_projects", type="secondary"):
            st.session_state.current_project_id = None
            st.session_state.confirm_delete_project_id = None
            st.session_state.expanded_project_id = None
            st.session_state.detail_part_id = None
            st.session_state.detail_part_project_id = None
            clear_part_form_state()
            st.rerun()
    with b2:
        if st.button("Edit project", key="edit_proj_inline", type="secondary"):
            edit_project_dialog(project)

    st.markdown(
        f'<h2 class="saas-h2-project">{html.escape(project["name"])}</h2>',
        unsafe_allow_html=True,
    )
    st.markdown(status_badge_html(project["status"]), unsafe_allow_html=True)
    st.markdown(
        f'<p class="saas-meta-notes">Started <strong>{html.escape(str(project.get("started_date") or "—"))}</strong> · '
        f'Ended <strong>{html.escape(str(project.get("ended_date") or "—"))}</strong></p>',
        unsafe_allow_html=True,
    )
    ob = (project.get("opened_by_name") or "").strip() or "You"
    st.markdown(
        f'<p class="saas-meta-dim">Opened by <strong style="color:#475569">{html.escape(ob)}</strong></p>',
        unsafe_allow_html=True,
    )

    if (project.get("notes") or "").strip():
        st.markdown(
            f'<p class="saas-meta-notes">{html.escape(project["notes"].strip())}</p>',
            unsafe_allow_html=True,
        )

    wm1, wm2 = st.columns(2, gap="large")
    with wm1:
        st.metric("Parts in this project", len(parts))
    with wm2:
        st.metric("Filament in this project", format_grams(total_g))

    danger_cols = st.columns([1, 1, 4])
    with danger_cols[0]:
        if st.button("Delete project", type="secondary", key="del_proj"):
            st.session_state.confirm_delete_project_id = pid
    if st.session_state.get("confirm_delete_project_id") == pid:
        st.warning("This deletes the project and **all** printed parts inside it.")
        c_y, c_n = st.columns(2)
        with c_y:
            if st.button("Yes, delete", type="primary", key="del_proj_yes"):
                delete_project(pid)
                st.session_state.current_project_id = None
                st.session_state.confirm_delete_project_id = None
                st.session_state.expanded_project_id = None
                st.session_state.detail_part_id = None
                st.session_state.detail_part_project_id = None
                clear_part_form_state()
                st.rerun()
        with c_n:
            if st.button("Cancel", key="del_proj_no", type="secondary"):
                st.session_state.confirm_delete_project_id = None
                st.rerun()

    tab_parts, tab_about = st.tabs(["Printed parts", "Project summary"])

    with tab_parts:
        if st.session_state.get("edit_part_id"):
            st.info("Editing a printed part — save the form below or cancel.")
            if st.button("Cancel part edit", key="cancel_part_edit", type="secondary"):
                clear_part_form_state()
                st.rerun()

        with st.form("part_form", clear_on_submit=False):
            st.subheader("Add printed part" if not st.session_state.edit_part_id else "Update printed part")
            mat_choices = list(MATERIAL_PRESETS)
            edit_ref = st.session_state.get("edit_part_id")
            if edit_ref:
                erow = get_part(edit_ref)
                if erow and (erow.get("material_type") or "").strip():
                    mt = erow["material_type"].strip()
                    if mt not in mat_choices:
                        mat_choices = [mt] + mat_choices
            part_name = st.text_input(
                "Part name",
                placeholder="e.g. Front left motor mount",
                key="fm_part_name",
            )
            brand = st.text_input("Filament brand", placeholder="e.g. Polymaker", key="fm_brand")
            material = st.selectbox("Material", mat_choices, key="fm_material")

            c1, c2, c3 = st.columns([1, 1, 2])
            with c1:
                color = st.color_picker("Color", key="fm_color")
            with c2:
                qty = st.number_input(
                    "Quantity (g)",
                    min_value=0.0,
                    step=0.1,
                    format="%.1f",
                    key="fm_quantity",
                )
            with c3:
                st.write("")
                st.write("")
                st.caption(f"Hex: `{color.upper()}`")

            h1, h2 = st.columns(2)
            with h1:
                hours = st.number_input("Print hours", min_value=0, max_value=999, step=1, key="fm_hours")
            with h2:
                minutes = st.number_input(
                    "Print minutes",
                    min_value=0,
                    max_value=59,
                    step=1,
                    key="fm_minutes",
                )

            description = st.text_area(
                "Notes",
                placeholder="Slicer settings, failures, assembly notes…",
                key="fm_description",
                height=100,
            )

            img = st.file_uploader("Photo (optional)", type=["png", "jpg", "jpeg", "webp", "gif"], key="fm_image")
            stl = st.file_uploader("STL reference (optional)", type=["stl"], key="fm_stl")

            submitted = st.form_submit_button(
                "Save part" if not st.session_state.edit_part_id else "Update part",
                type="primary",
            )

        if brands:
            st.markdown(
                '<p class="hint">Brands used in this project: '
                + ", ".join(brands[:14])
                + ("…" if len(brands) > 14 else "")
                + "</p>",
                unsafe_allow_html=True,
            )

        if submitted:
            if not (part_name or "").strip() or not (brand or "").strip() or not (material or "").strip():
                st.error("Part name, brand, and material are required.")
            else:
                now = datetime.now().timestamp()
                part_id = st.session_state.edit_part_id or str(uuid.uuid4())
                old = get_part(part_id) if st.session_state.edit_part_id else None
                created = old["created_at"] if old else now

                img_bytes = img.getvalue() if img else None
                img_name = img.name if img else None
                if st.session_state.edit_part_id and img_bytes is None and old:
                    img_bytes = old.get("image_blob")
                    img_name = old.get("image_name")

                stl_bytes = stl.getvalue() if stl else None
                stl_name = stl.name if stl else None
                if st.session_state.edit_part_id and stl_bytes is None and old:
                    stl_bytes = old.get("stl_blob")
                    stl_name = old.get("stl_name")

                print_mins = int(hours or 0) * 60 + int(minutes or 0)

                row = {
                    "id": part_id,
                    "project_id": pid,
                    "part_name": part_name.strip(),
                    "brand": brand.strip(),
                    "material_type": material.strip(),
                    "color_hex": color,
                    "description": (description or "").strip(),
                    "quantity_grams": float(qty or 0),
                    "print_time_minutes": print_mins,
                    "created_at": created,
                    "updated_at": now,
                    "image_blob": img_bytes,
                    "image_name": img_name,
                    "stl_blob": stl_bytes,
                    "stl_name": stl_name,
                }
                upsert_part(row)
                touch_project_updated(pid)
                clear_part_form_state()
                st.session_state.just_saved_part = True
                st.rerun()

        if st.session_state.pop("just_saved_part", False):
            st.success("Printed part saved.")

        q = st.text_input("Search parts", placeholder="Name, brand, material, notes…", key="part_search_q")
        filtered = filter_parts(parts, st.session_state.get("part_search_q", ""))

        if not filtered:
            st.write("No parts match your search." if q else "No printed parts yet — add one with the form above.")
        else:
            for e in filtered:
                cc = st.columns([0.12, 0.38, 0.34, 0.16])
                with cc[0]:
                    hx = safe_hex_color(e.get("color_hex"))
                    st.markdown(
                        f"<div style='width:36px;height:36px;border-radius:8px;background:{hx};"
                        f"border:1px solid #2e2e2e;margin-top:4px'></div>",
                        unsafe_allow_html=True,
                    )
                with cc[1]:
                    st.markdown(f"**{e['part_name']}**")
                    st.caption(f"{e['brand']} · {e['material_type']}")
                with cc[2]:
                    st.write(format_grams(e["quantity_grams"]))
                    st.caption(format_duration(e["print_time_minutes"]))
                with cc[3]:
                    if st.button("Open", key=f"open_part_{e['id']}", type="secondary"):
                        part_dialog(e)

    with tab_about:
        st.write("Statuses use these colors:")
        for s in STATUSES:
            st.markdown(status_badge_html(s) + f" — **{s}**", unsafe_allow_html=True)


def main() -> None:
    st.set_page_config(
        page_title="3D Project Tracker — KNG.3D",
        page_icon="📦",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    inject_css()
    init_db()

    if "current_project_id" not in st.session_state:
        st.session_state.current_project_id = None
    if "edit_part_id" not in st.session_state:
        st.session_state.edit_part_id = None
    if "_last_synced_part" not in st.session_state:
        st.session_state._last_synced_part = None
    if "expanded_project_id" not in st.session_state:
        st.session_state.expanded_project_id = None
    if "detail_part_id" not in st.session_state:
        st.session_state.detail_part_id = None
    if "detail_part_project_id" not in st.session_state:
        st.session_state.detail_part_project_id = None

    if st.session_state.pop("needs_part_form_sync", False):
        pe = st.session_state.get("edit_part_id")
        if pe:
            row = get_part(pe)
            if row:
                apply_part_row_to_form(row)
                st.session_state._last_synced_part = pe

    if st.session_state.get("edit_part_id") and st.session_state.get("_last_synced_part") != st.session_state.get("edit_part_id"):
        row = get_part(st.session_state.edit_part_id)
        if row:
            apply_part_row_to_form(row)
            st.session_state._last_synced_part = st.session_state.edit_part_id

    st.title("3D Project Tracker")
    st.markdown(
        '<p class="saas-page-lead">Organize builds into projects. Each <strong>printed part</strong> is a '
        "filament log entry (brand, material, color, grams, time, STL, photo).</p>",
        unsafe_allow_html=True,
    )

    pid = st.session_state.current_project_id
    if pid:
        project = get_project(pid)
        if not project:
            st.error("That project no longer exists.")
            st.session_state.current_project_id = None
            clear_part_form_state()
            st.stop()
        render_project_workspace(project)
    else:
        render_project_list()


if __name__ == "__main__":
    main()
