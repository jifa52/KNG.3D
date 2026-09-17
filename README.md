# Brief

This repository is **Brief** — a public, phone-first news deck. Hebrew is the default language (`dir=rtl`). English is an optional switcher on the **same URL**. It is **not** a 3D printer or filament tracker.

The site is a two-lane static briefing:

- **News / חדשות** (teal) — geopolitics overlay
- **Markets / שווקים** (amber) — tape, earnings, calendar, watch

Tape is data. There are no trade recommendations.

## Language

First visit is Hebrew. A switcher (`עברית | English`) sits above the News/Markets tabs (and on Archive/404 chrome). The choice is stored in `localStorage` (`brief-lang`) so refresh keeps it.

Optional `#he` / `#en` hashes set the language once without replacing the page. News/Markets still use `#news` / `#markets`. On `file://`, hash writes are skipped so `replaceState` cannot break local opens.

## Public URL

GitHub Pages (from `main`, site root):

**https://jifa52.github.io/KNG.3D/**

Latest is Afternoon, 17 September 2026:

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
index.html                         latest Afternoon (Hebrew default, English switcher)
assets/brief.css                   two-lane phone-first + RTL
assets/i18n.js                     language switch, localStorage, optional #he/#en
assets/lanes.js                    News / Markets switch (file://-safe; empty hash honors data-lane)
assets/favicon.svg
archive/index.html                 every published briefing
briefings/2026-09-17-1545/         frozen Thursday Afternoon snapshot (matches home; eight News cards kept; Markets / Pre-market filled)
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

This Afternoon (Thursday, 17 September 2026, 15:45 Jerusalem / 08:45 ET) keeps the eight midday MAIN News cards and the Wednesday five-card AI digest. Markets / Pre-market are filled from Yahoo futures ~15:28 (08:28 ET): broad green (ES +1.21%, NQ +1.57%) after Wednesday cash soft; WTI back under $100 (~$99.30, session ~−3%); FOMC hike Confirmed (+25 bp to 3.75%–4.00%, 12–0) with SEP funds median 4.1% end-2026 / 2027; FedWatch omitted (no CME primary). Oracle bounce versus Adobe; CPRT/ACVA near the $10.50 cash deal. Thursday claims / housing / Philly levels Unverified — date only. Yields stamped in basis points / percentage points, not a bare Yahoo percent. No geopolitics essay on Markets. No trade recommendations. No weather strip. News is the default home lane.

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
