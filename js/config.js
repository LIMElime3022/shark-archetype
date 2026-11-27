(function () {
  "use strict";
  var SA = (window.SharkArchetype = window.SharkArchetype || {});
  var publicSite = "https://same-shindan.pages.dev/";
  var oldEntry = typeof location !== "undefined" && location.hostname.endsWith(".github.io")
    && /^\/shark-archetype\/(?:index\.html)?$/.test(location.pathname);
  if (oldEntry) {
    var result = /^#r=[GS][HD][EL][AC][MR]$/i.test(location.hash) ? location.hash : "";
    location.replace(publicSite + result);
  }
  SA.config = {
    SITE_URL: typeof location !== "undefined" && location.protocol === "https:" ? publicSite : "",
    SHARE_TEXT: "わたしに似たサメは「{shark}」でした。\n{persona}",
    SHARE_HASHTAGS: ["サメ性格診断"]
  };
})();
