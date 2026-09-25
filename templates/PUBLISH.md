# Publishing a The Daily Jenya edition

This note is the publish path after the 25 September 2026 cutover. The locked sheet is Direction 02: paper `#f3f0e7`, ink `#15251f`, forest `#143e33`, lime `#dae8a4`, soft AI purple `#ded5ec`, rules `#cfcfc2`. Crimson `#8b1e2d` is only a secondary news accent. Frank Ruhl Libre headlines, Heebo body, asymmetric news front. Do not switch the identity to crimson/gold. This file does not replace verification, agenda, confidence, or cadence rules. Those still live with the desk. This file wins on what a reader sees.

The empty structure is `templates/edition.html`. It loads `assets/edition.css` and `assets/polish.css`. The filled cutover is `index.html` and `briefings/2026-09-25-1400/` (Friday midday News, the Friday ~11:35–11:45 markets snapshot, Friday morning AI). The masthead logo is `assets/daily-jenya-logo.png`. The labeled study that was approved earlier is `preview/ux-2026-09-24-polish/` — leave that folder in place. An earlier study, `preview/ux-2026-09-24/`, is the pre-polish Modern page and is not the template. Earlier pages under `briefings/` stay on `assets/brief.css`. Do not restyle those older editions, and do not change their facts.

`assets/paper.css` is retired. Do not bring the dark newspaper sheet back. The archive **index** (`archive/index.html`) is the light sheet. The pages it links to, before this cutover, stay on the card sheet. `404.html` is still the dark card chrome.

## Cutover

The 25 September 2026 midday edition is the Daily Jenya cutover. `index.html` and `briefings/2026-09-25-1400/index.html` render from this template. They carry the Friday MAIN News (eight cards), the Friday markets snapshot already on the site (~11:35–11:45 Israel, futures not cash), and the Friday morning AI digest. Do not invent stories or prices when remounting. VIX is the index. USD/ILS is FX spot. A tariff truce is not a stop to trade.

`assets/brief.css` and `assets/lanes.js` stay for earlier permalinks. The card rendering of that 15:45 tape is in git history. Do not delete `brief.css` while those archives still link it.

**Next editions** render from `templates/edition.html` into `index.html` and `briefings/YYYY-MM-DD-HHMM/index.html`. Copy `templates/IMAGE-CREDITS.md` into that folder when a photograph is used. Do not put `lanes.js` back on an editorial page. Do not swap the template while a Markets publish is in flight, and do not merge a fresh content pack in the same change as a template experiment.

Same sheet for every cadence. What changes is which blocks are filled:

- **Overnight thin.** One lead, fewer supports, quiet band only if the pack has the stories. Markets is the previous news-first block, with that stamp printed, or the section is omitted when the pack has no tape. AI is carried or omitted the same way.
- **Main news.** Full front: lead, about two supports, quiet band. If this drop does not replace Markets, keep the prior news-first block and print the real stamp. Do not say “today” for an older stamp.
- **Markets.** Refresh the snapshot strip, drivers, catalysts, today/next, and the optional story. Keep the news front unless the pack replaces a story.
- **AI digest.** Refresh `.ai-carry`, `.ai-lead`, and `.ai-list`. Text-first unless a licensed image exists.

The polish preview is not an archive edition. Do not add it to `archive/index.html`. It stays as the study that shipped:

`https://jifa52.github.io/KNG.3D/preview/ux-2026-09-24-polish/`

## What the reader sees

One scrolling page. News, then Markets, then AI. One language at a time. Hebrew is the default; English is the switcher in the masthead (`assets/i18n.js`, `data-lang`). Do not print a full Hebrew story and then the full English story in the same view.

The page is cream paper (`#f3f0e7`). Ink is `#15251f`. Forest `#143e33` is the mast bar, the nav rule, and the markets snapshot band. Lime `#dae8a4` is the Why-it-matters wash and the crawl prices. AI sits on `#ded5ec`. Rules are `#cfcfc2`. Crimson `#8b1e2d` is only a news kicker accent. No dark app bar, no quote-board dashboard, no crimson/gold identity.

Masthead: the supplied logo (J and globe, **The Daily Jenya**, **YOUR MORNING EDITION**), the edition date, and Jerusalem time before any other clock, plus the language switcher. Under that, the section nav: חדשות · שווקים · AI · ארכיון. Then the indices crawl, then one quotes line (what the news cut is, and that the markets figure is a snapshot, not a live quote).

Each story, in this order:

- Category kicker.
- Headline, about 8–14 words where that is natural. Ordinary Hebrew, not tape jargon.
- What happened, in two to four short sentences.
- A structural **למה זה חשוב / Why it matters** (`.why`), one or two sentences drawn from the sourced pack. Do not hide that point only inside the body.
- Confidence, source, and time (`.card-meta`). Jerusalem time first. **מאומת / Confirmed** needs two independent sources. A single newsletter is **סביר / Likely** at most. Do not print a stack of confidence essays.
- A sources line with links. The link is to the external original only. There is no in-site long article and no “continue reading.”

Strip from the HTML: internal notes, hard gates, verb locks, card IDs, agent routing (including “→ Markets”), and desk words such as stamp when a plain “at this hour” will do. Keep a material caveat in the prose. Uncertain claims stay qualified. A collapsed “more” block is only for extra sourced detail, never the only place a caveat lives.

News hierarchy, in this order, on the open page. The live sheet carries `class="home"` on `<html>` (with `edition`). Archive and older briefings do not.

1. The lead headline (`.lead-display`) sits in the mast, on the cream, beside the logo. One kicker, one `h2#lead-title`.
2. The forest panel (`article.lead` inside `.front`) is the story: index line, two to four sentences, `.why`, meta, sources. About 60% of the row. A `figure.photo` only when a licensed credit exists. Otherwise the panel is text-first. Do not print the gray “no licensed image” line. Do not invent a photograph.
3. About two supporting stories (`.side-stack`), about 40%. A portrait (`figure.photo.photo--portrait`) only with its own license and caption.
4. The rest quieter (`.quiet-band`), three across on a wide screen, stacked on a phone.
5. The edition dek (`.quotes`) comes after that band, not between the nav and the lead.

AI uses the same calm newspaper type: `.ai-carry` when the digest is carried, then `article.ai-lead`, then `.ai-list`. No equal-weight card stack. No product image without a license.

Section ids are `#news`, `#markets`, and `#ai`. `#premarket`, `#lane-news`, `#lane-markets`, and `#lane-ai` scroll to the matching section. Card-layout archives still use `assets/lanes.js` to switch panels. This template does not. Do not put `lanes.js` back on the editorial page or it will hide Markets and AI.

## Markets, after News

From 25 September 2026 the reader hierarchy is a market news brief, not a quote dashboard. Prices are supporting context and come last. The empty structure is the `#markets` block in `templates/edition.html`. Older permalinks that still use quote boards stay as they were. Do not rebuild those pages.

Reader order, top to bottom. Do not reverse it. On a phone the snapshot wraps; it does not become the hero. The page does not scroll sideways.

1. **Market drivers** (`#mkt-drivers-heading`, `.mkt-drivers`). About four to seven `article`s when the day has them. Do not fill weak items to hit a count. On the home sheet the section title is large cream type and this block is the forest slab; the first driver is the display line. Prices stay in the snapshot below. Each article: a bilingual headline, one or two short sentences, `.why`, and `.sources`. A material caveat stays in the sentence. Hebrew is plain. No trade recommendation. If the same event is a News story, give only the market angle.
2. **Company catalysts** (`#mkt-catalysts-heading`, `.mkt-catalysts`). About four to eight. Ticker in `.mkt-tick`, the name, the event, `.why`, and `.sources`. A price move is not a reason to include a name. Do not default to the same megacaps unless they have a real event. Cover other sectors when the day has them.
3. **Today / next** (`.mkt-next`). About two to four items that could matter. Israel time first. US Eastern beside it when the hour is confirmed, including which daylight-saving offset is in force. One short reason only when it is not obvious. Drop rows whose time has already passed. Do not invent an hour.
4. **Market story** (`.mkt-brief`). Optional. At most three sentences. Do not force a cause for a small move. Delete the block on a quiet day.
5. **Snapshot** (`.mkt-snap`). Secondary. A compact strip, after the news. The same six primary levels also run in the mast crawl (`.crawl`), duplicated for a seamless right-to-left loop. `prefers-reduced-motion` stops the animation and shows one static row. The crawl is the stamped snapshot, not a live quote.
   - `.mkt-snap-note` is one short freshness note, and only when a real limitation exists: futures are not cash, the US cash session is closed, or a yield is the prior close. No methodology essay. No per-quote timestamp paragraph.
   - `.mkt-strip` holds up to six `.mkt-chip` items: S&P 500 / ES, Nasdaq / NQ, Dow / YM, VIX, USD/ILS, WTI. Label a future as a future. NQ is not the Composite. VIX is the **index** — the flag says `מדד, לא חוזה` / `Index, not futures`. USD/ILS is **FX spot** — the flag says `שער מט״ח` / `FX spot`, and a rise means a stronger dollar. If the pack stamped cash instead of futures, label those chips as cash. Do not print both.
   - `.mkt-strip-tuck` is optional and smaller. At most Bitcoin and the US 10-year, when the pack stamped them. If the 10-year stamp is a prior cash close, the flag says so. Do not print a percent change unless that is the pack’s unit.
   - Do not print RTY, DXY, gold, Brent, or the 30-year as equal peers. Do not add a cash grid. A missing primary stamp is `.mkt-chip--missing` (“אין חותמת בחבילה הזו” / “Not in this tape”). Do not invent the number.
   - Each chip: symbol linked to the stamp, a plain name, the price, one change, a short flag. The section head prints the real stamp. If the tape is carried, do not say “today.” Do not call delayed data live.
Do not restate every chip inside the market story.

Desk pack, in this order, before HTML: SESSION (one label and the real stamp); SNAPSHOT_PRIMARY (the six); SNAPSHOT_SECONDARY (optional Bitcoin and 10-year only); MARKET_DRIVERS; COMPANY_CATALYSTS; TODAY_NEXT; MARKET_STORY (optional); INTERNAL NOTES. Do not print the internal notes.

DOM hooks: `#markets`, `.mkt-snap`, `.mkt-strip`, `.mkt-chip`, `.mkt-strip-tuck`, `.mkt-drivers`, `.mkt-catalysts`, `.mkt-next`, `.mkt-brief`. `#premarket` still scrolls to `#markets`.

## Freshness

Carried blocks show the real date and time. Replace stale “today / tomorrow” from the source pack when the edition is a later day.

## Type

Frank Ruhl Libre (headlines) and Heebo (body) are the faces in use. Both are SIL Open Font License; the license texts and the Hebrew plus Latin woff2 subsets are in `assets/fonts/`. `assets/edition.css` loads them. `assets/polish.css` sets the larger wordmark, the section nav, photographs, the news-first markets brief, and the newspaper AI and archive list. Older polish permalinks still use the quote-board rules in that file. Weights on disk are 500 and 700 (there is no 900 file). Body size is 18.5px, line-height about 1.65–1.7. The lead stays at that size; supports and the quiet band are set smaller on purpose.

Fallback, if a file fails: `"Noto Serif Hebrew", "Times New Roman", Times` for headlines, and `"Noto Sans Hebrew", "Arial Hebrew", Arial` for body. Do not switch faces unless a real load or shaping failure shows up.

## Images

Use a story picture only with a license, a credit in the caption, alt text (`data-alt-he` / `data-alt-en`), and a block in that edition’s `IMAGE-CREDITS.md`. The masthead file `assets/daily-jenya-logo.png` is the brand lockup, not a story photograph. An illustration that is not a photo of the event is allowed only with `<p class="illus-label">` reading **המחשה (AI)** / **AI illustration**. Put shared files in `assets/images/`. Put a file that only one edition uses in `briefings/YYYY-MM-DD-HHMM/images/`. Otherwise leave the story text-first. Do not generate a documentary fake. Do not draw a chart from memory. A market chart is allowed only when the series, source, range, units, and timestamps are real. Missing art does not block the edition.

There is no publish script that fetches images for a new story. Choosing and crediting a photograph is a manual step. Do not hotlink an unlicensed wire photo to fill the lead.

## Checks before publish

- Headline alone is specific.
- The paragraph states the point and any caveat that changes the meaning.
- Jargon is plain, or glossed once. Hebrew reads as a sentence, not a tape label.
- Hebrew and English are not both visible.
- The page is cream `#f3f0e7`. The masthead is the Daily Jenya logo beside the lead headline. The nav is חדשות · שווקים · AI · ארכיון. Forest is the top bar, the lead panel, and the drivers slab. Crimson is only a news kicker. The snapshot figures stay smaller than the drivers.
- Every story card has `.why` (למה זה חשוב / Why it matters). There is no dive-in reader.
- The indices crawl is present, duplicated, and still readable with `prefers-reduced-motion`.
- An AI picture carries `.illus-label` (**המחשה (AI)** / **AI illustration**). Do not present generated art as a photograph of the event.
- Both `edition.css` and `polish.css` are linked. `lanes.js`, `brief.css`, and `paper.css` are not.
- News is the asymmetric front. There is no gray photo placeholder.
- Markets is the news-first order above, not quote boards and not an HTML table. The snapshot strip is shorter than the drivers. VIX is labeled as an index. USD/ILS is labeled as FX spot. The six levels can be scanned without reading a paragraph.
- A carried AI digest says so, in `.ai-carry`, with the real date.
- Every embedded image has a caption and a row in `IMAGE-CREDITS.md`.
- Expired calendar rows are gone.
- No internal desk labels in the HTML.
- `#premarket` still reaches Markets.

## Pages deploy

GitHub Pages serves the `main` branch from the repository root. A push to `main` publishes `index.html`, `archive/`, `briefings/`, `assets/`, `preview/`, and `templates/`. The Actions workflow verifies those files; it does not replace the branch deploy.

Live homepage:

`https://jifa52.github.io/KNG.3D/`

Approved study (kept):

`https://jifa52.github.io/KNG.3D/preview/ux-2026-09-24-polish/`
