# The Daily Jenya

This repository is **The Daily Jenya** — a public, phone-first morning edition. Hebrew is the default language (`dir=rtl`). English is an optional switcher on the **same URL**. It is **not** a 3D printer or filament tracker. The masthead lockup is `assets/daily-jenya-logo.png` (J and globe, with YOUR MORNING EDITION).

The live edition is one scrolling page. News, then Markets, then AI. Hebrew is the default; English is the switcher. The nav is חדשות · שווקים · AI · ארכיון.

- **News / חדשות** — short cards: one lead, supports, then a quieter band. Each card has a kicker, the facts, and **למה זה חשוב / Why it matters**. A photograph only when it is licensed and credited. Otherwise the story is text-first.
- **Markets / שווקים** — a market news brief after News: drivers, company catalysts, today/next, an optional short story, then a compact snapshot (ES, NQ, YM, VIX, USD/ILS, WTI). The same six also crawl under the nav. VIX is the index. USD/ILS is the FX spot rate. Bitcoin and the 10-year, when stamped, sit smaller under the strip.
- **AI** — the digest on the same sheet, one lead then a list. An AI picture, when used, is labeled **המחשה (AI)** / **AI illustration**.

Older permalinks from before this cutover are still the card deck and may show a Pre-market tab. On the current edition, `#premarket` opens Markets.

Tape is data. There are no trade recommendations.

## Reader layout

The live homepage is The Daily Jenya (`assets/edition.css` and `assets/polish.css`): cream paper `#f3f0e7`, forest `#143e33`, lime `#dae8a4`, ink `#15251f`. News is an asymmetric front of short cards with **Why it matters / למה זה חשוב**. Markets follows News as a news brief: drivers, company catalysts, today/next, then a compact snapshot. One language is on screen.

- Live: `index.html`, `briefings/2026-09-25-1545/`, and `briefings/2026-09-25-1400/` (Markets refreshed in place)
- Approved study (kept): `preview/ux-2026-09-24-polish/`
- Earlier Modern study (PREVIEW, Wednesday tape, not an archive edition): `preview/ux-2026-09-24/`
- Empty structure: `templates/edition.html`
- Image-credit pattern: `templates/IMAGE-CREDITS.md`
- Rules: `templates/PUBLISH.md`
- Type: `assets/fonts/` (Frank Ruhl Libre + Heebo, SIL Open Font License)

The archive index uses the same light sheet. Earlier permalinks stay on `assets/brief.css`. Do not add the preview to the archive.

## Language

First visit is Hebrew. A switcher (`עברית | English`) sits in the masthead (and on Archive/404 chrome). The choice is stored in `localStorage` (`brief-lang`) so refresh keeps it.

Optional `#he` / `#en` hashes set the language once without replacing the page. Sections use `#news`, `#markets`, and `#ai`. On `file://`, hash writes are skipped so `replaceState` cannot break local opens.

## Public URL

GitHub Pages (from `main`, site root):

**https://jifa52.github.io/KNG.3D/**

Latest is the Friday markets refresh, 25 September 2026, ~15:45 Israel:

**https://jifa52.github.io/KNG.3D/briefings/2026-09-25-1545/**

Friday Midday (MAIN), with Markets refreshed in place to the same tape:

**https://jifa52.github.io/KNG.3D/briefings/2026-09-25-1400/**

Prior Midday (MAIN), 24 September 2026:

**https://jifa52.github.io/KNG.3D/briefings/2026-09-24-1400/**

Prior Morning (overnight thin), 24 September 2026:

**https://jifa52.github.io/KNG.3D/briefings/2026-09-24-0850/**

Prior Afternoon Markets / Pre-market (23 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-23-1545/**

Prior Midday MAIN (23 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-23-1400/**

Prior Morning (23 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-23-0850/**

Prior Afternoon Markets / Pre-market (22 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-22-1545/**

Prior Midday MAIN (22 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-22-1400/**

Prior Morning (22 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-22-0850/**

Prior Afternoon Markets (21 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-21-1545/**

Prior Midday MAIN (21 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-21-1400/**

Prior Morning (21 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-21-0850/**

Prior Midday MAIN (20 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-20-1400/**

Prior Morning (20 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-20-0850/**

Prior Midday MAIN (19 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-19-1400/**

Prior Morning (19 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-19-0850/**

Prior Afternoon (18 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-18-1545/**

Prior Midday MAIN (18 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-18-1400/**

Prior Morning (18 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-18-0850/**

Prior Afternoon (17 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-17-1545/**

Prior Midday MAIN (17 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-17-1400/**

Prior Morning (17 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-17-0850/**

Prior Afternoon (16 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-16-1545/**

Prior Midday MAIN (16 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-16-1400/**

Prior Morning (16 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-16-0850/**

Prior Afternoon (15 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-15-1545/**

Prior Midday MAIN (15 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-15-1400/**

Prior Morning (15 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-15-0850/**

Prior Afternoon (14 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-14-1545/**

Prior Morning (14 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-14-0850/**

Prior Afternoon (13 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-13-1545/**

Prior Morning (13 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-13-0850/**

Prior Afternoon (12 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-12-1545/**

Prior Morning (12 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-12-0850/**

Prior Afternoon (11 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-11-1545/**

Prior Morning (11 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-11-0850/**

Prior Afternoon (10 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-10-1545/**

Prior Morning (10 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-10-0850/**

Prior Afternoon (9 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-09-1545/**

Prior Morning (9 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-09-0850/**

Prior Afternoon (8 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-08-1545/**

Prior Morning (8 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-08-0850/**

Prior Afternoon (7 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-07-1545/**

Prior Morning (7 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-07-0850/**

Prior Evening (6 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-06-1830/**

Prior Morning (6 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-06-0830/**

Prior Morning (5 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-05-0830/**

Prior Intraday (3 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-03-1814/**

Prior Pre-open (3 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-03-1545/**

Prior Midday (3 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-03-1400/**

Prior Morning (3 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-03-0830/**

Prior Close (2 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-02-2300/**

## Layout

```
index.html                         live Daily Jenya edition: Friday midday News, Fri ~15:45 pre-market snapshot, Friday morning AI
assets/brief.css                   card sheet for earlier permalinks and 404
assets/edition.css                 Modern editorial base (homepage, permalink, archive index, template)
assets/polish.css                  approved polish: nav, photos, news-first markets, newspaper AI and archive
assets/images/                     licensed photographs for the current edition
assets/fonts/                      Frank Ruhl Libre + Heebo subsets (SIL OFL)
preview/ux-2026-09-24-polish/      approved polish study — kept, not an archive edition
preview/ux-2026-09-24/             earlier Modern study — not an archive edition
templates/edition.html             empty publish structure (overnight, main news, markets, AI)
templates/IMAGE-CREDITS.md         credit pattern copied into an edition that uses a photograph
templates/PUBLISH.md               how the next edition is rendered
assets/i18n.js                     language switch, localStorage, optional #he/#en
assets/lanes.js                    card-deck lane switch for earlier permalinks; not loaded on the editorial page
assets/favicon.svg
archive/index.html                 every published briefing
briefings/2026-09-25-1545/         Friday markets refresh on the Daily Jenya sheet (midday News kept, Fri ~15:45 pre-market tape, Friday morning AI kept)
briefings/2026-09-25-1400/         Friday Midday MAIN (News kept; Markets refreshed in place to the Friday ~15:45 tape; Friday morning AI kept)
briefings/2026-09-25-0850/         Friday Morning snapshot (overnight News; Markets carried from Thursday ~15:45)
briefings/2026-09-24-1545/         Thursday afternoon permalink on the polish sheet (same edition as the homepage; midday News, Thu ~15:45 snapshot, Wednesday AI, IMAGE-CREDITS.md)
briefings/2026-09-24-1400/         frozen Thursday Midday MAIN snapshot (six News cards and an opening summary; Markets refreshed in place to the Thursday ~15:45 pre-market tape; Wednesday AI digest kept; next AI digest Friday)
briefings/2026-09-24-0850/         frozen Thursday Morning snapshot (thin overnight News — five cards and an opening summary; one Markets section, session pre-market, Wednesday tape; Wednesday AI digest kept; next AI digest Friday)
briefings/2026-09-23-1545/         frozen Wednesday Afternoon snapshot (six News cards kept; Markets / Pre-market filled from ~15:45 tape; Wednesday AI digest kept)
briefings/2026-09-23-1400/         frozen Wednesday Midday MAIN snapshot (six News cards; Markets / Pre-market filled from ~15:45 tape; Wednesday AI digest kept)
briefings/2026-09-23-0850/         frozen Wednesday Morning snapshot (thin overnight News; Tuesday afternoon Markets / Pre-market kept as prior session; Wednesday AI digest kept)
briefings/2026-09-22-1545/         frozen Tuesday Afternoon snapshot (six News cards kept; Markets / Pre-market filled from ~15:37 tape; Monday AI digest kept)
briefings/2026-09-22-1400/         frozen Tuesday Midday MAIN snapshot (six News cards; Monday AI digest kept; Markets / Pre-market filled from ~15:37 tape)
briefings/2026-09-22-0850/         frozen Tuesday Morning snapshot (thin overnight News; Monday afternoon tape kept as prior session; Monday AI digest kept)
briefings/2026-09-21-1545/         frozen Monday Afternoon snapshot (seven News cards kept; Markets / Pre-market filled from ~15:38 tape; Monday AI digest kept)
briefings/2026-09-21-1400/         frozen Monday Midday MAIN snapshot (seven News cards; Monday AI digest kept; Markets / Pre-market filled from ~15:38 tape)
briefings/2026-09-21-0850/         frozen Monday Morning snapshot (thin overnight News; Monday AI digest kept)
briefings/2026-09-20-1400/         frozen Sunday Midday MAIN snapshot (six News cards; Friday AI digest kept)
briefings/2026-09-20-0850/         frozen Sunday Morning snapshot (thin overnight News; Friday AI digest kept)
briefings/2026-09-19-1400/         frozen Saturday Midday MAIN snapshot (seven News cards; Friday AI digest kept)
briefings/2026-09-19-0850/         frozen Saturday Morning snapshot (thin overnight News; Friday AI digest kept)
briefings/2026-09-18-1545/         frozen Friday Afternoon snapshot (five News cards kept; Markets / Pre-market filled; Friday AI digest kept)
briefings/2026-09-18-1400/         frozen Friday Midday MAIN snapshot (five News cards; Friday AI digest kept; Markets / Pre-market filled from ~15:25 tape)
briefings/2026-09-18-0850/         frozen Friday Morning snapshot (thin overnight News; Friday AI digest kept)
briefings/2026-09-17-1545/         frozen Thursday Afternoon snapshot (eight News cards kept; Markets / Pre-market filled)
briefings/2026-09-17-1400/         frozen Thursday Midday MAIN snapshot (News + AI kept; Markets / Pre-market filled from ~15:28 tape)
briefings/2026-09-17-0850/         frozen Thursday Morning snapshot (thin overnight News)
briefings/2026-09-16-1545/         frozen Wednesday Afternoon snapshot (eight News cards kept; Markets / Pre-market filled)
briefings/2026-09-16-1400/         frozen Wednesday Midday MAIN snapshot (News + AI kept; Markets / Pre-market filled from ~15:28 tape)
briefings/2026-09-16-0850/         frozen Wednesday Morning snapshot (thin overnight News)
briefings/2026-09-15-1545/         frozen Tuesday Afternoon snapshot (Markets + Pre-market)
briefings/2026-09-15-1400/         frozen Tuesday Midday MAIN snapshot (News + AI kept; Markets / Pre-market filled from ~15:08 tape)
briefings/2026-09-15-0850/         frozen Tuesday Morning snapshot
briefings/2026-09-14-1545/         frozen Monday Afternoon snapshot
briefings/2026-09-14-0850/         frozen Monday Morning snapshot
briefings/2026-09-13-1545/         frozen Sunday Afternoon snapshot
briefings/2026-09-13-0850/         frozen Sunday Morning snapshot
briefings/2026-09-12-1545/         frozen Saturday Afternoon snapshot
briefings/2026-09-12-0850/         frozen Saturday Morning snapshot
briefings/2026-09-11-1545/         frozen Friday Afternoon snapshot
briefings/2026-09-11-0850/         frozen Friday Morning snapshot
briefings/2026-09-10-1545/         frozen Thursday Afternoon snapshot
briefings/2026-09-10-0850/         frozen Thursday Morning snapshot
briefings/2026-09-09-1545/         frozen Wednesday Afternoon snapshot
briefings/2026-09-09-0850/         frozen Wednesday Morning snapshot
briefings/2026-09-08-1545/         frozen Tuesday Afternoon snapshot
briefings/2026-09-08-0850/         frozen Tuesday Morning snapshot
briefings/2026-09-07-1545/         frozen Monday Afternoon snapshot
briefings/2026-09-07-0850/         frozen Monday Morning snapshot
briefings/2026-09-06-1830/         frozen Sunday Evening snapshot
briefings/2026-09-06-0830/         frozen Sunday Morning snapshot
briefings/2026-09-05-0830/         frozen Saturday Morning snapshot
briefings/2026-09-03-1814/         frozen Intraday snapshot
briefings/2026-09-03-1545/         frozen Pre-open snapshot
briefings/2026-09-03-1400/         frozen Midday snapshot
briefings/2026-09-03-0830/         frozen Morning snapshot
briefings/2026-09-02-2300/         frozen Close snapshot
404.html
```

Home always shows the latest edition. The `briefings/` folder is the permalink.

Home is the Friday 25 September 2026 editorial edition. News is the midday front, clock ~14:00 Jerusalem (07:00 ET). Markets is the pre-market refresh, edition ~15:45 Jerusalem (08:45 ET), quotes ~15:04–15:19 Jerusalem (08:04–08:19 ET). Futures versus the prior futures settle: ES 7,794.75 (+0.36%), NQ 30,967.75 (+0.65%), YM 51,877 (+0.31%). VIX is 15.04 (−4.0%), the index. USD/ILS is 3.0346 (−0.31%), FX spot. WTI continuous is 92.56 (November 26, roll flagged, −2.17%). Bitcoin is 83,955 (−0.50%). The 10-year is Thursday’s cash close, 5.162% (+4.8 basis points versus Wednesday’s 5.114%). The 30-year Thursday close is 5.461% (+6.0 basis points). Thursday cash is labeled and is not Friday cash: S&P 500 7,704.13 (−0.02%), Dow 51,349.98 (−0.31%), Nasdaq Composite 26,939.37 (+0.01%). US cash was not open. Durable goods (15:30 Israel) and final Michigan sentiment (17:00 Israel) are clocks only. The Friday morning AI digest is carried. One language is on screen.

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080/

`file://` also works: open `index.html` directly.

## GitHub Pages

Public URL: **https://jifa52.github.io/KNG.3D/**

The site files are already on `main` at the repo root (`index.html`, `assets/`, `archive/`, `briefings/`). GitHub’s API token in this project cannot create a Pages site, so enable it once in the UI:

1. **Settings → General → Change repository visibility → Public** (required for a public news deck)
2. **Settings → Pages → Build and deployment → Deploy from a branch**
3. Branch **`main`**, folder **`/` (root)** → **Save**

Optional: set source to **GitHub Actions**, then run **Actions → GitHub Pages → Run workflow**. Push to `main` only verifies the static files; it does not try to create Pages (this token cannot).

No Vercel.
