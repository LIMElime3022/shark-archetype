/* 採点ロジック（画面に依存しない。軸の数は SA.axes に合わせる）
 *
 * SA.engine.score(answers)     回答（−2〜+2 の配列）→ コードと各軸の傾き
 * SA.engine.isValidCode(code)  知っているコードか
 * SA.engine.codeFromHash(hash) アドレスの「#r=XXXXX」→ コード（不正なら null）
 * SA.engine.buddyOf(code)      相性のいい相棒のコード
 */
(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});

  function clampAnswer(v) {
    if (typeof v !== "number" || !isFinite(v)) return 0; // 未回答・不正な値は「どちらでもない」扱い
    v = Math.round(v);
    return v > 2 ? 2 : v < -2 ? -2 : v;
  }

  function score(answers) {
    var axes = SA.axes, n = axes.length, i;
    var totals = [], counts = [], last = [];
    for (i = 0; i < n; i++) { totals.push(0); counts.push(0); last.push(0); }
    answers = answers || [];

    SA.questions.forEach(function (q, qi) {
      var s = clampAnswer(answers[qi]) * q.dir; // 逆向きの質問はここで反転
      totals[q.axis] += s;
      counts[q.axis] += 1;
      if (s !== 0) last[q.axis] = s; // 同点のときの決め手：最後に傾けた回答
    });

    var code = "", detail = [];
    for (i = 0; i < n; i++) {
      var isA;
      if (totals[i] !== 0) isA = totals[i] > 0;
      else if (last[i] !== 0) isA = last[i] > 0;
      else isA = axes[i].fallback === "a";

      var max = counts[i] * 2;
      var towardA = max ? (totals[i] + max) / (2 * max) : 0.5; // 0（完全に b）〜1（完全に a）
      code += isA ? axes[i].a.code : axes[i].b.code;
      detail.push({
        isA: isA,
        total: totals[i],
        towardA: towardA,
        strength: Math.max(towardA, 1 - towardA) // 選ばれた極への寄り具合（0.5〜1）
      });
    }
    return { code: code, axes: detail };
  }

  function isValidCode(code) {
    return typeof code === "string" && code.length === SA.axes.length && /^[A-Z]+$/.test(code) && !!SA.typeByCode[code];
  }

  function codeFromHash(hash) {
    var m = /^#r=([A-Za-z]{1,12})$/.exec(String(hash || ""));
    if (!m) return null;
    var code = m[1].toUpperCase();
    return isValidCode(code) ? code : null;
  }

  /* 相棒：人との関わり方と動き方が逆のタイプ。互いの苦手を補う組み合わせ。 */
  var BUDDY_FLIP = { social: true, action: true };
  function buddyOf(code) {
    if (!isValidCode(code)) return null;
    var out = "";
    for (var i = 0; i < SA.axes.length; i++) {
      var ax = SA.axes[i], ch = code.charAt(i);
      if (BUDDY_FLIP[ax.id] === true) out += ch === ax.a.code ? ax.b.code : ax.a.code;
      else out += ch;
    }
    return isValidCode(out) ? out : null;
  }

  SA.engine = { score: score, isValidCode: isValidCode, codeFromHash: codeFromHash, buddyOf: buddyOf };
})();
