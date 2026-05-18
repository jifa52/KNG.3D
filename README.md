# KNG.3D

## 3D Project Tracker (Streamlit)

The **Streamlit** app is a **3D project tracker**: each **project** has a status, start/end dates, and notes. Inside a project you add **printed parts** — each part is a full **filament log** (brand, material, color, grams, print time, notes, optional photo and STL).

**Project statuses (colors in the UI):** Planned (grey), Queue (yellow), WIP (purple), Done (green).

Data is stored in **`filament_usage.db`** (SQLite) next to `streamlit_app.py`. If you used the older single-table filament log, the app **migrates** those rows into a default “Imported filament log” project the first time it runs.

### Run locally

```bash
python3 -m pip install -r requirements.txt
streamlit run streamlit_app.py
```

In Cursor you can use the task **3D Project Tracker: Streamlit** (same command).

### Streamlit Community Cloud

Set **Main file path** to `streamlit_app.py` or `app.py`. If the deploy form says the file is missing, reconnect GitHub, confirm branch **`main`**, and retry.

**Ephemeral disk:** on the free Cloud tier the SQLite file may reset when the app sleeps or redeploys. Use a hosted database for data you cannot lose.

Theming: `.streamlit/config.toml` (red / white / black shell); project status badges use the colors above.

---

### Static web app (HTML + IndexedDB)

Files: `index.html`, `styles.css`, `app.js`. This is the **same 3D project model** as Streamlit (projects with statuses and dates, printed parts as filament logs), stored entirely in your browser’s **IndexedDB** (`kng-filament-log`, version 2). If you had the older single-list filament log in this browser, it is **migrated** once into an “Imported filament log” project.

**Run inside Cursor:** Live Preview on `index.html`, or the task **3D Project Tracker: static server** + Simple Browser at `http://127.0.0.1:5173/index.html`.

**GitHub Pages:** deploy from `main` root; public repos do not require a paid GitHub plan.

**If the UI looks unchanged after a merge** (still seeing the old “Open” button on each project instead of a white table), your browser or GitHub’s CDN is likely serving a **cached `index.html`**. You do not need the terminal to fix that: open the app via **`live.html`** instead (same folder as `index.html`). Example: `https://<user>.github.io/<repo>/live.html` — it redirects once to `index.html` with a fresh cache-busting query string. After it loads, check the footer for the line starting with **“Static UI: white project table…”**; if that line is missing, you are still on an old cached page — try a private/incognito window or your browser’s “empty cache and hard reload” from the devtools menu.
