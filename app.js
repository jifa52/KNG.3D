(() => {
  const DB_NAME = "kng-filament-log";
  const DB_VERSION = 1;
  const STORE = "entries";

  /**
   * @typedef {{
   *   id: string;
   *   brand: string;
   *   materialType: string;
   *   colorHex: string;
   *   description: string;
   *   quantityGrams: number;
   *   printTimeMinutes: number;
   *   createdAt: number;
   *   updatedAt: number;
   *   imageBlob?: Blob;
   *   imageName?: string | null;
   *   stlBlob?: Blob;
   *   stlName?: string | null;
   * }} FilamentEntry
   */

  /** @type {IDBDatabase | null} */
  let db = null;

  /** @type {{ imageBlob?: Blob, imageName?: string | null, stlBlob?: Blob, stlName?: string | null } | null} */
  let editBlobCache = null;

  const $ = (sel, root = document) => root.querySelector(sel);

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        db = req.result;
        resolve(db);
      };
      req.onupgradeneeded = (e) => {
        const database = /** @type {IDBDatabase} */ (e.target.result);
        if (!database.objectStoreNames.contains(STORE)) {
          database.createObjectStore(STORE, { keyPath: "id" });
        }
      };
    });
  }

  /** @param {FilamentEntry} entry */
  function putEntry(entry) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("DB not ready"));
        return;
      }
      const t = db.transaction(STORE, "readwrite");
      const store = t.objectStore(STORE);
      const req = store.put(entry);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(undefined);
    });
  }

  function deleteEntry(id) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("DB not ready"));
        return;
      }
      const t = db.transaction(STORE, "readwrite");
      const req = t.objectStore(STORE).delete(id);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(undefined);
    });
  }

  function getAllEntries() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("DB not ready"));
        return;
      }
      const t = db.transaction(STORE, "readonly");
      const req = t.objectStore(STORE).getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(/** @type {FilamentEntry[]} */ (req.result || []));
    });
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  const form = /** @type {HTMLFormElement} */ ($("#entry-form"));
  const editIdInput = /** @type {HTMLInputElement} */ ($("#edit-id"));
  const brandInput = /** @type {HTMLInputElement} */ ($("#brand"));
  const materialInput = /** @type {HTMLInputElement} */ ($("#material"));
  const colorInput = /** @type {HTMLInputElement} */ ($("#color"));
  const colorHexOut = /** @type {HTMLOutputElement} */ ($("#color-hex"));
  const quantityInput = /** @type {HTMLInputElement} */ ($("#quantity"));
  const hoursInput = /** @type {HTMLInputElement} */ ($("#hours"));
  const minutesInput = /** @type {HTMLInputElement} */ ($("#minutes"));
  const descriptionInput = /** @type {HTMLTextAreaElement} */ ($("#description"));
  const imageInput = /** @type {HTMLInputElement} */ ($("#image"));
  const stlInput = /** @type {HTMLInputElement} */ ($("#stl"));
  const imageHint = /** @type {HTMLSpanElement} */ ($("#image-hint"));
  const stlHint = /** @type {HTMLSpanElement} */ ($("#stl-hint"));
  const submitBtn = /** @type {HTMLButtonElement} */ ($("#submit-btn"));
  const resetBtn = /** @type {HTMLButtonElement} */ ($("#reset-form"));
  const statGrams = /** @type {HTMLElement} */ ($("#stat-grams"));
  const statCount = /** @type {HTMLElement} */ ($("#stat-count"));
  const entryList = /** @type {HTMLUListElement} */ ($("#entry-list"));
  const emptyHistory = /** @type {HTMLParagraphElement} */ ($("#empty-history"));
  const searchInput = /** @type {HTMLInputElement} */ ($("#history-search"));
  const brandSuggestions = /** @type {HTMLDataListElement} */ ($("#brand-suggestions"));
  const dialog = /** @type {HTMLDialogElement} */ ($("#detail-dialog"));
  const detailTitle = /** @type {HTMLElement} */ ($("#detail-title"));
  const detailBody = /** @type {HTMLElement} */ ($("#detail-body"));
  const detailEdit = /** @type {HTMLButtonElement} */ ($("#detail-edit"));
  const detailDelete = /** @type {HTMLButtonElement} */ ($("#detail-delete"));

  /** @type {FilamentEntry | null} */
  let dialogEntry = null;

  const tabBtns = /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll(".tabs__btn"));
  const panelLog = /** @type {HTMLElement} */ ($("#panel-log"));
  const panelHistory = /** @type {HTMLElement} */ ($("#panel-history"));

  function formatGrams(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return "0 g";
    const s = v >= 100 ? v.toFixed(0) : v.toFixed(1);
    return `${s.replace(/\.0$/, "")} g`;
  }

  function formatDuration(totalMinutes) {
    const m = Math.max(0, Math.round(Number(totalMinutes) || 0));
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h === 0) return `${min} min`;
    if (min === 0) return `${h} h`;
    return `${h} h ${min} min`;
  }

  function setTab(name) {
    tabBtns.forEach((btn) => {
      const active = btn.dataset.tab === name;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    const isLog = name === "log";
    panelLog.classList.toggle("is-active", isLog);
    panelLog.hidden = !isLog;
    panelHistory.classList.toggle("is-active", !isLog);
    panelHistory.hidden = isLog;
  }

  function updateColorHex() {
    const hex = colorInput.value.toUpperCase();
    colorHexOut.textContent = hex;
  }

  function fileHintText(file) {
    return file ? file.name : "No file chosen";
  }

  function clearForm() {
    form.reset();
    editIdInput.value = "";
    editBlobCache = null;
    imageHint.textContent = "No file chosen";
    stlHint.textContent = "No file chosen";
    colorInput.value = "#e53935";
    updateColorHex();
    hoursInput.value = "0";
    minutesInput.value = "0";
    submitBtn.textContent = "Save entry";
  }

  /** @param {FilamentEntry} entry */
  function fillFormForEdit(entry) {
    editIdInput.value = entry.id;
    brandInput.value = entry.brand;
    materialInput.value = entry.materialType;
    colorInput.value = entry.colorHex || "#e53935";
    updateColorHex();
    quantityInput.value = String(entry.quantityGrams);
    const total = entry.printTimeMinutes || 0;
    hoursInput.value = String(Math.floor(total / 60));
    minutesInput.value = String(total % 60);
    descriptionInput.value = entry.description || "";
    imageInput.value = "";
    stlInput.value = "";
    imageHint.textContent = entry.imageName || "Keep existing (optional replace)";
    stlHint.textContent = entry.stlName || "Keep existing (optional replace)";
    editBlobCache = {
      imageBlob: entry.imageBlob,
      imageName: entry.imageName || null,
      stlBlob: entry.stlBlob,
      stlName: entry.stlName || null,
    };
    submitBtn.textContent = "Update entry";
    setTab("log");
    brandInput.focus();
  }

  /** @returns {Promise<FilamentEntry[]>} */
  async function loadEntriesSorted() {
    const all = await getAllEntries();
    return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  function refreshBrandDatalist(entries) {
    const brands = [...new Set(entries.map((e) => e.brand).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
    brandSuggestions.innerHTML = brands.map((b) => `<option value="${escapeAttr(b)}"></option>`).join("");
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** @param {FilamentEntry[]} entries */
  function updateStats(entries) {
    const total = entries.reduce((sum, e) => sum + (Number(e.quantityGrams) || 0), 0);
    statGrams.textContent = formatGrams(total);
    statCount.textContent = String(entries.length);
  }

  /** @param {FilamentEntry[]} entries */
  function renderList(entries) {
    const q = (searchInput.value || "").trim().toLowerCase();
    const filtered = q
      ? entries.filter((e) => {
          const hay = [e.brand, e.materialType, e.description, e.colorHex]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        })
      : entries;

    entryList.querySelectorAll("button.entry-card").forEach((btn) => {
      const u = btn.dataset.revokeUrl;
      if (u) URL.revokeObjectURL(u);
    });

    entryList.innerHTML = "";
    emptyHistory.hidden = filtered.length > 0;

    for (const e of filtered) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "entry-card";
      btn.dataset.id = e.id;

      let left = "";
      if (e.imageBlob) {
        const url = URL.createObjectURL(e.imageBlob);
        btn.dataset.revokeUrl = url;
        left = `<img class="entry-card__thumb" src="${url}" alt="" />`;
      } else {
        left = `<span class="entry-card__swatch" style="background:${escapeAttr(e.colorHex || "#888")}"></span>`;
      }

      const descShort = (e.description || "").trim() || "—";
      const clipped = descShort.length > 80 ? `${descShort.slice(0, 77)}…` : descShort;

      btn.innerHTML = `
        ${left}
        <div class="entry-card__main">
          <p class="entry-card__title">${escapeHtml(e.brand)} · ${escapeHtml(e.materialType)}</p>
          <p class="entry-card__meta">${escapeHtml(clipped)}</p>
        </div>
        <span class="entry-card__grams">${escapeHtml(formatGrams(e.quantityGrams))}</span>
      `;

      btn.addEventListener("click", () => openDetail(e.id));
      li.appendChild(btn);
      entryList.appendChild(li);
    }
  }

  /** @param {string} id */
  async function openDetail(id) {
    const entries = await loadEntriesSorted();
    const entry = entries.find((x) => x.id === id);
    if (!entry) return;
    dialogEntry = entry;
    detailTitle.textContent = `${entry.brand} — ${entry.materialType}`;

    const imgUrl = entry.imageBlob ? URL.createObjectURL(entry.imageBlob) : null;
    const stlUrl = entry.stlBlob ? URL.createObjectURL(entry.stlBlob) : null;

    detailBody.innerHTML = "";
    const grid = document.createElement("dl");
    grid.className = "detail-grid";

    const rows = [
      ["Color", entry.colorHex || "—"],
      ["Quantity", formatGrams(entry.quantityGrams)],
      ["Print time", formatDuration(entry.printTimeMinutes)],
      ["Logged", new Date(entry.createdAt).toLocaleString()],
    ];
    if (entry.updatedAt && entry.updatedAt !== entry.createdAt) {
      rows.push(["Updated", new Date(entry.updatedAt).toLocaleString()]);
    }

    for (const [dt, dd] of rows) {
      const row = document.createElement("div");
      row.className = "detail-row";
      row.innerHTML = `<dt>${escapeHtml(dt)}</dt><dd>${escapeHtml(dd)}</dd>`;
      grid.appendChild(row);
    }

    const descRow = document.createElement("div");
    descRow.className = "detail-row";
    descRow.innerHTML = `<dt>Description</dt><dd>${escapeHtml(entry.description || "—")}</dd>`;
    grid.appendChild(descRow);

    detailBody.appendChild(grid);

    if (imgUrl) {
      const wrap = document.createElement("div");
      wrap.className = "detail-media";
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = entry.imageName || "Print photo";
      wrap.appendChild(img);
      detailBody.appendChild(wrap);
      dialog.addEventListener(
        "close",
        () => {
          URL.revokeObjectURL(imgUrl);
        },
        { once: true }
      );
    }

    if (stlUrl && entry.stlName) {
      const wrap = document.createElement("div");
      wrap.className = "detail-stl";
      const a = document.createElement("a");
      a.href = stlUrl;
      a.download = entry.stlName;
      a.textContent = `Download STL: ${entry.stlName}`;
      wrap.appendChild(a);
      detailBody.appendChild(wrap);
      dialog.addEventListener(
        "close",
        () => {
          URL.revokeObjectURL(stlUrl);
        },
        { once: true }
      );
    }

    dialog.showModal();
  }

  async function refreshAll() {
    const entries = await loadEntriesSorted();
    updateStats(entries);
    refreshBrandDatalist(entries);
    renderList(entries);
  }

  /** @param {SubmitEvent} e */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const now = Date.now();
    const id = editIdInput.value || uuid();
    const isEdit = Boolean(editIdInput.value);

    const hours = Math.max(0, parseInt(hoursInput.value, 10) || 0);
    const mins = Math.min(59, Math.max(0, parseInt(minutesInput.value, 10) || 0));
    const printTimeMinutes = hours * 60 + mins;

    const imageFile = imageInput.files && imageInput.files[0];
    const stlFile = stlInput.files && stlInput.files[0];

    /** @type {FilamentEntry} */
    const entry = {
      id,
      brand: brandInput.value.trim(),
      materialType: materialInput.value.trim(),
      colorHex: colorInput.value,
      description: descriptionInput.value.trim(),
      quantityGrams: parseFloat(quantityInput.value) || 0,
      printTimeMinutes,
      createdAt: isEdit ? (await findCreatedAt(id)) || now : now,
      updatedAt: now,
      imageName: imageFile ? imageFile.name : editBlobCache?.imageName ?? null,
      stlName: stlFile ? stlFile.name : editBlobCache?.stlName ?? null,
      imageBlob: imageFile ? imageFile : editBlobCache?.imageBlob,
      stlBlob: stlFile ? stlFile : editBlobCache?.stlBlob,
    };

    if (isEdit && !imageFile && editBlobCache && !editBlobCache.imageBlob) {
      delete entry.imageBlob;
      entry.imageName = null;
    }
    if (isEdit && !stlFile && editBlobCache && !editBlobCache.stlBlob) {
      delete entry.stlBlob;
      entry.stlName = null;
    }

    await putEntry(entry);
    clearForm();
    await refreshAll();
    setTab("history");
  });

  async function findCreatedAt(id) {
    const entries = await getAllEntries();
    const found = entries.find((x) => x.id === id);
    return found ? found.createdAt : undefined;
  }

  resetBtn.addEventListener("click", () => clearForm());

  colorInput.addEventListener("input", updateColorHex);

  imageInput.addEventListener("change", () => {
    imageHint.textContent = fileHintText(imageInput.files && imageInput.files[0]);
  });
  stlInput.addEventListener("change", () => {
    stlHint.textContent = fileHintText(stlInput.files && stlInput.files[0]);
  });

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.tab;
      if (name) setTab(name);
    });
  });

  searchInput.addEventListener("input", async () => {
    const entries = await loadEntriesSorted();
    renderList(entries);
  });

  detailEdit.addEventListener("click", async () => {
    if (!dialogEntry) return;
    const id = dialogEntry.id;
    dialog.close();
    const entries = await loadEntriesSorted();
    const entry = entries.find((x) => x.id === id);
    if (entry) fillFormForEdit(entry);
  });

  detailDelete.addEventListener("click", async () => {
    if (!dialogEntry) return;
    const ok = window.confirm("Delete this entry permanently?");
    if (!ok) return;
    await deleteEntry(dialogEntry.id);
    dialog.close();
    dialogEntry = null;
    await refreshAll();
  });

  dialog.addEventListener("close", () => {
    dialogEntry = null;
  });

  openDb()
    .then(() => refreshAll())
    .catch((err) => {
      console.error(err);
      statGrams.textContent = "Error";
      emptyHistory.textContent = "Could not open local database. Check browser settings.";
      emptyHistory.hidden = false;
    });

  updateColorHex();
})();
