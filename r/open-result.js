/* Follow the build-time result link. Crawlers can read this page's metadata directly. */
(function () {
  "use strict";
  var link = document.getElementById("open-result");
  if (link) location.replace(link.href);
})();
