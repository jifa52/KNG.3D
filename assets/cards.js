(function () {
  var deck = document.getElementById("briefing");
  if (!deck) return;

  var src = deck.getAttribute("data-briefing-src");
  if (!src) return;

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function approvedImage(image) {
    if (!image || typeof image !== "object") return null;
    var url = text(image.url);
    var credit = text(image.credit);
    var caption = text(image.caption);
    if (!url) return null;
    if (!credit && !caption) return null;
    if (/^(javascript|data|blob):/i.test(url)) return null;
    return { url: url, credit: credit, caption: caption };
  }

  function resolveUrl(url) {
    try {
      return new URL(url, new URL(src, location.href)).href;
    } catch (err) {
      return url;
    }
  }

  function findCard(id) {
    var cards = deck.querySelectorAll("[data-story-id]");
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getAttribute("data-story-id") === id) return cards[i];
    }
    return null;
  }

  function photoFigure() {
    var tpl = document.getElementById("card-photo-template");
    if (tpl && tpl.content && tpl.content.firstElementChild) {
      return tpl.content.firstElementChild.cloneNode(true);
    }
    var figure = document.createElement("figure");
    figure.className = "card-photo";
    var img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    var cap = document.createElement("figcaption");
    cap.className = "card-photo-credit";
    figure.appendChild(img);
    figure.appendChild(cap);
    return figure;
  }

  function insertPhoto(card, image) {
    if (card.querySelector(".card-photo")) return;

    var figure = photoFigure();
    var img = figure.querySelector("img");
    var cap = figure.querySelector(".card-photo-credit") || figure.querySelector("figcaption");
    if (!img) return;

    img.src = resolveUrl(image.url);
    img.alt = image.caption || image.credit;
    img.decoding = "async";
    img.loading = "lazy";
    if (cap) cap.textContent = image.credit || image.caption;

    img.addEventListener("error", function () {
      if (figure.parentNode) figure.parentNode.removeChild(figure);
    });

    var body = card.querySelector(".short-body");
    var heading = card.querySelector("h3");
    if (body) {
      body.parentNode.insertBefore(figure, body);
    } else if (heading && heading.nextSibling) {
      heading.parentNode.insertBefore(figure, heading.nextSibling);
    } else {
      card.appendChild(figure);
    }
  }

  fetch(src, { credentials: "same-origin" })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (!data || !Array.isArray(data.cards)) return;
      data.cards.forEach(function (story) {
        if (!story || !story.id) return;
        var image = approvedImage(story.image);
        if (!image) return;
        var card = findCard(story.id);
        if (card) insertPhoto(card, image);
      });
    })
    .catch(function () {});
})();
