# TheJls Market Brief

This repository is **TheJls Market Brief** — a public English news deck. It is **not** a 3D printer or filament tracker. The unused Streamlit tracker that used to live here has been removed.

The site is a phone-first, two-lane static briefing:

- **News** (teal) — geopolitics overlay
- **Markets** (amber) — tape, earnings, calendar, watch

Tape is data. There are no trade recommendations.

## Public URL

GitHub Pages (from `main`, site root):

**https://jifa52.github.io/KNG.3D/**

Tonight’s Close is also at:

**https://jifa52.github.io/KNG.3D/briefings/2026-09-02-2300/**

## Layout

```
index.html                         latest Close
assets/brief.css                   two-lane phone-first styles
assets/lanes.js                    News / Markets switch
assets/favicon.svg
archive/index.html                 every published briefing
briefings/2026-09-02-2300/         frozen Close snapshot
404.html
```

Home always shows the latest edition. The `briefings/` folder is the permalink.

This Close (Wednesday, 2 September 2026, 23:00 IDT / 16:00 ET US cash close) was copied from the live briefing. Numbers were not invented.

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080/

## GitHub Pages

A workflow in `.github/workflows/pages.yml` deploys the static files from `main` and will try to enable Pages (GitHub Actions source).

This deck is meant to be **public**. If `https://jifa52.github.io/KNG.3D/` 404s:

1. **Settings → General → Danger Zone → Change repository visibility → Public**
2. **Settings → Pages → Build and deployment → Source: GitHub Actions** (or Deploy from a branch: `main` / `/` root)

Then re-run **Actions → Deploy GitHub Pages**.

No Vercel.
