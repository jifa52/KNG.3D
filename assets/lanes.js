(function () {
  var deck = document.getElementById("briefing");
  if (!deck) return;

  var buttons = deck.querySelectorAll("[data-lane]");
  var news = document.getElementById("lane-news");
  var markets = document.getElementById("lane-markets");

  function show(lane) {
    var isNews = lane !== "markets";
    deck.dataset.lane = isNews ? "news" : "markets";
    document.body.dataset.lane = deck.dataset.lane;
    if (news) news.hidden = !isNews;
    if (markets) markets.hidden = isNews;
    buttons.forEach(function (btn) {
      var on = btn.getAttribute("data-lane") === deck.dataset.lane;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    var hash = isNews ? "#news" : "#markets";
    if (location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      show(btn.getAttribute("data-lane"));
    });
  });

  window.addEventListener("hashchange", function () {
    show(location.hash === "#markets" ? "markets" : "news");
  });

  show(location.hash === "#markets" ? "markets" : "news");
})();
