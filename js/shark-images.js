/* 図鑑・結果・相棒で同じタイプのイラストを使う。 */
(function () {
  "use strict";
  var SA = window.SharkArchetype;
  SA.sharkImages = Object.create(null);
  SA.types.forEach(function (type) {
    SA.sharkImages[type.code] = "img/sharks/" + type.code + ".webp";
  });
  SA.sharkStart = "SDEAM";
})();
