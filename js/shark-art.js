/* サメの絵を出す係（画像か、仮の絵か）
 *
 * js/shark-images.js の表に画像のパスがあれば <img> を、無ければ js/sharks-svg.js の仮の絵（SVG）を返す。
 * 画面の側（js/app.js・js/test-gallery.js）は、どちらの場合もこの係を通して絵を出す。
 * イラストを差し替えるときに、このファイルを直す必要はない。
 *
 * SA.sharkArt.build(code, opts)   絵の要素を作って返す（無ければ null）
 *    opts.decorative = true       飾りとして使う（読み上げない）
 *    opts.label                   読み上げ用の名前
 * SA.sharkArt.imagePath(code)     表に書かれた、使えるパス（無ければ ""）
 * SA.sharkArt.cleanPath(path)     パスを確かめる。このフォルダー内の相対パスだけを通し、ほかは "" にする
 */
(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});
  var ART_W = 320, ART_H = 170; // 絵の枠（仮の絵と同じ縦横比）

  function cleanPath(p) {
    if (typeof p !== "string") return "";
    // 正規の素材ディレクトリと画像形式に限定する。エスケープやクエリは受け付けない。
    return /^img\/sharks\/[A-Za-z0-9_-]+\.(?:webp|png|svg)$/.test(p) ? p : "";
  }

  function imagePath(code) {
    var table = SA.sharkImages;
    if (!table || !Object.prototype.hasOwnProperty.call(table, code)) return "";
    return cleanPath(table[code]);
  }

  function placeholder(code, opts) {
    return SA.sharks ? SA.sharks.build(code, opts) : null;
  }

  function build(code, opts) {
    opts = opts || {};
    var path = imagePath(code);
    if (!path) return placeholder(code, opts);

    var img = document.createElement("img");
    img.className = "shark-art";
    img.width = ART_W;
    img.height = ART_H;
    img.decoding = "async";
    if (opts.decorative) { img.alt = ""; img.setAttribute("aria-hidden", "true"); }
    else img.alt = (opts.label || "サメ") + "のイラスト";
    img.addEventListener("error", function () {
      // ファイルが見つからない・読めないときは、仮の絵に戻す
      var svg = placeholder(code, opts);
      if (svg && img.parentNode) img.parentNode.replaceChild(svg, img);
    }, { once: true });
    img.src = path;
    return img;
  }

  SA.sharkArt = { build: build, imagePath: imagePath, cleanPath: cleanPath };
})();
