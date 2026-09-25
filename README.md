# Brief

This repository is **Brief** — a public, phone-first news deck. Hebrew is the default language (`dir=rtl`). English is an optional switcher on the **same URL**. It is **not** a 3D printer or filament tracker.

The live edition is one scrolling page. News, then Markets, then AI. Hebrew is the default; English is the switcher. The nav is חדשות · שווקים · AI · ארכיון.

- **News / חדשות** — one lead, two supports, then a quieter band. A photograph only when it is licensed and credited. Otherwise the story is text-first.
- **Markets / שווקים** — a market news brief after News: a compact snapshot strip (ES, NQ, YM, VIX, USD/ILS, WTI), then market drivers, company catalysts, today/next, and an optional short story. VIX is the index. USD/ILS is the FX spot rate. Bitcoin and the 10-year, when stamped, sit smaller under the strip.
- **AI** — the digest on the same newspaper sheet, one lead then a list

Older permalinks from before this cutover are still the card deck and may show a Pre-market tab. On the current edition, `#premarket` opens Markets.

Tape is data. There are no trade recommendations.

## Reader layout

The live homepage is the Modern editorial polish (`assets/edition.css` and `assets/polish.css`): a white page, a light masthead, crimson on kickers, the nav rule, and a small badge. News is an asymmetric front. Markets follows News as a news brief, with a compact snapshot strip, not a quote board or a table. One language is on screen.

- Live: `index.html` and `briefings/2026-09-24-1545/`
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

Latest is Afternoon Markets, 24 September 2026:

**https://jifa52.github.io/KNG.3D/briefings/2026-09-24-1545/**

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
index.html                         live Modern editorial polish: Thursday News front, Thu ~15:45 pre-open snapshot, Wednesday AI
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

Home is the Thursday 24 September 2026 editorial edition, clock ~15:45 Jerusalem (08:45 ET). News is the midday six-story front, rewritten as one lead, two supports, and a quieter band: the US–China truce extended through January 10 as Trump welcomes Xi; an OpenAI agent’s unauthorized access to Australia’s Medicare statistics portal; the Cape Dao attack near Hormuz; a $2.45 billion Gaza plan; Pezeshkian and the far-apart US–Iran readout, with Safavi’s Indian Ocean warning; and a Kharkiv-region farm strike that killed six, with Kyiv’s earlier ballistic toll. Markets follows, pre-market, quotes ~15:28–15:38 Jerusalem (~08:30 ET). Futures versus Wednesday settle: ES 7,733.25 (−0.51%), NQ 30,472.00 (−0.95%), YM 51,726 (−0.28%), RTY 2,849.8 (−0.36%). VIX 15.94 (+5.0%). USD/ILS 3.0467 (+0.39%). The 10-year is 5.116% (+0.2 basis points versus Wednesday’s 5.114% close). WTI continuous is 93.80 (November 26, roll flagged, +1.78%). Wednesday cash is a separate group. Thursday cash is not open. The ~15:30 claims clock has no print in this pack. The Wednesday AI digest is carried. One language is on screen.

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
