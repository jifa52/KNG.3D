#!/usr/bin/env python3
"""Convert a legacy Daily Jenya edition (hand-written HTML, Sept–Oct 2026)
into the content format used by the redesigned paper (edition.js, schema v2).

    python3 tools/convert_legacy.py briefings/2026-10-03-1400/index.html > briefings/2026-10-03-1400/edition.js
    cp templates/shell.html briefings/2026-10-03-1400/index.html

Three legacy layouts are understood:
  cards      2 Sep – 24 Sep 14:00   (assets/brief.css, lane panels)
  boards     24 Sep 15:45, 25 Sep 08:50 (quote boards)
  editorial  25 Sep 14:00 – 3 Oct   (night sheet, news-first markets)

Nothing is rewritten. Every visible sentence of the original is carried into a
field; anything the converter does not recognise is kept in a fallback block, so
no text is dropped. Page chrome (nav, buttons, section titles, the duplicated
indices crawl) is not content and is not copied.

Requires: beautifulsoup4, lxml.
"""
import html
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

LANGS = ("he", "en")
INLINE_KEEP = {"strong", "b", "em", "i", "a", "bdi", "code", "br", "sup", "sub", "abbr", "s", "u", "q", "cite", "kbd", "mark", "small"}
BLOCKY = {"p", "li", "dd", "dt", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "summary", "div", "ul", "ol", "dl", "section", "article", "header", "footer", "details", "figure", "blockquote"}
# Elements that are page chrome, not content.
CHROME_SELECTORS = [
    "script", "style", "noscript", "nav", "button", ".skip", ".topbar", ".mast-brand", ".brand", ".mast-title",
    ".mast-date", ".switch-bar", ".lang", ".lang-switch", ".lane-switch", ".edition-nav", ".crawl", ".why-label",
    ".visually-hidden", "h2.kicker", "h3.mkt-label", "h3.label", ".lead-index", ".mkt-snap-kicker", ".brand-foot",
    ".permalink", ".zone-head h2", "#tape-heading", "#calendar-heading", ".opening-label",
]

WS = re.compile(r"\s+")


def norm(s):
    return WS.sub(" ", s).strip()


# --------------------------------------------------------------------------- text


def lang_of(el):
    return el.get("data-lang") if isinstance(el, Tag) else None


def ser(node, lang):
    """Serialise a node for one language as cleaned inline HTML."""
    out = []
    for ch in node.children if isinstance(node, Tag) else [node]:
        if isinstance(ch, Comment):
            continue
        if isinstance(ch, NavigableString):
            out.append(html.escape(str(ch), quote=False))
            continue
        if not isinstance(ch, Tag):
            continue
        dl = ch.get("data-lang")
        if dl and dl != lang:
            continue
        cls = ch.get("class") or []
        if "why-label" in cls or "visually-hidden" in cls:
            continue
        name = ch.name
        inner = ser(ch, lang)
        if "ticker" in cls or "mkt-tick" in cls:
            out.append("<b>" + inner + "</b>")
        elif name == "a":
            href = ch.get("href", "")
            if href and not href.startswith("javascript:"):
                out.append('<a href="%s">%s</a>' % (html.escape(href, quote=True), inner))
            else:
                out.append(inner)
        elif name == "br":
            out.append("<br>")
        elif name in INLINE_KEEP:
            out.append("<%s>%s</%s>" % (name, inner, name))
        elif name in BLOCKY:
            out.append(" " + inner + " ")
        else:  # span, time, etc. → unwrap
            out.append(inner)
    return "".join(out)


def clean(s):
    s = WS.sub(" ", s).strip()
    s = re.sub(r"<(b|strong|em|i|bdi|code)>\s*</\1>", "", s)
    return s


def field(els):
    """Bilingual field from one element (with data-lang spans) or a he/en pair."""
    if isinstance(els, Tag):
        els = [els]
    els = [e for e in els if e is not None]
    if not els:
        return None
    res = {}
    for lang in LANGS:
        parts = []
        for e in els:
            dl = lang_of(e)
            if dl and dl != lang:
                continue
            t = clean(ser(e, lang))
            if t:
                parts.append(t)
        res[lang] = " ".join(parts)
    if not res["he"] and not res["en"]:
        return None
    if res["he"] == res["en"]:
        return res["he"]
    return res


def pairs(els):
    """List of bilingual paragraphs from elements that alternate he/en (or carry both)."""
    he, en, both = [], [], []
    seq = []
    for e in els:
        dl = lang_of(e)
        if dl == "he":
            he.append(e)
        elif dl == "en":
            en.append(e)
        else:
            seq.append(e)
    out = []
    for e in seq:
        f = field(e)
        if f:
            out.append(f)
    n = max(len(he), len(en))
    for i in range(n):
        f = {"he": clean(ser(he[i], "he")) if i < len(he) else "", "en": clean(ser(en[i], "en")) if i < len(en) else ""}
        if f["he"] or f["en"]:
            out.append(f["he"] if f["he"] == f["en"] else f)
    return out


# --------------------------------------------------------------------------- consumption tracking


class Tracker:
    def __init__(self):
        self.used = set()

    def take(self, el):
        if el is None:
            return None
        if isinstance(el, list):
            for e in el:
                self.take(e)
            return el
        self.used.add(id(el))
        return el

    def is_used(self, el):
        p = el
        while isinstance(p, Tag):
            if id(p) in self.used:
                return True
            p = p.parent
        return False


def own_text(el):
    return norm("".join(str(c) for c in el.children if isinstance(c, NavigableString) and not isinstance(c, Comment)))


def leftovers(root, tr):
    """Text-bearing blocks under root that nothing consumed, in DOM order."""
    out = []
    if root is None:
        return out
    for el in root.find_all(True):
        if tr.is_used(el):
            continue
        if el.name in ("p", "li", "dd", "dt", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "summary", "span", "strong", "a", "div", "td", "th"):
            # a block with its own text, or an inline whose parent block was consumed elsewhere
            if el.name in ("span", "strong", "a", "div") and not own_text(el):
                continue
            if el.name in ("span", "strong", "a") and el.parent is not None and not tr.is_used(el.parent) and el.parent.name in ("p", "li", "dd", "dt", "h2", "h3", "figcaption", "summary", "div"):
                continue
            txt = norm(el.get_text(" "))
            if not txt:
                continue
            out.append(el)
            tr.take(el)
    return out


# --------------------------------------------------------------------------- pieces


def image(fig, tr, root_prefix):
    if fig is None:
        return None
    tr.take(fig)
    img = fig.find("img")
    if img is None:
        return None

    def fix(u):
        u = u.strip()
        if u.startswith(root_prefix):
            return u[len(root_prefix):]
        return u

    im = {"src": fix(img.get("src", ""))}
    if img.get("srcset"):
        im["srcset"] = ", ".join(fix(p.strip()) for p in img["srcset"].split(","))
    if img.get("sizes"):
        im["sizes"] = img["sizes"]
    for k in ("width", "height"):
        if img.get(k):
            try:
                im["w" if k == "width" else "h"] = int(img[k])
            except ValueError:
                pass
    he = img.get("data-alt-he") or img.get("alt") or ""
    en = img.get("data-alt-en") or img.get("alt") or ""
    im["alt"] = he if he == en else {"he": he, "en": en}
    cap = fig.find("figcaption")
    if cap is not None:
        if "illus-caption" in (cap.get("class") or []):
            im["ai"] = True
        else:
            f = field(cap)
            if f:
                im["caption"] = f
    return im


def chips(tags_p, tr):
    out = []
    if tags_p is None:
        return out
    tr.take(tags_p)
    for sp in tags_p.find_all("span", recursive=False):
        cls = sp.get("class") or []
        kind, level = "chip", None
        for c in cls:
            if c.startswith("fresh-"):
                kind, level = "fresh", c[6:]
            elif c.startswith("chip-conf-"):
                kind, level = "conf", c[10:]
            elif c == "chip-source":
                kind = "source"
            elif c.startswith("chip-cal-"):
                kind, level = "cal", c[9:]
        t = field(sp)
        if t:
            d = {"kind": kind, "text": t}
            if level:
                d["level"] = level
            out.append(d)
    return out


def headline_els(art):
    hs = []
    for h in art.find_all(["h1", "h2", "h3", "h4"]):
        if h.find_parent("figure") is not None or h.find_parent("details") is not None:
            continue
        if h.find_parent("article") is not art:
            continue
        hs.append(h)
    return hs


def strip_prefix(f, prefixes):
    return f


def story(art, tr, root_prefix):
    st = {}
    cls = art.get("class") or []
    k = art.select_one(".card-kicker")
    if k is not None:
        st["kicker"] = field(k)
    tg = chips(art.select_one(".story-tags"), tr)
    if tg:
        st["tags"] = tg
    hs = headline_els(art)
    if hs:
        tick = None
        for h in hs:
            t = h.select_one(".mkt-tick")
            if t is not None:
                tick = norm(t.get_text())
                t.decompose()
        hl = field(hs)
        if tick:
            st["ticker"] = tick
            # drop the joining middle dot left after the ticker
            if isinstance(hl, dict):
                hl = {l: re.sub(r"^\s*·\s*", "", v) for l, v in hl.items()}
            elif isinstance(hl, str):
                hl = re.sub(r"^\s*·\s*", "", hl)
        st["headline"] = hl
    fig = art.find("figure")
    if fig is not None:
        im = image(fig, tr, root_prefix)
        if im:
            st["image"] = im
    body = art.select("p.body, p.short-body, p.pending-body")
    body = [b for b in body if b.find_parent("article") is art]
    if body:
        st["body"] = pairs(body)
    why = art.select_one("p.why")
    if why is not None:
        st["why"] = field(why)
    wb = art.select_one(".why-beat")
    if wb is not None:
        st["why"] = field(wb.select(".why-text")) or field(wb)
    meta = art.select_one("p.card-meta")
    if meta is not None:
        st["meta"] = field(meta)
    src = art.select("p.sources, p.story-sources")
    if src:
        st["sourcesHtml"] = pairs(src)
    notes = art.select("p.cross-ref, p.note, p.mkt-aside")
    if notes:
        st["notes"] = pairs(notes)
    more = art.select("details")
    if more:
        mm = []
        for d in more:
            tr.take(d)
            summ = d.find("summary")
            ps = [p for p in d.find_all(["p", "li", "dd", "dt"])]
            sf = field(summ) if summ is not None else None
            mm.append({"title": sf, "items": pairs(ps)})
        st["more"] = mm
    if "pending-card" in cls:
        st["pending"] = True
    # anything else inside the article that carries text
    for el in [art.select_one(".card-kicker"), why, wb, meta] + body + src + notes:
        if el is not None:
            tr.take(el)
    for h in hs:
        tr.take(h)
    rest = []
    for el in art.find_all(True):
        if tr.is_used(el):
            continue
        if el.name in ("p", "li", "dd", "dt", "figcaption", "h2", "h3", "h4", "summary") and norm(el.get_text(" ")):
            rest.append(el)
            tr.take(el)
    if rest:
        st.setdefault("body", []).extend(pairs(rest))
    return st


def chip_from(art, tr, kind="snap"):
    tr.take(art)
    c = {}
    sym = art.select_one(".mkt-sym, .tape-label, .crawl-sym")
    if sym is not None:
        c["sym"] = field(sym)
        if sym.name == "a" and sym.get("href"):
            c["url"] = sym["href"]
        a = sym.find("a")
        if a is not None and a.get("href"):
            c["url"] = a["href"]
    name = art.select_one(".mkt-name")
    if name is not None:
        c["name"] = field(name)
    px = art.select_one(".mkt-px, .tape-value")
    if px is not None:
        c["last"] = field(px)
    chg = art.select_one(".mkt-chg, .tape-move")
    if chg is not None:
        if "tape-move" in (chg.get("class") or []) and not re.search(r"\d", chg.get_text()):
            c["flag"] = field(chg)  # card-era cells put a word ("fut", "level") where a change would go
        else:
            c["chg"] = field(chg)
    flag = art.select_one(".mkt-flag")
    if flag is not None:
        c["flag"] = field(flag)
    for k in ("sym", "last", "chg"):
        v = c.get(k)
        if isinstance(v, str):
            m = re.fullmatch(r"<bdi>([^<]*)</bdi>", v)
            if m:
                c[k] = m.group(1)
    cls = art.get("class") or []
    if "mkt-chip--missing" in cls:
        c["missing"] = True
    ch = c.get("chg") or ""
    ch = re.sub(r"<[^>]+>", "", ch if isinstance(ch, str) else ch.get("en") or ch.get("he") or "")
    if "tape-down" in cls or ch.startswith(("-", "−", "–")):
        c["dir"] = "down"
    elif "tape-up" in cls or ch.startswith("+"):
        c["dir"] = "up"
    det = art.select("details")
    if det:
        items = []
        for d in det:
            tr.take(d)
            items.extend(pairs(d.find_all("p")))
        if items:
            c["detail"] = items
    note = art.select("p.mkt-note, .mkt-meta p")
    for el in art.find_all(True):
        tr.take(el)
    return c


def calendar_items(lis, tr):
    out = []
    for li in lis:
        tr.take(li)
        it = {}
        w = li.select_one("strong.when, .cal-when")
        if w is not None:
            it["when"] = field(w)
        nm = li.select_one(".cal-name")
        if nm is not None:
            it["text"] = field(nm)
        tg = []
        for sp in li.select(".chip"):
            t = field(sp)
            if t:
                c = {"kind": "cal", "text": t}
                for cl in sp.get("class") or []:
                    if cl.startswith("chip-cal-"):
                        c["level"] = cl[9:]
                tg.append(c)
        if tg:
            it["tags"] = tg
        ps = li.find_all("p")
        if ps:
            it["detail"] = pairs(ps)
        if not it:
            it["text"] = field(li)
        out.append(it)
    return out


def extra_block(sec, tr, kind="list"):
    """A generic titled list (watch list, weather, glossary, session banner)."""
    tr.take(sec)
    ex = {"kind": kind}
    h = sec.find(["h2", "h3", "summary"])
    if h is not None:
        ex["title"] = field(h)
    items = []
    if kind == "glossary":
        for div in sec.select("dl > div"):
            terms = div.find_all("dt")
            defs = div.find_all("dd")
            t = field(terms)
            d = field(defs)
            if isinstance(t, str):
                t = {"he": t, "en": t}
            if isinstance(d, str):
                d = {"he": d, "en": d}
            items.append({l: "<b>%s</b> — %s" % ((t or {}).get(l, ""), (d or {}).get(l, "")) for l in LANGS})
    elif kind == "weather":
        for li in sec.select("li"):
            city = field(li.select_one(".weather-city"))
            facts = field(li.select_one(".weather-facts"))
            if isinstance(city, str):
                city = {"he": city, "en": city}
            if isinstance(facts, str):
                facts = {"he": facts, "en": facts}
            items.append({l: "<b>%s</b> — %s" % ((city or {}).get(l, ""), (facts or {}).get(l, "")) for l in LANGS})
        notes = sec.select(".weather-note")
        if notes:
            ex["note"] = pairs(notes)
    else:
        for li in sec.select("li"):
            f = field(li)
            if f:
                items.append(f)
    ex["items"] = items
    return ex


# --------------------------------------------------------------------------- eras


def detect_era(soup):
    links = " ".join(l.get("href", "") for l in soup.find_all("link"))
    if "brief.css" in links:
        return "cards"
    if soup.select_one(".mkt-board-primary") is not None:
        return "boards"
    return "editorial"


SLOTS = {"0830": "morning", "0850": "morning", "1400": "midday", "1545": "markets", "1814": "intraday", "1830": "evening", "2300": "close"}


def base_meta(eid):
    d, t = eid[:10], eid[11:]
    hh, mm = int(t[:2]), int(t[2:])
    et_h = (hh - 7) % 24  # IDT (UTC+3) vs EDT (UTC-4) throughout Sep–Oct 2026
    return {"v": 2, "id": eid, "date": d, "time": "%02d:%02d" % (hh, mm), "et": "%02d:%02d" % (et_h, mm), "slot": SLOTS.get(t, "special")}


def summary_from(soup):
    h = soup.find("html")
    he, en = h.get("data-desc-he"), h.get("data-desc-en")
    if he or en:
        return {"he": norm(he or ""), "en": norm(en or "")}
    return None


def convert_cards(soup, ed, tr, rp):
    meta = soup.select_one("dl.mast-meta")
    notes = []
    if meta is not None:
        tr.take(meta)
        for div in meta.find_all("div", recursive=False):
            dt, dd = div.find("dt"), div.find("dd")
            lab = norm(dt.get_text(" ")) if dt else ""
            if "Phase" in lab or "מהדורה" in lab:
                ed["label"] = field(dd)
            elif "Israel" in lab or "ישראל" in lab:
                ed["clock"] = field(dd)
            else:
                f = field([dt, dd])
                if f:
                    notes.append({"label": field(dt), "text": field(dd)})
    if notes:
        ed["notes"] = notes

    def lane(lid):
        sec = soup.select_one("#" + lid)
        if sec is None:
            return None, None
        s = {}
        dek = sec.find_all("p", class_="lane-kicker")
        if dek:
            s["dek"] = pairs(tr.take(dek))
        fr = sec.select("p.freshness")
        if fr:
            s["notes"] = pairs(tr.take(fr))
        st = [story(a, tr, rp) for a in sec.select(".stack > article")]
        if st:
            s["stories"] = st
        return s, sec

    news, nsec = lane("lane-news")
    mk, msec = lane("lane-markets")
    pre, psec = lane("lane-premarket")
    ai, asec = lane("lane-ai")
    news = news or {}
    mk = mk or {}
    for op in soup.select(".opening-summary"):
        tr.take(op)
        ex = {"kind": "summary", "title": field(op.select_one(".opening-label")), "items": pairs(op.select(".opening-text"))}
        news.setdefault("extras", []).append(ex)
    for b in soup.select("p.session-banner"):
        tr.take(b)
        items = []
        v = b.select_one(".session-banner-value")
        vt = field(v) if v is not None else None
        for a in pairs(b.select(".session-banner-asof")):
            if isinstance(a, str):
                a = {"he": a, "en": a}
            items.append({l: ("<b>%s</b> · %s" % (vt, a[l])) if isinstance(vt, str) else a[l] for l in LANGS})
        mk.setdefault("extras", []).append({"kind": "banner", "title": field(b.select_one(".session-banner-kicker")), "items": items})
    if mk.get("stories"):
        mk["drivers"] = mk.pop("stories")
    for sec in [msec, psec]:
        if sec is None:
            continue
        for tz in sec.select("section.tape-zone"):
            h = tz.select_one(".zone-head h2")
            board = {"title": field(h) if h is not None else None, "items": [chip_from(li, tr) for li in tz.select("li.tape-cell")]}
            zn = tz.select("p.zone-note")
            if zn:
                board["note"] = pairs(tr.take(zn))
            fr = tz.select("p.freshness")
            if fr:
                board.setdefault("note", []).extend(pairs(tr.take(fr)))
            mk.setdefault("boards", []).append(board)
        cal = sec.select_one("section.calendar-strip")
        if cal is not None:
            tr.take(cal)
            zn = cal.select("p.zone-note")
            c = {"items": calendar_items(cal.select("ol.calendar-rows > li"), tr)}
            if zn:
                c["note"] = pairs(tr.take(zn))
            mk["calendar"] = c
        for ws in sec.select("section.watch-strip"):
            mk.setdefault("extras", []).append(extra_block(ws, tr, "watch"))
        for ws in sec.select("section.weather-strip"):
            mk.setdefault("extras", []).append(extra_block(ws, tr, "weather"))
    if pre:
        mk["pre"] = pre
    # weather / glossary may sit in the news lane too
    for sec in [nsec, asec]:
        if sec is None:
            continue
        for ws in sec.select("section.weather-strip"):
            news.setdefault("extras", []).append(extra_block(ws, tr, "weather"))
    for g in soup.select("details.glossary-block"):
        target = mk if (msec is not None and g.find_parent(id="lane-markets")) or (psec is not None and g.find_parent(id="lane-premarket")) else news
        target.setdefault("extras", []).append(extra_block(g, tr, "glossary"))
    ed["news"] = news or {}
    ed["markets"] = mk
    ed["ai"] = ai or {}
    # leftovers per lane
    for key, sec in (("news", nsec), ("markets", msec), ("ai", asec)):
        lo = leftovers(sec, tr)
        if lo:
            ed[key].setdefault("extras", []).append({"kind": "text", "items": pairs(lo)})
    if psec is not None:
        lo = leftovers(psec, tr)
        if lo:
            ed["markets"].setdefault("pre", {}).setdefault("extras", []).append({"kind": "text", "items": pairs(lo)})
    foot = soup.select_one("footer.foot")
    if foot is not None:
        sl = foot.select("p.sources-line")
        if sl:
            ed["sources"] = pairs(sl)
        dc = foot.select("p.disclaimer")
        if dc:
            ed["footer"] = pairs(dc)
        lo = leftovers(foot, tr)
        if lo:
            ed.setdefault("footer", []).extend(pairs(lo))


def convert_editorial(soup, ed, tr, rp):
    badge = soup.select_one(".mast-meta .badge")
    if badge is not None:
        ed["label"] = field(tr.take(badge))
    mm = soup.select_one(".mast-meta")
    if mm is not None:
        notes = []
        for p in mm.find_all("p", recursive=False):
            tr.take(p)
            if p is badge:
                continue
            t = norm(p.get_text(" "))
            if p.find("strong") is not None and len(p.find_all(True)) <= 4 and re.search(r"20\d\d", t):
                continue  # the date line
            if t.startswith("שעת המהדורה") or "Edition time" in t:
                ed["clock"] = field(p)
                continue
            f = field(p)
            if f:
                notes.append({"text": f})
        if notes:
            ed["notes"] = notes

    def head(sec, s):
        w = sec.select_one(".section-when")
        if w is not None:
            s["asof"] = field(tr.take(w))

    # NEWS
    sec = soup.select_one("#news")
    news = {}
    if sec is not None:
        head(sec, news)
        dek = sec.select("p.news-open, p.quotes") + [q for q in soup.select("p.quotes") if q.find_parent(id="news") is None]
        if dek:
            news["dek"] = pairs(tr.take(dek))
        sts = []
        for a in sec.find_all("article"):
            if a.find_parent("article") is not None:
                continue
            s = story(a, tr, rp)
            if a.find_parent(class_="quiet-band") is not None:
                s["role"] = "quiet"
            sts.append(s)
        if sts:
            news["stories"] = sts
        lo = leftovers(sec, tr)
        if lo:
            news.setdefault("extras", []).append({"kind": "text", "items": pairs(lo)})
    ed["news"] = news

    # MARKETS
    sec = soup.select_one("#markets")
    mk = {}
    if sec is not None:
        head(sec, mk)
        sess = sec.select_one(".mkt-session")
        if sess is not None:
            tr.take(sess)
            mk["dek"] = pairs(sess.find_all("p"))
        d = sec.select(".mkt-drivers > article")
        if d:
            mk["drivers"] = [story(a, tr, rp) for a in d]
        c = sec.select(".mkt-catalysts > article, .companies > article")
        if c:
            mk["catalysts"] = [story(a, tr, rp) for a in c]
        nx = sec.select_one(".mkt-next, .upcoming")
        if nx is not None:
            tr.take(nx)
            cal = {"items": calendar_items(nx.select("ol > li, ul > li"), tr)}
            ld = [p for p in nx.find_all("p", recursive=False)]
            if ld:
                cal["note"] = pairs(tr.take(ld))
            mk["calendar"] = cal
        br = sec.select_one(".mkt-brief, .mkt-story")
        if br is not None:
            tr.take(br)
            mk["story"] = pairs(br.find_all("p"))
        snap = sec.select_one(".mkt-snap")
        if snap is not None:
            tr.take(snap)
            nt = snap.select("p.mkt-snap-note")
            if nt:
                mk["note"] = pairs(tr.take(nt))
            mk["tape"] = [chip_from(a, tr) for a in snap.select(".mkt-strip:not(.mkt-strip-tuck) > .mkt-chip")]
            tk = [chip_from(a, tr) for a in snap.select(".mkt-strip-tuck > .mkt-chip")]
            if tk:
                mk["extra"] = tk
        boards = sec.select(".mkt-board")
        if boards:
            bl = []
            for b in boards:
                title = None
                prev = b.find_previous_sibling(["h3", "div"])
                if prev is not None and prev.name == "h3":
                    title = field(prev)
                bl.append({"title": title, "items": [chip_from(a, tr) for a in b.select(".mkt-line, .mkt-chip")]})
            mk["boards"] = bl
        lo = leftovers(sec, tr)
        if lo:
            mk.setdefault("extras", []).append({"kind": "text", "items": pairs(lo)})
    ed["markets"] = mk

    # AI
    sec = soup.select_one("#ai")
    ai = {}
    if sec is not None:
        head(sec, ai)
        cr = sec.select("p.ai-carry")
        if cr:
            ai["notes"] = pairs(tr.take(cr))
        sts = [story(a, tr, rp) for a in sec.select("article")]
        if sts:
            ai["stories"] = sts
        lo = leftovers(sec, tr)
        if lo:
            ai.setdefault("extras", []).append({"kind": "text", "items": pairs(lo)})
    ed["ai"] = ai

    foot = soup.select_one("footer.page-foot")
    if foot is not None:
        ps = []
        for p in foot.find_all("p"):
            t = norm(p.get_text(" "))
            if t.startswith("©"):
                continue
            if p.find("a") is not None and len(norm(re.sub(r"<a[^>]*>.*?</a>", "", str(p)))) < 40:
                continue  # link row (archive · credits · sibling editions)
            ps.append(p)
        tr.take(foot.find_all("p"))
        if ps:
            ed["footer"] = pairs(ps)


def prune(o):
    if isinstance(o, dict):
        return {k: prune(v) for k, v in o.items() if v not in (None, "", [], {})}
    if isinstance(o, list):
        return [prune(v) for v in o if v not in (None, "", [], {})]
    return o


def convert(path, archive_entry=None):
    path = Path(path)
    eid = path.parent.name
    raw = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(raw, "lxml")
    tr = Tracker()
    for sel in CHROME_SELECTORS:
        for el in soup.select(sel):
            tr.take(el)
    ed = base_meta(eid)
    era = detect_era(soup)
    ed["legacy"] = era
    sm = summary_from(soup)
    if archive_entry:
        ed["headline"] = archive_entry.get("headline")
        ed["summary"] = archive_entry.get("summary") or sm
        if archive_entry.get("contents"):
            ed["contents"] = archive_entry["contents"]
    elif sm:
        ed["summary"] = sm
    rp = "../../"
    if era == "cards":
        convert_cards(soup, ed, tr, rp)
    else:
        convert_editorial(soup, ed, tr, rp)
    lo = leftovers(soup.body, tr)
    if lo:
        ed.setdefault("news", {}).setdefault("extras", []).append({"kind": "text", "items": pairs(lo)})
    if (path.parent / "IMAGE-CREDITS.md").exists():
        ed["credits"] = "IMAGE-CREDITS.md"
    return prune(ed), tr, soup


def to_js(ed):
    return "DJ.edition(" + json.dumps(ed, ensure_ascii=False, indent=1) + ");\n"


def archive_entries(archive_html):
    soup = BeautifulSoup(Path(archive_html).read_text(encoding="utf-8"), "lxml")
    out = {}
    for a in soup.select('main a[href*="briefings/"]'):
        m = re.search(r"briefings/([0-9-]+)/", a["href"])
        if not m:
            continue
        li = a.find_parent("li") or a.find_parent("article")
        ps = [p for p in li.find_all("p") if "edition-when" not in (p.get("class") or [])]
        e = {"headline": field(a)}
        if ps:
            e["summary"] = field(ps[0])
        if len(ps) > 1:
            e["contents"] = field(ps[1])
        out[m.group(1)] = e
    return out


if __name__ == "__main__":
    src = Path(sys.argv[1])
    arch = Path(__file__).resolve().parent.parent / "archive" / "index.html"
    entries = archive_entries(arch) if arch.exists() and "DJ." not in arch.read_text(encoding="utf-8") else {}
    ed, _, _ = convert(src, entries.get(src.parent.name))
    sys.stdout.write(to_js(ed))
