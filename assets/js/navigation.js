/* =========================================================
   EMIFORMULA — GLOBAL NAVIGATION SYSTEM
   STEP 1.11 — URL CONFIGURATION
   ========================================================= */

(function () {
  "use strict";


  function getConfig() {

    return window.EMIFORMULA_CONFIG || {};

  }


  function getSiteRoot() {

    var config =
      getConfig();


    /*
      If a complete public base URL is configured,
      use it.
    */

    if (config.baseUrl) {

      return config.baseUrl
        .replace(/\/+$/, "");

    }


    /*
      Otherwise use the current origin plus
      the configured GitHub Pages path.
    */

    var pathPrefix =
      config.pathPrefix || "";


    pathPrefix =
      "/" +
      pathPrefix
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");


    /*
      If pathPrefix is empty, homepage is
      simply the current origin.
    */

    if (
      pathPrefix === "/"
    ) {

      return window.location.origin;

    }


    return (
      window.location.origin +
      pathPrefix
    );

  }


  function getHomeUrl() {

    return (
      getSiteRoot() +
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


    if (
      !window.MutationObserver
    ) {

      return;

    }


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
