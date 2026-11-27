/* The displayed, downloaded and social-preview cards use the same local PNG. */
(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});
  var W = 1200, H = 630;

  function cardPath(code) {
    if (typeof code !== "string" || !SA.typeByCode || !Object.prototype.hasOwnProperty.call(SA.typeByCode, code)) return null;
    return "cards/" + code + ".png";
  }

  function render(code, canvas) {
    canvas = canvas || document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    var path = cardPath(code);
    canvas.dataset.cardPath = path || "";
    if (!path) return Promise.resolve(canvas);
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        if (canvas.dataset.cardPath === path) canvas.getContext("2d").drawImage(img, 0, 0, W, H);
        resolve(canvas);
      };
      img.onerror = function () { resolve(canvas); };
      img.src = path;
    });
  }

  function download(code) {
    var path = cardPath(code);
    if (!path) return Promise.resolve("error");
    var link = document.createElement("a");
    link.href = path;
    link.download = "shark-archetype-" + code + ".png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return Promise.resolve("ok");
  }

  SA.shareCard = { render: render, download: download, WIDTH: W, HEIGHT: H };
})();
