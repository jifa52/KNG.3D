# Publishing a Brief edition (reader layout)

This note is the publish path for the reader layout in UX spec v1.1. It does not replace verification, agenda, confidence, or cadence rules. Those still live with the desk. This file wins on what a reader sees.

The filled reference is `preview/ux-2026-09-24/index.html`. The empty structure is `templates/edition.html`. Both use `assets/paper.css`. Historical pages under `briefings/` stay on `assets/brief.css`. Do not restyle old editions to chase this layout, and do not change their facts.

## Do not collide with a live Markets slot

`index.html` is the live homepage. Leave it on the previous structure while a Markets content publish is in flight (weekday ~15:45 Israel). Ship the new layout on the next edition **after** that slot, by rendering with this template. Do not merge a content overwrite of `index.html` in the same moment as a template swap.

The preview is not an archive edition. Do not add it to `archive/index.html`.

## What the reader sees

One language at a time. Hebrew is the default; English is the switcher (`assets/i18n.js`, `data-lang`). Do not print a full Hebrew story and then the full English story in the same view.

Each story:

- Headline, about 8–14 words where that is natural.
- One paragraph. Ordinary stories about 45–75 words; the lead may run to about 100. Targets, not quotas.
- A compact sources line with links and dates.

What changed and why it matters belong **in that paragraph**. Do not print public headings “What / Why / Next” or “למה זה חשוב / Why it matters” under a card.

Strip from the HTML: internal notes, hard gates, verb locks, card IDs, agent routing, and confidence essays (stacks of מאומת / סביר / לא מאומת). Keep a material caveat in the paragraph itself. Uncertain claims stay qualified in prose. A collapsed “more” block is only for extra sourced detail, never the only place a caveat lives.

News hierarchy, in this order:

1. One lead (`story story-lead`).
2. About two supporting stories (`story story-support` inside `support-grid`).
3. The rest quieter (`story story-brief` inside `brief-list`).

Same component on AI, with one lead and a quieter list. No equal-weight card stack.

## Markets, in this order

1. **Session and data status.** Name the session at the edition clock: pre-market, market open, latest close, or market closed. Put the edition time and the quote time on separate lines. If the tape is carried, print the actual stamp. Do not say “today” for an older stamp. Do not call delayed data live.
2. **Snapshot table.** Primary: S&P 500, Nasdaq (the exact index or future), Dow, VIX, USD/ILS, WTI. Secondary: Bitcoin, Treasury yields, and any other instrument the pack actually stamped. One defined change per row, plus quote time, status, and a source link. Do not swap futures with cash, Nasdaq-100 with the Composite, or WTI with Brent. If a primary instrument has no stamp, show the row as “not in this tape.” Do not invent the number.
3. **Market story.** About 40–60 words under the table. Pattern, what the sources attribute, what is next. Do not restate every cell. Separate what was observed from what was reported from what is interpretation. No invented cause.
4. **Companies.** Zero to three. Name, ticker, the event, why it matters to the business. A price is not a reason to include a name. If the same event is a News story, give only the market implication and a link.
5. **Next 24–48 hours.** Chronological. Event, date, confirmed time, one line of relevance. Israel and US Eastern, including which daylight-saving offset is in force. Drop rows whose time has already passed. Do not add heatmaps, gauges, or a watchlist.

A visible note under the table carries methodology that changes the number (for example a futures-versus-cash basis, or a contract roll). The optional details block can repeat the definition. It cannot replace the note.

## Freshness

Carried blocks show the real date and time. Replace stale “today / tomorrow” from the source pack when the edition is a later day. If a newer cash close exists and the pack does not contain it, say the close is absent. Do not reconstruct it.

## Type

Frank Ruhl Libre (headlines) and Heebo (body) are the faces in use. Both are SIL Open Font License; the license texts and the Hebrew plus Latin woff2 subsets are in `assets/fonts/`. `assets/paper.css` loads them. Body size starts at 19px.

Fallback, if a file fails: `"Noto Serif Hebrew", "Times New Roman", Times` for headlines, and `"Noto Sans Hebrew", "Arial Hebrew", Arial` for body. The trial found full Hebrew letters (including final forms and gershayim) and Latin digits, minus, and percent in the subsets. No RTL defect turned up in rendering. Do not switch faces unless a real load or shaping failure shows up.

## Images

Use a picture only with a license, a credit, and alt text. Otherwise the layout stays text-led. Do not generate a documentary fake. Do not draw a chart from memory. A market chart is allowed only when the series, source, range, units, and timestamps are real. Missing art does not block the edition.

## Checks before publish

- Headline alone is specific.
- The paragraph states the point and any caveat that changes the meaning.
- Jargon is plain, or glossed once.
- Hebrew and English are not both visible.
- The Markets table can be scanned without reading a paragraph to find the level.
- Expired calendar rows are gone.
- No internal desk labels in the HTML.
- `assets/lanes.js` still switches News / Markets / AI. `#premarket` still opens Markets when that older panel is absent.

## Pages deploy

The GitHub Actions Pages workflow copies `preview/` and `templates/` with the rest of the site. A branch deploy from the repository root already serves those paths. Preview URL:

`https://jifa52.github.io/KNG.3D/preview/ux-2026-09-24/`
