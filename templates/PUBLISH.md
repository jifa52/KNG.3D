# Publishing a Brief edition (Modern editorial)

This note is the publish path for the Modern editorial layout in UX spec v1.2 (locked 2026-09-24). Owner rejected Classic cream and Business Markets-first. It does not replace verification, agenda, confidence, or cadence rules. Those still live with the desk. This file wins on what a reader sees.

The filled reference is `preview/ux-2026-09-24/index.html`. The empty structure is `templates/edition.html`. Both use `assets/edition.css`. Historical pages under `briefings/` stay on `assets/brief.css`. Do not restyle old editions to chase this layout, and do not change their facts.

`assets/paper.css` is retired. Do not bring the dark newspaper sheet back.

## Cutover is not this template

`index.html` is the live homepage. It stays on the current card layout (`assets/brief.css`, `assets/lanes.js`) through the weekday ~15:45 Israel Markets publish.

**Cutover is Marshal’s next step, not a side effect of editing this file.** After that Markets slot has landed cleanly, and after the preview at `preview/ux-2026-09-24/` has been checked, render the next edition from `templates/edition.html` into `index.html` and `briefings/YYYY-MM-DD-HHMM/index.html`. Do not merge a content overwrite of `index.html` in the same moment as the template swap, and do not swap the template while a Markets publish is in flight.

The preview is not an archive edition. Do not add it to `archive/index.html`. One canonical preview URL is enough:

`https://jifa52.github.io/KNG.3D/preview/ux-2026-09-24/`

## What the reader sees

One scrolling page. News, then Markets, then AI. One language at a time. Hebrew is the default; English is the switcher in the masthead (`assets/i18n.js`, `data-lang`). Do not print a full Hebrew story and then the full English story in the same view.

The page is white (`#ffffff`). Ink is `#121212`, body text `#3a3a3a`, muted text `#6b6b6b`. Crimson `#8b1e2d` is only for kickers, the rule under the quotes line, and the small badge. No dark app bar, no card grid, no cream paper, no gold ticker.

Masthead: a large Frank Ruhl Libre “Brief” wordmark, the edition date and clock beside it, the language switcher, then one quotes line (the market stamp and whether it is carried). The crimson rule sits under that line.

Each story:

- Headline, about 8–14 words where that is natural.
- One paragraph. Ordinary stories about 45–75 words; the lead may run to about 100. Targets, not quotas.
- A compact sources line with links and dates.

What changed and why it matters belong **in that paragraph**. Do not print public headings “What / Why / Next” or “למה זה חשוב / Why it matters” under a card.

Strip from the HTML: internal notes, hard gates, verb locks, card IDs, agent routing, and confidence essays (stacks of מאומת / סביר / לא מאומת). Keep a material caveat in the paragraph itself. Uncertain claims stay qualified in prose. A collapsed “more” block is only for extra sourced detail, never the only place a caveat lives.

News hierarchy, in this order, on the open page:

1. One lead (`article.lead` inside `.front`), about 60% of the row, with the image placeholder only if a licensed credit exists. Otherwise keep the gray “no licensed image” line or delete the placeholder.
2. About two supporting stories (`.side-stack`), about 40%.
3. The rest quieter (`.quiet-band`), three across on a wide screen, stacked on a phone.

Same calm type on AI: one lead, then `.ai-list`. No equal-weight card stack.

Section ids are `#news`, `#markets`, and `#ai`. `#premarket`, `#lane-news`, `#lane-markets`, and `#lane-ai` scroll to the matching section. The live card homepage still uses `assets/lanes.js` to switch panels. This template does not. Do not put `lanes.js` back on the editorial page or it will hide Markets and AI.

## Markets, after News

Markets is the business section under the news, not the front of the page and not a ticker strip.

1. **Session line.** Name the session at the edition clock: pre-market, market open, latest close, or market closed. The edition time is in the masthead. The quote time is the quotes line and the table caption. If the tape is carried, print the actual stamp. Do not say “today” for an older stamp. Do not call delayed data live.
2. **Open table** (`.mkt-table`) beside a short market story (`.pull`). Columns: symbol, instrument, last, one change, basis and status, with the source link in the basis cell. Primary: S&P 500, Nasdaq (the exact index or future), Dow, VIX, USD/ILS, WTI. Secondary: Bitcoin, Treasury yields, and any other instrument the pack actually stamped. Do not swap futures with cash, Nasdaq-100 with the Composite, or WTI with Brent. If a primary instrument has no stamp, show the row as “not in this tape.” Do not invent the number. On a narrow screen the row stacks under its own labels; the page itself does not scroll sideways.
3. **Market story.** About 40–60 words in the pull beside the table. Pattern, what the sources attribute, what is next. Do not restate every cell. Separate what was observed from what was reported from what is interpretation. No invented cause.
4. **Companies.** Zero to three, in `.companies`. Name, ticker, the event, why it matters to the business. A price is not a reason to include a name. If the same event is a News story, give only the market implication and a link.
5. **Next 24–48 hours.** Chronological, under `.upcoming`. Event, date, confirmed time, one line of relevance. Israel and US Eastern, including which daylight-saving offset is in force. Drop rows whose time has already passed. Do not add heatmaps, gauges, or a watchlist.

A visible note under the table carries methodology that changes the number (for example a futures-versus-cash basis, or a contract roll). The optional details block can repeat the definition. It cannot replace the note.

## Freshness

Carried blocks show the real date and time. Replace stale “today / tomorrow” from the source pack when the edition is a later day. If a newer cash close exists and the pack does not contain it, say the close is absent. Do not reconstruct it.

## Type

Frank Ruhl Libre (headlines) and Heebo (body) are the faces in use. Both are SIL Open Font License; the license texts and the Hebrew plus Latin woff2 subsets are in `assets/fonts/`. `assets/edition.css` loads them. Weights on disk are 500 and 700 (there is no 900 file). Body size is 18.5px, line-height about 1.65–1.7. The lead stays at that size; supports and the quiet band are set smaller on purpose.

Fallback, if a file fails: `"Noto Serif Hebrew", "Times New Roman", Times` for headlines, and `"Noto Sans Hebrew", "Arial Hebrew", Arial` for body. The trial found full Hebrew letters (including final forms and gershayim) and Latin digits, minus, and percent in the subsets. No RTL defect turned up in rendering. Do not switch faces unless a real load or shaping failure shows up.

## Images

Use a picture only with a license, a credit, and alt text. Otherwise leave the gray placeholder or delete it. Do not generate a documentary fake. Do not draw a chart from memory. A market chart is allowed only when the series, source, range, units, and timestamps are real. Missing art does not block the edition. One image, on the lead only.

## Checks before publish

- Headline alone is specific.
- The paragraph states the point and any caveat that changes the meaning.
- Jargon is plain, or glossed once.
- Hebrew and English are not both visible.
- The page is white, the masthead is the wordmark (not a dark bar), and crimson is only the kicker, the quotes rule, and the badge.
- News is the asymmetric front. Markets comes after it.
- The Markets table can be scanned without reading a paragraph to find the level.
- Expired calendar rows are gone.
- No internal desk labels in the HTML.
- `#premarket` still reaches Markets. `assets/lanes.js` stays on the live card homepage only.

## Pages deploy

The GitHub Actions Pages workflow copies `preview/` and `templates/` with the rest of the site. A branch deploy from the repository root already serves those paths. Preview URL:

`https://jifa52.github.io/KNG.3D/preview/ux-2026-09-24/`
