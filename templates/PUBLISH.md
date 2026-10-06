# The Daily Jenya — publishing brief

This is the whole job for an edition bot. Read it end to end before every drop. It replaces every earlier version of this file and every earlier HTML template.

## What the paper is

The Daily Jenya is a daily newspaper with three sections — **News**, **Markets** (the US session, read from Israel), and **AI**. It publishes up to three editions a day, in Hebrew by default with English one tap away, on a phone and on a PC. The site is static on GitHub Pages: `https://jifa52.github.io/KNG.3D/`.

**You write content, not pages.** Each edition is one data file, `edition.js`. A shared renderer (`assets/dj.js`, `assets/dj.css`) turns it into the page: the nameplate, the edition stars, the tape, the layout, the language switch, light/dark, the archive. You never write HTML pages, CSS, or JavaScript.

## Cadence

| Drop | Folder time | `slot` | Days | What is new |
|---|---|---|---|---|
| Morning | `0850` | `morning` | every day | Overnight news (a short front: 2–5 stories). Markets copied from the last markets edition. |
| Midday | `1400` | `midday` | every day | The day's news front (4–8 stories). Markets copied from the last markets edition. |
| Markets | `1545` | `markets` | Monday–Friday (US trading days) | Markets refreshed from the pre-market tape. News copied from the midday edition. |

**AI** is a digest three times a week: **Monday, Wednesday and Friday, around 09:00**. It goes into the morning drop, or into the midday drop if the newsletters were not in by 08:50. On every other drop the AI section is copied from the previous edition, with its real date.

Every edition is **complete**: it contains all three sections. A section you did not refresh is copied from the previous edition and marked `"carried"` (see below). Folder time is the scheduled Israel time; keep it even if you publish a few minutes late.

## Publish, step by step

1. **Folder.** Create `briefings/YYYY-MM-DD-HHMM/` (Israel time), e.g. `briefings/2026-10-04-0850/`.
2. **Shell.** Copy `templates/shell.html` into that folder as `index.html`. Do not change a single character — the check compares it byte for byte.
3. **Content.** Start from the previous edition's `edition.js` (so copied sections come along), then replace what this drop refreshes. Format below; `templates/example/edition.js` is a complete, valid example.
4. **Pictures** (required on every card). Download each file into `assets/images/` — never hotlink. Fill `image` on every news story, market driver, market catalyst, and AI story. Copy `templates/IMAGE-CREDITS.md` into the folder, fill one block per picture, and set `"credits": "IMAGE-CREDITS.md"`.
5. **Manifest.** Add one line at the **top** of the list in `assets/editions.js`:
   `{"id": "2026-10-04-0850", "date": "2026-10-04", "time": "08:50", "slot": "morning", "headline": <exactly the lead story's headline object>, "summary": <exactly the edition's summary object>},`
   The homepage always opens the first entry, and the archive is built from this list.
6. **Check** (if you can run Python): `python3 tools/check.py 2026-10-04-0850`. It must print `0 errors`. The same check runs on every push.
7. **Commit** with the message `Edition 2026-10-04 08:50 (morning)`.

**Never edit:** `index.html` (home), `archive/`, `assets/dj.js`, `assets/dj.css`, `templates/shell.html`, or any older folder in `briefings/`. Published editions are frozen; the push is rejected if one changes. A correction goes into the next edition.

## The file

`edition.js` is one call wrapping one JSON object. It must be valid JSON inside: double quotes, no trailing commas, no comments.

```js
DJ.edition({
 "v": 2,
 "id": "2026-10-04-0850",
 "date": "2026-10-04",
 "time": "08:50",
 "et": "01:50",
 "slot": "morning",
 "summary": {"he": "...", "en": "..."},
 "news":    { "asof": {...}, "carried": false, "stories": [ STORY, ... ] },
 "markets": { "asof": {...}, "carried": false, "story": [ {...} ], "note": [ {...} ],
              "tape": [ CHIP x6 ], "extra": [ CHIP x≤2 ],
              "drivers": [ ITEM, ... ], "catalysts": [ ITEM, ... ], "calendar": { "items": [ EVENT, ... ] } },
 "ai":      { "asof": {...}, "carried": false, "stories": [ STORY, ... ] }
});
```

**Bilingual text.** Every reader-facing field is `{"he": "...", "en": "..."}` — both languages, same facts, written natively (not a word-for-word translation). A plain string is allowed only for text that is identical in both languages (a ticker, a product name like `"GPT-6.1 Sol"`).

**Inline markup allowed in text:** `<b>`, `<strong>`, `<em>`, `<i>`, `<a href="https://...">`, `<bdi>`, `<code>`, `<br>`, `<sup>`, `<sub>`, `<abbr>`. Nothing else. Wrap numbers inside Hebrew sentences in `<bdi>…</bdi>` so they keep their direction: `"עלייה של <bdi>3.2%</bdi>"`. Escape `&` as `&amp;`.

**Times.** `time` and `et` are `HH:MM`. Israel time always comes first. ET = Israel − 7 h while both are on summer time; Israel moves to winter time on 25 October 2026 (− 6 h until US clocks change on 1 November), then − 7 h again. If unsure, give Israel time only.

### Edition fields

| Field | Required | Notes |
|---|---|---|
| `v` | yes | Always `2`. |
| `id`, `date`, `time` | yes | Match the folder name. |
| `et` | yes | US Eastern time of the drop. |
| `slot` | yes | `morning`, `midday`, `markets` (or `special` for an unscheduled drop). |
| `summary` | yes | 1–2 sentences, he + en: the edition at a glance. Used by the archive and the page description, not shown above the stories. Not a story-by-story recap. |

There is no weather in the paper. The check rejects a `weather` field.

### Section fields (`news`, `markets`, `ai`)

| Field | Notes |
|---|---|
| `asof` | The **content cutoff**: when you stopped gathering, not when the edition went out. Short and human: `{"he": "בוקר, <bdi>08:50</bdi> בישראל", "en": "Morning, <bdi>08:50</bdi> Israel"}`. If research stopped earlier than the drop, say the earlier time. For markets, the time the quotes were taken: `{"en": "Friday 2 October, quotes <bdi>15:06–15:21</bdi> Israel, before the jobs report", ...}`. Never "today" for an older stamp. |
| `carried` | `false` when fresh. When the section is copied from an earlier edition: `true`, or a reader note such as `{"he": "ממהדורת השווקים של יום שישי, 15:45.", "en": "From Friday's 15:45 markets edition."}`. The page shows **ממהדורה קודמת / Earlier edition**. Do not write the words "carried", "נישא", "MAIN", "lane", or "desk" in that note. A copied section keeps its own `asof` exactly — never restamp it with the new edition's time — and drop any note in it that points at an edition that is no longer current. |

### Four different times

Keep them apart; never copy one into another.

1. **Event time**: when the thing happened or is scheduled (`time`/`date` on a story, `time`/`date` on a calendar item).
2. **Source time**: when the source published it. Use it when the event time is unknown, and say which it is if it matters.
3. **Content cutoff**: the section's `asof`.
4. **Publication**: the edition's `time` (the folder time).

A time you do not know is left out, never estimated. Convert with real time zones (Asia/Jerusalem, America/New_York), daylight saving included.

### STORY (news and AI)

```json
{
 "kicker":   {"he": "אנרגיה", "en": "Energy"},
 "headline": {"he": "...", "en": "..."},
 "bottom":   {"he": "...", "en": "..."},
 "facts":    [ {"he": "...", "en": "..."}, ... ],
 "why":      {"he": "...", "en": "..."},
 "flags":    [ {"he": "...", "en": "..."} ],
 "confidence": "confirmed",
 "source":   {"he": "רויטרס ו־BBC", "en": "Reuters and BBC"},
 "time": "16:13",
 "date":     {"he": "<bdi>2</bdi> באוקטובר", "en": "2 October"},
 "links":    [ {"label": "Reuters", "url": "https://..."} ],
 "image":    IMAGE
}
```

The reader's rule is **answer first, explanation only if it adds value, flags clearly separated.** The fields map to that:

- **`headline`** — specific, 8–14 words, plain language. Not tape jargon.
- **`bottom`** — the bottom line: one sentence that answers "what happened, and where does it stand now". If he reads nothing else, this is the story.
- **`facts`** — 1–5 short numbered facts that support the bottom line. One fact per item, one or two sentences each. Numbers, names, dates. No caveats here.
- **`why`** — a consequence or a mechanism, in one or two sentences: who is affected, through what, and what is still open. Not a second summary, and not "this is important". If you cannot say why it matters, the story probably does not belong.
- **`flags`** — what is unconfirmed, disputed, missing, or easy to misread: "A request, not a signed deal." "One source, unnamed officials." "The figure is not in this edition." Each caveat appears **once**, here — not again in the bottom line, the why, or the photo caption. Omit when there is nothing to flag.
- **`confidence`** — see the rules below.
- **`source`**, **`time`** (Israel, when known) or **`date`** — who reported it and when.
- **`links`** — the original sources, external only, at least one. Link the article or document itself, not a homepage, and link every source you name in `source`.

### Confidence

| Label | Rule |
|---|---|
| `confirmed` (מאומת) | **Two independent publishers**, both linked. |
| `likely` (סביר) | One publisher, or several that all trace back to one (a newsletter summarising a vendor's post is one source). |
| `unverified` (לא מאומת) | You could not check it. |

- **Same publisher counts once.** A vendor's site, its blog, its GitHub, its Hugging Face page and its X account are all the vendor. A wire story republished on another site is still the wire. The check rejects `confirmed` unless the links come from two different publishers.
- **A newsletter alone is `likely` at most.**
- **Announced is not verified.** An official post confirms that a release was announced. It does not confirm the vendor's own speed, accuracy or benchmark numbers: write those as vendor-reported ("לפי החברה" / "the company says") and flag them, unless an independent source measured them.
- **Israeli force posture** (deployments, call-ups, operations, alert levels) is `confirmed` only from the IDF Spokesperson or Reuters/AFP-class reporting. Israeli TV alone is `likely`.
- **The label covers the bottom line.** If a card bundles claims of different strength, the weaker ones are flagged, or the card is split.
- Never upgrade a label, or a claim's wording, when you copy or carry a story. Never upgrade the wording beyond the label.

### What goes on the front

Rank news by: significance for Israel and the Middle East; major geopolitics; macro, energy, trade and regulation; companies that matter across sectors; AI. Market impact counts, but it is not the only test. Energy infrastructure (oil, gas, shipping lanes) goes in when it is sourced and material. Never add a story to fill a slot.

The first news story is the lead; order the rest by importance: the lead, then 2 strong supports, then the rest. One story is one development; do not run the same development twice under different headlines.

### IMAGE (required on every card)

```json
{
 "src": "assets/images/big-spring-refinery-1280.jpg",
 "srcset": "assets/images/x-960.jpg 960w, assets/images/x-1600.jpg 1600w",
 "w": 1280, "h": 759,
 "alt":     {"he": "...", "en": "..."},
 "year":    2007,
 "caption": {"he": "בית הזיקוק בביג ספרינג, טקסס", "en": "Big Spring Refinery, Texas"},
 "credit":  "James St. John",
 "license": {"label": "CC BY 2.0", "url": "https://creativecommons.org/licenses/by/2.0/"}
}
```

The page builds the caption as **Archive photo, 2007 · subject · Photo: creator · licence**.

- **Every card needs a picture.** News stories, market drivers, market catalysts, and AI stories each need an `image`. The check rejects a card without one. Prefer a real licensed photograph. If none fits, an illustration is allowed.
- Only licensed pictures (Wikimedia Commons, public domain, government) with a credit and a license. Download into `assets/images/` as JPEG, about 1280–1600 px wide. Never hotlink.
- `year` — the year the photo was taken, as a number. Set it for every photo that is not of the event itself; the page then labels it "Archive photo, 2007".
- `caption` — what and where, in a few words. The year and the credit are separate fields, so do not repeat a long credit line. Do not list what the photo is not.
- `credit` — the creator, nothing else.
- A generated illustration: set `"ai": true` and no credit. The page shows only **המחשה (AI)** / **AI Illustration** under the image (capital I in Illustration). No badge, no banner, and no extra caption. Never present an illustration as a photograph of a real event or a real person.
- A copied section keeps its pictures.

### Markets

```json
"markets": {
 "asof": {"he": "...", "en": "Friday 2 October, quotes <bdi>15:06–15:21</bdi> Israel, before the open"},
 "stamp": {"he": "שישי 15:21", "en": "Fri 15:21"},
 "carried": false,
 "story": [ {"he": "...", "en": "At most three sentences: what the tape is doing and the one or two reasons the sources give."} ],
 "note":  [ {"he": "...", "en": "Futures, not cash. US stocks open at <bdi>16:30</bdi> Israel."} ],
 "tape": [
  {"sym": "ES", "name": "S&amp;P 500", "last": "7,756.5", "chg": "+0.42%", "flag": {"he": "חוזה, לא המדד", "en": "Future, not the index"}, "url": "https://finance.yahoo.com/quote/ES%3DF/"},
  {"sym": "NQ", ...}, {"sym": "YM", ...},
  {"sym": "VIX", ..., "flag": {"he": "מדד, לא חוזה", "en": "Index, not futures"}},
  {"sym": "USD/ILS", ..., "flag": {"he": "שער מט״ח", "en": "FX spot"}},
  {"sym": "WTI", ...}
 ],
 "extra": [ {"sym": "BTC", ...}, {"sym": "10Y", ...} ],
 "drivers":   [ ITEM ],
 "catalysts": [ ITEM with "ticker": "AVGO" ],
 "calendar":  { "items": [ {"date": "2026-10-06", "time": "19:00", "et": "12:00", "label": {...}, "detail": {...}} ] }
}
```

The page shows Markets in this order: the story → what is moving markets (drivers) → companies (catalysts) → today and next (calendar) beside a small price snapshot. The prices are context, not the headline; the TV ticker at the top carries them too.

- **`stamp`**: the short label on the ticker — weekday and the time the quotes were taken, e.g. `{"he": "שישי 15:21", "en": "Fri 15:21"}`. Never "Live".

- **`tape`**: exactly these six, in this order: ES, NQ, YM, VIX, USD/ILS, WTI. Each with `last`, one `chg`, a short `flag`. Label a future as a future; NQ is not the Composite; **VIX is the index** (flag must say מדד / Index); **USD/ILS is FX spot** (flag must say שער מט״ח / FX spot) and a rise means a stronger dollar. If the tape was cash, say cash. A number you do not have: `{"sym": "WTI", "missing": true}` — never invent it.
- **`extra`**: at most Bitcoin and the US 10-year. A prior close is labeled as such. Nothing else as equal peers (no RTY, DXY, gold, Brent, 30-year).
- **`story`**: optional, at most three sentences. Do not force a cause for a small move.
- **`drivers`** (about 4–7) and **`catalysts`** (about 4–8) — ranges, not quotas; never pad. Each has `headline`, `bottom`, optional `facts`, `why`, optional `flags`, `links`.
  - **One card = one development.** A driver explains a broad market mechanism (rates, energy, policy); a catalyst explains a company-specific change. Bundle related angles into one card (jobs and rates are one driver, not two).
  - A **scheduled** event or deadline lives only in the calendar, not as a driver. A newly sourced award, release or delivery can be a driver.
  - A merger approval and its later closing date can be separate items only if each adds new information.
  - A catalyst has a `ticker` and a real event — a price move alone is not a reason. Spread across sectors; do not default to the same mega-caps.
- **`calendar`**: 2–4 events, each with `date` (`YYYY-MM-DD`), and Israel `time` and `et` only when confirmed.
  - An event **after** your cutoff: list it as upcoming.
  - An event **at or before** your cutoff (e.g. a 15:30 jobs report in a 15:45 edition): give the sourced result in `result` (`{"he": "...", "en": "..."}`), or set `"status": "unavailable"` (the page shows "Result not available at cutoff"). Never describe a market reaction to a result you do not have. The check enforces this.
  - Drop older events that no longer matter.
- On a non-markets drop, copy the last markets section and set `carried`.
- No trade recommendations. Ever. Tape is data.

## Words

- Hebrew reads as Hebrew sentences; English as English. Jargon is glossed once or avoided.
- No desk language anywhere a reader can see (cards, captions, the nameplate, the archive, image credits): no MAIN, overnight thin / מהדורה רזה, carried / נישא, desk, lane, essay-on-this-tab, verb lock, card IDs, HOLD, pack, routing notes, internal notes, TODO. Edition names are Morning / בוקר, Midday / צהריים, Markets / שווקים, and AI. Normal market words a reader knows (pre-market, futures, the jobs report) are fine; internal shorthand such as pre-NFP is not.
- Do not name or describe the publisher as a person. The only public name is the brand **The Daily Jenya**.
- Say it once. The summary does not recap every story; the why does not repeat the bottom line; a caveat lives only in `flags`.
- Uncertain claims stay qualified, and the qualification lives in `flags`.
- Do not invent: no number, quote, time, forecast, or photo that is not in your sources. Missing data is said to be missing.

## Before you push

- [ ] Folder name, `id`, `date`, `time`, `slot` agree.
- [ ] `index.html` in the folder is an exact copy of `templates/shell.html`.
- [ ] Every story has headline, bottom, facts, why, confidence, source, links — in both languages.
- [ ] Every `confirmed` has two independent publishers linked; vendor numbers are marked vendor-reported.
- [ ] Carried sections are marked `carried` and keep their own `asof`.
- [ ] Each section's `asof` is its real content cutoff.
- [ ] Calendar: every event has a `date`; anything at or before the cutoff has a `result` or `"status": "unavailable"`.
- [ ] Markets: no development appears twice; deadlines are in the calendar only.
- [ ] Tape: six chips, VIX = index, USD/ILS = FX spot, missing numbers marked missing; `stamp` set.
- [ ] Every News, Markets, and AI card has an image. Photos are licensed and credited; illustrations use `ai: true` and the label המחשה (AI) / AI Illustration only.
- [ ] Captions say what and where. They do not list what the photo is not.
- [ ] No desk words, and no personal name besides the brand The Daily Jenya.
- [ ] Manifest line added at the top, headline and summary identical to the edition's.
- [ ] `python3 tools/check.py <id>` prints 0 errors.
- [ ] No older edition folder was touched.
