# Publishing a Brief edition (Modern editorial polish)

This note is the publish path for the Modern editorial polish approved on 24 September 2026. The locked sheet is still white, crimson `#8b1e2d`, Frank Ruhl Libre headlines, and an asymmetric news front. Owner rejected Classic cream and Business Markets-first. This file does not replace verification, agenda, confidence, or cadence rules. Those still live with the desk. This file wins on what a reader sees.

The empty structure is `templates/edition.html`. It loads `assets/edition.css` and `assets/polish.css`. The filled cutover is `index.html` and `briefings/2026-09-24-1545/` (midday News, the Thursday ~15:45 markets snapshot, Wednesday AI). The labeled study that was approved is `preview/ux-2026-09-24-polish/` — leave that folder in place. An earlier study, `preview/ux-2026-09-24/`, is the pre-polish Modern page and is not the template. Earlier pages under `briefings/` stay on `assets/brief.css`. Do not restyle those older editions, and do not change their facts.

`assets/paper.css` is retired. Do not bring the dark newspaper sheet back. The archive **index** (`archive/index.html`) is the light sheet. The pages it links to, before this cutover, stay on the card sheet. `404.html` is still the dark card chrome.

## Cutover

The 24 September 2026 afternoon edition is the polish cutover. `index.html` and `briefings/2026-09-24-1545/index.html` render from this template. They carry the midday News and the Thursday ~15:45 markets snapshot that had already landed, in the approved wording (a tariff truce, not a stop to trade; VIX is the index; USD/ILS is FX spot). Licensed photographs and their credits are in `assets/images/` and `briefings/2026-09-24-1545/IMAGE-CREDITS.md`.

`assets/brief.css` and `assets/lanes.js` stay for earlier permalinks. The card rendering of that 15:45 tape is in git history. Do not delete `brief.css` while those archives still link it.

**Next editions** render from `templates/edition.html` into `index.html` and `briefings/YYYY-MM-DD-HHMM/index.html`. Copy `templates/IMAGE-CREDITS.md` into that folder when a photograph is used. Do not put `lanes.js` back on an editorial page. Do not swap the template while a Markets publish is in flight, and do not merge a fresh content pack in the same change as a template experiment.

Same sheet for every cadence. What changes is which blocks are filled:

- **Overnight thin.** One lead, fewer supports, quiet band only if the pack has the stories. Markets is the previous stamp, with that stamp printed, or the section is omitted when the pack has no tape. AI is carried or omitted the same way.
- **Main news.** Full front: lead, about two supports, quiet band. If this drop does not replace Markets, keep the prior board and print the real stamp. Do not say “today” for an older stamp.
- **Markets.** Refresh A–F from the new tape. Keep the news front unless the pack replaces a story.
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

## Markets A–F, after News

Markets is the business section under the news, not the front of the page and not a ticker strip. It is not an HTML table. Each quote is an `article.mkt-line` on a `.mkt-board`: symbol and plain name, price and change on one line, a short flag, and provenance inside `details.mkt-detail`. On a phone the six primary quotes stack. From 860px the primary, secondary, and cash boards are two columns. The page does not scroll sideways.

1. **A. Session** (`.mkt-session`). Name the session at the edition clock: pre-market, market open, latest close, or market closed. The edition time is in the masthead. The quote time is the session line and the section head. If the tape is carried, print the actual stamp. Do not say “today” for an older stamp. Do not call delayed data live.
2. **B. Primary snapshot** (`.mkt-board-primary`). Six rows when the pack has them: S&P 500 future, Nasdaq (the exact future, not the Composite), Dow future, VIX, USD/ILS, WTI. VIX is the **index**, not futures — the flag says so. USD/ILS is **FX spot**, not a future, and a rise means a stronger dollar — the flag says so. Do not swap futures with cash, Nasdaq-100 with the Composite, or WTI with Brent. If a primary instrument has no stamp, show the missing-row pattern (“not in this tape”) and do not invent the number.
3. **C. Story and basis note** (`.mkt-story`, then `.note` when a second basis changes a number). About 40–60 words. Pattern, what the sources attribute, what is next. Do not restate every cell. Separate what was observed from what was reported from what is interpretation. No invented cause. The note is visible. A details block can repeat the definition. It cannot replace the note.
4. **D. Secondary** (`.mkt-board-secondary`). Yields, Bitcoin, and any other instrument the pack actually stamped, so they do not bury the six. Yield changes are in basis points, not percent, when that is the pack’s unit.
5. **E. Cash close** (`.mkt-board-cash`). Only when the pack stamped a cash close. Label it as cash, and as not the futures above. If a newer cash close exists and the pack does not contain it, say the close is absent. Do not reconstruct it. Delete this block when there is no stamp.
6. **F. Companies and the next 48 hours** (`.companies`, `.upcoming`). Zero to three companies. Name, ticker, the event, why it matters. A price is not a reason to include a name. If the same event is a News story, give only the market implication and a link. Then a chronological list: event, date, confirmed time, one line of relevance. Israel and US Eastern, including which daylight-saving offset is in force. Drop rows whose time has already passed. Do not add heatmaps, gauges, or a watchlist.

## Freshness

Carried blocks show the real date and time. Replace stale “today / tomorrow” from the source pack when the edition is a later day.

## Type

Frank Ruhl Libre (headlines) and Heebo (body) are the faces in use. Both are SIL Open Font License; the license texts and the Hebrew plus Latin woff2 subsets are in `assets/fonts/`. `assets/edition.css` loads them. `assets/polish.css` sets the larger wordmark, the section nav, photographs, the markets boards, and the newspaper AI and archive list. Weights on disk are 500 and 700 (there is no 900 file). Body size is 18.5px, line-height about 1.65–1.7. The lead stays at that size; supports and the quiet band are set smaller on purpose.

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
- Markets is A–F, not an HTML table. VIX is labeled as an index. USD/ILS is labeled as FX spot. The six primary quotes can be scanned without reading a paragraph to find the level.
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
