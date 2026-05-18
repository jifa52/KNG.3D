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
   *   openedByName?: string;
   *   openedByAvatar?: Blob;
   *   openedByAvatarName?: string | null;
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
  let drawerPart = null;

  /** @type {string | null} */
  let expandedProjectId = null;

  /** @type {string[]} */
  let listAvatarObjectUrls = [];

  /** @type {string[]} */
  let partDrawerObjectUrls = [];

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
            openedByName: "You",
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

  /** @param {string} iso */
  function formatProjectDisplayDate(iso) {
    const s = (iso || "").trim();
    if (!s) return "—";
    const d = new Date(s + "T12:00:00");
    if (Number.isNaN(d.getTime())) return escapeHtml(s);
    return escapeHtml(
      d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    );
  }

  /** @param {string} name */
  function initialsFromName(name) {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function revokeListAvatarUrls() {
    for (const u of listAvatarObjectUrls) URL.revokeObjectURL(u);
    listAvatarObjectUrls = [];
  }

  function revokePartDrawerUrls() {
    for (const u of partDrawerObjectUrls) URL.revokeObjectURL(u);
    partDrawerObjectUrls = [];
  }

  function closePartDrawer() {
    partDrawerLayer.classList.remove("part-drawer-layer--open");
    revokePartDrawerUrls();
    partDrawerBody.innerHTML = "";
    drawerPart = null;
    partDrawerLayer.hidden = true;
  }

  /** @param {ProjectRow} project */
  function ownerCellHtml(project) {
    const name = (project.openedByName || "").trim() || "You";
    let avatar = "";
    if (project.openedByAvatar) {
      const url = URL.createObjectURL(project.openedByAvatar);
      listAvatarObjectUrls.push(url);
      avatar = `<img class="project-owner__img" src="${escapeAttr(url)}" alt="" />`;
    } else {
      const ini = escapeHtml(initialsFromName(name));
      avatar = `<span class="project-owner__fallback" aria-hidden="true">${ini}</span>`;
    }
    return `<span class="project-owner">${avatar}<span class="project-owner__name">${escapeHtml(name)}</span></span>`;
  }

  /** @param {string} status */
  function statusSelectClass(status) {
    const s = STATUSES.includes(status) ? status : "Planned";
    if (s === "Planned") return "project-status-select project-status-select--planned";
    if (s === "Queue") return "project-status-select project-status-select--queue";
    if (s === "WIP") return "project-status-select project-status-select--wip";
    return "project-status-select project-status-select--done";
  }

  const viewProjects = /** @type {HTMLElement} */ ($("#view-projects"));
  const viewProject = /** @type {HTMLElement} */ ($("#view-project"));
  const statProjects = /** @type {HTMLElement} */ ($("#stat-projects"));
  const statParts = /** @type {HTMLElement} */ ($("#stat-parts"));
  const statGrams = /** @type {HTMLElement} */ ($("#stat-grams"));
  const projectTableShell = /** @type {HTMLElement} */ ($("#project-table-shell"));
  const projectList = /** @type {HTMLElement} */ ($("#project-list"));
  const emptyProjects = /** @type {HTMLParagraphElement} */ ($("#empty-projects"));
  const projectStatusFilter = /** @type {HTMLSelectElement} */ ($("#project-status-filter"));
  const pcStatus = /** @type {HTMLSelectElement} */ ($("#pc-status"));
  const pcStarted = /** @type {HTMLInputElement} */ ($("#pc-started"));
  const pcEnded = /** @type {HTMLInputElement} */ ($("#pc-ended"));
  const pcHasEnded = /** @type {HTMLInputElement} */ ($("#pc-has-ended"));
  const pcEndedWrap = /** @type {HTMLElement} */ ($("#pc-ended-wrap"));
  const projectCreateForm = /** @type {HTMLFormElement} */ ($("#project-create-form"));
  const pcOpenedBy = /** @type {HTMLInputElement} */ ($("#pc-opened-by"));
  const pcOpenedAvatar = /** @type {HTMLInputElement} */ ($("#pc-opened-avatar"));
  const pcOpenedAvatarHint = /** @type {HTMLSpanElement} */ ($("#pc-opened-avatar-hint"));

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

  const partDrawerLayer = /** @type {HTMLElement} */ ($("#part-drawer-layer"));
  const partDrawerBackdrop = /** @type {HTMLButtonElement} */ ($("#part-drawer-backdrop"));
  const partDrawerTitleText = /** @type {HTMLElement} */ ($("#part-drawer-title-text"));
  const partDrawerBody = /** @type {HTMLElement} */ ($("#part-drawer-body"));
  const partDrawerClose = /** @type {HTMLButtonElement} */ ($("#part-drawer-close"));
  const partDrawerEdit = /** @type {HTMLButtonElement} */ ($("#part-drawer-edit"));
  const partDrawerDelete = /** @type {HTMLButtonElement} */ ($("#part-drawer-delete"));

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
  const peOpenedBy = /** @type {HTMLInputElement} */ ($("#pe-opened-by"));
  const peOpenedAvatar = /** @type {HTMLInputElement} */ ($("#pe-opened-avatar"));
  const peOpenedAvatarHint = /** @type {HTMLSpanElement} */ ($("#pe-opened-avatar-hint"));

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
    revokeListAvatarUrls();
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

    const filteredIds = new Set(filtered.map((x) => x.id));
    if (expandedProjectId && !filteredIds.has(expandedProjectId)) expandedProjectId = null;

    projectList.innerHTML = "";
    const hasRows = filtered.length > 0;
    emptyProjects.hidden = hasRows;
    projectTableShell.hidden = !hasRows;

    const statusOptionsHtml = STATUSES.map(
      (s) => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`
    ).join("");

    for (const p of filtered) {
      const grams = gramsBy.get(p.id) || 0;
      const cnt = countBy.get(p.id) || 0;
      const isOpen = expandedProjectId === p.id;
      const curStatus = STATUSES.includes(p.status) ? p.status : "Planned";

      const block = document.createElement("div");
      block.className = "project-block";
      block.dataset.projectId = p.id;

      const row = document.createElement("div");
      row.className = "project-row" + (isOpen ? " project-row--expanded" : "");
      row.setAttribute("role", "row");
      row.tabIndex = 0;
      row.setAttribute("aria-expanded", isOpen ? "true" : "false");

      row.innerHTML = `
        <div class="project-row__cell project-row__cell--name" role="cell">
          <span class="project-row__name">${escapeHtml(p.name)}</span>
        </div>
        <div class="project-row__cell project-row__cell--status" role="cell">
          <label class="sr-only" for="proj-status-${escapeAttr(p.id)}">Status</label>
          <select id="proj-status-${escapeAttr(p.id)}" class="${statusSelectClass(curStatus)}" data-project-id="${escapeAttr(p.id)}">${statusOptionsHtml}</select>
        </div>
        <div class="project-row__cell project-row__cell--date" role="cell">
          <span class="project-row__date">${formatProjectDisplayDate(p.startedDate)}</span>
        </div>
        <div class="project-row__cell project-row__cell--owner" role="cell">
          ${ownerCellHtml(p)}
        </div>
        <div class="project-row__cell project-row__cell--actions project-table__actions" role="cell">
          <button type="button" class="btn btn--ghost btn--icon project-row__edit" data-project-id="${escapeAttr(p.id)}" title="Edit project">✎</button>
          <button type="button" class="btn btn--ghost btn--icon project-row__del" data-project-id="${escapeAttr(p.id)}" title="Delete project">🗑</button>
        </div>
      `;

      const statusSelect = /** @type {HTMLSelectElement} */ (row.querySelector("select[data-project-id]"));
      if (statusSelect) statusSelect.value = curStatus;

      row.addEventListener("click", (ev) => {
        const t = /** @type {HTMLElement} */ (ev.target);
        if (t.closest(".project-table__actions")) return;
        if (t.closest("select.project-status-select")) return;
        expandedProjectId = expandedProjectId === p.id ? null : p.id;
        renderProjectList().catch(console.error);
      });

      row.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          const t = /** @type {HTMLElement} */ (ev.target);
          if (t.closest("select")) return;
          ev.preventDefault();
          expandedProjectId = expandedProjectId === p.id ? null : p.id;
          renderProjectList().catch(console.error);
        }
      });

      statusSelect?.addEventListener("click", (e) => e.stopPropagation());
      statusSelect?.addEventListener("keydown", (e) => e.stopPropagation());
      statusSelect?.addEventListener("change", async (e) => {
        e.stopPropagation();
        const id = statusSelect.dataset.projectId;
        if (!id) return;
        const existing = await getOne(STORE_PROJECTS, id);
        if (!existing) return;
        await put(STORE_PROJECTS, {
          ...existing,
          status: statusSelect.value,
          updatedAt: Date.now(),
        });
        await refreshGlobalStats();
        await renderProjectList();
      });

      const btnEdit = row.querySelector("button.project-row__edit");
      btnEdit?.addEventListener("click", async (e) => {
        e.stopPropagation();
        const proj = await getOne(STORE_PROJECTS, p.id);
        if (!proj) return;
        peId.value = proj.id;
        peName.value = proj.name;
        peStatus.value = STATUSES.includes(proj.status) ? proj.status : "Planned";
        peStarted.value = proj.startedDate || todayISO();
        const hasEnd = Boolean(proj.endedDate);
        peHasEnded.checked = hasEnd;
        peEndedWrap.hidden = !hasEnd;
        peEnded.value = proj.endedDate || todayISO();
        peNotes.value = proj.notes || "";
        peOpenedBy.value = (proj.openedByName || "").trim() || "You";
        peOpenedAvatar.value = "";
        peOpenedAvatarHint.textContent = proj.openedByAvatarName ? `Current: ${proj.openedByAvatarName}` : "No file chosen";
        projectDialog.showModal();
      });

      const btnDel = row.querySelector("button.project-row__del");
      btnDel?.addEventListener("click", async (e) => {
        e.stopPropagation();
        const ok = window.confirm(`Delete project "${p.name}" and all its printed parts?`);
        if (!ok) return;
        const plist = await getPartsForProject(p.id);
        for (const part of plist) await del(STORE_PARTS, part.id);
        await del(STORE_PROJECTS, p.id);
        if (expandedProjectId === p.id) expandedProjectId = null;
        if (getCurrentProjectId() === p.id) {
          setCurrentProjectId("");
          clearPartForm();
        }
        closePartDrawer();
        await refreshAll();
      });

      block.appendChild(row);

      if (isOpen) {
        const expand = document.createElement("div");
        expand.className = "project-expand";
        expand.setAttribute("role", "region");
        expand.setAttribute("aria-label", `Parts in ${p.name}`);
        const partRows = await getPartsForProject(p.id);
        const lines =
          partRows.length === 0
            ? `<p class="project-expand__empty">No parts yet — <button type="button" class="btn btn--link project-expand__workspace" data-project-id="${escapeAttr(p.id)}">open workspace to add parts</button>.</p>`
            : `<ul class="project-expand__parts">${partRows
                .map((part) => {
                  let left = "";
                  if (part.imageBlob) {
                    const url = URL.createObjectURL(part.imageBlob);
                    listAvatarObjectUrls.push(url);
                    left = `<img class="project-expand__thumb" src="${escapeAttr(url)}" alt="" />`;
                  } else {
                    const hx = escapeAttr(part.colorHex || "#888888");
                    left = `<span class="project-expand__swatch" style="background:${hx}"></span>`;
                  }
                  const snip = escapeHtml(((part.description || "").trim() || "—").slice(0, 72));
                  return `<li><button type="button" class="project-expand__part" data-part-id="${escapeAttr(part.id)}" data-project-id="${escapeAttr(p.id)}">
                    ${left}
                    <span class="project-expand__part-main"><span class="project-expand__part-name">${escapeHtml(part.partName)}</span><span class="project-expand__part-meta">${escapeHtml(part.brand)} · ${escapeHtml(part.materialType)} · ${snip}</span></span>
                    <span class="project-expand__part-grams">${escapeHtml(formatGrams(part.quantityGrams))}</span>
                  </button></li>`;
                })
                .join("")}</ul><p class="project-expand__foot"><span class="project-expand__stats">${cnt} parts · ${escapeHtml(formatGrams(grams))}</span> <button type="button" class="btn btn--ghost btn--sm project-expand__workspace" data-project-id="${escapeAttr(p.id)}">Open workspace</button></p>`;

        expand.innerHTML = `<div class="project-expand__inner">${lines}</div>`;
        expand.querySelectorAll("button.project-expand__part").forEach((btn) => {
          btn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const partId = /** @type {HTMLButtonElement} */ (btn).dataset.partId;
            const pid = /** @type {HTMLButtonElement} */ (btn).dataset.projectId;
            if (partId && pid) openPartSidePanel(partId, pid).catch(console.error);
          });
        });
        expand.querySelectorAll("button.project-expand__workspace").forEach((btn) => {
          btn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const pid = /** @type {HTMLButtonElement} */ (btn).dataset.projectId;
            if (!pid) return;
            setCurrentProjectId(pid);
            deletePanel.hidden = true;
            renderProjectWorkspace().catch(console.error);
          });
        });
        block.appendChild(expand);
      }

      projectList.appendChild(block);
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
    closePartDrawer();
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
      btn.addEventListener("click", () => {
        openPartSidePanel(p.id, projectId).catch(console.error);
      });
      li.appendChild(btn);
      partList.appendChild(li);
    }
  }

  /** @param {string} partId @param {string} projectId */
  async function openPartSidePanel(partId, projectId) {
    const parts = await getPartsForProject(projectId);
    const part = parts.find((x) => x.id === partId);
    if (!part) return;

    revokePartDrawerUrls();
    drawerPart = part;
    partDrawerTitleText.textContent = part.partName;

    const imgUrl = part.imageBlob ? URL.createObjectURL(part.imageBlob) : null;
    const stlUrl = part.stlBlob ? URL.createObjectURL(part.stlBlob) : null;
    if (imgUrl) partDrawerObjectUrls.push(imgUrl);
    if (stlUrl) partDrawerObjectUrls.push(stlUrl);

    partDrawerBody.innerHTML = "";
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
      const rowEl = document.createElement("div");
      rowEl.className = "detail-row";
      rowEl.innerHTML = `<dt>${escapeHtml(dt)}</dt><dd>${escapeHtml(dd)}</dd>`;
      grid.appendChild(rowEl);
    }
    const dr = document.createElement("div");
    dr.className = "detail-row";
    dr.innerHTML = `<dt>Notes</dt><dd>${escapeHtml(part.description || "—")}</dd>`;
    grid.appendChild(dr);
    partDrawerBody.appendChild(grid);

    if (imgUrl) {
      const wrap = document.createElement("div");
      wrap.className = "detail-media";
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = part.imageName || "Photo";
      wrap.appendChild(img);
      partDrawerBody.appendChild(wrap);
    }
    if (stlUrl && part.stlName) {
      const wrap = document.createElement("div");
      wrap.className = "detail-stl";
      const a = document.createElement("a");
      a.href = stlUrl;
      a.download = part.stlName;
      a.textContent = `Download STL: ${part.stlName}`;
      wrap.appendChild(a);
      partDrawerBody.appendChild(wrap);
    }

    partDrawerLayer.hidden = false;
    requestAnimationFrame(() => partDrawerLayer.classList.add("part-drawer-layer--open"));
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
  pcOpenedBy.value = "You";

  pcOpenedAvatar.addEventListener("change", () => {
    pcOpenedAvatarHint.textContent = fileHintText(pcOpenedAvatar.files && pcOpenedAvatar.files[0]);
  });

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
    const openedByName = pcOpenedBy.value.trim() || "You";
    const avatarFile = pcOpenedAvatar.files && pcOpenedAvatar.files[0];
    /** @type {ProjectRow} */
    const row = {
      id,
      name,
      notes,
      status,
      startedDate: started,
      endedDate: ended || "",
      createdAt: now,
      updatedAt: now,
      openedByName,
    };
    if (avatarFile) {
      row.openedByAvatar = avatarFile;
      row.openedByAvatarName = avatarFile.name;
    }
    await put(STORE_PROJECTS, row);
    expandedProjectId = id;
    projectCreateForm.reset();
    pcStarted.value = todayISO();
    pcOpenedBy.value = "You";
    pcOpenedAvatarHint.textContent = "No file chosen";
    pcHasEnded.checked = false;
    pcEndedWrap.hidden = true;
    /** @type {HTMLDetailsElement} */ ($("#new-project-details")).open = false;
    await refreshGlobalStats();
    await renderProjectList();
  });

  projectStatusFilter.addEventListener("change", () => {
    renderProjectList().catch(console.error);
  });

  btnBack.addEventListener("click", async () => {
    setCurrentProjectId("");
    clearPartForm();
    closePartDrawer();
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
    peOpenedBy.value = (p.openedByName || "").trim() || "You";
    peOpenedAvatar.value = "";
    peOpenedAvatarHint.textContent = p.openedByAvatarName ? `Current: ${p.openedByAvatarName}` : "No file chosen";
    projectDialog.showModal();
  });

  peOpenedAvatar.addEventListener("change", () => {
    peOpenedAvatarHint.textContent =
      peOpenedAvatar.files && peOpenedAvatar.files[0]
        ? peOpenedAvatar.files[0].name
        : "No file chosen";
  });

  projectDialogClose.addEventListener("click", () => projectDialog.close());

  projectEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = peId.value;
    const existing = /** @type {ProjectRow | undefined} */ (await getOne(STORE_PROJECTS, id));
    if (!existing) return;
    const name = peName.value.trim();
    if (!name) return;
    const ended = peHasEnded.checked ? peEnded.value : "";
    const avatarFile = peOpenedAvatar.files && peOpenedAvatar.files[0];
    /** @type {ProjectRow} */
    const next = {
      ...existing,
      name,
      notes: peNotes.value.trim(),
      status: peStatus.value,
      startedDate: peStarted.value,
      endedDate: ended || "",
      openedByName: peOpenedBy.value.trim() || "You",
      updatedAt: Date.now(),
    };
    if (avatarFile) {
      next.openedByAvatar = avatarFile;
      next.openedByAvatarName = avatarFile.name;
    }
    await put(STORE_PROJECTS, next);
    projectDialog.close();
    if (getCurrentProjectId() === id) await renderProjectWorkspace();
    else await renderProjectList();
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
    closePartDrawer();
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
    closePartDrawer();
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

  partDrawerClose.addEventListener("click", () => closePartDrawer());
  partDrawerBackdrop.addEventListener("click", () => closePartDrawer());

  partDrawerEdit.addEventListener("click", async () => {
    if (!drawerPart) return;
    const id = drawerPart.id;
    const pid = drawerPart.projectId;
    closePartDrawer();
    setCurrentProjectId(pid);
    deletePanel.hidden = true;
    await renderProjectWorkspace();
    const p = await getOne(STORE_PARTS, id);
    if (p) fillPartFormForEdit(p);
  });

  partDrawerDelete.addEventListener("click", async () => {
    if (!drawerPart) return;
    const ok = window.confirm("Delete this printed part permanently?");
    if (!ok) return;
    const pid = drawerPart.projectId;
    const delId = drawerPart.id;
    await del(STORE_PARTS, delId);
    closePartDrawer();
    await touchProject(pid);
    if (getCurrentProjectId() === pid) await renderProjectWorkspace();
    else await renderProjectList();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && partDrawerLayer.classList.contains("part-drawer-layer--open")) {
      closePartDrawer();
    }
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
