/* 図鑑のカードと詳細。診断の回答状態から独立して開閉できる。 */
(function () {
  "use strict";
  var SA = window.SharkArchetype;
  var grid = document.getElementById("guide-grid");
  var all = document.getElementById("guide-all");
  var detail = document.getElementById("guide-dialog");
  var about = document.getElementById("about-dialog");
  var featured = ["SDEAM", "GHEAM", "GHLCM", "GHLCR"];
  var types = featured.map(function (code) { return SA.typeByCode[code]; })
    .concat(SA.types.filter(function (type) { return !featured.includes(type.code); }));

  function element(tag, className, text) {
    var el = document.createElement(tag);
    el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function showSpecies(type, color) {
    var art = document.getElementById("detail-art");
    art.className = "detail-art " + color;
    art.replaceChildren(SA.sharkArt.build(type.code, { decorative: true }));
    ["code", "name", "persona", "eco", "place", "size"].forEach(function (key) {
      document.getElementById("detail-" + key).textContent = key === "name" ? type.shark : type[key];
    });
    detail.showModal();
  }

  var colors = ["sky", "mint", "lilac", "peach"];
  function addCard(type, index) {
    var color = colors[index % colors.length];
    var card = element("button", "species-card");
    card.type = "button";
    card.setAttribute("aria-haspopup", "dialog");
    var picture = element("span", "species-picture " + color);
    var image = SA.sharkArt.build(type.code, { decorative: true });
    if (index >= featured.length) image.loading = "lazy";
    var badge = element("span", "species-code", type.code);
    picture.append(badge, image);
    var caption = element("span", "species-caption");
    caption.append(element("strong", "species-name", type.shark), element("span", "species-label", type.label + "タイプ"));
    var plus = element("span", "species-plus", "＋");
    plus.setAttribute("aria-hidden", "true");
    caption.appendChild(plus);
    card.append(picture, caption);
    card.addEventListener("click", function () { showSpecies(type, color); });
    grid.appendChild(card);
  }
  types.slice(0, featured.length).forEach(addCard);
  all.addEventListener("click", function () {
    var expand = all.getAttribute("aria-expanded") === "false";
    if (expand && grid.children.length === featured.length) {
      types.slice(featured.length).forEach(function (type, i) { addCard(type, i + featured.length); });
    }
    Array.from(grid.children).slice(featured.length).forEach(function (card) { card.hidden = !expand; });
    all.setAttribute("aria-expanded", String(expand));
    all.querySelector("span").textContent = expand ? "図鑑をたたむ" : "全32タイプを見る";
  });
  document.getElementById("about-open").addEventListener("click", function () { about.showModal(); });
  [detail, about].forEach(function (dialog) {
    dialog.querySelector(".dialog-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) {
      if (event.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
})();
