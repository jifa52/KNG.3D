# Brief

This repository is **Brief** — a public, phone-first news deck. Hebrew is the default language (`dir=rtl`). English is an optional switcher on the **same URL**. It is **not** a 3D printer or filament tracker.

The live deck has three sections:

- **News / חדשות** (teal) — what changed, and why it matters
- **Markets / שווקים** (amber) — one tape, with a session-state label: `pre-market`, `open`, or `latest close`
- **AI** — the AI digest on its cadence

The **Pre-market** tab is gone. Calendar rows and any tape notes that were only on that tab now sit in Markets. Older permalinks from before 24 September 2026 may still show a Pre-market tab. On a current edition, `#premarket` opens Markets.

Tape is data. There are no trade recommendations.

## Reader layout

The live homepage is still the previous card layout, so a Markets content publish can land on it without a template change mid-slot. The reader layout for the next edition is separate:

- Preview (real 24 Sep 2026 copy, labeled PREVIEW, not an archive edition): `preview/ux-2026-09-24/`
- Empty structure: `templates/edition.html`
- Rules for the next publish: `templates/PUBLISH.md`
- Styles and type: `assets/paper.css` and `assets/fonts/` (Frank Ruhl Libre + Heebo, SIL Open Font License)

News is one lead, about two supporting stories, then a quieter list. One language is on screen. Markets is a session line, a snapshot table, a short story, up to three companies, and the next 48 hours. Do not add the preview to the archive.

## Language

First visit is Hebrew. A switcher (`עברית | English`) sits above the section tabs (and on Archive/404 chrome). The choice is stored in `localStorage` (`brief-lang`) so refresh keeps it.

Optional `#he` / `#en` hashes set the language once without replacing the page. Sections use `#news`, `#markets`, and `#ai`. On `file://`, hash writes are skipped so `replaceState` cannot break local opens.

## Public URL

GitHub Pages (from `main`, site root):

**https://jifa52.github.io/KNG.3D/**

Latest is Midday (MAIN), 24 September 2026:

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
index.html                         latest Thursday Midday MAIN News (previous card layout; left in place so a Markets publish can still land)
assets/brief.css                   phone-first + RTL, used by the live edition and the archive
assets/paper.css                   reader layout (preview and the next edition)
assets/fonts/                      Frank Ruhl Libre + Heebo subsets (SIL OFL)
preview/ux-2026-09-24/             labeled reader preview for 24 Sep 2026 — not an archive edition
templates/edition.html             empty publish structure
templates/PUBLISH.md               how the next edition is rendered
assets/i18n.js                     language switch, localStorage, optional #he/#en
assets/lanes.js                    News / Markets / AI switch (file://-safe; #premarket falls through to Markets when that panel is absent)
assets/favicon.svg
archive/index.html                 every published briefing
briefings/2026-09-24-1400/         frozen Thursday Midday MAIN snapshot (six News cards and an opening summary; one Markets section, session pre-market, Wednesday tape; Wednesday AI digest kept; next AI digest Friday)
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

Home is the Thursday midday edition (24 September 2026, ~14:00 Jerusalem / 07:00 ET). News opens with a short summary of what changed since the overnight edition, then six cards: the US–China trade truce extended through January 10 as Trump welcomes Xi; an OpenAI agent’s unauthorized access to Australia’s Medicare statistics portal; a projectile attack on the Cape Dao near Hormuz; a $2.45 billion Gaza recovery plan; Pezeshkian’s General Assembly address with a far-apart US–Iran readout and Safavi’s Indian Ocean warning; and a Kharkiv-region farm strike that killed six, with Kyiv’s earlier ballistic toll of two dead and six injured. Markets is one section: the Wednesday tape, session state `pre-market`, as of ~15:45 Jerusalem (08:45 ET) on 23 September. Futures versus Tuesday settle: ES −0.13%, NQ −0.24%, YM −0.32%, RTY −0.50%. Tuesday cash was split (S&P flat, Dow −0.36%, Nasdaq +0.45%). The 10-year is 4.988% (about +2.0 basis points versus Tuesday’s 4.968% close). WTI continuous is $90.96, daily-bar roll flagged. Flash US PMI (~16:45 / 09:45 ET) and Governor Barr (17:05 / 10:05 ET) are Confirmed clocks. Costco’s IR call remains Thursday. The Wednesday AI digest stays. News is the default section.

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
