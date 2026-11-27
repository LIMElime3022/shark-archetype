/* 共有先は診断トップ。診断結果は投稿文と画像に含める。 */
(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});

  var X_INTENT = "https://x.com/intent/tweet";
  var X_LIMIT = 280;
  function cfg(c) { return c || SA.config || {}; }
  function siteUrl(c) {
    try {
      var configured = cfg(c).SITE_URL;
      var base = configured ? new URL(configured) : !c && typeof location !== "undefined" ? new URL(".", location.href) : null;
      if (!base || ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)) return "";
      if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) return "";
      return base.href.replace(/\/?$/, "/");
    } catch (e) { return ""; }
  }

  function fill(tpl, t) {
    return String(tpl || "").replace(/\{(shark|persona|label|code)\}/g, function (all, k) { return (t && t[k]) || ""; });
  }
  function shareText(t, c) { return fill(cfg(c).SHARE_TEXT, t); }

  function shareUrl(code, c) {
    var base = siteUrl(c);
    return base && SA.engine.isValidCode(code) ? base : null;
  }

  function hashtags(c) {
    var h = cfg(c).SHARE_HASHTAGS;
    return Array.isArray(h) ? h.filter(function (x) { return typeof x === "string" && /^[^\s#,]+$/.test(x); }) : [];
  }

  function xIntentUrl(text, url, tags) {
    var q = "text=" + encodeURIComponent(text);
    if (url) q += "&url=" + encodeURIComponent(url);
    if (tags && tags.length) q += "&hashtags=" + encodeURIComponent(tags.join(","));
    return X_INTENT + "?" + q;
  }

  /* X の文字数の目安：英数字などは1字を1、日本語などは1字を2、アドレスは長さによらず23として数える */
  function xWeight(s) {
    var n = 0;
    Array.from(String(s)).forEach(function (ch) {
      var c = ch.codePointAt(0);
      n += (c <= 0x10FF || (c >= 0x2000 && c <= 0x200D) || (c >= 0x2010 && c <= 0x201F) || (c >= 0x2032 && c <= 0x2037)) ? 1 : 2;
    });
    return n;
  }
  function xLength(text, tags) {
    var n = xWeight(text) + 1 + 23;
    (tags || []).forEach(function (tg) { n += 1 + xWeight("#" + tg); });
    return n;
  }

  /* ---------------- ここから下は画面（index.html）の部分 ---------------- */

  var current = null, bound = false, toastTimer = 0;
  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    var el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
  }

  function legacyCopy(s) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea"), ok = false;
      ta.value = s;
      ta.setAttribute("readonly", "");
      ta.className = "copy-buffer";
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      if (ok) resolve(); else reject(new Error("copy failed"));
    });
  }
  function copyText(s) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(s).catch(function () { return legacyCopy(s); });
    }
    return legacyCopy(s);
  }

  function onCopy() {
    if (!current) return;
    copyText(shareUrl(current.code)).then(function () {
      toast("リンクをコピーしました");
    }, function () { toast("コピーできませんでした"); });
  }

  function onImage() {
    if (!current || !SA.shareCard) return;
    SA.shareCard.download(current.code).then(function (r) {
      toast(r === "ok" ? "共有カードの保存を開始しました" : "画像を保存できませんでした");
    });
  }

  async function prepareFile(result) {
    var button = $("btn-share-x");
    button.disabled = false;
    if (!navigator.share || !navigator.canShare || typeof File === "undefined" || !SA.shareCard?.imageFile) return;
    button.disabled = true;
    // A slow card download must not leave the X composer inaccessible.
    function enableButton() { if (current === result) button.disabled = false; }
    var timeout = setTimeout(enableButton, 5000);
    try {
      var file = await SA.shareCard.imageFile(result.code);
      if (!file || current !== result) return;
      var parts = [shareText(result.type), hashtags().map(function (tag) { return "#" + tag; }).join(" "), shareUrl(result.code)];
      var data = { files: [file], text: parts.filter(Boolean).join("\n") };
      if (navigator.canShare(data)) result.fileShare = data;
    } catch (e) {
      // The X composer also works without a prepared file.
    } finally {
      clearTimeout(timeout);
      enableButton();
    }
  }

  async function onShareX() {
    var result = current;
    if (!result) return;
    if (!result.fileShare) {
      window.open(result.xIntent, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      await navigator.share(result.fileShare);
    } catch (e) {
      if (e.name === "AbortError" || result !== current) return;
      result.fileShare = null;
      toast("画像を共有できませんでした。もう一度押すとXの投稿画面を開きます。");
    }
  }

  function bind() {
    if (bound) return;
    bound = true;
    $("btn-share-copy").addEventListener("click", onCopy);
    $("btn-share-image").addEventListener("click", onImage);
    $("btn-share-x").addEventListener("click", onShareX);
  }

  /* 結果画面から呼ばれる */
  function render(code, type) {
    if (typeof document === "undefined" || !$("share")) return;
    bind();
    current = SA.engine && SA.engine.isValidCode(code) && type ? { code: code, type: type } : null;
    var url = current && shareUrl(code);
    $("share").hidden = !current;
    if (!current) return;
    current.xIntent = xIntentUrl(shareText(type), url, hashtags());
    prepareFile(current);
    $("btn-share-copy").hidden = !url;
    $("share-note").hidden = !!url;
  }

  SA.share = {
    render: render, shareText: shareText, shareUrl: shareUrl, hashtags: hashtags,
    xIntentUrl: xIntentUrl, xLength: xLength, siteUrl: siteUrl, X_LIMIT: X_LIMIT
  };
})();
