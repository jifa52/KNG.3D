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

Latest is Midday MAIN, 15 September 2026:

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
index.html                         latest Midday MAIN (Hebrew default, English switcher)
assets/brief.css                   two-lane phone-first + RTL
assets/i18n.js                     language switch, localStorage, optional #he/#en
assets/lanes.js                    News / Markets switch (file://-safe; empty hash honors data-lane)
assets/favicon.svg
archive/index.html                 every published briefing
briefings/2026-09-15-1400/         frozen Tuesday Midday MAIN snapshot (matches home)
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

This Midday MAIN (Tuesday, 15 September 2026, 14:00 Jerusalem / 07:00 ET) is seven bilingual News cards: East-West mostly offline 3–5 weeks (AP) versus Wright “soon” (Likely; reopen fail closed); Houthi wave on Saudi Arabia as MBS meets CENTCOM’s Cooper; Zelenskyy energy-pause conditionality after Trump’s mutual-deal claim; Senate CLARITY cloture Tuesday (vote-day, not a result); Anthropic Nasdaq IPO push versus Amodei slowdown and Trump’s “perfect little angel”; Netanyahu on the Gaza documentary NAZA; GSK–Chimagen T-cell engager up to $750 million. Overnight Rezaei/El Gaia is not refiled as a lead. Markets + Pre-market stay honest pending — Markets owns 15:45; last tape stays on Monday afternoon as the prior session; no invented Tuesday cash, futures, or oil prints. The Monday five-card AI digest is kept. No weather strip. No oil-barrel or US-index prints inside News cards. News is the default home lane.

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
