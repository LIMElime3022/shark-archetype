/* 32種のサメの仮の絵（SVG）
 *
 * 差し替え用の画像が無いタイプに出す、仮の絵。画像への差し替えは js/shark-images.js で行う
 * （このファイルは直さなくてよい。全タイプを差し替えたら、読み込みを外してもよい）。
 *
 * 共通の描き方（胴体・ひれ・尾）に、種ごとの数値と特徴（extra）を渡して描き分ける。
 * 外部の画像は使わない。サメは左向き。特徴を強調した簡単な絵で、正確な図ではない。
 *
 * SA.sharks.has(code)            そのコードの絵の定義があるか
 * SA.sharks.build(code, opts)    <svg> 要素を作って返す
 *    opts.decorative = true      飾りとして使う（読み上げない）
 *    opts.label                  読み上げ用の名前
 */
(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});

  var NS = "http://www.w3.org/2000/svg";
  var VB_W = 320, VB_H = 170, CY = 85, PD = 3;

  /* L: 鼻先〜尾の付け根の長さ / H: 胴の高さの目安 / s: 鼻先のとがり具合（小さいほど丸い）
     dorsal・dorsal2: 背びれ（at は体の前からの位置 0〜1） / pect: 胸びれ / tail: 尾びれの上下の先
     x0: 鼻先の位置（既定 30） / bellyK: おなかのふくらみ（既定 1） / gills: えらの線の数（既定 5）
     extra: 種ごとの特徴（下の「模様」「飾り」を参照） */
  var SPECS = {
    /* ヨシキリザメ */ GHECM: { L: 205, H: 22, s: 0.2, top: "#2f5fa8", belly: "#e8f1f8", dorsal: { at: 0.42, w: 28, h: 22 }, dorsal2: { at: 0.8, w: 9, h: 6 }, pect: { at: 0.26, w: 22, h: 44 }, tail: { ux: 46, uy: 48, lx: 22, ly: 22 } },
    /* ツマグロ */ GHECR: { L: 185, H: 27, s: 0.13, top: "#a8957a", belly: "#f3eee4", dorsal: { at: 0.36, w: 32, h: 32 }, dorsal2: { at: 0.78, w: 11, h: 8 }, pect: { at: 0.25, w: 22, h: 30 }, tail: { ux: 44, uy: 46, lx: 24, ly: 24 }, extra: ["tipDark"] },
    /* ジンベエザメ */ GHEAM: { L: 200, H: 40, s: 0.02, top: "#3b5f86", belly: "#e3edf3", dorsal: { at: 0.56, w: 34, h: 28 }, dorsal2: { at: 0.84, w: 10, h: 8 }, pect: { at: 0.24, w: 30, h: 36 }, tail: { ux: 50, uy: 60, lx: 30, ly: 34 }, extra: ["spots"], eyeAt: 0.05, eyeR: 2.2 },
    /* ネムリブカ */ GHEAR: { L: 200, H: 22, s: 0.06, top: "#8b9198", belly: "#eceef0", dorsal: { at: 0.46, w: 26, h: 22 }, dorsal2: { at: 0.76, w: 16, h: 13 }, pect: { at: 0.24, w: 20, h: 26 }, tail: { ux: 44, uy: 40, lx: 16, ly: 14 }, extra: ["tipLight"] },
    /* アカシュモクザメ */ GHLCM: { L: 190, H: 26, s: 0.1, top: "#8a8f7e", belly: "#eef0ea", dorsal: { at: 0.33, w: 28, h: 42 }, dorsal2: { at: 0.8, w: 9, h: 7 }, pect: { at: 0.24, w: 20, h: 28 }, tail: { ux: 46, uy: 52, lx: 22, ly: 22 }, extra: ["hammer"] },
    /* レモンザメ */ GHLCR: { L: 190, H: 28, s: 0.07, top: "#b7a456", belly: "#f3edc8", dorsal: { at: 0.36, w: 30, h: 26 }, dorsal2: { at: 0.66, w: 27, h: 23 }, pect: { at: 0.24, w: 24, h: 32 }, tail: { ux: 46, uy: 44, lx: 20, ly: 18 } },
    /* ウバザメ */ GHLAM: { L: 205, H: 36, s: 0.12, top: "#6a6f73", belly: "#b9bdbf", dorsal: { at: 0.42, w: 32, h: 32 }, dorsal2: { at: 0.8, w: 10, h: 8 }, pect: { at: 0.3, w: 26, h: 34 }, tail: { ux: 44, uy: 50, lx: 36, ly: 40 }, extra: ["bigGills", "openMouth"], eyeAt: 0.08, eyeR: 1.8, gillAt: 0.17 },
    /* コモリザメ */ GHLAR: { L: 195, H: 26, s: 0.03, top: "#a9815a", belly: "#e6d3b6", dorsal: { at: 0.56, w: 24, h: 20 }, dorsal2: { at: 0.72, w: 20, h: 16 }, pect: { at: 0.22, w: 26, h: 26 }, tail: { ux: 56, uy: 22, lx: 12, ly: 8 }, extra: ["barbels"], eyeR: 1.8, eyeAt: 0.08 },
    /* ネズミザメ */ GDECM: { L: 185, H: 36, s: 0.2, top: "#3f4a57", belly: "#f4f6f7", dorsal: { at: 0.36, w: 30, h: 32 }, dorsal2: { at: 0.84, w: 7, h: 5 }, pect: { at: 0.27, w: 24, h: 34 }, tail: { ux: 40, uy: 46, lx: 34, ly: 38 }, extra: ["bellyBlotch"] },
    /* ドチザメ */ GDECR: { L: 190, H: 22, s: 0.1, top: "#8a8f86", belly: "#eceee8", dorsal: { at: 0.4, w: 24, h: 20 }, dorsal2: { at: 0.72, w: 20, h: 16 }, pect: { at: 0.24, w: 20, h: 24 }, tail: { ux: 44, uy: 34, lx: 16, ly: 12 }, extra: ["bands", "darkDots"] },
    /* アブラツノザメ */ GDEAM: { L: 195, H: 21, s: 0.17, top: "#6d7f8d", belly: "#e7ebee", dorsal: { at: 0.38, w: 22, h: 20 }, dorsal2: { at: 0.72, w: 16, h: 14 }, pect: { at: 0.25, w: 18, h: 26 }, tail: { ux: 42, uy: 42, lx: 18, ly: 16 }, extra: ["whiteDots", "spines"] },
    /* ネコザメ */ GDEAR: { L: 165, H: 31, s: 0.02, top: "#b89a6a", belly: "#f0e4cd", dorsal: { at: 0.24, w: 30, h: 30 }, dorsal2: { at: 0.62, w: 24, h: 22 }, pect: { at: 0.2, w: 26, h: 30 }, tail: { ux: 44, uy: 40, lx: 22, ly: 18 }, extra: ["bands", "spines"], eyeAt: 0.09 },
    /* ダルマザメ */ GDLCM: { L: 160, H: 18, s: 0.03, top: "#6a5645", belly: "#7c6857", dorsal: { at: 0.7, w: 13, h: 9 }, dorsal2: { at: 0.83, w: 13, h: 9 }, pect: { at: 0.24, w: 12, h: 12 }, tail: { ux: 24, uy: 22, lx: 22, ly: 20 }, extra: ["collar", "glow"], eyeR: 3.6, eyeColor: "#9fe8b0", eyeAt: 0.07 },
    /* フジクジラ */ GDLCR: { L: 150, H: 21, s: 0.1, top: "#3d4163", belly: "#25273d", dorsal: { at: 0.36, w: 18, h: 13 }, dorsal2: { at: 0.68, w: 20, h: 15 }, pect: { at: 0.26, w: 14, h: 16 }, tail: { ux: 34, uy: 30, lx: 16, ly: 14 }, extra: ["glow", "spines"], eyeR: 4, eyeColor: "#9af5e6" },
    /* シロワニ */ GDLAM: { L: 195, H: 30, s: 0.14, top: "#9a8f78", belly: "#efe9db", dorsal: { at: 0.46, w: 26, h: 24 }, dorsal2: { at: 0.7, w: 24, h: 22 }, pect: { at: 0.25, w: 22, h: 28 }, tail: { ux: 50, uy: 40, lx: 16, ly: 12 }, extra: ["darkDots", "teeth"], eyeR: 1.8 },
    /* ノコギリザメ */ GDLAR: { x0: 68, L: 170, H: 17, s: 0.04, top: "#b3996b", belly: "#efe5cc", dorsal: { at: 0.42, w: 22, h: 18 }, dorsal2: { at: 0.72, w: 20, h: 16 }, pect: { at: 0.2, w: 24, h: 18 }, tail: { ux: 40, uy: 24, lx: 14, ly: 8 }, extra: ["saw"], eyeAt: 0.09, eyeR: 2 },
    /* アオザメ */ SHECM: { L: 195, H: 27, s: 0.26, top: "#2a4fb0", belly: "#f4f7fb", dorsal: { at: 0.4, w: 26, h: 28 }, dorsal2: { at: 0.84, w: 6, h: 4 }, pect: { at: 0.28, w: 18, h: 28 }, tail: { ux: 40, uy: 48, lx: 36, ly: 42 } },
    /* オオメジロザメ */ SHECR: { L: 185, H: 36, s: 0.04, top: "#7b858d", belly: "#eef0f1", dorsal: { at: 0.34, w: 36, h: 34 }, dorsal2: { at: 0.78, w: 14, h: 10 }, pect: { at: 0.24, w: 26, h: 34 }, tail: { ux: 46, uy: 50, lx: 24, ly: 24 }, eyeR: 2 },
    /* イタチザメ */ SHEAM: { L: 200, H: 32, s: 0.04, top: "#6f8188", belly: "#f1f3f2", dorsal: { at: 0.36, w: 30, h: 30 }, dorsal2: { at: 0.78, w: 10, h: 8 }, pect: { at: 0.24, w: 24, h: 34 }, tail: { ux: 52, uy: 54, lx: 22, ly: 20 }, extra: ["stripes"] },
    /* トラフザメ */ SHEAR: { L: 165, H: 24, s: 0.03, top: "#d6c494", belly: "#f5efdc", dorsal: { at: 0.5, w: 26, h: 18 }, dorsal2: { at: 0.72, w: 16, h: 10 }, pect: { at: 0.22, w: 24, h: 24 }, tail: { ux: 108, uy: 20, lx: 10, ly: 6 }, extra: ["darkDots"], eyeR: 2 },
    /* オナガザメ */ SHLCM: { L: 150, H: 25, s: 0.12, top: "#4a5f92", belly: "#eef2f7", dorsal: { at: 0.4, w: 24, h: 26 }, dorsal2: { at: 0.86, w: 6, h: 4 }, pect: { at: 0.25, w: 22, h: 36 }, tail: { ux: 118, uy: 66, lx: 14, ly: 14 }, eyeR: 3.4 },
    /* マモンツキテンジクザメ */ SHLCR: { L: 190, H: 15, s: 0.04, top: "#c9a878", belly: "#eedfc2", dorsal: { at: 0.58, w: 18, h: 14 }, dorsal2: { at: 0.74, w: 18, h: 14 }, pect: { at: 0.2, w: 22, h: 20 }, tail: { ux: 52, uy: 10, lx: 22, ly: 6 }, extra: ["darkDots", "epaulette"], eyeR: 2, eyeAt: 0.06 },
    /* メガマウスザメ */ SHLAM: { L: 195, H: 38, s: 0.01, top: "#4b4f5e", belly: "#d9dbe0", dorsal: { at: 0.4, w: 26, h: 20 }, dorsal2: { at: 0.76, w: 12, h: 9 }, pect: { at: 0.26, w: 26, h: 38 }, tail: { ux: 56, uy: 56, lx: 26, ly: 24 }, extra: ["bigMouth"], eyeR: 1.8, eyeAt: 0.07, gillAt: 0.22 },
    /* ナヌカザメ */ SHLAR: { L: 170, H: 28, s: 0.03, bellyK: 1.4, top: "#a58a5e", belly: "#e9d9b5", dorsal: { at: 0.6, w: 18, h: 13 }, dorsal2: { at: 0.78, w: 14, h: 9 }, pect: { at: 0.22, w: 22, h: 20 }, tail: { ux: 40, uy: 18, lx: 14, ly: 8 }, extra: ["blotch", "darkDots"], eyeR: 2.2, eyeAt: 0.07 },
    /* ヨゴレ */ SDECM: { L: 195, H: 31, s: 0.06, top: "#8a7a62", belly: "#f1ede2", dorsal: { at: 0.33, w: 38, h: 34 }, dorsal2: { at: 0.78, w: 12, h: 9 }, pect: { at: 0.24, w: 28, h: 46 }, tail: { ux: 48, uy: 50, lx: 26, ly: 26 }, extra: ["tipLight"] },
    /* カグラザメ */ SDECR: { L: 205, H: 30, s: 0.04, top: "#5f5a52", belly: "#a9a297", dorsal: { at: 0.7, w: 22, h: 16 }, pect: { at: 0.24, w: 24, h: 26 }, tail: { ux: 56, uy: 26, lx: 14, ly: 8 }, gills: 6, eyeR: 3, eyeColor: "#8fe0b0", eyeAt: 0.07 },
    /* ホホジロザメ */ SDEAM: { L: 200, H: 35, s: 0.17, top: "#5c6a77", belly: "#f6f8f9", dorsal: { at: 0.38, w: 34, h: 36 }, dorsal2: { at: 0.84, w: 7, h: 5 }, pect: { at: 0.27, w: 26, h: 38 }, tail: { ux: 44, uy: 52, lx: 38, ly: 44 } },
    /* オオセ */ SDEAR: { L: 195, H: 17, s: 0.01, top: "#a8895a", belly: "#dccaa4", dorsal: { at: 0.62, w: 18, h: 14 }, dorsal2: { at: 0.78, w: 16, h: 12 }, pect: { at: 0.2, w: 30, h: 16 }, tail: { ux: 44, uy: 14, lx: 30, ly: 10 }, extra: ["blotch", "tassel", "sand"], eyeAt: 0.07, eyeR: 2 },
    /* ヒラシュモクザメ */ SDLCM: { L: 195, H: 28, s: 0.1, top: "#7b7466", belly: "#f0eee8", dorsal: { at: 0.3, w: 28, h: 54 }, dorsal2: { at: 0.78, w: 14, h: 14 }, pect: { at: 0.24, w: 22, h: 30 }, tail: { ux: 48, uy: 56, lx: 22, ly: 22 }, extra: ["hammer"] },
    /* ミツクリザメ */ SDLCR: { L: 190, H: 22, s: 0.05, top: "#e0a3a6", belly: "#f4d6d4", dorsal: { at: 0.42, w: 20, h: 14 }, dorsal2: { at: 0.72, w: 18, h: 12 }, pect: { at: 0.24, w: 18, h: 20 }, tail: { ux: 60, uy: 22, lx: 14, ly: 8 }, extra: ["blade"], eyeR: 1.8, eyeAt: 0.09 },
    /* ニシオンデンザメ */ SDLAM: { L: 205, H: 35, s: 0.07, top: "#6f6b68", belly: "#8d8882", dorsal: { at: 0.48, w: 20, h: 13 }, dorsal2: { at: 0.76, w: 14, h: 9 }, pect: { at: 0.24, w: 20, h: 22 }, tail: { ux: 38, uy: 36, lx: 26, ly: 26 }, eyeR: 2 },
    /* ラブカ */ SDLAR: { L: 225, H: 13, s: 0.04, top: "#6b4f45", belly: "#806459", dorsal: { at: 0.74, w: 22, h: 9 }, pect: { at: 0.2, w: 14, h: 14 }, tail: { ux: 46, uy: 8, lx: 34, ly: 14 }, extra: ["frill"], gills: 6, eyeR: 2.4, eyeAt: 0.05, gillAt: 0.1 }
  };

  /* ---- 小道具 ---- */
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function n(v) { return Math.round(v * 10) / 10; }
  function P() { // 数値と命令を並べてパス文字列にする
    var out = [];
    for (var i = 0; i < arguments.length; i++) out.push(typeof arguments[i] === "number" ? n(arguments[i]) : arguments[i]);
    return out.join(" ");
  }
  function shade(hex, f) { // f < 0 で暗く、f > 0 で明るく
    var v = parseInt(hex.slice(1), 16), c = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    var t = f < 0 ? 0 : 255, a = Math.abs(f);
    return "rgb(" + c.map(function (x) { return Math.round(x + (t - x) * a); }).join(",") + ")";
  }
  function bez(p, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return { x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x, y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y };
  }
  function yAt(p, x) { // 曲線の上で、横の位置 x に当たる高さを探す
    var inc = p[3].x > p[0].x, lo = 0, hi = 1;
    for (var i = 0; i < 24; i++) {
      var mid = (lo + hi) / 2, mx = bez(p, mid).x;
      if ((mx < x) === inc) lo = mid; else hi = mid;
    }
    return bez(p, (lo + hi) / 2).y;
  }
  function lerpPt(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
  function tri(a, b, c, fill) { return el("path", { d: P("M", a.x, a.y, "L", b.x, b.y, "L", c.x, c.y, "Z"), fill: fill }); }

  /* ---- 1匹を描く ---- */
  function build(code, opts) {
    if (!Object.prototype.hasOwnProperty.call(SPECS, code)) return null;
    var sp = SPECS[code];
    opts = opts || {};
    var X0 = sp.x0 || 30, L = sp.L, H = sp.H, xt = X0 + L, extra = sp.extra || [];
    function has(k) { return extra.indexOf(k) !== -1; }

    var svg = el("svg", { viewBox: "0 0 " + VB_W + " " + VB_H, "class": "shark-art shark-svg is-placeholder", focusable: "false" });
    if (opts.decorative) svg.setAttribute("aria-hidden", "true");
    else { svg.setAttribute("role", "img"); svg.setAttribute("aria-label", (opts.label || "サメ") + "のイラスト"); }

    var bk = sp.bellyK || 1;
    var topPts = [{ x: X0, y: CY }, { x: X0 + L * sp.s, y: CY - H * 1.15 }, { x: X0 + L * 0.55, y: CY - H * 1.05 }, { x: xt, y: CY - PD }];
    var s2 = sp.s * 0.8 + 0.05;
    var botPts = [{ x: xt, y: CY + PD }, { x: X0 + L * 0.55, y: CY + H * 0.95 * bk }, { x: X0 + L * s2, y: CY + H * bk }, { x: X0, y: CY }];
    function top(x) { return yAt(topPts, x); }
    function bottom(x) { return yAt(botPts, x); }

    var finFill = shade(sp.top, -0.14), pectFill = shade(sp.top, -0.22), dark = shade(sp.top, -0.45), line = "rgba(255,255,255,.22)";
    var tipFill = has("tipDark") ? "#1b1f26" : has("tipLight") ? "#f4f7f9" : null;
    var back = el("g", {}), front = el("g", {});
    var f, x, y, i;

    if (has("sand")) back.appendChild(el("ellipse", { cx: 160, cy: CY + H + 8, rx: 140, ry: 5, fill: "rgba(255,255,255,.09)" }));

    /* 背びれ */
    function dorsal(d) {
      var xf = X0 + L * d.at, xb = xf + d.w, y1 = top(xf) + 4, y2 = top(xb) + 4;
      var tip = { x: xf + d.w * 0.9, y: Math.min(y1, y2) - 4 - d.h };
      back.appendChild(el("path", { d: P("M", xf, y1, "Q", xf + d.w * 0.45, tip.y + d.h * 0.15, tip.x, tip.y, "Q", xf + d.w * 0.78, y2 - d.h * 0.35, xb, y2, "Z"), fill: finFill }));
      if (tipFill) back.appendChild(tri(tip, lerpPt(tip, { x: xf + d.w * 0.45, y: tip.y + d.h * 0.15 }, 0.75), lerpPt(tip, { x: xb, y: y2 }, 0.34), tipFill));
      if (has("spines")) back.appendChild(el("path", { d: P("M", xf + 1, y1 - 2, "L", xf + d.w * 0.4, tip.y + d.h * 0.42), stroke: "#f1ede4", "stroke-width": 1.6, "stroke-linecap": "round", fill: "none" }));
    }
    dorsal(sp.dorsal);
    if (sp.dorsal2) dorsal(sp.dorsal2);

    /* 腹びれ・しりびれ */
    [[0.64, 16, H * 0.42], [0.82, 11, H * 0.3]].forEach(function (v) {
      var xf = X0 + L * v[0], yb = bottom(xf) - 4;
      back.appendChild(el("path", { d: P("M", xf, yb, "L", xf + v[1] * 0.85, yb + 4 + v[2], "L", xf + v[1] + 4, bottom(xf + v[1] + 4) - 4, "Z"), fill: finFill }));
    });

    /* 尾びれ */
    var t = sp.tail, notch = Math.min(t.ux, t.lx) * 0.35;
    var uTip = { x: xt + t.ux, y: CY - t.uy }, lTip = { x: xt + t.lx, y: CY + t.ly }, nPt = { x: xt + notch, y: CY };
    back.appendChild(el("path", {
      d: P("M", xt - 10, CY - PD - 1, "Q", xt + t.ux * 0.5, CY - t.uy * 0.7, uTip.x, uTip.y,
        "Q", nPt.x + (t.ux - notch) * 0.3, CY - t.uy * 0.25, nPt.x, nPt.y,
        "Q", nPt.x + (t.lx - notch) * 0.3, CY + t.ly * 0.3, lTip.x, lTip.y,
        "Q", xt + t.lx * 0.4, CY + t.ly * 0.75, xt - 10, CY + PD + 1, "Z"),
      fill: finFill
    }));
    if (tipFill) {
      back.appendChild(tri(uTip, lerpPt(uTip, { x: xt, y: CY - PD }, 0.2), lerpPt(uTip, nPt, 0.22), tipFill));
      back.appendChild(tri(lTip, lerpPt(lTip, { x: xt, y: CY + PD }, 0.3), lerpPt(lTip, nPt, 0.3), tipFill));
    }

    /* 頭の飾り（胴の後ろに置くもの） */
    if (has("hammer")) back.appendChild(el("ellipse", { cx: X0 + 5, cy: CY - 1, rx: 8, ry: H * 1.35, fill: sp.top, stroke: line, "stroke-width": 1 }));
    if (has("saw")) { // のこぎりのような鼻先：細長い板、両側の歯、途中から下がるひげ
      var sawL = 56, sx = X0 - sawL;
      for (i = 0; i < 8; i++) {
        x = sx + 4 + i * 6;
        back.appendChild(tri({ x: x, y: CY - 1.5 }, { x: x + 2, y: CY - 6 - (i % 2) * 2 }, { x: x + 4, y: CY - 1.5 }, shade(sp.top, 0.35)));
        back.appendChild(tri({ x: x, y: CY + 2.5 }, { x: x + 2, y: CY + 7 + (i % 2) * 2 }, { x: x + 4, y: CY + 2.5 }, shade(sp.top, 0.35)));
      }
      back.appendChild(el("path", { d: P("M", X0 + L * 0.05, CY - H * 0.35, "L", sx, CY - 1.5, "L", sx, CY + 2.5, "L", X0 + L * 0.05, CY + H * 0.3, "Z"), fill: sp.top, stroke: line, "stroke-width": 1 }));
      [0.5, 0.56].forEach(function (k) {
        back.appendChild(el("path", { d: P("M", sx + sawL * k, CY + 2, "q", -3, 8, -7, 12), stroke: shade(sp.top, -0.2), "stroke-width": 1.6, "stroke-linecap": "round", fill: "none" }));
      });
    }

    /* 胴 */
    var bodyD = P("M", X0, CY, "C", topPts[1].x, topPts[1].y, topPts[2].x, topPts[2].y, topPts[3].x, topPts[3].y,
      "L", botPts[0].x, botPts[0].y, "C", botPts[1].x, botPts[1].y, botPts[2].x, botPts[2].y, botPts[3].x, botPts[3].y, "Z");
    front.appendChild(el("path", { d: bodyD, fill: sp.top, stroke: line, "stroke-width": 1 }));

    /* 腹（明るい色） */
    front.appendChild(el("path", {
      d: P("M", X0, CY, "C", X0 + L * 0.3, CY + H * 0.3, X0 + L * 0.7, CY + H * 0.15, xt, CY + 1,
        "L", botPts[0].x, botPts[0].y, "C", botPts[1].x, botPts[1].y, botPts[2].x, botPts[2].y, botPts[3].x, botPts[3].y, "Z"),
      fill: sp.belly
    }));

    /* ---- 模様 ---- */
    if (has("spots")) { // 白い点（ジンベエザメ）
      for (f = 0.12; f < 0.93; f += 0.065) for (i = 0; i < 4; i++) {
        x = X0 + L * (f + (i % 2) * 0.03);
        if (x > xt - 6) continue;
        y = top(x) + 5 + (CY - 4 - top(x) - 5) * (i / 3);
        if (y < CY - 1) front.appendChild(el("circle", { cx: n(x), cy: n(y), r: 1.8, fill: "#eaf4fb", opacity: 0.85 }));
      }
    }
    if (has("darkDots")) { // 暗い斑点
      for (f = 0.14, i = 0; f < 0.9; f += 0.055, i++) {
        x = X0 + L * f;
        y = top(x) + 4 + (CY - top(x) - 6) * ((i * 7) % 5) / 5;
        if (y < CY - 1) front.appendChild(el("circle", { cx: n(x), cy: n(y), r: 1.5, fill: dark, opacity: 0.7 }));
      }
    }
    if (has("whiteDots")) for (f = 0.3; f < 0.82; f += 0.07) front.appendChild(el("circle", { cx: n(X0 + L * f), cy: n(CY - H * 0.28), r: 1.4, fill: "#f4f7f9", opacity: 0.85 }));
    if (has("bands")) [0.2, 0.36, 0.52, 0.68, 0.84].forEach(function (b) { // 太い帯
      var bx = X0 + L * b, bw = L * 0.05;
      front.appendChild(el("path", { d: P("M", bx, top(bx) + 1, "L", bx + bw, top(bx + bw) + 1, "L", bx + bw - 3, CY + 2, "L", bx - 3, CY + 2, "Z"), fill: shade(sp.top, -0.4), opacity: 0.55 }));
    });
    if (has("stripes")) for (f = 0.3; f < 0.94; f += 0.055) { // 細いしま（イタチザメ）
      x = X0 + L * f;
      front.appendChild(el("path", { d: P("M", x, top(x) + 2, "L", x - 2, CY - 1), stroke: dark, "stroke-width": 2.6, "stroke-linecap": "round", opacity: 0.55, fill: "none" }));
    }
    if (has("blotch")) [0.18, 0.32, 0.47, 0.62, 0.77].forEach(function (b, k) { // まだら
      front.appendChild(el("ellipse", { cx: n(X0 + L * b), cy: n(CY - H * 0.36), rx: n(L * 0.045), ry: n(H * 0.3), fill: shade(sp.top, -0.38), opacity: 0.6 }));
      front.appendChild(el("circle", { cx: n(X0 + L * (b + 0.07)), cy: n(CY - H * (k % 2 ? 0.2 : 0.5)), r: 1.6, fill: shade(sp.top, 0.5), opacity: 0.7 }));
    });
    if (has("bellyBlotch")) for (f = 0.24, i = 0; f < 0.8; f += 0.07, i++) { // おなかの暗い斑点（ネズミザメ）
      x = X0 + L * f; y = CY + (bottom(x) - CY) * (0.45 + (i % 2) * 0.2);
      front.appendChild(el("circle", { cx: n(x), cy: n(y), r: 1.7, fill: sp.top, opacity: 0.55 }));
    }
    if (has("collar")) { // えらのあたりの暗い帯（ダルマザメ）
      x = X0 + L * 0.15;
      front.appendChild(el("path", { d: P("M", x, top(x), "L", x + 8, top(x + 8), "L", x + 8, bottom(x + 8), "L", x, bottom(x), "Z"), fill: "#2a211a", opacity: 0.8 }));
    }
    if (has("glow")) for (f = 0.24; f < 0.86; f += 0.1) { // おなかの光
      x = X0 + L * f; y = CY + (bottom(x) - CY) * 0.6;
      front.appendChild(el("circle", { cx: n(x), cy: n(y), r: 2.6, fill: "#7df9e6", opacity: 0.18 }));
      front.appendChild(el("circle", { cx: n(x), cy: n(y), r: 1, fill: "#b9fff3", opacity: 0.95 }));
    }
    if (has("epaulette")) { // 体の横の大きな黒い斑点（白いふち）
      front.appendChild(el("circle", { cx: n(X0 + L * 0.27), cy: n(CY - H * 0.15), r: n(H * 0.45), fill: "#15151a", stroke: "#f6eedc", "stroke-width": 1.5 }));
    }

    /* ---- 鼻先・口の飾り（胴の手前に置くもの） ---- */
    if (has("blade")) { // 長く平たい鼻先と、前へ出たあご（ミツクリザメ）
      front.appendChild(el("path", { d: P("M", X0 + L * 0.02, CY + H * 0.1, "L", X0 - 7, CY + H * 0.5, "L", X0 + L * 0.1, CY + H * 0.6, "Z"), fill: sp.belly }));
      front.appendChild(el("path", { d: P("M", X0 + L * 0.1, CY - H * 0.78, "L", X0 - 24, CY - H * 0.55, "Q", X0 - 20, CY - H * 0.3, X0 + L * 0.06, CY - H * 0.05, "Z"), fill: sp.top, stroke: line, "stroke-width": 1 }));
    }
    if (has("tassel")) for (i = 0; i < 5; i++) front.appendChild(el("path", { d: P("M", X0 + 1 + i * 5, CY + 3 + i * 1.2, "l", -3, 7), stroke: shade(sp.top, -0.2), "stroke-width": 2, "stroke-linecap": "round", fill: "none" }));
    if (has("barbels")) [2, 7].forEach(function (dx) { // 口元の短いひげ（コモリザメ）
      front.appendChild(el("path", { d: P("M", X0 + dx, CY + 3 + dx * 0.4, "l", -2, 8), stroke: shade(sp.top, -0.25), "stroke-width": 1.8, "stroke-linecap": "round", fill: "none" }));
    });
    if (has("openMouth")) { // 大きく開けた口（ウバザメ）
      front.appendChild(el("ellipse", { cx: n(X0 + L * 0.055), cy: n(CY + H * 0.2), rx: n(L * 0.035), ry: n(H * 0.42), fill: "#231318", stroke: shade(sp.belly, 0.3), "stroke-width": 1.2 }));
    }

    /* えら */
    var gillN = sp.gills || 5, gx = X0 + L * (sp.gillAt || 0.2), gTop = has("bigGills") ? 0.62 : 0.28, gBot = has("bigGills") ? 0.6 : 0.22;
    for (i = 0; i < gillN; i++) front.appendChild(el("path", {
      d: P("M", gx + i * 4, CY - H * gTop, "L", gx + i * 4 + 1.5, CY + H * gBot),
      stroke: has("frill") ? "#c4635d" : shade(sp.top, -0.35), "stroke-width": has("frill") ? 1.6 : 1.2, "stroke-linecap": "round", opacity: 0.75, fill: "none"
    }));

    /* 口 */
    var mx = X0 + L * 0.05, my = CY + (bottom(mx) - CY) * 0.55;
    if (has("bigMouth")) { // 幅の広い口と白っぽいくちびる（メガマウスザメ）
      front.appendChild(el("path", { d: P("M", X0 + 1, CY + H * 0.16, "Q", X0 + L * 0.08, CY + H * 0.5, X0 + L * 0.19, CY + H * 0.4), stroke: "#f2f4f8", "stroke-width": 3, "stroke-linecap": "round", fill: "none" }));
      front.appendChild(el("path", { d: P("M", X0 + 2, CY + H * 0.24, "Q", X0 + L * 0.08, CY + H * 0.58, X0 + L * 0.18, CY + H * 0.48), stroke: "#231318", "stroke-width": 1.4, "stroke-linecap": "round", fill: "none" }));
    } else if (!has("openMouth")) {
      front.appendChild(el("path", { d: P("M", mx, my, "Q", mx + L * 0.04, my + 3, mx + L * 0.09, my + 1), stroke: shade(sp.belly, -0.45), "stroke-width": 1.2, "stroke-linecap": "round", fill: "none" }));
      if (has("teeth")) for (i = 0; i < 5; i++) { // のぞく歯（シロワニ）
        x = mx + 1 + i * 3.2;
        front.appendChild(tri({ x: x, y: my + 1 + i * 0.3 }, { x: x + 1.2, y: my + 4.5 + i * 0.3 }, { x: x + 2.4, y: my + 1.2 + i * 0.3 }, "#ffffff"));
      }
    }

    /* 胸びれ */
    var p = sp.pect, xp = X0 + L * p.at, ry = CY + H * 0.3 * bk, pTip = { x: xp + p.w, y: ry + p.h };
    front.appendChild(el("path", { d: P("M", xp, ry, "Q", xp + p.w * 0.25, ry + p.h * 0.85, pTip.x, pTip.y, "Q", xp + p.w * 0.75, ry + p.h * 0.35, xp + p.w * 0.6 + 6, ry + 2, "Z"), fill: pectFill }));
    if (tipFill) front.appendChild(tri(pTip, lerpPt(pTip, { x: xp + p.w * 0.25, y: ry + p.h * 0.85 }, 0.6), lerpPt(pTip, { x: xp + p.w * 0.75, y: ry + p.h * 0.35 }, 0.45), tipFill));

    /* 目 */
    var eyeR = sp.eyeR || 2.6, eyes = [];
    if (has("hammer")) eyes = [{ x: X0 + 5, y: CY - 1 - H * 1.18 }, { x: X0 + 5, y: CY - 1 + H * 1.18 }];
    else eyes = [{ x: X0 + L * (sp.eyeAt || 0.1), y: CY - H * 0.22 }];
    eyes.forEach(function (e) {
      front.appendChild(el("circle", { cx: n(e.x), cy: n(e.y), r: eyeR, fill: sp.eyeColor || "#0b1220" }));
      front.appendChild(el("circle", { cx: n(e.x - eyeR * 0.3), cy: n(e.y - eyeR * 0.3), r: n(eyeR * 0.32), fill: "#ffffff", opacity: 0.9 }));
    });

    svg.appendChild(back);
    svg.appendChild(front);
    return svg;
  }

  SA.sharks = {
    has: function (code) { return Object.prototype.hasOwnProperty.call(SPECS, code); },
    build: build
  };
})();
