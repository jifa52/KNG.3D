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
})();
