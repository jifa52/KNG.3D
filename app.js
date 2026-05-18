(() => {
  const DB_NAME = "kng-filament-log";
  const DB_VERSION = 2;
  const STORE_PROJECTS = "projects";
  const STORE_PARTS = "parts";
  const LEGACY_ENTRIES = "entries";
  const LEGACY_FLAG = "kng_legacy_entries_migrated_v2";

  const STATUSES = ["Planned", "Queue", "WIP", "Done"];

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
   * }} LegacyEntry
   *
   * @typedef {{
   *   id: string;
   *   name: string;
   *   notes: string;
   *   status: string;
   *   startedDate: string;
   *   endedDate: string;
   *   createdAt: number;
   *   updatedAt: number;
   * }} ProjectRow
   *
   * @typedef {{
   *   id: string;
   *   projectId: string;
   *   partName: string;
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
   * }} PrintedPart
   */

  /** @type {IDBDatabase | null} */
  let db = null;

  /** @type {{ imageBlob?: Blob, imageName?: string | null, stlBlob?: Blob, stlName?: string | null } | null} */
  let editPartBlobCache = null;

  /** @type {PrintedPart | null} */
  let dialogPart = null;

  const $ = (sel, root = document) => root.querySelector(sel);

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error("Database upgrade blocked"));
      req.onsuccess = () => {
        db = req.result;
        migrateLegacyEntriesIfNeeded()
          .then(() => resolve(db))
          .catch(reject);
      };
      req.onupgradeneeded = (e) => {
        const database = /** @type {IDBDatabase} */ (e.target.result);
        if (!database.objectStoreNames.contains(STORE_PROJECTS)) {
          database.createObjectStore(STORE_PROJECTS, { keyPath: "id" });
        }
        if (!database.objectStoreNames.contains(STORE_PARTS)) {
          const ps = database.createObjectStore(STORE_PARTS, { keyPath: "id" });
          ps.createIndex("projectId", "projectId", { unique: false });
        }
      };
    });
  }

  /**
   * Copy legacy `entries` into a default project + `parts`, then clear `entries`.
   * @returns {Promise<void>}
   */
  function migrateLegacyEntriesIfNeeded() {
    if (!db) return Promise.reject(new Error("DB not ready"));
    if (!db.objectStoreNames.contains(LEGACY_ENTRIES)) return Promise.resolve();
    if (localStorage.getItem(LEGACY_FLAG) === "1") return Promise.resolve();

    return new Promise((resolve, reject) => {
      const t = db.transaction([LEGACY_ENTRIES, STORE_PROJECTS, STORE_PARTS], "readwrite");
      t.onerror = () => reject(t.error);
      t.oncomplete = () => {
        localStorage.setItem(LEGACY_FLAG, "1");
        resolve(undefined);
      };

      const est = t.objectStore(LEGACY_ENTRIES);
      const getAllReq = est.getAll();
      getAllReq.onerror = () => reject(getAllReq.error);
      getAllReq.onsuccess = () => {
        const rows = /** @type {LegacyEntry[]} */ (getAllReq.result || []);
        const pStore = t.objectStore(STORE_PROJECTS);
        const partStore = t.objectStore(STORE_PARTS);
        const now = Date.now();
        const today = todayISO();

        if (rows.length > 0) {
          const pid = uuid();
          pStore.put({
            id: pid,
            name: "Imported filament log",
            notes: "Migrated from the older single-list filament log in this browser.",
            status: "Done",
            startedDate: today,
            endedDate: today,
            createdAt: now,
            updatedAt: now,
          });

          for (const row of rows) {
            const desc = (row.description || "").trim();
            const partName = (desc.split("\n")[0] || "Imported part").slice(0, 120);
            partStore.put({
              id: row.id,
              projectId: pid,
              partName,
              brand: row.brand,
              materialType: row.materialType,
              colorHex: row.colorHex,
              description: row.description || "",
              quantityGrams: row.quantityGrams,
              printTimeMinutes: row.printTimeMinutes,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
              imageBlob: row.imageBlob,
              imageName: row.imageName ?? null,
              stlBlob: row.stlBlob,
              stlName: row.stlName ?? null,
            });
          }
        }

        const clearReq = est.clear();
        clearReq.onerror = () => reject(clearReq.error);
      };
    });
  }

  /** @param {string} store */
  function tx(store, mode) {
    if (!db) throw new Error("DB not ready");
    return db.transaction(store, mode).objectStore(store);
  }

  /** @returns {Promise<any[]>} */
  function getAll(store) {
    return new Promise((resolve, reject) => {
      const r = tx(store, "readonly").getAll();
      r.onerror = () => reject(r.error);
      r.onsuccess = () => resolve(r.result || []);
    });
  }

  /** @returns {Promise<void>} */
  function put(store, value) {
    return new Promise((resolve, reject) => {
      const r = tx(store, "readwrite").put(value);
      r.onerror = () => reject(r.error);
      r.onsuccess = () => resolve(undefined);
    });
  }

  /** @returns {Promise<void>} */
  function del(store, id) {
    return new Promise((resolve, reject) => {
      const r = tx(store, "readwrite").delete(id);
      r.onerror = () => reject(r.error);
      r.onsuccess = () => resolve(undefined);
    });
  }

  /** @returns {Promise<any|undefined>} */
  function getOne(store, id) {
    return new Promise((resolve, reject) => {
      const r = tx(store, "readonly").get(id);
      r.onerror = () => reject(r.error);
      r.onsuccess = () => resolve(r.result);
    });
  }

  /** @returns {Promise<PrintedPart[]>} */
  async function getPartsForProject(projectId) {
    const all = await getAll(STORE_PARTS);
    return all.filter((p) => p.projectId === projectId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

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

  function statusBadgeHtml(status) {
    const cls =
      status === "Planned"
        ? "status-badge--planned"
        : status === "Queue"
          ? "status-badge--queue"
          : status === "WIP"
            ? "status-badge--wip"
            : status === "Done"
              ? "status-badge--done"
              : "status-badge--planned";
    const label = STATUSES.includes(status) ? status : "Planned";
    return `<span class="status-badge ${cls}">${escapeHtml(label)}</span>`;
  }

  const viewProjects = /** @type {HTMLElement} */ ($("#view-projects"));
  const viewProject = /** @type {HTMLElement} */ ($("#view-project"));
  const statProjects = /** @type {HTMLElement} */ ($("#stat-projects"));
  const statParts = /** @type {HTMLElement} */ ($("#stat-parts"));
  const statGrams = /** @type {HTMLElement} */ ($("#stat-grams"));
  const projectList = /** @type {HTMLUListElement} */ ($("#project-list"));
  const emptyProjects = /** @type {HTMLParagraphElement} */ ($("#empty-projects"));
  const projectStatusFilter = /** @type {HTMLSelectElement} */ ($("#project-status-filter"));
  const pcStatus = /** @type {HTMLSelectElement} */ ($("#pc-status"));
  const pcStarted = /** @type {HTMLInputElement} */ ($("#pc-started"));
  const pcEnded = /** @type {HTMLInputElement} */ ($("#pc-ended"));
  const pcHasEnded = /** @type {HTMLInputElement} */ ($("#pc-has-ended"));
  const pcEndedWrap = /** @type {HTMLElement} */ ($("#pc-ended-wrap"));
  const projectCreateForm = /** @type {HTMLFormElement} */ ($("#project-create-form"));

  const btnBack = /** @type {HTMLButtonElement} */ ($("#btn-back-projects"));
  const btnEditProject = /** @type {HTMLButtonElement} */ ($("#btn-edit-project"));
  const btnDeleteProject = /** @type {HTMLButtonElement} */ ($("#btn-delete-project"));
  const deletePanel = /** @type {HTMLElement} */ ($("#project-delete-confirm"));
  const btnConfirmDeleteProject = /** @type {HTMLButtonElement} */ ($("#btn-confirm-delete-project"));
  const btnCancelDeleteProject = /** @type {HTMLButtonElement} */ ($("#btn-cancel-delete-project"));
  const projectTitle = /** @type {HTMLElement} */ ($("#project-title"));
  const projectMeta = /** @type {HTMLElement} */ ($("#project-meta"));
  const projectNotes = /** @type {HTMLElement} */ ($("#project-notes"));
  const projectStatusSlot = /** @type {HTMLElement} */ ($("#project-status-slot"));

  const partForm = /** @type {HTMLFormElement} */ ($("#part-form"));
  const editPartIdInput = /** @type {HTMLInputElement} */ ($("#edit-part-id"));
  const partNameInput = /** @type {HTMLInputElement} */ ($("#part-name"));
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
  const submitPartBtn = /** @type {HTMLButtonElement} */ ($("#submit-part-btn"));
  const resetPartBtn = /** @type {HTMLButtonElement} */ ($("#reset-part-form"));
  const partList = /** @type {HTMLUListElement} */ ($("#part-list"));
  const emptyParts = /** @type {HTMLParagraphElement} */ ($("#empty-parts"));
  const partSearch = /** @type {HTMLInputElement} */ ($("#part-search"));
  const brandSuggestions = /** @type {HTMLDataListElement} */ ($("#brand-suggestions"));

  const partDialog = /** @type {HTMLDialogElement} */ ($("#part-dialog"));
  const partDialogTitle = /** @type {HTMLElement} */ ($("#part-dialog-title"));
  const partDialogBody = /** @type {HTMLElement} */ ($("#part-dialog-body"));
  const partDialogEdit = /** @type {HTMLButtonElement} */ ($("#part-dialog-edit"));
  const partDialogDelete = /** @type {HTMLButtonElement} */ ($("#part-dialog-delete"));

  const projectDialog = /** @type {HTMLDialogElement} */ ($("#project-dialog"));
  const projectDialogClose = /** @type {HTMLButtonElement} */ ($("#project-dialog-close"));
  const projectEditForm = /** @type {HTMLFormElement} */ ($("#project-edit-form"));
  const peId = /** @type {HTMLInputElement} */ ($("#pe-id"));
  const peName = /** @type {HTMLInputElement} */ ($("#pe-name"));
  const peStatus = /** @type {HTMLSelectElement} */ ($("#pe-status"));
  const peStarted = /** @type {HTMLInputElement} */ ($("#pe-started"));
  const peEnded = /** @type {HTMLInputElement} */ ($("#pe-ended"));
  const peHasEnded = /** @type {HTMLInputElement} */ ($("#pe-has-ended"));
  const peEndedWrap = /** @type {HTMLElement} */ ($("#pe-ended-wrap"));
  const peNotes = /** @type {HTMLTextAreaElement} */ ($("#pe-notes"));

  function fillStatusSelects() {
    const opts = STATUSES.map((s) => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`).join("");
    pcStatus.innerHTML = opts;
    peStatus.innerHTML = opts;
    projectStatusFilter.innerHTML = STATUSES.map(
      (s) => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`
    ).join("");
  }

  function setRoute(route) {
    const isProject = route === "project";
    viewProjects.classList.toggle("view--active", !isProject);
    viewProject.classList.toggle("view--active", isProject);
  }

  function getCurrentProjectId() {
    return sessionStorage.getItem("kng_current_project_id");
  }

  function setCurrentProjectId(id) {
    if (id) sessionStorage.setItem("kng_current_project_id", id);
    else sessionStorage.removeItem("kng_current_project_id");
  }

  function updateColorHex() {
    colorHexOut.textContent = colorInput.value.toUpperCase();
  }

  function fileHintText(file) {
    return file ? file.name : "No file chosen";
  }

  function clearPartForm() {
    partForm.reset();
    editPartIdInput.value = "";
    editPartBlobCache = null;
    imageHint.textContent = "No file chosen";
    stlHint.textContent = "No file chosen";
    colorInput.value = "#e53935";
    updateColorHex();
    hoursInput.value = "0";
    minutesInput.value = "0";
    submitPartBtn.textContent = "Save part";
  }

  /** @param {PrintedPart} part */
  function fillPartFormForEdit(part) {
    editPartIdInput.value = part.id;
    partNameInput.value = part.partName;
    brandInput.value = part.brand;
    materialInput.value = part.materialType;
    colorInput.value = part.colorHex || "#e53935";
    updateColorHex();
    quantityInput.value = String(part.quantityGrams);
    const total = part.printTimeMinutes || 0;
    hoursInput.value = String(Math.floor(total / 60));
    minutesInput.value = String(total % 60);
    descriptionInput.value = part.description || "";
    imageInput.value = "";
    stlInput.value = "";
    imageHint.textContent = part.imageName || "Keep existing (optional replace)";
    stlHint.textContent = part.stlName || "Keep existing (optional replace)";
    editPartBlobCache = {
      imageBlob: part.imageBlob,
      imageName: part.imageName || null,
      stlBlob: part.stlBlob,
      stlName: part.stlName || null,
    };
    submitPartBtn.textContent = "Update part";
    partNameInput.focus();
  }

  async function refreshGlobalStats() {
    const projects = await getAll(STORE_PROJECTS);
    const parts = await getAll(STORE_PARTS);
    const grams = parts.reduce((s, p) => s + (Number(p.quantityGrams) || 0), 0);
    statProjects.textContent = String(projects.length);
    statParts.textContent = String(parts.length);
    statGrams.textContent = formatGrams(grams);
  }

  async function refreshBrandSuggestions(projectId) {
    const parts = await getPartsForProject(projectId);
    const brands = [...new Set(parts.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    brandSuggestions.innerHTML = brands.map((b) => `<option value="${escapeAttr(b)}"></option>`).join("");
  }

  function selectedStatuses() {
    return Array.from(projectStatusFilter.selectedOptions).map((o) => o.value);
  }

  async function renderProjectList() {
    const projects = await getAll(STORE_PROJECTS);
    projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const parts = await getAll(STORE_PARTS);
    const gramsBy = new Map();
    const countBy = new Map();
    for (const p of parts) {
      gramsBy.set(p.projectId, (gramsBy.get(p.projectId) || 0) + (Number(p.quantityGrams) || 0));
      countBy.set(p.projectId, (countBy.get(p.projectId) || 0) + 1);
    }

    const sel = selectedStatuses();
    const filtered = sel.length ? projects.filter((p) => sel.includes(p.status)) : projects;

    projectList.innerHTML = "";
    emptyProjects.hidden = filtered.length > 0;

    for (const p of filtered) {
      const li = document.createElement("li");
      li.className = "project-card";
      const grams = gramsBy.get(p.id) || 0;
      const cnt = countBy.get(p.id) || 0;
      li.innerHTML = `
        <div class="project-card__badge">${statusBadgeHtml(p.status)}</div>
        <div class="project-card__main">
          <p class="project-card__title">${escapeHtml(p.name)}</p>
          <p class="project-card__meta">Started <strong>${escapeHtml(p.startedDate || "—")}</strong> · Ended <strong>${escapeHtml(p.endedDate || "—")}</strong></p>
          <p class="project-card__snip">${escapeHtml(((p.notes || "").trim() || "—").slice(0, 120))}</p>
        </div>
        <div class="project-card__stats">
          <span class="project-card__count">${cnt} parts</span>
          <span class="project-card__grams">${escapeHtml(formatGrams(grams))}</span>
        </div>
        <button type="button" class="btn btn--primary project-card__open" data-id="${escapeAttr(p.id)}">Open</button>
      `;
      const btn = li.querySelector("button.project-card__open");
      btn?.addEventListener("click", () => {
        setCurrentProjectId(p.id);
        deletePanel.hidden = true;
        renderProjectWorkspace().catch(console.error);
      });
      projectList.appendChild(li);
    }
  }

  async function renderProjectWorkspace() {
    const id = getCurrentProjectId();
    if (!id) {
      setRoute("projects");
      await refreshGlobalStats();
      await renderProjectList();
      return;
    }

    const project = await getOne(STORE_PROJECTS, id);
    if (!project) {
      setCurrentProjectId("");
      setRoute("projects");
      await refreshGlobalStats();
      await renderProjectList();
      return;
    }

    setRoute("project");
    deletePanel.hidden = true;
    projectTitle.textContent = project.name;
    projectMeta.innerHTML = `Started <strong>${escapeHtml(project.startedDate || "—")}</strong> · Ended <strong>${escapeHtml(project.endedDate || "—")}</strong>`;
    projectNotes.textContent = (project.notes || "").trim() || "";
    projectStatusSlot.innerHTML = statusBadgeHtml(project.status);

    await refreshBrandSuggestions(id);
    await renderPartList(id);
    await refreshGlobalStats();
  }

  function revokePartListUrls() {
    partList.querySelectorAll("button.entry-card").forEach((btn) => {
      const u = btn.dataset.revokeUrl;
      if (u) URL.revokeObjectURL(u);
    });
  }

  async function renderPartList(projectId) {
    const parts = await getPartsForProject(projectId);
    const q = (partSearch.value || "").trim().toLowerCase();
    const filtered = q
      ? parts.filter((p) => {
          const hay = [p.partName, p.brand, p.materialType, p.description, p.colorHex]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        })
      : parts;

    revokePartListUrls();
    partList.innerHTML = "";
    emptyParts.hidden = filtered.length > 0;

    for (const p of filtered) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "entry-card";
      btn.dataset.id = p.id;

      let left = "";
      if (p.imageBlob) {
        const url = URL.createObjectURL(p.imageBlob);
        btn.dataset.revokeUrl = url;
        left = `<img class="entry-card__thumb" src="${url}" alt="" />`;
      } else {
        const hx = escapeAttr(p.colorHex || "#888888");
        left = `<span class="entry-card__swatch" style="background:${hx}"></span>`;
      }

      const snip = ((p.description || "").trim() || "—").slice(0, 80);
      btn.innerHTML = `
        ${left}
        <div class="entry-card__main">
          <p class="entry-card__title">${escapeHtml(p.partName)}</p>
          <p class="entry-card__meta">${escapeHtml(p.brand)} · ${escapeHtml(p.materialType)} · ${escapeHtml(snip)}</p>
        </div>
        <span class="entry-card__grams">${escapeHtml(formatGrams(p.quantityGrams))}</span>
      `;
      btn.addEventListener("click", () => openPartDialog(p.id));
      li.appendChild(btn);
      partList.appendChild(li);
    }
  }

  /** @param {string} partId */
  async function openPartDialog(partId) {
    const projectId = getCurrentProjectId();
    if (!projectId) return;
    const parts = await getPartsForProject(projectId);
    const part = parts.find((x) => x.id === partId);
    if (!part) return;
    dialogPart = part;
    partDialogTitle.textContent = part.partName;

    const imgUrl = part.imageBlob ? URL.createObjectURL(part.imageBlob) : null;
    const stlUrl = part.stlBlob ? URL.createObjectURL(part.stlBlob) : null;

    partDialogBody.innerHTML = "";
    const grid = document.createElement("dl");
    grid.className = "detail-grid";

    const rows = [
      ["Brand · material", `${part.brand} · ${part.materialType}`],
      ["Color", part.colorHex || "—"],
      ["Quantity", formatGrams(part.quantityGrams)],
      ["Print time", formatDuration(part.printTimeMinutes)],
      ["Logged", new Date(part.createdAt).toLocaleString()],
    ];
    if (part.updatedAt && part.updatedAt !== part.createdAt) {
      rows.push(["Updated", new Date(part.updatedAt).toLocaleString()]);
    }
    for (const [dt, dd] of rows) {
      const row = document.createElement("div");
      row.className = "detail-row";
      row.innerHTML = `<dt>${escapeHtml(dt)}</dt><dd>${escapeHtml(dd)}</dd>`;
      grid.appendChild(row);
    }
    const dr = document.createElement("div");
    dr.className = "detail-row";
    dr.innerHTML = `<dt>Notes</dt><dd>${escapeHtml(part.description || "—")}</dd>`;
    grid.appendChild(dr);
    partDialogBody.appendChild(grid);

    if (imgUrl) {
      const wrap = document.createElement("div");
      wrap.className = "detail-media";
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = part.imageName || "Photo";
      wrap.appendChild(img);
      partDialogBody.appendChild(wrap);
      partDialog.addEventListener("close", () => URL.revokeObjectURL(imgUrl), { once: true });
    }
    if (stlUrl && part.stlName) {
      const wrap = document.createElement("div");
      wrap.className = "detail-stl";
      const a = document.createElement("a");
      a.href = stlUrl;
      a.download = part.stlName;
      a.textContent = `Download STL: ${part.stlName}`;
      wrap.appendChild(a);
      partDialogBody.appendChild(wrap);
      partDialog.addEventListener("close", () => URL.revokeObjectURL(stlUrl), { once: true });
    }

    partDialog.showModal();
  }

  async function touchProject(projectId) {
    const p = await getOne(STORE_PROJECTS, projectId);
    if (!p) return;
    p.updatedAt = Date.now();
    await put(STORE_PROJECTS, p);
  }

  async function refreshAll() {
    await refreshGlobalStats();
    if (getCurrentProjectId()) await renderProjectWorkspace();
    else await renderProjectList();
  }

  // --- init UI wiring ---
  fillStatusSelects();
  pcStarted.value = todayISO();

  pcHasEnded.addEventListener("change", () => {
    pcEndedWrap.hidden = !pcHasEnded.checked;
    if (pcHasEnded.checked && !pcEnded.value) pcEnded.value = todayISO();
  });

  peHasEnded.addEventListener("change", () => {
    peEndedWrap.hidden = !peHasEnded.checked;
    if (peHasEnded.checked && !peEnded.value) peEnded.value = todayISO();
  });

  projectCreateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = /** @type {HTMLInputElement} */ ($("#pc-name")).value.trim();
    const notes = /** @type {HTMLTextAreaElement} */ ($("#pc-notes")).value.trim();
    const status = pcStatus.value;
    const started = pcStarted.value;
    const ended = pcHasEnded.checked ? pcEnded.value : "";
    if (!name || !started) return;
    const now = Date.now();
    const id = uuid();
    await put(STORE_PROJECTS, {
      id,
      name,
      notes,
      status,
      startedDate: started,
      endedDate: ended || "",
      createdAt: now,
      updatedAt: now,
    });
    setCurrentProjectId(id);
    projectCreateForm.reset();
    pcStarted.value = todayISO();
    pcHasEnded.checked = false;
    pcEndedWrap.hidden = true;
    /** @type {HTMLDetailsElement} */ ($("#new-project-details")).open = false;
    await renderProjectWorkspace();
  });

  projectStatusFilter.addEventListener("change", () => {
    renderProjectList().catch(console.error);
  });

  btnBack.addEventListener("click", async () => {
    setCurrentProjectId("");
    clearPartForm();
    setRoute("projects");
    await refreshGlobalStats();
    await renderProjectList();
  });

  btnEditProject.addEventListener("click", async () => {
    const id = getCurrentProjectId();
    if (!id) return;
    const p = await getOne(STORE_PROJECTS, id);
    if (!p) return;
    peId.value = p.id;
    peName.value = p.name;
    peStatus.value = STATUSES.includes(p.status) ? p.status : "Planned";
    peStarted.value = p.startedDate || todayISO();
    const hasEnd = Boolean(p.endedDate);
    peHasEnded.checked = hasEnd;
    peEndedWrap.hidden = !hasEnd;
    peEnded.value = p.endedDate || todayISO();
    peNotes.value = p.notes || "";
    projectDialog.showModal();
  });

  projectDialogClose.addEventListener("click", () => projectDialog.close());

  projectEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = peId.value;
    const existing = await getOne(STORE_PROJECTS, id);
    if (!existing) return;
    const name = peName.value.trim();
    if (!name) return;
    const ended = peHasEnded.checked ? peEnded.value : "";
    await put(STORE_PROJECTS, {
      ...existing,
      name,
      notes: peNotes.value.trim(),
      status: peStatus.value,
      startedDate: peStarted.value,
      endedDate: ended || "",
      updatedAt: Date.now(),
    });
    projectDialog.close();
    await renderProjectWorkspace();
  });

  btnDeleteProject.addEventListener("click", () => {
    deletePanel.hidden = false;
  });
  btnCancelDeleteProject.addEventListener("click", () => {
    deletePanel.hidden = true;
  });
  btnConfirmDeleteProject.addEventListener("click", async () => {
    const id = getCurrentProjectId();
    if (!id) return;
    const parts = await getPartsForProject(id);
    for (const p of parts) await del(STORE_PARTS, p.id);
    await del(STORE_PROJECTS, id);
    setCurrentProjectId("");
    clearPartForm();
    deletePanel.hidden = true;
    setRoute("projects");
    await refreshAll();
  });

  colorInput.addEventListener("input", updateColorHex);
  imageInput.addEventListener("change", () => {
    imageHint.textContent = fileHintText(imageInput.files && imageInput.files[0]);
  });
  stlInput.addEventListener("change", () => {
    stlHint.textContent = fileHintText(stlInput.files && stlInput.files[0]);
  });

  resetPartBtn.addEventListener("click", () => clearPartForm());

  partForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const projectId = getCurrentProjectId();
    if (!projectId) return;
    const now = Date.now();
    const id = editPartIdInput.value || uuid();
    const isEdit = Boolean(editPartIdInput.value);

    const hours = Math.max(0, parseInt(hoursInput.value, 10) || 0);
    const mins = Math.min(59, Math.max(0, parseInt(minutesInput.value, 10) || 0));
    const printTimeMinutes = hours * 60 + mins;

    const imageFile = imageInput.files && imageInput.files[0];
    const stlFile = stlInput.files && stlInput.files[0];

    /** @type {PrintedPart} */
    const part = {
      id,
      projectId,
      partName: partNameInput.value.trim(),
      brand: brandInput.value.trim(),
      materialType: materialInput.value.trim(),
      colorHex: colorInput.value,
      description: descriptionInput.value.trim(),
      quantityGrams: parseFloat(quantityInput.value) || 0,
      printTimeMinutes,
      createdAt: isEdit ? (await getCreatedAtForPart(id)) || now : now,
      updatedAt: now,
      imageName: imageFile ? imageFile.name : editPartBlobCache?.imageName ?? null,
      stlName: stlFile ? stlFile.name : editPartBlobCache?.stlName ?? null,
      imageBlob: imageFile ? imageFile : editPartBlobCache?.imageBlob,
      stlBlob: stlFile ? stlFile : editPartBlobCache?.stlBlob,
    };

    if (isEdit && !imageFile && editPartBlobCache && !editPartBlobCache.imageBlob) {
      delete part.imageBlob;
      part.imageName = null;
    }
    if (isEdit && !stlFile && editPartBlobCache && !editPartBlobCache.stlBlob) {
      delete part.stlBlob;
      part.stlName = null;
    }

    await put(STORE_PARTS, part);
    await touchProject(projectId);
    clearPartForm();
    await renderProjectWorkspace();
  });

  async function getCreatedAtForPart(id) {
    const p = await getOne(STORE_PARTS, id);
    return p ? p.createdAt : undefined;
  }

  partSearch.addEventListener("input", () => {
    const pid = getCurrentProjectId();
    if (pid) renderPartList(pid).catch(console.error);
  });

  partDialogEdit.addEventListener("click", async () => {
    if (!dialogPart) return;
    const id = dialogPart.id;
    partDialog.close();
    const p = await getOne(STORE_PARTS, id);
    if (p) fillPartFormForEdit(p);
  });

  partDialogDelete.addEventListener("click", async () => {
    if (!dialogPart) return;
    const ok = window.confirm("Delete this printed part permanently?");
    if (!ok) return;
    const pid = dialogPart.projectId;
    await del(STORE_PARTS, dialogPart.id);
    partDialog.close();
    dialogPart = null;
    await touchProject(pid);
    await renderProjectWorkspace();
  });

  partDialog.addEventListener("close", () => {
    dialogPart = null;
  });

  openDb()
    .then(async () => {
      updateColorHex();
      if (getCurrentProjectId()) await renderProjectWorkspace();
      else {
        setRoute("projects");
        await refreshGlobalStats();
        await renderProjectList();
      }
    })
    .catch((err) => {
      console.error(err);
      statProjects.textContent = "—";
      statParts.textContent = "—";
      statGrams.textContent = "Error";
      setRoute("projects");
      emptyProjects.hidden = false;
      emptyProjects.textContent = "Could not open IndexedDB. Check browser settings.";
    });
})();
