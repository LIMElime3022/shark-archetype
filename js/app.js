/* 画面の制御（開始 → 質問 → 結果）
 *
 * 演出（js/fx-sea.js・js/fx-ui.js）が無くても、診断は最後まで動く。
 * 画面に入れる文字は、すべて textContent で入れる。
 */
(function () {
  "use strict";
  var SA = window.SharkArchetype;
  var axes = SA.axes, questions = SA.questions, choices = SA.choices, engine = SA.engine;
  var N = questions.length, MAX_DEPTH = 1200;

  function $(id) { return document.getElementById(id); }
  function noop() {}
  function make(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* 演出が読み込めていないときの代わり（動きなしで最終の状態にする） */
  var fx = SA.fx || {
    enter: noop, stagger: noop, maskOpen: noop, tilt: noop,
    scramble: function (el, text) { el.textContent = text; },
    countTo: function (el, from, to, fmt) { el.textContent = fmt ? fmt(to) : String(to); }
  };
  var sea = SA.sea || { setDepth: noop };

  var views = { start: $("v-start"), quiz: $("v-quiz"), result: $("v-result") };
  var gauge = $("gauge");
  var state = { answers: [], idx: 0, busy: false, depth: 0 };
  var BASE_TITLE = document.title;

  function show(name) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
    gauge.hidden = name !== "quiz";
    document.body.dataset.view = name;
    if (sea.setActive) sea.setActive(name === "quiz");
    window.scrollTo(0, 0);
  }

  /* ---- 深さ ---- */
  function depthAt(i) { return Math.round(MAX_DEPTH * Math.pow(i / (N - 1), 1.5) / 10) * 10; }
  function zoneOf(m) {
    if (m < 200) return "表層 — 光の届く海";
    if (m < 1000) return "中深層 — 薄明の海";
    return "漸深層 — 光の届かない海";
  }

  /* ---- 開始 ---- */
  function goStart() {
    state.answers = []; state.idx = 0; state.busy = false; state.depth = 0;
    document.title = BASE_TITLE;
    clearHash();
    sea.setDepth(0);
    show("start");
    fx.enter(views.start);
  }

  /* ---- 質問 ---- */
  var optButtons = [], answerTimer = 0;
  function buildOptions() {
    var box = $("options");
    choices.forEach(function (c, i) {
      var b = make("button", "opt");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.appendChild(make("span", "opt-label", c.label));
      var key = make("span", "opt-key", String(i + 1));
      key.setAttribute("aria-hidden", "true");
      b.appendChild(key);
      b.addEventListener("click", function () { answer(c.value); });
      box.appendChild(b);
      optButtons.push({ el: b, value: c.value });
    });
    $("q-total").textContent = String(N);
  }

  function renderQuestion(animate) {
    var i = state.idx, q = questions[i], cur = state.answers[i];
    $("q-num").textContent = String(i + 1);
    $("q-text").textContent = q.text;
    optButtons.forEach(function (o) { o.el.setAttribute("aria-pressed", o.value === cur ? "true" : "false"); });
    $("btn-back").disabled = i === 0;

    var d = depthAt(i);
    fx.countTo($("depth-num"), state.depth, d, String);
    state.depth = d;
    $("depth-zone").textContent = zoneOf(d);
    gauge.style.setProperty("--p", String(i / (N - 1)));
    sea.setDepth(i / (N - 1));

    if (animate) fx.enter($("q-body"));
    state.busy = false;
  }

  function startQuiz() {
    state.answers = []; state.idx = 0; state.depth = 0;
    clearHash();
    show("quiz");
    fx.enter(views.quiz);
    renderQuestion(false);
    $("q-text").focus({ preventScroll: true });
  }

  function answer(value) {
    if (state.busy || views.quiz.hidden) return;
    state.busy = true;
    state.answers[state.idx] = value;
    optButtons.forEach(function (o) { o.el.setAttribute("aria-pressed", o.value === value ? "true" : "false"); });
    // 選んだ印を一瞬見せてから次へ（動きを減らす設定なら待たない）
    answerTimer = setTimeout(function () {
      if (state.idx + 1 >= N) { finish(); return; }
      state.idx += 1;
      renderQuestion(true);
      $("q-text").focus({ preventScroll: true });
    }, SA.reduceMotion ? 0 : 230);
  }

  function back() {
    if (state.busy || state.idx === 0) return;
    state.idx -= 1;
    renderQuestion(true);
    $("q-text").focus({ preventScroll: true });
  }

  function finish() {
    var result = engine.score(state.answers);
    setHash(result.code);
    showResult(result.code, result, true);
  }

  /* ---- 結果 ---- */
  function fillList(id, items) {
    var ul = $(id);
    ul.textContent = "";
    items.forEach(function (t) { ul.appendChild(make("li", "", t)); });
  }

  function renderAxes(code, result) {
    var box = $("r-axes"), marks = [];
    box.textContent = "";
    axes.forEach(function (ax, i) {
      var isA = code.charAt(i) === ax.a.code;
      var d = result ? result.axes[i] : null;
      var pos = d ? 1 - d.towardA : (isA ? 0.25 : 0.75); // 極 a が左、極 b が右

      // 1行の作り： 何が分かるか（見出し）｜ 極 a と説明 ― 目盛り ― 極 b と説明 ｜ 読み取り
      var row = make("div", "axis");
      var title = make("p", "axis-title");
      title.appendChild(make("span", "axis-no mono", String(i + 1)));
      title.appendChild(make("span", "axis-label", ax.label));
      row.appendChild(title);

      var body = make("div", "axis-body");
      [[ax.a, isA, "pole-a"], [ax.b, !isA, "pole-b"]].forEach(function (p, k) {
        var box = make("div", "pole-box " + p[2] + (p[1] ? " is-on" : ""));
        box.appendChild(make("b", "pole", p[0].name));
        box.appendChild(make("span", "pole-hint", p[0].hint));
        if (k === 1) {
          var tr = make("div", "axis-track");
          tr.appendChild(make("div", "axis-mark"));
          body.appendChild(tr);
        }
        body.appendChild(box);
      });
      var track = body.querySelector(".axis-track");
      row.appendChild(body);

      var read = make("p", "axis-read");
      read.appendChild(make("b", "", isA ? ax.a.name : ax.b.name));
      read.appendChild(document.createTextNode(" 寄り"));
      if (d) {
        var pct = Math.round(d.strength * 100);
        var num = make("span", "mono", "0");
        read.appendChild(document.createTextNode(" "));
        read.appendChild(num);
        read.appendChild(document.createTextNode("%" + (pct < 55 ? "（僅差）" : "")));
        fx.countTo(num, 50, pct, String, 900);
      }
      row.appendChild(read);
      box.appendChild(row);
      marks.push({ track: track, pos: pos });
    });
    $("r-axes-note").hidden = !!result;

    // まず中央に置き、次の描画で本来の位置へ動かす
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        marks.forEach(function (m) { m.track.style.setProperty("--pos", String(m.pos)); });
      });
    });
  }

  function putShark(id, code, label, decorative) {
    var box = $(id);
    box.textContent = "";
    if (!SA.sharkArt) return;
    // 画像（js/shark-images.js の表）があれば画像、無ければ仮の絵が返ってくる
    var art = SA.sharkArt.build(code, { label: label, decorative: !!decorative });
    if (art) box.appendChild(art);
  }

  function showResult(code, result, withReveal) {
    var t = SA.typeByCode[code];
    if (!t) { goStart(); return; }

    document.title = t.shark + "タイプ（" + t.label + "）| サメ性格診断";
    putShark("r-shark", code, t.shark, false);
    $("r-persona").textContent = t.persona;
    $("r-title").textContent = t.title;
    $("r-desc").textContent = t.desc;
    $("r-eco").textContent = t.eco;
    $("r-place").textContent = t.place;
    $("r-size").textContent = t.size;
    $("r-food").textContent = t.food;
    fillList("r-strengths", t.strengths);
    fillList("r-cautions", t.cautions);

    // 出会った場所と海の深さは、そのサメがすむ場所に合わせる（性格の軸とは別）
    $("r-zone").textContent = t.place;
    sea.setDepth(typeof t.sea === "number" ? t.sea : 0.3);

    var buddyCode = engine.buddyOf(code), buddy = buddyCode && SA.typeByCode[buddyCode];
    if (buddy) {
      putShark("r-buddy-shark", buddyCode, buddy.shark, true);
      $("r-buddy-title").textContent = buddy.persona;
      $("r-buddy-name").textContent = buddy.shark + "タイプ";
    }

    $("btn-retry").textContent = result ? "もう一度診断する" : "自分も診断する";
    show("result");
    renderAxes(code, result);
    renderShare(code, t);

    if (withReveal) fx.maskOpen(views.result);
    fx.stagger($("r-bento"));
    fx.scramble($("r-code"), code, axes.map(function (a) { return a.a.code + a.b.code; }).join(""));
    fx.scramble($("r-name"), t.shark, "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン");

    $("r-heading").focus({ preventScroll: true });
  }

  /* ---- 共有 ---- */
  function renderShare(code, type) {
    if (SA.share) SA.share.render(code, type);
    else $("share").hidden = true;
  }

  /* ---- アドレスの # ---- */
  function setHash(code) {
    try { history.replaceState(null, "", "#r=" + code); } catch (e) { /* file:// で失敗しても診断は続ける */ }
  }
  function clearHash() {
    if (!location.hash) return;
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* 同上 */ }
  }
  function openFromHash() {
    var code = engine.codeFromHash(location.hash); // 知っているコード以外は null
    if (!code) return false;
    state.busy = false;
    clearTimeout(answerTimer);
    showResult(code, null, false);
    return true;
  }

  /* ---- 始める ---- */
  buildOptions();
  $("btn-start").addEventListener("click", startQuiz);
  $("btn-back").addEventListener("click", back);
  $("btn-retry").addEventListener("click", startQuiz);

  document.addEventListener("keydown", function (e) {
    if (document.querySelector("dialog[open]") || e.repeat || views.quiz.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = Number(e.key);
    if (k >= 1 && k <= choices.length) { e.preventDefault(); answer(choices[k - 1].value); }
  });
  window.addEventListener("hashchange", function () { if (!openFromHash() && !views.result.hidden) goStart(); });

  if (!openFromHash()) { sea.setDepth(0); fx.enter(views.start); }
})();
