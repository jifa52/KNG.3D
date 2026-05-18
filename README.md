# KNG.3D

## Filament Log (local web app)

The filament tracker lives in `index.html`, `styles.css`, and `app.js`. Data is stored in your browser’s IndexedDB.

### Run inside Cursor (recommended)

1. When Cursor prompts you, install the recommended **Live Preview** extension (`ms-vscode.live-server`), or install it from the Extensions view.
2. Open `index.html`, then use the Command Palette (**Live Preview: Show Preview**) or the **Show Preview** affordance the extension adds to the editor. The page opens in Cursor’s embedded preview over `http://localhost`, which keeps IndexedDB working reliably.

### Run with a manual local server (optional)

1. **Tasks: Run Task** → **Filament Log: local server** (starts `http://127.0.0.1:5173`).
2. Command Palette → **Simple Browser: Show** → enter `http://127.0.0.1:5173/index.html`.

You can also open that URL in an external browser if you prefer.
