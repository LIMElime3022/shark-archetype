/* 画面の演出
 *
 * enter      現れる動き（下から少し上がりながら表示）
 * stagger    並んだ枠を、少しずつずらして現す
 * maskOpen   丸い光が広がって、中から画面が現れる（結果の登場で1回だけ）
 * scramble   文字スクランブル（でたらめな文字から、左から順に確定）
 * countTo    数字のカウントアップ
 * tilt       傾くカード（マウスのときだけ。指で触る画面では傾けない）
 *
 * 「動きを減らす」設定の端末では、どれも動かさず最終の状態をそのまま出す。
 * このファイルを読み込まなくても、診断そのものは動く（js/app.js に代わりがある）。
 */
(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  SA.reduceMotion = !!(mq && mq.matches);
  if (mq && mq.addEventListener) mq.addEventListener("change", function (e) { SA.reduceMotion = e.matches; });

  function replay(el, cls) {
    if (SA.reduceMotion || !el) return;
    el.classList.remove(cls);
    void el.offsetWidth; // いったん外してから付け直すと、動きが最初から始まる
    el.classList.add(cls);
  }

  function enter(el) { replay(el, "fx-in"); }

  function stagger(box) {
    if (!box) return;
    for (var i = 0; i < box.children.length; i++) box.children[i].style.setProperty("--i", String(i));
    replay(box, "fx-stagger");
  }

  function maskOpen(el) {
    if (SA.reduceMotion || !el) return;
    replay(el, "fx-mask");
    el.addEventListener("animationend", function done(e) {
      if (e.target !== el) return;
      el.classList.remove("fx-mask"); // 終わったら外す（切り抜きを残さない）
      el.removeEventListener("animationend", done);
    });
  }

  /* 文字スクランブル：1.2秒で、左から順に正しい文字に確定する */
  var scrambleTimers = new WeakMap();
  function scramble(el, text, pool) {
    if (!el) return;
    if (scrambleTimers.has(el)) clearInterval(scrambleTimers.get(el));
    el.setAttribute("aria-label", text); // 読み上げには、確定した文字だけを伝える
    if (SA.reduceMotion || !pool) { el.textContent = text; return; }
    var chars = Array.from(text), start = performance.now(), DUR = 1200;
    var timer = setInterval(function () {
      var p = Math.min(1, (performance.now() - start) / DUR), fixed = Math.floor(p * chars.length), out = "";
      for (var i = 0; i < chars.length; i++) out += i < fixed ? chars[i] : pool.charAt(Math.floor(Math.random() * pool.length));
      el.textContent = out;
      if (p >= 1) { el.textContent = text; clearInterval(timer); scrambleTimers.delete(el); }
    }, 50);
    scrambleTimers.set(el, timer);
  }

  /* 数字のカウントアップ */
  var countRuns = new WeakMap();
  function countTo(el, from, to, fmt, dur) {
    if (!el) return;
    fmt = fmt || String;
    var id = (countRuns.get(el) || 0) + 1;
    countRuns.set(el, id);
    if (SA.reduceMotion || from === to) { el.textContent = fmt(to); return; }
    var start = performance.now();
    dur = dur || 500;
    (function step(now) {
      if (countRuns.get(el) !== id) return; // 新しい動きが始まったら、古いほうは止める
      var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* 傾くカード：最大8度。マウスのときだけ */
  function tilt(el) {
    if (!el || el.dataset.tilt) return;
    el.dataset.tilt = "1";
    var MAX = 8;
    el.addEventListener("pointermove", function (e) {
      if (SA.reduceMotion || e.pointerType !== "mouse") return;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = "perspective(900px) rotateX(" + (-y * MAX).toFixed(2) + "deg) rotateY(" + (x * MAX).toFixed(2) + "deg)";
    });
    el.addEventListener("pointerleave", function () { el.style.transform = ""; });
  }

  SA.fx = { enter: enter, stagger: stagger, maskOpen: maskOpen, scramble: scramble, countTo: countTo, tilt: tilt };
})();
