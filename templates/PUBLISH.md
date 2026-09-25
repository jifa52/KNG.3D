# Publishing a Brief edition (Modern editorial polish)

This note is the publish path for the Modern editorial polish approved on 24 September 2026. The locked sheet is still white, crimson `#8b1e2d`, Frank Ruhl Libre headlines, and an asymmetric news front. Owner rejected Classic cream and Business Markets-first. This file does not replace verification, agenda, confidence, or cadence rules. Those still live with the desk. This file wins on what a reader sees.

The empty structure is `templates/edition.html`. It loads `assets/edition.css` and `assets/polish.css`. The filled cutover is `index.html` and `briefings/2026-09-24-1545/` (midday News, the Thursday ~15:45 markets snapshot, Wednesday AI). The labeled study that was approved is `preview/ux-2026-09-24-polish/` — leave that folder in place. An earlier study, `preview/ux-2026-09-24/`, is the pre-polish Modern page and is not the template. Earlier pages under `briefings/` stay on `assets/brief.css`. Do not restyle those older editions, and do not change their facts.

`assets/paper.css` is retired. Do not bring the dark newspaper sheet back. The archive **index** (`archive/index.html`) is the light sheet. The pages it links to, before this cutover, stay on the card sheet. `404.html` is still the dark card chrome.

## Cutover

The 24 September 2026 afternoon edition is the polish cutover. `index.html` and `briefings/2026-09-24-1545/index.html` render from this template. They carry the midday News and the Thursday ~15:45 markets snapshot that had already landed, in the approved wording (a tariff truce, not a stop to trade; VIX is the index; USD/ILS is FX spot). Licensed photographs and their credits are in `assets/images/` and `briefings/2026-09-24-1545/IMAGE-CREDITS.md`.

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

The page is white (`#ffffff`). Ink is `#121212`, body text `#3a3a3a`, muted text `#6b6b6b`. Crimson `#8b1e2d` is for kickers, the rule under the section nav, and the small badge. No dark app bar, no card grid, no cream paper, no gold ticker.

Masthead: a large Frank Ruhl Libre “Brief” wordmark, the edition date and clock beside it, the language switcher. Under that, the section nav: חדשות · שווקים · AI · ארכיון. Then one quotes line (what the news cut is, and that the markets figure is a snapshot, not a live quote).

Each story:

- Headline, about 8–14 words where that is natural. Ordinary Hebrew, not tape jargon.
- One paragraph. Ordinary stories about 45–75 words; the lead may run to about 100. Targets, not quotas.
- A compact sources line with links and dates.

What changed and why it matters belong **in that paragraph**. Do not print public headings “What / Why / Next” or “למה זה חשוב / Why it matters” under a card.

Strip from the HTML: internal notes, hard gates, verb locks, card IDs, agent routing, and confidence essays (stacks of מאומת / סביר / לא מאומת). Keep a material caveat in the paragraph itself. Uncertain claims stay qualified in prose. A collapsed “more” block is only for extra sourced detail, never the only place a caveat lives.

News hierarchy, in this order, on the open page:

1. One lead (`article.lead` inside `.front`), about 60% of the row. A `figure.photo` only when a licensed credit exists. Otherwise the lead is text-first. Do not print the gray “no licensed image” line.
2. About two supporting stories (`.side-stack`), about 40%. A portrait (`figure.photo.photo--portrait`) only with its own license and caption.
3. The rest quieter (`.quiet-band`), three across on a wide screen, stacked on a phone.

AI uses the same calm newspaper type: `.ai-carry` when the digest is carried, then `article.ai-lead`, then `.ai-list`. No equal-weight card stack. No product image without a license.

Section ids are `#news`, `#markets`, and `#ai`. `#premarket`, `#lane-news`, `#lane-markets`, and `#lane-ai` scroll to the matching section. Card-layout archives still use `assets/lanes.js` to switch panels. This template does not. Do not put `lanes.js` back on the editorial page or it will hide Markets and AI.

## Markets, after News

From 25 September 2026 the reader hierarchy is a market news brief, not a quote dashboard. Prices are supporting context. The empty structure is the `#markets` block in `templates/edition.html`. Older permalinks that still use quote boards stay as they were. Do not rebuild those pages.

Reader order, top to bottom. Do not reverse it. On a phone the snapshot wraps; it does not become a second story. The page does not scroll sideways.

1. **Snapshot** (`.mkt-snap`). Secondary. A compact strip.
   - `.mkt-snap-note` is one short freshness note, and only when a real limitation exists: futures are not cash, the US cash session is closed, or a yield is the prior close. No methodology essay. No per-quote timestamp paragraph.
   - `.mkt-strip` holds up to six `.mkt-chip` items: S&P 500 / ES, Nasdaq / NQ, Dow / YM, VIX, USD/ILS, WTI. Label a future as a future. NQ is not the Composite. VIX is the **index** — the flag says `מדד, לא חוזה` / `Index, not futures`. USD/ILS is **FX spot** — the flag says `שער מט״ח` / `FX spot`, and a rise means a stronger dollar. If the pack stamped cash instead of futures, label those chips as cash. Do not print both.
   - `.mkt-strip-tuck` is optional and smaller. At most Bitcoin and the US 10-year, when the pack stamped them. If the 10-year stamp is a prior cash close, the flag says so. Do not print a percent change unless that is the pack’s unit.
   - Do not print RTY, DXY, gold, Brent, or the 30-year as equal peers. Do not add a cash grid. A missing primary stamp is `.mkt-chip--missing` (“אין חותמת בחבילה הזו” / “Not in this tape”). Do not invent the number.
   - Each chip: symbol linked to the stamp, a plain name, the price, one change, a short flag. The section head prints the real stamp. If the tape is carried, do not say “today.” Do not call delayed data live.
2. **Market drivers** (`#mkt-drivers-heading`, `.mkt-drivers`). About four to seven `article`s when the day has them. Do not fill weak items to hit a count. Each article: a bilingual headline, one or two short sentences (what happened, and why a market participant may care), and `.sources`. A material caveat stays in the sentence. Hebrew is plain. No trade recommendation. If the same event is a News story, give only the market angle.
3. **Company catalysts** (`#mkt-catalysts-heading`, `.mkt-catalysts`). About four to eight. Ticker in `.mkt-tick`, the name, the event, why it matters, and `.sources`. A price move is not a reason to include a name. Do not default to the same megacaps unless they have a real event. Cover other sectors when the day has them.
4. **Today / next** (`.mkt-next`). About two to four items that could matter. Israel time first. US Eastern beside it when the hour is confirmed, including which daylight-saving offset is in force. One short reason only when it is not obvious. Drop rows whose time has already passed. Do not invent an hour.
5. **Market story** (`.mkt-brief`). Optional, and last. At most three sentences. Do not force a cause for a small move. Delete the block on a quiet day. Do not restate every chip.

Desk pack, in this order, before HTML: SESSION (one label and the real stamp); SNAPSHOT_PRIMARY (the six); SNAPSHOT_SECONDARY (optional Bitcoin and 10-year only); MARKET_DRIVERS; COMPANY_CATALYSTS; TODAY_NEXT; MARKET_STORY (optional); INTERNAL NOTES. Do not print the internal notes.

DOM hooks: `#markets`, `.mkt-snap`, `.mkt-strip`, `.mkt-chip`, `.mkt-strip-tuck`, `.mkt-drivers`, `.mkt-catalysts`, `.mkt-next`, `.mkt-brief`. `#premarket` still scrolls to `#markets`.

## Freshness

Carried blocks show the real date and time. Replace stale “today / tomorrow” from the source pack when the edition is a later day.

## Type

Frank Ruhl Libre (headlines) and Heebo (body) are the faces in use. Both are SIL Open Font License; the license texts and the Hebrew plus Latin woff2 subsets are in `assets/fonts/`. `assets/edition.css` loads them. `assets/polish.css` sets the larger wordmark, the section nav, photographs, the news-first markets brief, and the newspaper AI and archive list. Older polish permalinks still use the quote-board rules in that file. Weights on disk are 500 and 700 (there is no 900 file). Body size is 18.5px, line-height about 1.65–1.7. The lead stays at that size; supports and the quiet band are set smaller on purpose.

Fallback, if a file fails: `"Noto Serif Hebrew", "Times New Roman", Times` for headlines, and `"Noto Sans Hebrew", "Arial Hebrew", Arial` for body. Do not switch faces unless a real load or shaping failure shows up.

## Images

Use a picture only with a license, a credit in the caption, alt text (`data-alt-he` / `data-alt-en`), and a block in that edition’s `IMAGE-CREDITS.md`. Put shared files in `assets/images/`. Put a file that only one edition uses in `briefings/YYYY-MM-DD-HHMM/images/`. Otherwise leave the story text-first. Do not generate a documentary fake. Do not draw a chart from memory. A market chart is allowed only when the series, source, range, units, and timestamps are real. Missing art does not block the edition.

There is no publish script that fetches images for a new story. Choosing and crediting a photograph is a manual step. Do not hotlink an unlicensed wire photo to fill the lead.

## Checks before publish

- Headline alone is specific.
- The paragraph states the point and any caveat that changes the meaning.
- Jargon is plain, or glossed once. Hebrew reads as a sentence, not a tape label.
- Hebrew and English are not both visible.
- The page is white. The masthead is the wordmark. The nav is חדשות · שווקים · AI · ארכיון. Crimson is the kicker, the nav rule, and the badge.
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
