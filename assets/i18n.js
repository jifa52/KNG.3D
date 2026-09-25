(function () {
  var KEY = "brief-lang";
  var root = document.documentElement;

  function langFromHash() {
    var h = location.hash;
    if (h === "#en" || h === "#he") return h.slice(1);
    return null;
  }

  function storedLang() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === "en" || s === "he") return s;
    } catch (err) {}
    return null;
  }

  function readLang() {
    return langFromHash() || storedLang() || "he";
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(KEY, lang);
    } catch (err) {}
  }

  function apply(lang) {
    if (lang !== "en" && lang !== "he") lang = "he";
    root.lang = lang;
    root.dir = lang === "he" ? "rtl" : "ltr";
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
    var desc = root.getAttribute("data-desc-" + lang);
    if (desc) {
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", desc);
    }
    document.querySelectorAll("[data-lang-set]").forEach(function (btn) {
      var on = btn.getAttribute("data-lang-set") === lang;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-alt-he][data-alt-en]").forEach(function (el) {
      var alt = el.getAttribute("data-alt-" + lang);
      if (alt) el.setAttribute("alt", alt);
    });
  }

  apply(readLang());

  function bind() {
    document.querySelectorAll("[data-lang-set]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang-set");
        saveLang(lang);
        apply(lang);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  window.addEventListener("hashchange", function () {
    var fromHash = langFromHash();
    if (!fromHash) return;
    saveLang(fromHash);
    apply(fromHash);
  });

  document.querySelectorAll(".crawl").forEach(function (crawl) {
    var btn = crawl.querySelector(".crawl-pause");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var paused = !crawl.classList.contains("is-paused");
      crawl.classList.toggle("is-paused", paused);
      btn.setAttribute("aria-pressed", paused ? "true" : "false");
      var he = btn.querySelector('[data-lang="he"]');
      var en = btn.querySelector('[data-lang="en"]');
      if (he) he.textContent = paused ? "המשך" : "השהה";
      if (en) en.textContent = paused ? "Play" : "Pause";
    });
  });

  /* Home sheet: one section at a time. #premarket and the lane hashes open the same views. */
  if (root.classList.contains("home")) {
    var sections = ["news", "markets", "ai"];
    var alias = {
      premarket: "markets",
      "lane-news": "news",
      "lane-markets": "markets",
      "lane-ai": "ai"
    };

    function sectionFromHash() {
      var raw = (location.hash || "").replace("#", "");
      if (alias[raw]) return alias[raw];
      if (sections.indexOf(raw) !== -1) return raw;
      return null;
    }

    function showSection(id, scroll) {
      if (sections.indexOf(id) === -1) id = "news";
      root.setAttribute("data-section", id);
      sections.forEach(function (sid) {
        var panel = document.getElementById(sid);
        if (!panel) return;
        if (sid === id) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
      document.querySelectorAll('.edition-nav a[href^="#"]').forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      if (scroll) window.scrollTo(0, 0);
    }

    document.querySelectorAll('.edition-nav a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var id = a.getAttribute("href").slice(1);
        if (sections.indexOf(id) === -1) return;
        ev.preventDefault();
        showSection(id, true);
        try { history.pushState(null, "", "#" + id); } catch (err) {}
      });
    });

    window.addEventListener("hashchange", function () {
      var id = sectionFromHash();
      if (id) showSection(id, false);
    });
    window.addEventListener("popstate", function () {
      showSection(sectionFromHash() || "news", false);
    });

    var initial = sectionFromHash() || "news";
    var rawHash = (location.hash || "").replace("#", "");
    showSection(initial, false);
    if (alias[rawHash]) {
      try { history.replaceState(null, "", "#" + initial); } catch (err) {}
    }
  }
})();
