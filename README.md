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
assets/cards.js                    optional Marshall photo thumbnails
assets/briefing.schema.json        copy overlay, including image { url, credit }
assets/favicon.svg
archive/index.html                 every published briefing
briefings/2026-09-02-2300/         frozen Close snapshot + briefing.json
404.html
```

Home always shows the latest edition. The `briefings/` folder is the permalink.

This Close (Wednesday, 2 September 2026, 23:00 IDT / 16:00 ET US cash close) was copied from the live briefing. Numbers were not invented.

## Card photos

Cards stay text-first. A small inline thumbnail appears only when Marshall-approved copy includes a real source photo:

```json
{
  "id": "centcom-irgc",
  "image": {
    "url": "https://example.test/photo.jpg",
    "credit": "CENTCOM",
    "caption": "optional alt text"
  }
}
```

Add that object to the matching card in `briefings/<edition>/briefing.json` (`id` must match `data-story-id` on the HTML card). `assets/cards.js` renders a real `<img>` plus the credit in small type. Omit `image` when there is no shipped photo — do not scrape, stock, or generate pictures, and do not leave an empty image box.

Tonight’s 23:00 IDT Close has no Marshall-shipped photos. Those cards stay copy-only.

You can also paste the same chrome by hand:

```html
<figure class="card-photo">
  <img src="PHOTO_URL" alt="CREDIT" decoding="async" loading="lazy">
  <figcaption class="card-photo-credit">CREDIT</figcaption>
</figure>
```

Never use a raw URL or an “open photo” link as the visual.

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
