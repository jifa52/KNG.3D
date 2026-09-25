/* Section switcher for the isolated navy preview.
   Language copy is in the DOM (data-lang). assets/i18n.js sets html lang/dir.
   Ordinary buttons only. */
(function () {
  var root = document.documentElement;
  var shell = document.getElementById("jenya-navy");
  if (!shell) return;

  var sections = ["news", "markets", "ai"];
  var buttons = Array.prototype.slice.call(shell.querySelectorAll("[data-section]"));
  var panels = sections.map(function (id) { return document.getElementById(id); });
  var main = document.getElementById("main");
  var announce = shell.querySelector(".n-announcement");

  function sectionFromHash() {
    var h = (location.hash || "").replace("#", "");
    if (sections.indexOf(h) !== -1) return h;
    return null;
  }

  function placeIndicator() {
    var nav = shell.querySelector(".n-nav");
    var active = nav && nav.querySelector('[aria-pressed="true"]');
    var bar = nav && nav.querySelector(".n-indicator");
    if (!active || !bar) return;
    bar.style.width = active.offsetWidth + "px";
    bar.style.transform = "translateX(" + active.offsetLeft + "px)";
  }

  function show(id, animate) {
    if (sections.indexOf(id) === -1) id = "news";
    root.setAttribute("data-section", id);
    buttons.forEach(function (btn) {
      var on = btn.getAttribute("data-section") === id;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    panels.forEach(function (panel) {
      if (!panel) return;
      if (panel.id === id) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
    placeIndicator();
    if (announce) {
      var label = id === "ai" ? "AI Digest" : id;
      announce.textContent = label;
    }
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate && main && !reduce && main.animate) {
      main.animate(
        [{ transform: "translateY(12px)", opacity: 0.45 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-section");
      if (root.getAttribute("data-section") === id) return;
      show(id, true);
      if (location.protocol !== "file:") {
        try { history.replaceState(null, "", "#" + id); } catch (err) {}
      }
    });
  });

  window.addEventListener("hashchange", function () {
    var id = sectionFromHash();
    if (id) show(id, false);
  });

  shell.querySelectorAll(".n-photo img").forEach(function (img) {
    img.addEventListener("error", function () {
      var fig = img.closest("figure");
      if (!fig || fig.classList.contains("is-missing")) return;
      fig.classList.add("is-missing");
      var note = document.createElement("p");
      note.className = "n-photo-fallback";
      var he = root.lang !== "en";
      note.textContent = he
        ? "התמונה לא נטענה. התקציר נשאר בלי תמונה."
        : "Image failed to load. The brief stands without it.";
      fig.appendChild(note);
    });
  });

  var nav = shell.querySelector(".n-nav");
  if (nav && "ResizeObserver" in window) {
    new ResizeObserver(placeIndicator).observe(nav);
  } else {
    window.addEventListener("resize", placeIndicator);
  }

  function syncNavLabel() {
    var nav = shell.querySelector(".n-nav");
    if (!nav) return;
    nav.setAttribute("aria-label", root.lang === "en" ? "Newspaper sections" : "מדורי העיתון");
  }

  if ("MutationObserver" in window) {
    new MutationObserver(function () {
      syncNavLabel();
      placeIndicator();
    }).observe(root, {
      attributes: true,
      attributeFilter: ["lang", "dir"]
    });
  }
  syncNavLabel();

  show(sectionFromHash() || "news", false);
})();
