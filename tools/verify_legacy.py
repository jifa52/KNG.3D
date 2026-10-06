#!/usr/bin/env python3
"""Check a converted edition against its original HTML, word for word.

For each language, every word visible in the original page body (minus page
chrome: nav, buttons, section titles, the duplicated crawl) must appear in the
converted content. Prints the words that did not make it, per edition.

    python3 tools/verify_legacy.py ORIGINAL_ROOT CONVERTED_ROOT
    # both arguments are repository roots that contain briefings/<id>/
    # original root needs index.html; converted root needs edition.js
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parent))
from convert_legacy import CHROME_SELECTORS  # noqa: E402

TOK = re.compile(r"[\w֐-׿][\w֐-׿׳״'’.,%:/+−–-]*")
SKIP_KEYS = {"src", "srcset", "sizes", "url", "kind", "level", "legacy", "v", "id", "slot", "credits", "w", "h", "missing", "dir", "role", "pending"}


def toks(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
    out = []
    for t in TOK.findall(s):
        t = t.strip(".,:;")
        if t:
            out.append(t)
    return out


def orig_tokens(path, lang):
    soup = BeautifulSoup(Path(path).read_text(encoding="utf-8"), "lxml")
    for sel in CHROME_SELECTORS:
        for el in soup.select(sel):
            el.decompose()
    for el in soup.select("[data-lang]"):
        if el.get("data-lang") != lang:
            el.decompose()
    body = soup.body
    return toks(body.get_text(" "))


def json_strings(o, lang, key=None):
    if key in SKIP_KEYS:
        return
    if isinstance(o, dict):
        if set(o.keys()) <= {"he", "en"}:
            v = o.get(lang)
            if isinstance(v, str):
                yield v
            return
        for k, v in o.items():
            yield from json_strings(v, lang, k)
    elif isinstance(o, list):
        for v in o:
            yield from json_strings(v, lang, key)
    elif isinstance(o, str):
        yield o


def load_edition(js_path):
    t = Path(js_path).read_text(encoding="utf-8").strip()
    t = t[len("DJ.edition("):]
    t = t[: t.rfind(")")]
    return json.loads(t)


def check(orig_html, edition_js):
    ed = load_edition(edition_js)
    res = {}
    for lang in ("he", "en"):
        o = Counter(orig_tokens(orig_html, lang))
        j = Counter()
        for s in json_strings(ed, lang):
            j.update(toks(s))
        missing = o - j
        res[lang] = (sum(o.values()), missing)
    return res


if __name__ == "__main__":
    orig_root, conv_root = Path(sys.argv[1]), Path(sys.argv[2])
    worst = 0
    for d in sorted((orig_root / "briefings").iterdir()):
        oh = d / "index.html"
        cj = conv_root / "briefings" / d.name / "edition.js"
        if not oh.exists() or not cj.exists():
            continue
        r = check(oh, cj)
        line = []
        for lang in ("he", "en"):
            total, miss = r[lang]
            n = sum(miss.values())
            worst = max(worst, n)
            line.append("%s %d/%d missing" % (lang, n, total))
            if n and "-v" in sys.argv:
                line.append(" " + " ".join("%s×%d" % (k, v) for k, v in miss.most_common(25)))
        print(d.name, " | ".join(line))
    print("max missing words in any edition/language:", worst)
