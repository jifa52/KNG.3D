(function () {
  var deck = document.getElementById("briefing");
  if (!deck) return;

  var buttons = deck.querySelectorAll(".lane-btn[data-lane]");
  var LANES = ["news", "markets", "premarket", "ai"];

  function isLangHash(hash) {
    return hash === "#en" || hash === "#he";
  }

  function laneFromHash(hash) {
    for (var i = 0; i < LANES.length; i++) {
      if (hash === "#" + LANES[i]) return LANES[i];
    }
    return null;
  }

  function deckLane() {
    var dl = deck.dataset.lane;
    return LANES.indexOf(dl) >= 0 ? dl : "markets";
  }

  function setHash(hash) {
    if (location.protocol === "file:") return;
    if (location.hash === hash) return;
    try {
      history.replaceState(null, "", hash);
    } catch (err) {}
  }

  function panelFor(lane) {
    return document.getElementById("lane-" + lane);
  }

  function show(lane, opts) {
    opts = opts || {};
    if (LANES.indexOf(lane) < 0) lane = "markets";
    if (!panelFor(lane)) lane = "markets";
    deck.dataset.lane = lane;
    document.body.dataset.lane = lane;
    LANES.forEach(function (l) {
      var panel = panelFor(l);
      if (panel) panel.hidden = l !== lane;
    });
    buttons.forEach(function (btn) {
      var on = btn.getAttribute("data-lane") === lane;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (opts.skipHash) return;
    setHash("#" + lane);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      show(btn.getAttribute("data-lane"));
    });
  });

  window.addEventListener("hashchange", function () {
    if (isLangHash(location.hash)) return;
    var fromHash = laneFromHash(location.hash);
    var missing = fromHash && !panelFor(fromHash);
    show(fromHash || deckLane(), { skipHash: !missing });
  });

  var requested = laneFromHash(location.hash);
  var initial = requested || deckLane();
  var missingPanel = requested && !panelFor(requested);
  show(initial, { skipHash: !missingPanel });
})();
