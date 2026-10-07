#!/usr/bin/env python3
"""The Daily Jenya — publish check. Standard library only.

    python3 tools/check.py            check everything
    python3 tools/check.py 2026-10-04-0850   check one edition (plus the site files)

Exit code 0 = publishable. Every problem is printed with the file it is in.
Converted legacy editions ("legacy" set) get the structural checks only;
editions written in the new format get the full editorial checks.
"""
import json
import re
import sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
errors, warnings = [], []
SLOTS = {"morning", "midday", "markets", "intraday", "evening", "close", "special"}
CONF = {"confirmed", "likely", "unverified"}
ALLOWED_TAGS = {"b", "strong", "em", "i", "a", "bdi", "code", "br", "sup", "sub", "abbr", "s", "u", "q", "cite", "kbd", "mark", "small"}
DESK_WORDS = re.compile(r"INTERNAL NOTES|Verb lock|נעילת פעלים|bare-refile|bare refile|densify|MAIN HOLD|House rule|HARD GATE|card ID|→ Markets|desk pack|breadth beyond mega.?caps|\bTODO\b|\bTBD\b|lorem ipsum|overnight thin|מהדורה רזה|essay on this tab|geopolitics essay|pre-NFP|fail closed|material upgrade|path-first|\bshippable\b", re.I)
READER_BANS = (
    (re.compile(r"\bcarried\b(?!\s+(?:out|by|the)\b)", re.I), "carried"),
    (re.compile(r"\bdesk\b", re.I), "desk"),
    (re.compile(r"(?<!sea )(?<!shipping )(?<!traffic )\blane\b", re.I), "lane"),
    (re.compile(r"\bHOLD\b"), "HOLD"),
    (re.compile(r"(?<![\u0590-\u05FF])נישא(?![\u0590-\u05FF])"), "נישא"),
)
ID_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-\d{4}$")
TIME_RE = re.compile(r"^\d{2}:\d{2}$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
CAL_STATUS = {"unavailable"}
# Hosts where the first path segment is the publisher (a vendor's GitHub org is still the vendor).
ORG_HOSTS = {"github.com", "gitlab.com", "huggingface.co", "x.com", "twitter.com", "medium.com", "substack.com", "youtube.com", "linkedin.com"}
SECOND_LEVEL = {"co", "com", "org", "gov", "ac", "net", "edu", "muni"}
BRAND_TLDS = {"google", "microsoft", "apple", "amazon", "aws", "nvidia", "ibm", "intel", "samsung", "sony", "meta"}


def err(where, msg):
    errors.append("%s: %s" % (where, msg))


def warn(where, msg):
    warnings.append("%s: %s" % (where, msg))


def load_call(path, fn):
    t = path.read_text(encoding="utf-8").strip()
    # allow a leading comment line
    t = re.sub(r"^/\*.*?\*/\s*", "", t, flags=re.S)
    head = fn + "("
    if not t.startswith(head):
        raise ValueError("must start with %s" % head)
    body = t[len(head):].rstrip().rstrip(";").rstrip()
    if not body.endswith(")"):
        raise ValueError("must end with );")
    return json.loads(body[:-1])


class TagCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.bad = set()
        self.bad_href = []

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED_TAGS:
            self.bad.add(tag)
        if tag == "a":
            href = dict(attrs).get("href") or ""
            if href and not re.match(r"^(https?://|mailto:|#|\.\.?/|[\w-]+/)", href):
                self.bad_href.append(href)


def walk_strings(o, path=""):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk_strings(v, path + "." + k if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk_strings(v, "%s[%d]" % (path, i))
    elif isinstance(o, str):
        yield path, o


def text(v):
    return re.sub(r"<[^>]+>", "", v or "").strip()


def bi(where, v, field, required=True, allow_plain=True):
    """A bilingual field: {"he": "...", "en": "..."} (or one plain string for language-neutral text)."""
    if v is None or v == "" or v == {}:
        if required:
            err(where, "%s is missing" % field)
        return False
    if isinstance(v, str):
        if not allow_plain:
            err(where, "%s must have both he and en" % field)
            return False
        if not text(v):
            err(where, "%s is empty" % field)
        return True
    if isinstance(v, dict):
        for l in ("he", "en"):
            if not text(v.get(l, "")):
                err(where, "%s.%s is empty" % (field, l))
        extra = set(v) - {"he", "en"}
        if extra:
            err(where, "%s has unknown keys %s" % (field, sorted(extra)))
        return True
    err(where, "%s must be text or {he, en}" % field)
    return False


def check_image(where, im, eid, full):
    src = im.get("src", "")
    if not src:
        err(where, "image without src")
        return
    if re.match(r"^https?://", src):
        if full:
            err(where, "image must be downloaded into the repo, not hotlinked: %s" % src)
        return
    if not (ROOT / src).exists():
        err(where, "image file not found: %s" % src)
    for part in (im.get("srcset") or "").split(","):
        p = part.strip().split(" ")[0]
        if p and not re.match(r"^https?://", p) and not (ROOT / p).exists():
            err(where, "srcset file not found: %s" % p)
    if full:
        if not im.get("w") or not im.get("h"):
            err(where, "image needs w and h (pixels)")
        bi(where, im.get("alt"), "image.alt")
        if not im.get("ai"):
            bi(where, im.get("credit"), "image.credit")
            lic = im.get("license") or {}
            if not lic.get("label"):
                err(where, "image.license.label is missing (e.g. CC BY 2.0)")
        y = im.get("year")
        if y is not None and not (isinstance(y, int) and 1826 <= y <= 2100):
            err(where, "image.year must be the year the photo was taken, as a number (e.g. 2007)")


def check_links(where, links, required=True):
    if not links:
        if required:
            err(where, "needs at least one source link")
        return
    for i, l in enumerate(links):
        if not isinstance(l, dict):
            err(where, "links[%d] must be {label, url}" % i)
            continue
        if not re.match(r"^https?://", l.get("url", "")):
            err(where, "links[%d].url must be http(s)" % i)
        bi(where, l.get("label"), "links[%d].label" % i)


def publisher(url):
    """Who stands behind a link: reuters.com -> reuters, github.com/openai/x -> openai, openai.com -> openai."""
    u = urlparse(url or "")
    host = (u.hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    if host in ORG_HOSTS:
        seg = [x for x in u.path.split("/") if x]
        return (seg[0].lstrip("@").lower() if seg else host)
    labels = host.split(".")
    if labels[-1] in BRAND_TLDS:
        return labels[-1]
    if host.endswith((".github.io", ".substack.com", ".medium.com", ".hf.space")) and len(labels) > 2:
        return labels[0]
    if len(labels) >= 3 and len(labels[-1]) == 2 and labels[-2] in SECOND_LEVEL:
        return labels[-3]
    return labels[-2] if len(labels) >= 2 else host


def check_confidence(where, st):
    """confirmed = two independent publishers, both linked. Same vendor twice is one publisher."""
    if st.get("confidence") != "confirmed":
        return
    pubs = {publisher(l.get("url")) for l in (st.get("links") or []) if isinstance(l, dict) and l.get("url")}
    if len(pubs) < 2:
        err(where, "confidence 'confirmed' needs links to two independent publishers (found: %s); otherwise use 'likely'"
            % (", ".join(sorted(pubs)) or "none"))


def require_card_image(where, st):
    im = st.get("image") if isinstance(st, dict) else None
    if not isinstance(im, dict) or not im.get("src"):
        err(where, "every card needs an image: a licensed photo, or an AI illustration (ai: true) with a file in the repo")


def check_story(where, st, eid, kind):
    bi(where, st.get("headline"), "headline", allow_plain=False)
    bi(where, st.get("bottom"), "bottom", allow_plain=False)
    bi(where, st.get("why"), "why", allow_plain=False)
    facts = st.get("facts") or []
    if kind == "news" and not facts:
        err(where, "facts: give 1–5 short facts")
    if len(facts) > 5:
        warn(where, "facts: %d items; keep it to 5 or fewer" % len(facts))
    for i, f in enumerate(facts):
        bi(where, f, "facts[%d]" % i)
    for i, f in enumerate(st.get("flags") or []):
        bi(where, f, "flags[%d]" % i)
    if kind in ("news", "ai"):
        if st.get("confidence") not in CONF:
            err(where, "confidence must be one of %s" % sorted(CONF))
        bi(where, st.get("source"), "source")
    if st.get("time") and not TIME_RE.match(st["time"]):
        err(where, "time must be HH:MM (Israel)")
    check_links(where, st.get("links"))
    check_confidence(where, st)
    if kind == "catalyst" and not st.get("ticker"):
        err(where, "catalyst needs a ticker")
    for bad in ("body", "meta", "sourcesHtml", "tags"):
        if bad in st:
            err(where, "'%s' is a legacy field; use bottom / facts / why / flags / source / links" % bad)


def check_chip(where, c, full):
    if not c.get("sym"):
        err(where, "chip without sym")
    if c.get("missing"):
        return
    if not text(c.get("last") if isinstance(c.get("last"), str) else json.dumps(c.get("last"))):
        err(where, "chip %s has no last price (or set missing: true)" % c.get("sym"))
    if full:
        if not c.get("chg"):
            err(where, "chip %s has no change" % c.get("sym"))
        bi(where, c.get("flag"), "chip %s flag" % c.get("sym"))
        sym = text(c.get("sym") if isinstance(c.get("sym"), str) else "")
        fl = json.dumps(c.get("flag"), ensure_ascii=False)
        if sym == "VIX" and not ("Index" in fl and "מדד" in fl):
            err(where, "VIX is the index: its flag must say so (מדד, לא חוזה / Index, not futures)")
        if sym == "USD/ILS" and not ("FX" in fl and "מט״ח" in fl):
            err(where, "USD/ILS is the FX spot rate: its flag must say so (שער מט״ח / FX spot)")


def check_edition(folder, full_ok=True):
    eid = folder.name
    where = "briefings/%s/edition.js" % eid
    p = folder / "edition.js"
    if not p.exists():
        err("briefings/%s" % eid, "edition.js is missing")
        return None
    try:
        ed = load_call(p, "DJ.edition")
    except Exception as e:  # noqa: BLE001
        err(where, "not valid: %s" % e)
        return None
    if ed.get("id") != eid:
        err(where, "id %r does not match the folder name" % ed.get("id"))
    if not ID_RE.match(eid):
        err(where, "folder name must be YYYY-MM-DD-HHMM")
    else:
        if ed.get("date") != eid[:10]:
            err(where, "date must be %s" % eid[:10])
        if ed.get("time") != "%s:%s" % (eid[11:13], eid[13:15]):
            err(where, "time must be %s:%s" % (eid[11:13], eid[13:15]))
    if ed.get("slot") not in SLOTS:
        err(where, "slot must be one of %s" % sorted(SLOTS))
    if ed.get("et") and not TIME_RE.match(ed["et"]):
        err(where, "et must be HH:MM")
    shell = folder / "index.html"
    tmpl = (ROOT / "templates" / "shell.html").read_text(encoding="utf-8")
    if not shell.exists():
        err("briefings/%s/index.html" % eid, "missing; copy templates/shell.html")
    elif shell.read_text(encoding="utf-8") != tmpl:
        err("briefings/%s/index.html" % eid, "must be an exact copy of templates/shell.html")
    if ed.get("credits") and not (folder / ed["credits"]).exists():
        err(where, "credits file %s not found" % ed["credits"])
    if p.stat().st_size > 250_000:
        warn(where, "edition.js is %d KB; aim for under 120 KB" % (p.stat().st_size // 1024))

    legacy = bool(ed.get("legacy"))
    for path, s in walk_strings(ed):
        if "{{" in s or "}}" in s:
            err(where, "unfilled template token at %s" % path)
        tc = TagCheck()
        tc.feed(s)
        if tc.bad:
            err(where, "HTML tag(s) %s not allowed at %s" % (sorted(tc.bad), path))
        if tc.bad_href:
            err(where, "link must be http(s) at %s" % path)
        if DESK_WORDS.search(s):
            err(where, "desk note left in reader text at %s: %r" % (path, DESK_WORDS.search(s).group(0)))
        elif re.search(r"\bMAIN\b", s):
            err(where, "desk note left in reader text at %s: %r" % (path, "MAIN"))
        for cre, name in READER_BANS:
            m = cre.search(s)
            if m and not (name == "desk" and re.search(r"\b(?:trading|help|front) desk\b", s, re.I)):
                err(where, "desk note left in reader text at %s: %r" % (path, m.group(0)))
                break

    # images exist even on legacy editions (they are hotlinked in two early ones, which is how they shipped)
    def images(o, pth=""):
        if isinstance(o, dict):
            if "image" in o and isinstance(o["image"], dict):
                yield pth, o["image"]
            for k, v in o.items():
                yield from images(v, pth + "." + k)
        elif isinstance(o, list):
            for i, v in enumerate(o):
                yield from images(v, "%s[%d]" % (pth, i))

    for pth, im in images(ed):
        check_image("%s %s" % (where, pth), im, eid, full=not legacy)

    if legacy:
        return ed

    # ---------------- full editorial checks for new-format editions
    bi(where, ed.get("summary"), "summary", allow_plain=False)
    if "weather" in ed:
        err(where, "weather is not part of the paper; remove the weather field")
    published = None
    if ID_RE.match(eid):
        published = datetime.strptime(eid, "%Y-%m-%d-%H%M")
    news = ed.get("news") or {}
    stories = news.get("stories") or []
    if not stories:
        err(where, "news.stories is empty")
    if len(stories) > 9:
        warn(where, "news has %d stories; the front holds about 3–8" % len(stories))
    bi(where, news.get("asof"), "news.asof")
    for i, st in enumerate(stories):
        w = "%s news.stories[%d]" % (where, i)
        check_story(w, st, eid, "news")
        require_card_image(w, st)
    mk = ed.get("markets")
    if mk:
        bi(where, mk.get("asof"), "markets.asof")
        tape = mk.get("tape") or []
        if len(tape) > 6:
            err(where, "markets.tape holds at most 6 chips (ES, NQ, YM, VIX, USD/ILS, WTI)")
        for i, c in enumerate(tape):
            check_chip("%s markets.tape[%d]" % (where, i), c, True)
        if len(mk.get("extra") or []) > 2:
            err(where, "markets.extra holds at most 2 chips (BTC, 10Y)")
        for i, c in enumerate(mk.get("extra") or []):
            check_chip("%s markets.extra[%d]" % (where, i), c, True)
        for i, st in enumerate(mk.get("drivers") or []):
            w = "%s markets.drivers[%d]" % (where, i)
            check_story(w, st, eid, "driver")
            require_card_image(w, st)
        for i, st in enumerate(mk.get("catalysts") or []):
            w = "%s markets.catalysts[%d]" % (where, i)
            check_story(w, st, eid, "catalyst")
            require_card_image(w, st)
        if mk.get("stamp") is not None:
            bi(where, mk.get("stamp"), "markets.stamp")
            for l, v in ((mk["stamp"] or {}).items() if isinstance(mk.get("stamp"), dict) else [("", mk.get("stamp"))]):
                if len(text(v)) > 22:
                    warn(where, "markets.stamp%s is long (%r); it is the ticker label, e.g. \"Fri 15:21\"" % ("." + l if l else "", text(v)))
        fresh = not mk.get("carried")
        for i, it in enumerate((mk.get("calendar") or {}).get("items") or []):
            w = "%s markets.calendar.items[%d]" % (where, i)
            bi(w, it.get("label"), "label")
            for k in ("time", "et"):
                if it.get(k) and not TIME_RE.match(it[k]):
                    err(w, "%s must be HH:MM" % k)
            if it.get("date") and not DATE_RE.match(it["date"]):
                err(w, "date must be YYYY-MM-DD")
            if it.get("time") and not it.get("date"):
                err(w, "an event with a time needs its date (YYYY-MM-DD)")
            if it.get("status") is not None and it["status"] not in CAL_STATUS:
                err(w, "status must be one of %s" % sorted(CAL_STATUS))
            if it.get("result") is not None:
                bi(w, it.get("result"), "result")
            # An event that happened before this edition went out must say what happened, or say the result is not in.
            if fresh and published and it.get("date") and DATE_RE.match(it["date"]):
                at = it["date"] + " " + (it.get("time") if it.get("time") and TIME_RE.match(it["time"]) else "23:59")
                if datetime.strptime(at, "%Y-%m-%d %H:%M") <= published and not it.get("result") and not it.get("status"):
                    err(w, "this event is at or before the edition time (%s): give its sourced result, or \"status\": \"unavailable\"; do not present it as upcoming" % at)
        for i, p_ in enumerate(mk.get("story") or []):
            bi(where, p_, "markets.story[%d]" % i)
    ai = ed.get("ai")
    if ai:
        bi(where, ai.get("asof"), "ai.asof")
        for i, st in enumerate(ai.get("stories") or []):
            w = "%s ai.stories[%d]" % (where, i)
            # A carried digest can still be in the previous story shape (body / meta / sourcesHtml).
            # Copying it forward must keep the wording and the label. This drop's own cards are checked in full.
            if ai.get("carried") and isinstance(st, dict) and any(k in st for k in ("body", "meta", "sourcesHtml")):
                require_card_image(w, st)
                continue
            check_story(w, st, eid, "ai")
            require_card_image(w, st)
    for sec in ("news", "markets", "ai"):
        s = ed.get(sec) or {}
        c = s.get("carried")
        if c not in (None, False, True) and not isinstance(c, (str, dict)):
            err(where, "%s.carried must be true/false or a note" % sec)
    return ed


def main(only=None):
    # site files
    for f in ("index.html", "archive/index.html", "404.html", "assets/dj.js", "assets/dj.css", "assets/editions.js", "templates/shell.html", ".nojekyll"):
        if not (ROOT / f).exists():
            err(f, "missing")
    home = (ROOT / "index.html").read_text(encoding="utf-8") if (ROOT / "index.html").exists() else ""
    if 'DJ.boot("latest")' not in home:
        err("index.html", "the homepage must boot the latest edition (do not hand-write the homepage)")
    arch = (ROOT / "archive/index.html").read_text(encoding="utf-8") if (ROOT / "archive/index.html").exists() else ""
    if 'DJ.boot("archive")' not in arch:
        err("archive/index.html", "the archive must boot from the manifest")

    try:
        manifest = load_call(ROOT / "assets" / "editions.js", "DJ.manifest")
    except Exception as e:  # noqa: BLE001
        err("assets/editions.js", "not valid: %s" % e)
        manifest = []
    ids = [m.get("id") for m in manifest]
    if ids != sorted(ids, reverse=True):
        err("assets/editions.js", "entries must be newest first")
    if len(ids) != len(set(ids)):
        err("assets/editions.js", "duplicate ids")
    folders = sorted(d for d in (ROOT / "briefings").iterdir() if d.is_dir())
    names = {d.name for d in folders}
    for i in ids:
        if i not in names:
            err("assets/editions.js", "lists %s but briefings/%s/ does not exist" % (i, i))
    for n in names - set(ids):
        err("assets/editions.js", "briefings/%s/ is not listed" % n)

    by_id = {m.get("id"): m for m in manifest}
    for d in folders:
        if only and d.name != only:
            continue
        ed = check_edition(d)
        if ed is None or d.name not in by_id:
            continue
        m = by_id[d.name]
        for k in ("date", "time", "slot"):
            if m.get(k) != ed.get(k):
                err("assets/editions.js", "%s: %s is %r, edition says %r" % (d.name, k, m.get(k), ed.get(k)))
        lead = ((ed.get("news") or {}).get("stories") or [{}])[0].get("headline")
        if not ed.get("legacy") and m.get("headline") != lead:
            err("assets/editions.js", "%s: headline must equal the lead story headline" % d.name)
        if not m.get("headline"):
            err("assets/editions.js", "%s: headline is missing" % d.name)

    owner_re = re.compile(r"Jenya", re.I)
    served = [ROOT / "README.md", ROOT / "templates" / "PUBLISH.md", ROOT / "templates" / "IMAGE-CREDITS.md", ROOT / "index.html", ROOT / "archive.html", ROOT / "404.html"]
    served += list((ROOT / "briefings").glob("*/IMAGE-CREDITS.md"))
    served += list((ROOT / "templates").glob("**/*"))
    for f in served:
        if not f.is_file() or f.suffix.lower() not in {".md", ".html", ".js", ".css", ".txt", ".yml"}:
            continue
        try:
            text = f.read_text(encoding="utf-8")
        except OSError:
            continue
        if re.search(r"engineer in Israel|one reader,", text, re.I):
            err(str(f.relative_to(ROOT)), "owner description must not be published")
        for m in owner_re.finditer(text):
            ctx = text[max(0, m.start() - 16): m.end()]
            if re.search(r"(The )?Daily Jenya$", ctx):
                continue
            err(str(f.relative_to(ROOT)), "owner name outside the brand “The Daily Jenya”: %r" % text[max(0, m.start() - 24): m.end() + 12].replace("\n", " "))
            break

    for w in warnings:
        print("warning  " + w)
    for e in errors:
        print("ERROR    " + e)
    print("%d editions checked, %d errors, %d warnings" % (len(folders) if not only else 1, len(errors), len(warnings)))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else None))
