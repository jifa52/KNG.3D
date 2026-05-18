# KNG.3D

## Filament Log

You can use either the **Streamlit** app (Python + SQLite file) or the **static** web app (HTML + IndexedDB in the browser).

### Streamlit (good for work laptops and Streamlit Cloud)

**What you get:** the same fields (brand, material, color, grams, print time, description, optional photo and STL), search, totals, and edit/delete via a detail dialog. Data is stored in a SQLite file named `filament_usage.db` next to `streamlit_app.py`.

**Run on your machine (when Python is allowed):**

```bash
python3 -m pip install -r requirements.txt
streamlit run streamlit_app.py
```

Then open the URL Streamlit prints (by default `http://127.0.0.1:8501`). In Cursor you can also run the task **Filament Log: Streamlit**.

**Run without installing anything on your work PC:** deploy the repo to **[Streamlit Community Cloud](https://streamlit.io/cloud)** (free tier). In the deploy form, set **Main file path** to `streamlit_app.py` (or `app.py` if the UI claims the file is missing—both run the same app). Open the hosted URL in your browser.

If Streamlit says the file does not exist even though you see it on GitHub: disconnect and reconnect GitHub in Streamlit, pick the repo again, confirm you are on branch **`main`**, wait a minute after the last push, then retry.

**Important for Streamlit Cloud:** the filesystem there is **ephemeral**. The SQLite database may reset when the app sleeps or redeploys. For data you must not lose, use a hosted database (or keep running the app locally where `filament_usage.db` persists on disk).

Theming uses `.streamlit/config.toml` (red / white / black).

---

### Static web app (HTML + IndexedDB)

Files: `index.html`, `styles.css`, `app.js`. Data stays in **that browser’s** IndexedDB.

**Run inside Cursor:** install the recommended **Live Preview** extension, open `index.html`, then **Live Preview: Show Preview** from the Command Palette.

**Run with a manual local server:** task **Filament Log: local server**, then **Simple Browser: Show** → `http://127.0.0.1:5173/index.html`.

**Host on GitHub Pages:** enable Pages from the repo root; open the `github.io` URL. No paid GitHub plan is required for **public** repositories.
