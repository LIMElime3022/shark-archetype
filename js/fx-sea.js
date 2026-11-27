/* 背景の演出（海）
 *
 * SA.sea.setDepth(frac)   frac は 0（水面）〜1（深海）
 *   ・地の色を、深さに合わせて変える（CSS の --sea-a / --sea-b）
 *   ・コースティックス（水面から差す光の網）：浅いときだけ。深くなると消し、描くのも止める
 *   ・パーティクル：浅いと泡が上り、深いとマリンスノーが降る
 *
 * 重くならないよう、光の網は粗く（200×125）描いて画面いっぱいに拡大している。
 * 「動きを減らす」設定の端末では、動かさずに止めた絵を1枚だけ描く。
 * このファイルを読み込まなくても、診断そのものは動く。
 */
(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});
  var root = document.documentElement;
  var cCan = document.getElementById("sea-caustics");
  var pCan = document.getElementById("sea-particles");
  if (!cCan || !pCan || !cCan.getContext) { SA.sea = { setDepth: function () {} }; return; }

  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(mq && mq.matches); }

  /* 深さごとの色（上の色・下の色）。間は混ぜる */
  var STOPS = [
    { at: 0, a: [11, 104, 146], b: [8, 74, 124] },
    { at: 0.33, a: [8, 66, 120], b: [6, 42, 92] },
    { at: 0.66, a: [5, 32, 76], b: [4, 18, 50] },
    { at: 1, a: [4, 14, 38], b: [2, 7, 22] }
  ];
  function mix(c1, c2, t) { return "rgb(" + c1.map(function (v, i) { return Math.round(v + (c2[i] - v) * t); }).join(",") + ")"; }
  function colorsAt(f) {
    for (var i = 1; i < STOPS.length; i++) {
      if (f <= STOPS[i].at) {
        var s0 = STOPS[i - 1], s1 = STOPS[i], t = (f - s0.at) / (s1.at - s0.at);
        return { a: mix(s0.a, s1.a, t), b: mix(s0.b, s1.b, t) };
      }
    }
    var last = STOPS[STOPS.length - 1];
    return { a: mix(last.a, last.a, 0), b: mix(last.b, last.b, 0) };
  }

  var target = 0;   // 目標の深さ
  var depth = 0;    // いま描いている深さ（目標へゆっくり近づける）

  /* ---- コースティックス ---- */
  var cCtx = cCan.getContext("2d"), CW = cCan.width, CH = cCan.height;
  var cImg = cCtx.createImageData(CW, CH), lastCaustics = -1e9;
  function causticStrength() { return Math.max(0, Math.min(1, 1 - depth / 0.4)); }
  function drawCaustics(time) {
    var s = causticStrength();
    cCan.style.opacity = (s * 0.4).toFixed(3);
    if (s <= 0.01) return;
    var t = time * 0.00045, data = cImg.data, k = 0, aspect = PH ? PW / PH : 1.6;
    for (var y = 0; y < CH; y++) {
      var Y = y / CH * 9, fade = 1 - (y / CH) * 0.75; // 上（水面側）ほど明るい
      for (var x = 0; x < CW; x++) {
        var X = x / CW * 9 * aspect; // 画面の縦横比に合わせる（縦長の画面で網が伸びないように）
        // 座標をゆらしてから、2方向の波の「谷」を光の線にする
        var u = X + 0.7 * Math.sin(Y * 1.3 + t * 2.0) + 0.3 * Math.sin(Y * 2.9 - t * 1.3);
        var w = Y + 0.7 * Math.sin(X * 1.1 - t * 1.6) + 0.3 * Math.sin(X * 3.1 + t * 1.1);
        var a = Math.abs(Math.sin(u * 1.6 + t * 0.7)), b = Math.abs(Math.sin(w * 1.7 - t * 0.6));
        var m = 1 - Math.min(a, b);
        var v = m * m * m; v = v * v; // 6乗：線のまわりだけを残す
        data[k++] = 205; data[k++] = 255; data[k++] = 244; data[k++] = Math.round(v * fade * 255);
      }
    }
    cCtx.putImageData(cImg, 0, 0);
  }

  /* ---- パーティクル（泡とマリンスノー） ---- */
  var pCtx = pCan.getContext("2d"), PW = 0, PH = 0, dpr = 1, parts = [], seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    PW = window.innerWidth; PH = window.innerHeight;
    pCan.width = Math.round(PW * dpr); pCan.height = Math.round(PH * dpr);
    pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var want = Math.max(28, Math.min(70, Math.round(PW * PH / 15000)));
    while (parts.length < want) parts.push({ x: rnd(), y: rnd(), r: rnd(), th: rnd() * 0.8, ph: rnd() * 6.28, sw: 0.4 + rnd() * 0.8 });
    parts.length = want;
  }
  function drawParticles(dt, time) {
    pCtx.clearRect(0, 0, PW, PH);
    pCtx.lineWidth = 1;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], bubble = depth < p.th; // 粒ごとに、泡から雪へ切り替わる深さが違う
      var size = bubble ? 2 + p.r * 3.5 : 0.8 + p.r * 1.2;
      var vy = bubble ? -(14 + p.r * 22) : 5 + p.r * 9; // 泡は上へ、雪は下へ（1秒あたりの px）
      p.y += vy * dt / PH;
      if (p.y < -0.03) { p.y = 1.03; p.x = rnd(); }
      if (p.y > 1.03) { p.y = -0.03; p.x = rnd(); }
      var X = p.x * PW + Math.sin(time * 0.001 * p.sw + p.ph) * (bubble ? 7 : 4), Y = p.y * PH;
      pCtx.beginPath();
      pCtx.arc(X, Y, size, 0, 6.2832);
      if (bubble) { pCtx.strokeStyle = "rgba(225,246,255,.42)"; pCtx.stroke(); }
      else { pCtx.fillStyle = "rgba(214,232,244," + (0.28 + p.r * 0.3).toFixed(2) + ")"; pCtx.fill(); }
    }
  }

  /* ---- まわす ---- */
  var raf = 0, prev = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - prev) / 1000 || 0);
    prev = now;
    depth += (target - depth) * Math.min(1, dt * 2.2);
    if (now - lastCaustics > 50) { lastCaustics = now; drawCaustics(now); } // 光の網は1秒に20回まで
    drawParticles(dt, now);
  }
  function drawStill() { depth = target; drawCaustics(4000); drawParticles(0, 0); }
  function start() {
    cancelAnimationFrame(raf); raf = 0;
    if (reduced() || document.hidden) { drawStill(); return; }
    prev = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function setDepth(frac) {
    target = Math.max(0, Math.min(1, Number(frac) || 0));
    var c = colorsAt(target);
    root.style.setProperty("--sea-a", c.a);
    root.style.setProperty("--sea-b", c.b);
    if (!raf) drawStill();
  }

  window.addEventListener("resize", function () { resize(); if (!raf) drawStill(); });
  document.addEventListener("visibilitychange", start); // 見えていない間は止める
  if (mq && mq.addEventListener) mq.addEventListener("change", start);

  resize();
  start();
  SA.sea = { setDepth: setDepth };
})();
