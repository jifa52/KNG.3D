#!/usr/bin/env python3
"""Rebuild assets/editions.js from every briefings/*/edition.js.

    python3 tools/manifest.py

The bots add one entry by hand when they publish; this script regenerates the
whole list from the editions themselves, so the two can never drift for long.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_edition(p):
    t = Path(p).read_text(encoding="utf-8").strip()
    if not t.startswith("DJ.edition(") or not t.rstrip(";").endswith(")"):
        raise ValueError("%s: must be DJ.edition({...});" % p)
    return json.loads(t[len("DJ.edition("): t.rstrip(";").rfind(")")])


def entry(ed):
    lead = ((ed.get("news") or {}).get("stories") or [{}])[0]
    e = {
        "id": ed["id"],
        "date": ed["date"],
        "time": ed["time"],
        "slot": ed.get("slot", "special"),
        "headline": ed.get("headline") or lead.get("headline"),
    }
    if ed.get("summary"):
        e["summary"] = ed["summary"]
    return e


def build():
    eds = []
    for p in sorted((ROOT / "briefings").glob("*/edition.js")):
        eds.append(entry(load_edition(p)))
    eds.sort(key=lambda e: e["id"], reverse=True)
    lines = ["/* Every edition, newest first. The homepage opens the first entry. */", "DJ.manifest(["]
    for i, e in enumerate(eds):
        lines.append(" " + json.dumps(e, ensure_ascii=False) + ("," if i < len(eds) - 1 else ""))
    lines.append("]);")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    out = build()
    if "--check" in sys.argv:
        cur = (ROOT / "assets" / "editions.js").read_text(encoding="utf-8")
        sys.exit(0 if cur == out else 1)
    (ROOT / "assets" / "editions.js").write_text(out, encoding="utf-8")
    print("wrote assets/editions.js")
