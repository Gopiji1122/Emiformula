/* =========================================================
   EMIFORMULA — GLOBAL NAVIGATION SYSTEM
   STEP 1.8 — PERMANENT HOME NAVIGATION
   ========================================================= */

(function () {
  "use strict";

  function getHomeUrl() {

    var path =
      window.location.pathname;

    var marker =
      "/Emiformula/";

    var position =
      path.indexOf(marker);

    if (position !== -1) {

      return (
        window.location.origin +
        marker
      );

    }

    return (
      window.location.origin +
      "/"
    );
  }


  function fixHomeLinks() {

    var homeUrl =
      getHomeUrl();

    document
      .querySelectorAll(
        'a[href="./"]'
      )
      .forEach(function (link) {

        link.setAttribute(
          "href",
          homeUrl
        );

      });

  }


  function start() {

    fixHomeLinks();


    var observer =
      new MutationObserver(
        function () {

          fixHomeLinks();

        }
      );


    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();

  }

})();
