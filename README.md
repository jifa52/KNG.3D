# Brief

This repository is **Brief** — a public English news deck. It is **not** a 3D printer or filament tracker. The unused Streamlit tracker that used to live here has been removed.

The site is a phone-first, two-lane static briefing:

- **News** (teal) — geopolitics overlay
- **Markets** (amber) — tape, earnings, calendar, watch

Tape is data. There are no trade recommendations.

## Public URL

GitHub Pages (from `main`, site root):

**https://jifa52.github.io/KNG.3D/**

Latest is Morning, 3 September 2026:

**https://jifa52.github.io/KNG.3D/briefings/2026-09-03-0830/**

Prior Close (2 September 2026):

**https://jifa52.github.io/KNG.3D/briefings/2026-09-02-2300/**

## Layout

```
index.html                         latest Morning
assets/brief.css                   two-lane phone-first styles
assets/lanes.js                    News / Markets switch
assets/favicon.svg
archive/index.html                 every published briefing
briefings/2026-09-03-0830/         frozen Morning snapshot
briefings/2026-09-02-2300/         frozen Close snapshot
404.html
```

Home always shows the latest edition. The `briefings/` folder is the permalink.

This Morning (Thursday, 3 September 2026, 08:30 (01:30 ET), overnight futures freeze) was copied from the live briefing. Numbers were not invented.

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080/

## GitHub Pages

Public URL: **https://jifa52.github.io/KNG.3D/**

The site files are already on `main` at the repo root (`index.html`, `assets/`, `archive/`, `briefings/`). GitHub’s API token in this project cannot create a Pages site, so enable it once in the UI:

1. **Settings → General → Change repository visibility → Public** (required for a public news deck)
2. **Settings → Pages → Build and deployment → Deploy from a branch**
3. Branch **`main`**, folder **`/` (root)** → **Save**

Optional: set source to **GitHub Actions**, then run **Actions → GitHub Pages → Run workflow**. Push to `main` only verifies the static files; it does not try to create Pages (this token cannot).

No Vercel.
