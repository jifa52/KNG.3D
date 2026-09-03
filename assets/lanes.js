(function () {
  var deck = document.getElementById("briefing");
  if (!deck) return;

  var buttons = deck.querySelectorAll(".lane-btn[data-lane]");
  var news = document.getElementById("lane-news");
  var markets = document.getElementById("lane-markets");

  function isLangHash(hash) {
    return hash === "#en" || hash === "#he";
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
    show(location.hash === "#markets" ? "markets" : "news", { skipHash: true });
  });

  if (location.hash === "#markets") {
    show("markets", { skipHash: true });
  } else {
    show("news", { skipHash: true });
  }
})();
