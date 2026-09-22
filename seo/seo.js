/* =========================================================
   EMIFORMULA — CORE SEO ENGINE
   STEP 1.10
   ========================================================= */

(function () {
  "use strict";


  function getConfig() {

    if (
      window.EMIFORMULA_SEO
    ) {

      return window.EMIFORMULA_SEO;

    }


    return {

      defaultTitle:
        "EMIFORMULA",

      defaultDescription:
        "EMI and loan calculation tools.",

      defaultRobots:
        "index, follow"

    };

  }


  function getMeta(
    name
  ) {

    return document.querySelector(
      'meta[name="' +
      name +
      '"]'
    );

  }


  function createMeta(
    name
  ) {

    var meta =
      document.createElement(
        "meta"
      );

    meta.setAttribute(
      "name",
      name
    );

    document.head.appendChild(
      meta
    );

    return meta;

  }


  function setMeta(
    name,
    content
  ) {

    if (!content) {
      return;
    }


    var meta =
      getMeta(name);


    if (!meta) {

      meta =
        createMeta(name);

    }


    meta.setAttribute(
      "content",
      content
    );

  }


  function getCanonical() {

    return document.querySelector(
      'link[rel="canonical"]'
    );

  }


  function createCanonical() {

    var link =
      document.createElement(
        "link"
      );

    link.setAttribute(
      "rel",
      "canonical"
    );

    document.head.appendChild(
      link
    );

    return link;

  }


  function setCanonical() {

    /*
      Do not create a canonical URL
      while the site's public domain
      is not configured.
    */

    var config =
      window.EMIFORMULA_CONFIG;


    if (
      !config ||
      !config.baseUrl
    ) {

      return;

    }


    var baseUrl =
      config.baseUrl
        .replace(/\/+$/, "");


    var path =
      window.location.pathname;


    var canonicalUrl =
      baseUrl +
      path;


    var canonical =
      getCanonical();


    if (!canonical) {

      canonical =
        createCanonical();

    }


    canonical.setAttribute(
      "href",
      canonicalUrl
    );

  }


  function setTitle() {

    var config =
      getConfig();


    var currentTitle =
      document.title.trim();


    if (
      !currentTitle ||
      currentTitle ===
      "Page Title"
    ) {

      document.title =
        config.defaultTitle;

    }

  }


  function initialize() {

    var config =
      getConfig();


    setTitle();


    setMeta(
      "description",
      config.defaultDescription
    );


    setMeta(
      "robots",
      config.defaultRobots
    );


    setCanonical();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();

  }

})();
