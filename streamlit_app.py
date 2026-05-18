"""Filament usage tracker — Streamlit + SQLite (local file DB)."""

from __future__ import annotations

import re
import sqlite3
import uuid
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any

import streamlit as st

DB_PATH = Path(__file__).resolve().parent / "filament_usage.db"

FORM_KEYS = (
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
    return conn


def init_db() -> None:
    with _conn() as c:
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS entries (
                id TEXT PRIMARY KEY,
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
                stl_name TEXT
            )
            """
        )


def list_entries() -> list[dict[str, Any]]:
    with _conn() as c:
        cur = c.execute(
            "SELECT * FROM entries ORDER BY created_at DESC, id DESC"
        )
        return [dict(r) for r in cur.fetchall()]


def get_entry(entry_id: str) -> dict[str, Any] | None:
    with _conn() as c:
        cur = c.execute("SELECT * FROM entries WHERE id = ?", (entry_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def upsert_entry(row: dict[str, Any]) -> None:
    with _conn() as c:
        c.execute(
            """
            INSERT INTO entries (
                id, brand, material_type, color_hex, description,
                quantity_grams, print_time_minutes, created_at, updated_at,
                image_blob, image_name, stl_blob, stl_name
            ) VALUES (
                :id, :brand, :material_type, :color_hex, :description,
                :quantity_grams, :print_time_minutes, :created_at, :updated_at,
                :image_blob, :image_name, :stl_blob, :stl_name
            )
            ON CONFLICT(id) DO UPDATE SET
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


def delete_entry(entry_id: str) -> None:
    with _conn() as c:
        c.execute("DELETE FROM entries WHERE id = ?", (entry_id,))


def unique_brands(entries: list[dict[str, Any]]) -> list[str]:
    brands = {e["brand"] for e in entries if e.get("brand")}
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


def filter_entries(entries: list[dict[str, Any]], q: str) -> list[dict[str, Any]]:
    q = (q or "").strip().lower()
    if not q:
        return entries

    def hay(e: dict[str, Any]) -> str:
        parts = [
            str(e.get("brand") or ""),
            str(e.get("material_type") or ""),
            str(e.get("description") or ""),
            str(e.get("color_hex") or ""),
        ]
        return " ".join(parts).lower()

    return [e for e in entries if q in hay(e)]


def clear_usage_form_state() -> None:
    for k in FORM_KEYS:
        if k in st.session_state:
            del st.session_state[k]
    st.session_state.edit_id = None
    st.session_state._last_synced_edit = None


def apply_row_to_form_state(row: dict[str, Any]) -> None:
    st.session_state.fm_brand = row["brand"]
    st.session_state.fm_material = row["material_type"]
    hexv = row["color_hex"] or "#e53935"
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
          div[data-testid="stMetricValue"] { font-weight: 700; }
          .block-container { padding-top: 1.25rem; }
          h1 { letter-spacing: -0.02em; }
          .hint { color: #9a9a9a; font-size: 0.85rem; margin-top: -0.5rem; }
        </style>
        """,
        unsafe_allow_html=True,
    )


@st.dialog("Entry details")
def entry_dialog(entry: dict[str, Any]) -> None:
    st.markdown(f"**{entry['brand']}** · {entry['material_type']}")
    st.caption(f"Color `{entry['color_hex']}` · {format_grams(entry['quantity_grams'])} · {format_duration(entry['print_time_minutes'])}")
    st.write(entry.get("description") or "—")

    c1, c2 = st.columns(2)
    with c1:
        st.caption("Logged")
        st.write(datetime.fromtimestamp(entry["created_at"]).strftime("%Y-%m-%d %H:%M"))
    with c2:
        if entry.get("updated_at") and entry["updated_at"] != entry.get("created_at"):
            st.caption("Updated")
            st.write(datetime.fromtimestamp(entry["updated_at"]).strftime("%Y-%m-%d %H:%M"))

    if entry.get("image_blob"):
        st.image(BytesIO(entry["image_blob"]), caption=entry.get("image_name") or "Photo")

    if entry.get("stl_blob") and entry.get("stl_name"):
        st.download_button(
            label=f"Download STL ({entry['stl_name']})",
            data=entry["stl_blob"],
            file_name=entry["stl_name"],
            mime="model/stl",
            key=f"dl_stl_{entry['id']}",
        )

    b1, b2, _ = st.columns([1, 1, 3])
    with b1:
        if st.button("Edit in form", key=f"dlg_edit_{entry['id']}"):
            st.session_state.edit_id = entry["id"]
            st.session_state.needs_form_sync = True
            st.rerun()
    with b2:
        if st.button("Delete", type="secondary", key=f"dlg_del_{entry['id']}"):
            delete_entry(entry["id"])
            if st.session_state.get("edit_id") == entry["id"]:
                clear_usage_form_state()
            st.toast("Entry deleted.", icon="🗑️")
            st.rerun()


def main() -> None:
    st.set_page_config(
        page_title="Filament Log — KNG.3D",
        page_icon="🧵",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    inject_css()
    init_db()

    if "edit_id" not in st.session_state:
        st.session_state.edit_id = None
    if "_last_synced_edit" not in st.session_state:
        st.session_state._last_synced_edit = None

    if st.session_state.pop("just_saved", False):
        st.success("Saved. Open the **History** tab to review entries.")

    if st.session_state.pop("needs_form_sync", False):
        eid = st.session_state.get("edit_id")
        if eid:
            row = get_entry(eid)
            if row:
                apply_row_to_form_state(row)
                st.session_state._last_synced_edit = eid

    if st.session_state.get("edit_id") and st.session_state.get("_last_synced_edit") != st.session_state.get("edit_id"):
        row = get_entry(st.session_state.edit_id)
        if row:
            apply_row_to_form_state(row)
            st.session_state._last_synced_edit = st.session_state.edit_id

    all_entries = list_entries()
    brands = unique_brands(all_entries)
    total_g = sum(float(e["quantity_grams"] or 0) for e in all_entries)

    st.title("Filament Log")
    st.caption("Track grams, brand, material, color, print time, notes, and optional photo + STL.")

    m1, m2, _ = st.columns([1, 1, 2])
    with m1:
        st.metric("Total used", format_grams(total_g))
    with m2:
        st.metric("Entries", len(all_entries))

    tab_log, tab_hist = st.tabs(["Log usage", "History"])

    with tab_log:
        if st.session_state.edit_id:
            st.info(f"Editing entry `{st.session_state.edit_id}`. Save to update, or cancel.")
            if st.button("Cancel edit", key="cancel_edit"):
                clear_usage_form_state()
                st.rerun()

        with st.form("usage_form", clear_on_submit=False):
            st.subheader("New entry" if not st.session_state.edit_id else "Update entry")

            brand = st.text_input(
                "Brand",
                placeholder="e.g. Polymaker",
                key="fm_brand",
            )
            material = st.text_input(
                "Material type",
                placeholder="e.g. PLA",
                key="fm_material",
            )

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
                "Description / what it was for",
                placeholder="Part name, project, notes…",
                key="fm_description",
                height=110,
            )

            img = st.file_uploader("Photo (optional)", type=["png", "jpg", "jpeg", "webp", "gif"], key="fm_image")
            stl = st.file_uploader("STL reference (optional)", type=["stl"], key="fm_stl")

            submitted = st.form_submit_button(
                "Save entry" if not st.session_state.edit_id else "Update entry",
                type="primary",
            )

        if brands:
            st.markdown('<p class="hint">Tip: brands you have used before: ' + ", ".join(brands[:12]) + ("…" if len(brands) > 12 else "") + "</p>", unsafe_allow_html=True)

        if submitted:
            if not (brand or "").strip() or not (material or "").strip():
                st.error("Brand and material are required.")
            else:
                now = datetime.now().timestamp()
                eid = st.session_state.edit_id or str(uuid.uuid4())
                old = get_entry(eid) if st.session_state.edit_id else None
                created = old["created_at"] if old else now

                img_bytes = img.getvalue() if img else None
                img_name = img.name if img else None
                if st.session_state.edit_id and img_bytes is None and old:
                    img_bytes = old.get("image_blob")
                    img_name = old.get("image_name")

                stl_bytes = stl.getvalue() if stl else None
                stl_name = stl.name if stl else None
                if st.session_state.edit_id and stl_bytes is None and old:
                    stl_bytes = old.get("stl_blob")
                    stl_name = old.get("stl_name")

                print_mins = int(hours or 0) * 60 + int(minutes or 0)

                row = {
                    "id": eid,
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
                upsert_entry(row)
                clear_usage_form_state()
                st.session_state.just_saved = True
                st.rerun()

    with tab_hist:
        q = st.text_input("Search", placeholder="Brand, material, description, color…", key="search_q")
        rows = filter_entries(all_entries, st.session_state.get("search_q", ""))

        if not rows:
            st.write("No entries match your search." if q else "No entries yet — add one under **Log usage**.")
        else:
            for e in rows:
                cc = st.columns([0.12, 0.35, 0.35, 0.18])
                with cc[0]:
                    hx = safe_hex_color(e.get("color_hex"))
                    st.markdown(
                        f"<div style='width:36px;height:36px;border-radius:8px;background:{hx};"
                        f"border:1px solid #2e2e2e;margin-top:4px'></div>",
                        unsafe_allow_html=True,
                    )
                with cc[1]:
                    st.markdown(f"**{e['brand']}** · {e['material_type']}")
                    desc = (e.get("description") or "").strip() or "—"
                    if len(desc) > 100:
                        desc = desc[:97] + "…"
                    st.caption(desc)
                with cc[2]:
                    st.write(format_grams(e["quantity_grams"]))
                    st.caption(format_duration(e["print_time_minutes"]))
                with cc[3]:
                    if st.button("Open", key=f"open_{e['id']}"):
                        entry_dialog(e)


if __name__ == "__main__":
    main()
