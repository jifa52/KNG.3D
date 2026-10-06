/* The Daily Jenya — renderer.
   Every page is a thin shell. Content lives in data files:
     assets/editions.js          DJ.manifest([...])   every edition, newest first
     briefings/<id>/edition.js   DJ.edition({...})    one edition
   This file turns that data into the page. Bots never edit it. */
(function () {
  "use strict";

  var DJ = (window.DJ = window.DJ || {});
  var root = document.documentElement;
  var ROOT = root.getAttribute("data-root") || "";
  var LANG_KEY = "brief-lang";
  var THEME_KEY = "dj-theme";
  var SECTIONS = ["news", "markets", "ai"];
  var ALIAS = { premarket: "markets", "lane-news": "news", "lane-markets": "markets", "lane-premarket": "markets", "lane-ai": "ai" };
  var state = { lang: "he", edition: null, manifest: [], section: "news", mode: "edition" };

  /* ------------------------------------------------------------ storage */
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  /* ------------------------------------------------------------ language + theme, before paint */
  function hashLang() { var h = location.hash; return h === "#he" || h === "#en" ? h.slice(1) : null; }
  state.lang = hashLang() || (function () { var s = load(LANG_KEY); return s === "en" || s === "he" ? s : null; })() || "he";
  if (hashLang()) save(LANG_KEY, state.lang);
  function applyLang() {
    root.lang = state.lang;
    root.dir = state.lang === "he" ? "rtl" : "ltr";
  }
  function applyTheme() {
    var t = load(THEME_KEY);
    if (t === "light" || t === "dark") root.setAttribute("data-theme", t);
    else root.removeAttribute("data-theme");
  }
  applyLang();
  applyTheme();

  /* ------------------------------------------------------------ strings */
  var UI = {
    news: ["חדשות", "News"], markets: ["שווקים", "Markets"], ai: ["AI", "AI"], archive: ["ארכיון", "Archive"],
    inbrief: ["בקצרה", "In brief"], why: ["למה זה חשוב", "Why it matters"], bottom: ["השורה התחתונה", "Bottom line"],
    flags: ["דגלים", "Flags"], sources: ["מקורות", "Sources"], details: ["פרטים", "Details"], less: ["פחות", "Less"],
    confirmed: ["מאומת", "Confirmed"], likely: ["סביר", "Likely"], unverified: ["לא מאומת", "Unverified"],
    drivers: ["מה מזיז את השוק", "What is moving markets"], catalysts: ["חברות", "Companies"],
    calendar: ["היום ובהמשך", "Today and next"], snapshot: ["תמונת מצב", "Snapshot"], story: ["סיפור השוק", "The market story"],
    pre: ["לפני הפתיחה", "Before the open"], carried: ["ממהדורה קודמת", "Earlier edition"],
    edition: ["מהדורה", "Edition"], no: ["גיליון", "No."], prev: ["המהדורה הקודמת", "Previous edition"], next: ["המהדורה הבאה", "Next edition"],
    latest: ["למהדורה האחרונה", "Latest edition"], credits: ["קרדיטים לתמונות", "Image credits"],
    disclaimer: ["תידרוך חינוכי, לא ייעוץ השקעות. נתוני השוק הם תמונת מצב, לא ציטוט חי.", "Educational briefing, not investment advice. Market figures are a snapshot, not a live quote."],
    about: ["על המהדורה הזו", "About this edition"], legacy: ["הומר מהמהדורה המקורית. הנוסח לא שונה.", "Converted from the original edition. The wording is unchanged."],
    illus: ["המחשה (AI)", "AI Illustration"], archival: ["צילום ארכיון", "Archive photo"], unavailable: ["התוצאה לא הייתה זמינה בזמן החיתוך", "Result not available at cutoff"], photo: ["צילום", "Photo"], theme: ["מצב תצוגה", "Display"],
    themeAuto: ["אוטומטי", "Auto"], themeLight: ["יום", "Day"], themeDark: ["לילה", "Night"],
    motto: ["חדשות, שווקים ו־AI. שלוש מהדורות ביום.", "News, markets and AI. Three editions a day."],
    today: ["המהדורות של היום", "Today's editions"], missing: ["אין נתון במהדורה הזו", "Not in this edition"],
    pending: ["בהכנה", "Pending"], filter: ["חיפוש בכותרות", "Search headlines"], editions: ["מהדורות", "editions"],
    noMatch: ["אין מהדורה שמתאימה לחיפוש.", "No edition matches that search."], read: ["לקריאה", "Read"],
    alsoMarkets: ["בשווקים", "In Markets"], alsoAi: ["ב־AI", "In AI"], items: ["פריטים", "items"],
    weather: ["מזג אוויר", "Weather"], notFound: ["המהדורה לא נמצאה.", "This edition could not be loaded."],
    jsOff: ["העיתון הזה צריך JavaScript.", "This paper needs JavaScript."], skip: ["דלג לתוכן", "Skip to content"],
    open: ["פתיחת המסחר בארה״ב", "US open"], since: ["מאז", "Since"], pause: ["עצירת הפס הנע", "Pause the ticker"], play: ["הפעלת הפס הנע", "Play the ticker"], et: ["ET", "ET"], israel: ["בישראל", "Israel"]
  };
  function ui(k) { var v = UI[k]; return v ? v[state.lang === "he" ? 0 : 1] : k; }
  var SLOT = {
    morning: [["בוקר", "Morning"], 1], midday: [["צהריים", "Midday"], 2], markets: [["שווקים", "Markets"], 3],
    intraday: [["תוך־יום", "Intraday"], 3], evening: [["ערב", "Evening"], 2], close: [["סגירה", "Close"], 3], special: [["מיוחדת", "Special"], 1]
  };
  function slotName(s) { var v = SLOT[s] || SLOT.special; return v[0][state.lang === "he" ? 0 : 1]; }
  function slotStars(s) { var v = SLOT[s] || SLOT.special; return new Array(v[1] + 1).join("★"); }

  /* bilingual value → string for the current language */
  function tx(v) {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
      var a = v[state.lang], b = v[state.lang === "he" ? "en" : "he"];
      return a != null && a !== "" ? a : b || "";
    }
    return String(v);
  }
  function has(v) { return tx(v).replace(/<[^>]*>/g, "").trim() !== ""; }

  /* ------------------------------------------------------------ safe inline HTML */
  var KEEP = { B: 1, STRONG: 1, EM: 1, I: 1, A: 1, BDI: 1, CODE: 1, BR: 1, SUP: 1, SUB: 1, ABBR: 1, S: 1, U: 1, Q: 1, CITE: 1, KBD: 1, MARK: 1, SMALL: 1 };
  function rich(target, html) {
    var tpl = document.createElement("template");
    tpl.innerHTML = html || "";
    (function walk(src, dst) {
      for (var i = 0; i < src.childNodes.length; i++) {
        var n = src.childNodes[i];
        if (n.nodeType === 3) { appendIsolated(dst, n.nodeValue); continue; }
        if (n.nodeType !== 1) continue;
        if (KEEP[n.nodeName]) {
          var el = document.createElement(n.nodeName.toLowerCase());
          if (n.nodeName === "BDI") {
            if (n.getAttribute("dir")) el.setAttribute("dir", n.getAttribute("dir"));
            if (n.getAttribute("class")) el.className = n.getAttribute("class");
          }
          if (n.nodeName === "A") {
            var href = n.getAttribute("href") || "";
            if (/^(https?:|mailto:|#|\.|\/|[\w-]+\/)/i.test(href) && !/^javascript:/i.test(href)) {
              el.setAttribute("href", /^https?:/i.test(href) ? href : href);
              if (/^https?:/i.test(href)) { el.setAttribute("rel", "noopener"); el.setAttribute("target", "_blank"); }
            }
          }
          if (n.nodeName === "ABBR" && n.getAttribute("title")) el.setAttribute("title", n.getAttribute("title"));
          walk(n, el);
          if (n.nodeName === "BDI" && !el.getAttribute("dir") && /[A-Za-z0-9]-[A-Za-z0-9]|[\u2212\-]\d/.test(el.textContent || "")) {
            el.setAttribute("dir", "ltr");
            el.classList.add("lat");
          }
          dst.appendChild(el);
        } else {
          walk(n, dst);
        }
      }
    })(tpl.content, target);
    return target;
  }
  /* Keep hyphenated Latin tokens (GPT-6.1) and signed numbers from breaking or flipping in Hebrew. */
  function appendIsolated(dst, text) {
    if (!text) return;
    var re = /[A-Za-z][A-Za-z0-9]*(?:[\u2010\u2011\u2013\-–][A-Za-z0-9.]+)+|[\u2212\u2013\-]\d[\d,]*(?:\.\d+)?%?/g;
    var last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) dst.appendChild(document.createTextNode(text.slice(last, m.index)));
      var b = document.createElement("bdi");
      b.setAttribute("dir", "ltr");
      b.className = "lat";
      b.textContent = m[0];
      dst.appendChild(b);
      last = m.index + m[0].length;
    }
    if (last < text.length) dst.appendChild(document.createTextNode(text.slice(last)));
  }

  /* ------------------------------------------------------------ tiny DOM helper */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") rich(el, v);
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    (kids || []).forEach(function (c) { if (c != null && c !== false) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function T(v, tag, cls) { return has(v) ? h(tag || "span", { class: cls, html: tx(v) }) : null; }
  function list(v) { return Array.isArray(v) ? v : v == null ? [] : [v]; }
  var NARROW = window.matchMedia ? matchMedia("(max-width: 759px)") : null;
  function narrow() { return NARROW ? NARROW.matches : false; }

  /* ------------------------------------------------------------ dates and links */
  var MONTHS = {
    he: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };
  var DAYS = { he: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת"], en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] };
  function ymd(s) { var p = (s || "").split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function longDate(s) {
    var d = ymd(s), L = state.lang;
    return L === "he"
      ? DAYS.he[d.getUTCDay()] + ", " + d.getUTCDate() + " ב" + MONTHS.he[d.getUTCMonth()] + " " + d.getUTCFullYear()
      : DAYS.en[d.getUTCDay()] + ", " + d.getUTCDate() + " " + MONTHS.en[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function shortDate(s) {
    var d = ymd(s);
    return state.lang === "he" ? d.getUTCDate() + " ב" + MONTHS.he[d.getUTCMonth()] : d.getUTCDate() + " " + MONTHS.en[d.getUTCMonth()];
  }
  function shortDay(s) { var d = ymd(s); return (state.lang === "he" ? DAYS.he[d.getUTCDay()].replace("יום ", "") : DAYS.en[d.getUTCDay()].slice(0, 3)) + " " + d.getUTCDate() + "." + (d.getUTCMonth() + 1); }
  function monthTitle(s) { var d = ymd(s); return MONTHS[state.lang][d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function dayName(s) { return DAYS[state.lang][ymd(s).getUTCDay()]; }
  var FILE = location.protocol === "file:" || root.hasAttribute("data-explicit-index");
  function href(path) { return ROOT + path + (FILE && /\/$/.test(path) ? "index.html" : ""); }
  function editionHref(id) { return href("briefings/" + id + "/"); }
  function asset(src) { return /^(https?:)?\/\//.test(src) ? src : ROOT + src; }
  function num(t) { return h("bdi", { class: "n", text: t }); }
  function plain(v) { return tx(v).replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"); }

  /* ------------------------------------------------------------ manifest helpers */
  function indexOf(id) { for (var i = 0; i < state.manifest.length; i++) if (state.manifest[i].id === id) return i; return -1; }
  function issueNo(id) { var i = indexOf(id); return i < 0 ? null : state.manifest.length - i; }
  function sameDay(date) { return state.manifest.filter(function (e) { return e.date === date; }).sort(function (a, b) { return a.time < b.time ? -1 : 1; }); }

  /* ------------------------------------------------------------ the logo */
  var TAG = { morning: "Your morning edition", midday: "Your midday edition", markets: "Your markets edition", intraday: "Your intraday edition", evening: "Your evening edition", close: "Your closing edition", special: "Special edition" };
  function logo(ed) {
    var tag = ed ? TAG[ed.slot] || TAG.special : "The archive";
    return h("span", { class: "lockup", dir: "ltr" }, [
      h("img", { class: "lk-emblem", src: ROOT + "assets/logo-emblem-gold.png", width: "492", height: "427", alt: "", decoding: "async" }),
      h("span", { class: "lk-text" }, [
        h("img", { class: "lk-word", src: ROOT + "assets/logo-wordmark-gold.png", width: "1200", height: "222", alt: "The Daily Jenya", decoding: "async" }),
        h("span", { class: "lk-tag", lang: "en", text: tag })
      ])
    ]);
  }

  /* ------------------------------------------------------------ chrome: nameplate */
  function nameplate(ed, compact) {
    var n = ed ? issueNo(ed.id) : null;
    var left = ed ? h("div", { class: "ear ear-start" }, [
      h("span", { class: "stars", "aria-hidden": "true", text: slotStars(ed.slot) }),
      h("strong", { text: slotName(ed.slot) }),
      h("span", null, [num(ed.time), " ", ui("israel")]),
      ed.et ? h("span", { class: "dim" }, [num(ed.et + " ET")]) : null
    ]) : h("div", { class: "ear ear-start" });
    var right = h("div", { class: "ear ear-end" }, [
      n ? h("strong", null, [ui("no") + " ", num(String(n))]) : null,
      h("span", { class: "dim", text: ui("motto") })
    ]);
    var plate = h("a", { class: "plate", href: href(""), "aria-label": "The Daily Jenya" }, [logo(ed)]);
    return h("header", { class: "mast" + (compact ? " mast-compact" : "") }, [
      h("div", { class: "mast-top" }, [left, h("h1", { class: "plate-wrap" }, [plate]), right])
    ]);
  }
  function dateline(ed) {
    var today = sameDay(ed.date);
    var strip = h("nav", { class: "runs", "aria-label": ui("today") }, today.map(function (e) {
      var cur = e.id === ed.id;
      return h(cur ? "span" : "a", { class: "run" + (cur ? " is-current" : ""), href: cur ? null : editionHref(e.id), "aria-current": cur ? "page" : null }, [
        h("span", { class: "stars", "aria-hidden": "true", text: slotStars(e.slot) }), " ", h("span", { text: slotName(e.slot) }), " ", num(e.time)
      ]);
    }));
    return h("div", { class: "dateline" }, [
      h("p", { class: "date" }, [h("span", { class: "date-long", text: longDate(ed.date) }), h("span", { class: "date-short", text: shortDay(ed.date) })]),
      today.length ? strip : null,
      controls()
    ]);
  }

  function controls() {
    var t = load(THEME_KEY);
    var tLabel = t === "light" ? ui("themeLight") : t === "dark" ? ui("themeDark") : ui("themeAuto");
    return h("div", { class: "controls" }, [
      h("div", { class: "langs", role: "group", "aria-label": "Language" }, [
        h("button", { type: "button", lang: "he", "aria-pressed": state.lang === "he" ? "true" : "false", onclick: function () { setLang("he"); } , text: "עברית" }),
        h("button", { type: "button", lang: "en", "aria-pressed": state.lang === "en" ? "true" : "false", onclick: function () { setLang("en"); }, text: "English" })
      ]),
      h("button", { type: "button", class: "theme", title: ui("theme"), onclick: cycleTheme }, [h("span", { class: "theme-dot", "aria-hidden": "true" }), " ", tLabel])
    ]);
  }
  function setLang(l) { state.lang = l; save(LANG_KEY, l); applyLang(); render(); }
  function cycleTheme() {
    var t = load(THEME_KEY), nx = t === "light" ? "dark" : t === "dark" ? null : "light";
    save(THEME_KEY, nx); applyTheme(); render();
  }

  /* ------------------------------------------------------------ chrome: tape */
  // Older editions have no short `stamp`; pull "weekday + first clock time" out of the long as-of line.
  function stampText(m) {
    if (has(m.stamp)) return plain(m.stamp);
    var t = has(m.asof) ? plain(m.asof) : "", tm = t.match(/\d{1,2}:\d{2}/), day = -1;
    if (!tm) return "";
    DAYS[state.lang].forEach(function (d, i) { if (t.indexOf(d) >= 0) day = i; });
    return (day < 0 ? "" : (state.lang === "he" ? DAYS.he[day].replace("יום ", "") : DAYS.en[day].slice(0, 3)) + " ") + tm[0];
  }
  function tapeRow(ed) {
    var m = ed.markets || {};
    var items = list(m.tape).length ? m.tape : m.boards && m.boards[0] ? m.boards[0].items : [];
    if (!items || !items.length) return null;
    function seq(hidden) {
      return h("ul", { class: "crawl-seq", "aria-hidden": hidden ? "true" : null }, items.concat(list(m.extra)).map(function (c) {
        var dc = dirClass(c);
        return h("li", { class: "tick " + dc }, [
          h("span", { class: "tick-sym", text: plain(c.sym) }),
          c.missing ? h("span", { class: "tick-px dim", text: "—" }) : h("span", { class: "tick-px" + (has(c.chg) ? "" : " tick-" + dc), text: plain(c.last) }),
          c.missing || !has(c.chg) ? null : h("span", { class: "tick-chg", dir: "ltr" }, [h("span", { class: "tick-arrow", "aria-hidden": "true", text: dc === "up" ? "▲" : dc === "down" ? "▼" : "■" }), h("span", { html: tx(c.chg) })])
        ]);
      }));
    }
    var paused = load("dj-crawl") === "paused";
    var bar = h("div", { class: "ticker" + (paused ? " is-paused" : ""), role: "region", "aria-label": ui("snapshot") });
    var btn = h("button", { type: "button", class: "ticker-pause", "aria-pressed": paused ? "true" : "false", title: paused ? ui("play") : ui("pause"), onclick: function () {
      var p = !bar.classList.contains("is-paused");
      bar.classList.toggle("is-paused", p);
      btn.setAttribute("aria-pressed", p ? "true" : "false");
      btn.title = p ? ui("play") : ui("pause");
      save("dj-crawl", p ? "paused" : null);
    } }, [h("span", { class: "sr", text: ui("pause") })]);
    var n = items.length + list(m.extra).length;
    bar.appendChild(h("a", { class: "ticker-label", href: "#markets", title: plain(m.asof), onclick: go("markets") }, [
      h("span", { class: "ticker-k", text: ui("markets") }),
      stampText(m) ? h("span", { class: "ticker-when is-short" }, [h("bdi", { text: stampText(m) })]) : has(m.asof) ? h("span", { class: "ticker-when", html: tx(m.asof) }) : null
    ]));
    bar.appendChild(h("div", { class: "ticker-view", dir: "ltr" }, [
      h("div", { class: "ticker-track", style: "--dur:" + Math.max(28, n * 6) + "s" }, [seq(false), seq(true)])
    ]));
    bar.appendChild(btn);
    return bar;
  }
  function dirClass(c) {
    if (c.missing) return "flat";
    if (c.dir) return c.dir;
    var s = plain(c.chg).trim();
    return /^[-−–]/.test(s) ? "down" : /^\+/.test(s) ? "up" : "flat";
  }

  /* ------------------------------------------------------------ chrome: section nav */
  function sectionNav(ed) {
    var counts = { news: count(ed.news), markets: count(ed.markets, true), ai: count(ed.ai) };
    return h("nav", { class: "sections", "aria-label": "Sections" }, [
      h("div", { class: "sections-in" }, SECTIONS.map(function (s) {
        return h("a", { href: "#" + s, class: "sec sec-" + s, onclick: go(s), "aria-current": state.section === s ? "true" : null }, [
          ui(s), counts[s] ? h("span", { class: "count" }, [num(String(counts[s]))]) : null
        ]);
      }).concat([h("a", { class: "sec sec-archive", href: href("archive/") }, [ui("archive")])]))
    ]);
  }
  function count(sec, mk) {
    if (!sec) return 0;
    if (mk) return list(sec.drivers).length + list(sec.catalysts).length;
    return list(sec.stories).length;
  }
  function go(s) {
    return function (ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      state.section = s;
      try { history.pushState(null, "", "#" + s); } catch (e) {}
      render();
      var nav = document.querySelector(".sections");
      if (nav) {
        var top = nav.getBoundingClientRect().top + window.pageYOffset;
        if (window.pageYOffset > top) window.scrollTo(0, top);
      }
    };
  }

  /* ------------------------------------------------------------ story pieces */
  function confidence(c) {
    if (!c) return null;
    var lvl = { confirmed: 3, likely: 2, unverified: 1 }[c] || 0;
    return h("span", { class: "conf conf-" + c }, [
      h("span", { class: "conf-bar", "aria-hidden": "true" }, [h("i", { class: lvl >= 1 ? "on" : "" }), h("i", { class: lvl >= 2 ? "on" : "" }), h("i", { class: lvl >= 3 ? "on" : "" })]),
      ui(c)
    ]);
  }
  function figure(im, big) {
    if (!im || !im.src) return null;
    var alt = tx(im.alt).replace(/<[^>]*>/g, "");
    var img = h("img", {
      src: asset(im.src), alt: alt, loading: big ? "eager" : "lazy", decoding: "async",
      width: im.w || null, height: im.h || null,
      srcset: im.srcset ? im.srcset.split(",").map(function (p) { p = p.trim(); var sp = p.split(/\s+/); return asset(sp[0]) + (sp[1] ? " " + sp[1] : ""); }).join(", ") : null,
      sizes: im.srcset ? (big ? "(min-width: 1100px) 760px, 100vw" : "(min-width: 1100px) 360px, (min-width: 760px) 50vw, 100vw") : null,
      referrerpolicy: /^https?:/.test(im.src) ? "no-referrer" : null
    });
    var cap = [];
    if (im.ai) {
      return h("figure", { class: "fig fig-ai" }, [img, h("figcaption", null, [h("span", { class: "illus", text: ui("illus") })])]);
    }
    if (im.year) cap.push(h("span", { class: "archival" }, [ui("archival") + ", ", num(String(im.year))]));
    if (has(im.caption)) cap.push(h("span", { html: tx(im.caption) }));
    if (has(im.credit)) cap.push(h("span", null, [ui("photo") + ": ", h("span", { html: tx(im.credit) })]));
    if (im.license && im.license.label) cap.push(h("span", null, [im.license.url ? h("a", { href: im.license.url, rel: "noopener", target: "_blank", text: im.license.label }) : im.license.label]));
    return h("figure", { class: "fig" }, [img, cap.length ? h("figcaption", null, cap) : null]);
  }
  function tags(tg) {
    tg = list(tg);
    if (!tg.length) return null;
    return h("p", { class: "tags" }, tg.map(function (t) {
      return h("span", { class: "tag tag-" + (t.kind || "chip") + (t.level ? " tag-" + t.level : ""), html: tx(t.text) });
    }));
  }
  function sourcesLine(st) {
    var links = list(st.links);
    var out = [];
    if (links.length) {
      out.push(h("p", { class: "src" }, [h("span", { class: "src-label", text: ui("sources") })].concat(links.map(function (l, i) {
        var label = tx(l.label) || l.url;
        return h("span", { class: "src-item" }, [l.url ? h("a", { href: l.url, rel: "noopener", target: "_blank", html: label }) : h("span", { html: label })]);
      }))));
    }
    list(st.sourcesHtml).forEach(function (s) { if (has(s)) out.push(h("p", { class: "src", html: tx(s) })); });
    return out;
  }
  function metaLine(st) {
    var bits = [];
    if (st.confidence) bits.push(confidence(st.confidence));
    if (has(st.source)) bits.push(h("span", { html: tx(st.source) }));
    if (st.time) bits.push(h("span", null, [num(st.time), " ", ui("israel")]));
    if (has(st.date)) bits.push(h("span", { html: tx(st.date) }));
    if (has(st.meta)) bits.push(h("span", { html: tx(st.meta) }));
    return bits.length ? h("p", { class: "meta" }, bits) : null;
  }
  function flagsBox(st) {
    var fl = list(st.flags).filter(has);
    if (!fl.length) return null;
    return h("div", { class: "flags" }, [
      h("p", { class: "flags-label", text: ui("flags") }),
      h("ul", null, fl.map(function (f) { return h("li", { html: tx(f) }); }))
    ]);
  }
  function whyBox(st) {
    if (!has(st.why)) return null;
    return h("p", { class: "why" }, [h("span", { class: "why-label", text: ui("why") }), " ", h("span", { html: tx(st.why) })]);
  }
  function bodyBlock(st) {
    var out = [];
    var facts = list(st.facts).filter(has);
    if (facts.length) out.push(h("ol", { class: "facts" }, facts.map(function (f) { return h("li", { html: tx(f) }); })));
    list(st.body).forEach(function (p) { if (has(p)) out.push(h("p", { class: "body", html: tx(p) })); });
    list(st.notes).forEach(function (p) { if (has(p)) out.push(h("p", { class: "aside", html: tx(p) })); });
    list(st.more).forEach(function (m) {
      out.push(h("details", { class: "more-block" }, [h("summary", { html: has(m.title) ? tx(m.title) : ui("details") })].concat(list(m.items).map(function (p) { return h("p", { html: tx(p) }); }))));
    });
    return out;
  }

  /* Story: headline, deck (bottom line), picture, facts/body, why, flags, meta, sources.
     variant: lead | col | list | compact */
  function story(st, i, variant, opts) {
    opts = opts || {};
    var id = opts.id || null;
    var head = [];
    if (has(st.kicker) || st.ticker) head.push(h("p", { class: "kicker" }, [st.ticker ? h("b", { class: "sym", dir: "ltr", text: st.ticker }) : null, has(st.kicker) ? h("span", { html: tx(st.kicker) }) : null]));
    head.push(tags(st.tags));
    if (has(st.headline)) head.push(h(variant === "lead" ? "h2" : "h3", { class: "hl", html: tx(st.headline) }));
    if (st.pending) head.push(h("p", { class: "pending", text: ui("pending") }));
    var deck = has(st.bottom) ? h("p", { class: "deck", html: tx(st.bottom) }) : null;
    var fig = figure(st.image, variant === "lead");
    var detail = bodyBlock(st).concat([whyBox(st), flagsBox(st), metaLine(st)]).concat(sourcesLine(st)).filter(Boolean);
    var fold = opts.fold && narrow() && detail.length > 1;
    var kids = [h("div", { class: "st-head" }, head), deck, fig];
    if (fold) {
      // why + confidence stay visible; the rest folds
      var keep = [whyBox(st), st.confidence ? h("p", { class: "meta" }, [confidence(st.confidence)]) : null].filter(Boolean);
      var rest = bodyBlock(st).concat([flagsBox(st), metaLine(st)]).concat(sourcesLine(st)).filter(Boolean);
      kids = kids.concat(keep);
      kids.push(h("details", { class: "fold" }, [h("summary", null, [h("span", { class: "fold-open", text: ui("details") }), h("span", { class: "fold-close", text: ui("less") })])].concat(rest)));
    } else {
      kids = kids.concat(detail);
    }
    return h("article", { class: "st st-" + variant + (st.role ? " st-role-" + st.role : ""), id: id }, kids);
  }

  /* ------------------------------------------------------------ blocks */
  function notes(sec) {
    var out = [];
    list(sec.dek).forEach(function (d) { if (has(d)) out.push(h("p", { class: "dek", html: tx(d) })); });
    list(sec.notes).forEach(function (n) { if (has(n)) out.push(h("p", { class: "carry", html: tx(n) })); });
    if (has(sec.carried) && sec.carried !== true) out.push(h("p", { class: "carry", html: tx(sec.carried) }));
    return out;
  }
  function extras(sec, pos) {
    return list(sec.extras).filter(function (x) { return pos === "top" ? x.kind === "summary" || x.kind === "banner" : !(x.kind === "summary" || x.kind === "banner"); }).map(function (x) {
      var items = list(x.items).filter(has);
      return h("section", { class: "extra extra-" + (x.kind || "list") }, [
        has(x.title) ? h("h3", { class: "extra-title", html: tx(x.title) }) : null,
        items.length ? (x.kind === "text" || x.kind === "summary" || x.kind === "banner" ? h("div", null, items.map(function (p) { return h("p", { html: tx(p) }); })) : h("ul", null, items.map(function (p) { return h("li", { html: tx(p) }); }))) : null
      ].concat(list(x.note).map(function (n) { return h("p", { class: "extra-note", html: tx(n) }); })));
    });
  }
  function sectionHead(title, sec, id) {
    var bits = [];
    if (has(sec.asof)) bits.push(h("span", { class: "asof", html: tx(sec.asof) }));
    if (sec.carried) bits.push(h("span", { class: "carried-chip", text: ui("carried") }));
    return h("header", { class: "sec-head" }, [h("h2", { class: "sec-title", id: id, text: title }), bits.length ? h("p", { class: "sec-when" }, bits) : null]);
  }

  /* ------------------------------------------------------------ NEWS */
  function newsSection(ed) {
    var n = ed.news || {};
    var st = list(n.stories);
    var sec = h("section", { class: "page page-news", id: "news", "aria-labelledby": "news-h" }, [sectionHead(ui("news"), n, "news-h")]);
    notes(n).forEach(function (x) { sec.appendChild(x); });
    extras(n, "top").forEach(function (x) { sec.appendChild(x); });
    if (!st.length) { extras(n).forEach(function (x) { sec.appendChild(x); }); return sec; }

    var lead = st[0];
    var rest = st.slice(1);
    var rail = h("aside", { class: "rail", "aria-label": ui("inbrief") }, [
      h("h3", { class: "rail-title", text: ui("inbrief") }),
      h("ol", { class: "brief" }, st.map(function (s, i) {
        return h("li", null, [h("a", { href: "#story-" + (i + 1), onclick: jump("story-" + (i + 1)) }, [
          has(s.kicker) ? h("span", { class: "brief-k", html: tx(s.kicker) }) : null,
          h("span", { class: "brief-t", html: has(s.bottom) ? tx(s.bottom) : tx(s.headline) })
        ])]);
      })),
      teaser(ed)
    ]);
    sec.appendChild(h("div", { class: "front" }, [story(lead, 0, "lead", { id: "story-1" }), rail]));
    if (rest.length) {
      sec.appendChild(h("div", { class: "cols" }, rest.map(function (s, i) {
        return story(s, i + 1, s.role === "quiet" ? "col st-quiet" : "col", { id: "story-" + (i + 2), fold: true });
      })));
    }
    extras(n).forEach(function (x) { sec.appendChild(x); });
    return sec;
  }
  function teaser(ed) {
    var out = [];
    var m = ed.markets || {};
    var story0 = list(m.story)[0];
    var d0 = list(m.drivers)[0];
    if (story0 || d0) {
      out.push(h("a", { class: "teaser teaser-mk", href: "#markets", onclick: go("markets") }, [
        h("span", { class: "teaser-k" }, [ui("alsoMarkets"), m.carried && stampText(m) ? h("span", { class: "teaser-when" }, [" · ", h("bdi", { text: stampText(m) })]) : null]),
        h("span", { class: "teaser-t", html: story0 ? tx(story0) : tx(d0.headline) })
      ]));
    }
    var a = ed.ai || {};
    var a0 = list(a.stories)[0];
    if (a0) {
      out.push(h("a", { class: "teaser teaser-ai", href: "#ai", onclick: go("ai") }, [
        h("span", { class: "teaser-k" }, [ui("alsoAi"), a.carried ? h("span", { class: "teaser-when", text: " · " + ui("carried") }) : null]),
        h("span", { class: "teaser-t", html: tx(a0.headline) })
      ]));
    }
    return out.length ? h("div", { class: "teasers" }, out) : null;
  }
  function jump(id) {
    return function (ev) {
      var el = document.getElementById(id);
      if (!el) return;
      ev.preventDefault();
      var f = el.querySelector("details.fold");
      if (f) f.open = true;
      el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      el.classList.add("is-target");
      setTimeout(function () { el.classList.remove("is-target"); }, 1600);
    };
  }

  /* ------------------------------------------------------------ MARKETS */
  function chip(c) {
    var name = has(c.name) ? h("span", { class: "chip-name", html: tx(c.name) }) : null;
    var sym = c.url ? h("a", { class: "chip-sym", href: c.url, rel: "noopener", target: "_blank", text: plain(c.sym) }) : h("span", { class: "chip-sym", text: plain(c.sym) });
    var kids = [h("div", { class: "chip-id" }, [sym, name])];
    if (c.missing) kids.push(h("p", { class: "chip-missing", text: has(c.flag) ? tx(c.flag).replace(/<[^>]*>/g, "") : ui("missing") }));
    else {
      kids.push(h("p", { class: "chip-px", dir: "ltr" }, [h("span", { class: "px" + (has(c.chg) ? "" : " px-" + dirClass(c)), text: plain(c.last) }), " ", h("span", { class: "chg", dir: "ltr", html: tx(c.chg) })]));
      if (has(c.flag)) kids.push(h("p", { class: "chip-flag", html: tx(c.flag) }));
    }
    list(c.detail).forEach(function (d) { if (has(d)) kids.push(h("p", { class: "chip-detail", html: tx(d) })); });
    return h("li", { class: "chip " + dirClass(c) + (c.missing ? " is-missing" : "") }, kids);
  }
  function board(items, title, note, cls) {
    items = list(items);
    if (!items.length && !list(note).length) return null;
    return h("section", { class: "board" + (cls ? " " + cls : "") }, [
      has(title) ? h("h4", { class: "board-title", html: tx(title) }) : null,
      items.length ? h("ul", { class: "chips" }, items.map(chip)) : null
    ].concat(list(note).map(function (n) { return h("p", { class: "board-note", html: tx(n) }); })));
  }
  function marketsSection(ed) {
    var m = ed.markets || {};
    var sec = h("section", { class: "page page-markets", id: "markets", "aria-labelledby": "markets-h" }, [sectionHead(ui("markets"), m, "markets-h")]);
    var lead = [];
    var storyP = list(m.story).filter(has);
    if (storyP.length) lead.push(h("div", { class: "mk-story" }, [h("h3", { class: "blk-title", text: ui("story") })].concat(storyP.map(function (p) { return h("p", { class: "mk-story-p", html: tx(p) }); }))));
    notes(m).forEach(function (x) { lead.push(x); });
    extras(m, "top").forEach(function (x) { lead.push(x); });
    var snap = [];
    var hasTape = list(m.tape).length;
    if (hasTape || list(m.extra).length || list(m.note).length) {
      snap.push(h("h3", { class: "blk-title", text: ui("snapshot") }));
      if (hasTape) snap.push(board(m.tape, null, null, "board-main"));
      if (list(m.extra).length) snap.push(board(m.extra, null, null, "board-tuck"));
      list(m.note).forEach(function (n) { if (has(n)) snap.push(h("p", { class: "board-note", html: tx(n) })); });
    }
    list(m.boards).forEach(function (b, i) {
      if (hasTape || i > 0 || has(b.title)) snap.push(board(b.items, b.title, b.note));
      else snap.push(board(b.items, null, b.note, "board-main"));
    });
    if (!snap.length && !lead.length) {
      // nothing at all
    }
    // Order: the story, what moves the market, companies, then Today/Next beside a small price snapshot.
    if (lead.length) sec.appendChild(h("div", { class: "mk-lead" }, lead));
    var drivers = list(m.drivers);
    if (drivers.length) {
      sec.appendChild(h("section", { class: "mk-block" }, [
        h("h3", { class: "blk-title", text: ui("drivers") }),
        h("div", { class: "cols cols-2" }, drivers.map(function (d, i) { return story(d, i, "col", { fold: i > 0 }); }))
      ]));
    }
    var cat = list(m.catalysts);
    if (cat.length) {
      sec.appendChild(h("section", { class: "mk-block" }, [
        h("h3", { class: "blk-title", text: ui("catalysts") }),
        h("div", { class: "cols cols-2 cols-cat" }, cat.map(function (d, i) { return story(d, i, "col", { fold: true }); }))
      ]));
    }
    var cal = m.calendar, end = [];
    if (cal && (list(cal.items).length || list(cal.note).length)) {
      end.push(h("section", { class: "mk-block mk-cal" }, [
        h("h3", { class: "blk-title", text: ui("calendar") })
      ].concat(list(cal.note).map(function (n) { return h("p", { class: "cal-note", html: tx(n) }); })).concat([
        h("ol", { class: "cal" }, list(cal.items).map(function (it) {
          var when = it.time ? [it.date ? shortDay(it.date) + " " : null, num(it.time), " ", ui("israel"), it.et ? h("span", { class: "dim" }, [" ", num(it.et + " ET")]) : null] : it.date ? [shortDay(it.date)] : [h("span", { html: tx(it.when) })];
          return h("li", null, [
            h("p", { class: "cal-when" }, when),
            h("div", { class: "cal-what" }, [
              has(it.label) ? h("p", { class: "cal-t", html: tx(it.label) }) : null,
              has(it.text) ? h("p", { class: "cal-t", html: tx(it.text) }) : null,
              tags(it.tags),
              has(it.result) ? h("p", { class: "cal-result", html: tx(it.result) }) : it.status === "unavailable" ? h("p", { class: "cal-result cal-unavailable", text: ui("unavailable") }) : null
            ].concat(list(it.detail).map(function (d) { return h("p", { class: "cal-d", html: tx(d) }); })))
          ]);
        }))
      ])));
    }
    if (snap.length) end.push(h("section", { class: "mk-block mk-snap" }, snap));
    if (end.length) sec.appendChild(h("div", { class: "mk-end" + (end.length > 1 ? " mk-end-2" : "") }, end));
    if (m.pre) {
      var p = m.pre;
      var pre = h("section", { class: "mk-block mk-pre" }, [h("h3", { class: "blk-title", text: ui("pre") })]);
      notes(p).forEach(function (x) { pre.appendChild(x); });
      if (list(p.stories).length) pre.appendChild(h("div", { class: "cols cols-2" }, list(p.stories).map(function (d, i) { return story(d, i, "col", { fold: true }); })));
      extras(p).forEach(function (x) { pre.appendChild(x); });
      sec.appendChild(pre);
    }
    extras(m).forEach(function (x) { sec.appendChild(x); });
    return sec;
  }

  /* ------------------------------------------------------------ AI */
  function aiSection(ed) {
    var a = ed.ai || {};
    var st = list(a.stories);
    var sec = h("section", { class: "page page-ai", id: "ai", "aria-labelledby": "ai-h" }, [sectionHead(ui("ai"), a, "ai-h")]);
    notes(a).forEach(function (x) { sec.appendChild(x); });
    extras(a, "top").forEach(function (x) { sec.appendChild(x); });
    if (st.length) {
      sec.appendChild(h("div", { class: "ai-front" }, [story(st[0], 0, "lead st-ai-lead", {})]));
      if (st.length > 1) sec.appendChild(h("div", { class: "cols cols-2" }, st.slice(1).map(function (s, i) { return story(s, i + 1, "col", { fold: true }); })));
    }
    extras(a).forEach(function (x) { sec.appendChild(x); });
    return sec;
  }

  /* ------------------------------------------------------------ footer */
  function footer(ed) {
    var i = indexOf(ed.id);
    var prev = i >= 0 ? state.manifest[i + 1] : null;
    var next = i > 0 ? state.manifest[i - 1] : null;
    var about = [];
    if (has(ed.clock)) about.push(h("p", { html: tx(ed.clock) }));
    if (has(ed.contents)) about.push(h("p", { html: tx(ed.contents) }));
    list(ed.notes).forEach(function (n) {
      about.push(h("p", null, [has(n.label) ? h("b", { html: tx(n.label) }) : null, has(n.label) ? " " : null, h("span", { html: tx(n.text || n) })]));
    });
    list(ed.footer).forEach(function (p) { if (has(p)) about.push(h("p", { html: tx(p) })); });
    list(ed.sources).forEach(function (p) { if (has(p)) about.push(h("p", { class: "dim", html: tx(p) })); });
    return h("footer", { class: "foot" }, [
      h("nav", { class: "foot-nav" }, [
        prev ? h("a", { class: "pn pn-prev", href: editionHref(prev.id) }, [h("span", { class: "pn-k", text: ui("prev") }), h("span", null, [dayName(prev.date) + " ", num(prev.time)])]) : h("span"),
        h("a", { class: "pn pn-archive", href: href("archive/"), text: ui("archive") }),
        next ? h("a", { class: "pn pn-next", href: editionHref(next.id) }, [h("span", { class: "pn-k", text: ui("next") }), h("span", null, [dayName(next.date) + " ", num(next.time)])]) : h("span")
      ]),
      h("p", { class: "disclaimer", text: ui("disclaimer") }),
      about.length ? h("details", { class: "about" }, [h("summary", { text: ui("about") })].concat(about)) : null,
      ed.credits ? h("p", { class: "dim" }, [h("a", { href: href("briefings/" + ed.id + "/" + ed.credits), text: ui("credits") })]) : null,
      h("p", { class: "colophon dim", text: "© The Daily Jenya" })
    ]);
  }

  /* ------------------------------------------------------------ edition page */
  function sectionFromHash() {
    var raw = (location.hash || "").replace("#", "");
    if (ALIAS[raw]) return ALIAS[raw];
    if (SECTIONS.indexOf(raw) !== -1) return raw;
    if (/^story-\d+$/.test(raw)) return "news";
    return null;
  }

  function renderEdition() {
    var ed = state.edition;
    var app = document.getElementById("dj");
    var frag = document.createDocumentFragment();
    frag.appendChild(h("a", { class: "skip", href: "#main", text: ui("skip") }));
    if (has(ed.banner)) frag.appendChild(h("p", { class: "banner", html: tx(ed.banner) }));
    frag.appendChild(nameplate(ed));
    var t = tapeRow(ed);
    if (t) frag.appendChild(t);
    frag.appendChild(dateline(ed));
    frag.appendChild(sectionNav(ed));
    var main = h("main", { id: "main", tabindex: "-1" });
    var s = state.section;
    main.appendChild(s === "markets" ? marketsSection(ed) : s === "ai" ? aiSection(ed) : newsSection(ed));
    frag.appendChild(main);
    frag.appendChild(footer(ed));
    app.innerHTML = "";
    app.appendChild(frag);
    root.setAttribute("data-section", s);
    var title = (has(ed.headline) ? tx(ed.headline) : list((ed.news || {}).stories)[0] ? tx(ed.news.stories[0].headline) : longDate(ed.date)).replace(/<[^>]*>/g, "");
    document.title = longDate(ed.date) + " · " + slotName(ed.slot) + " · The Daily Jenya";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", has(ed.summary) ? tx(ed.summary).replace(/<[^>]*>/g, "") : title);
  }

  /* ------------------------------------------------------------ archive page */
  function renderArchive() {
    var app = document.getElementById("dj");
    var q = (state.query || "").trim().toLowerCase();
    var entries = state.manifest.filter(function (e) {
      if (!q) return true;
      var hay = (tx(e.headline) + " " + tx(e.summary) + " " + (e.headline && e.headline.he || "") + " " + (e.headline && e.headline.en || "")).replace(/<[^>]*>/g, "").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    var frag = document.createDocumentFragment();
    frag.appendChild(h("a", { class: "skip", href: "#main", text: ui("skip") }));
    frag.appendChild(nameplate(null, true));
    var first = state.manifest[state.manifest.length - 1];
    frag.appendChild(h("div", { class: "dateline" }, [h("p", { class: "date" }, first ? [ui("since") + " " + longDate(first.date)] : []), controls()]));
    var main = h("main", { id: "main", class: "archive" });
    var input = h("input", { type: "search", class: "search", placeholder: ui("filter"), "aria-label": ui("filter"), value: state.query || "" });
    input.addEventListener("input", function () { state.query = input.value; renderArchive(); var i = document.querySelector(".search"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } });
    main.appendChild(h("header", { class: "sec-head" }, [
      h("h2", { class: "sec-title", text: ui("archive") }),
      h("p", { class: "sec-when" }, [num(String(state.manifest.length)), " " + ui("editions")]),
      input
    ]));
    if (!entries.length) main.appendChild(h("p", { class: "empty", text: ui("noMatch") }));
    var byDay = {};
    var days = [];
    entries.forEach(function (e) { if (!byDay[e.date]) { byDay[e.date] = []; days.push(e.date); } byDay[e.date].push(e); });
    var month = null, monthList = null;
    days.forEach(function (d) {
      var mt = d.slice(0, 7);
      if (mt !== month) {
        month = mt;
        main.appendChild(h("h3", { class: "arch-month", text: monthTitle(d) }));
        monthList = h("div", { class: "arch-days" });
        main.appendChild(monthList);
      }
      var eds = byDay[d].slice().sort(function (a, b) { return a.time < b.time ? -1 : 1; });
      monthList.appendChild(h("section", { class: "arch-day" }, [
        h("h4", { class: "arch-date" }, [h("span", { class: "arch-dnum", text: String(ymd(d).getUTCDate()) }), h("span", { class: "arch-dname", text: dayName(d) })]),
        h("ol", { class: "arch-runs" }, eds.map(function (e) {
          return h("li", null, [h("a", { href: editionHref(e.id) }, [
            h("span", { class: "arch-slot" }, [h("span", { class: "stars", "aria-hidden": "true", text: slotStars(e.slot) }), " ", slotName(e.slot), " ", num(e.time)]),
            h("span", { class: "arch-hl", html: tx(e.headline) }),
            has(e.summary) ? h("span", { class: "arch-sum", html: tx(e.summary) }) : null
          ])]);
        }))
      ]));
    });
    frag.appendChild(main);
    frag.appendChild(h("footer", { class: "foot" }, [h("p", { class: "disclaimer", text: ui("disclaimer") }), h("p", { class: "colophon dim", text: "© The Daily Jenya" })]));
    app.innerHTML = "";
    app.appendChild(frag);
    document.title = ui("archive") + " · The Daily Jenya";
  }

  function renderError(msg) {
    var app = document.getElementById("dj");
    app.innerHTML = "";
    app.appendChild(nameplate(null, true));
    app.appendChild(h("main", { id: "main", class: "error" }, [h("p", { text: msg || ui("notFound") }), h("p", null, [h("a", { href: href("archive/"), text: ui("archive") })])]));
  }

  function render() {
    root.setAttribute("data-mode", state.mode);
    if (state.mode === "archive") { root.removeAttribute("data-section"); return renderArchive(); }
    if (!state.edition) return renderError();
    renderEdition();
  }

  /* ------------------------------------------------------------ data entry points */
  DJ.manifest = function (list_) { state.manifest = (list_ || []).slice().sort(function (a, b) { return a.id < b.id ? 1 : -1; }); };
  DJ.edition = function (ed) { state.edition = ed; };

  function start() {
    state.section = sectionFromHash() || "news";
    render();
    var raw = (location.hash || "").replace("#", "");
    if (ALIAS[raw]) { try { history.replaceState(null, "", "#" + state.section); } catch (e) {} }
    if (/^story-\d+$/.test(raw)) { var el = document.getElementById(raw); if (el) { var f = el.querySelector("details.fold"); if (f) f.open = true; el.scrollIntoView(); } }
  }

  DJ.boot = function (mode) {
    state.mode = mode || "edition";
    if (state.mode === "latest") {
      state.mode = "edition";
      var latest = state.manifest[0];
      if (!latest) return renderError();
      var s = document.createElement("script");
      s.src = ROOT + "briefings/" + latest.id + "/edition.js";
      s.onload = start;
      s.onerror = function () { renderError(); };
      document.body.appendChild(s);
      return;
    }
    if (state.mode === "archive") return render();
    start();
  };

  window.addEventListener("hashchange", function () {
    var l = hashLang();
    if (l) { state.lang = l; save(LANG_KEY, l); applyLang(); render(); return; }
    var s = sectionFromHash();
    if (s && s !== state.section) { state.section = s; render(); }
  });
  window.addEventListener("popstate", function () { var s = sectionFromHash() || "news"; if (s !== state.section) { state.section = s; render(); } });
  if (NARROW && NARROW.addEventListener) NARROW.addEventListener("change", function () { if (state.mode === "edition" && state.edition) render(); });
  if (window.matchMedia) {
    var mq = matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { if (!load(THEME_KEY)) render(); });
  }
})();
