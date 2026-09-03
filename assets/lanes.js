(function () {
  var deck = document.getElementById("briefing");
  if (!deck) return;

  var buttons = deck.querySelectorAll(".lane-btn[data-lane]");
  var news = document.getElementById("lane-news");
  var markets = document.getElementById("lane-markets");

  function isLangHash(hash) {
    return hash === "#en" || hash === "#he";
  }

  function laneFromHash(hash) {
    if (hash === "#markets") return "markets";
    if (hash === "#news") return "news";
    return null;
  }

  function deckLane() {
    return deck.dataset.lane === "markets" ? "markets" : "news";
  }

  function setHash(hash) {
    if (location.protocol === "file:") return;
    if (location.hash === hash) return;
    try {
      history.replaceState(null, "", hash);
    } catch (err) {}
  }

  function show(lane, opts) {
    opts = opts || {};
    var isNews = lane !== "markets";
    deck.dataset.lane = isNews ? "news" : "markets";
    document.body.dataset.lane = deck.dataset.lane;
    if (news) news.hidden = !isNews;
    if (markets) markets.hidden = isNews;
    buttons.forEach(function (btn) {
      var on = btn.getAttribute("data-lane") === deck.dataset.lane;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (opts.skipHash) return;
    setHash(isNews ? "#news" : "#markets");
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      show(btn.getAttribute("data-lane"));
    });
  });

  window.addEventListener("hashchange", function () {
    if (isLangHash(location.hash)) return;
    var fromHash = laneFromHash(location.hash);
    show(fromHash || deckLane(), { skipHash: true });
  });

  show(laneFromHash(location.hash) || deckLane(), { skipHash: true });
})();
