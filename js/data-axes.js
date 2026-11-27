/* 5つの軸の定義
 *
 * 点数は「プラス＝極 a 寄り」「マイナス＝極 b 寄り」。
 * fallback は、全問「どちらでもない」で決め手が無いときに採る極。
 * code（1文字）を5つ並べたものがタイプのコードになる（例 SDLAR）。
 * 軸の順番を変えると、タイプのコード（js/data-types.js・js/sharks-svg.js）も変わるので注意。
 */
(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});

  SA.axes = [
    {
      id: "social",
      label: "人との関わり方",
      a: { code: "G", name: "群れ", hint: "誰かと一緒に動く" },
      b: { code: "S", name: "単独", hint: "一人で動く" },
      fallback: "a"
    },
    {
      id: "mood",
      label: "気持ちのあらわれ方",
      a: { code: "H", name: "表層", hint: "陽気・気持ちが表に出る" },
      b: { code: "D", name: "深海", hint: "沈着・気持ちを内に秘める" },
      fallback: "a"
    },
    {
      id: "sense",
      label: "ものの見方",
      a: { code: "E", name: "目", hint: "見えるもの・確かなものを頼る" },
      b: { code: "L", name: "第六感", hint: "見えない仕組みや意味を探る" },
      fallback: "a"
    },
    {
      id: "action",
      label: "動き方",
      a: { code: "C", name: "追跡", hint: "すぐ動く" },
      b: { code: "A", name: "待ち伏せ", hint: "見極めてから動く" },
      fallback: "b"
    },
    {
      id: "range",
      label: "居場所",
      a: { code: "M", name: "回遊", hint: "変化を求める" },
      b: { code: "R", name: "定住", hint: "安定を大事にする" },
      fallback: "a"
    }
  ];

  /* 回答の選択肢（上から順に表示）。value は −2〜+2。 */
  SA.choices = [
    { value: 2, label: "とてもそう思う" },
    { value: 1, label: "ややそう思う" },
    { value: 0, label: "どちらでもない" },
    { value: -1, label: "あまりそう思わない" },
    { value: -2, label: "まったくそう思わない" }
  ];
})();
