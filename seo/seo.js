/* =========================================================
   EMIFORMULA — CORE SEO ENGINE
   STEP 1.10 — COMPLETE FOUNDATION
   ========================================================= */

(function () {
  "use strict";


  function getSiteSeo() {

    return window.EMIFORMULA_SEO || {

      defaultTitle:
        "EMIFORMULA",

      defaultDescription:
        "EMI and loan calculation tools.",

      defaultRobots:
        "index, follow",

      siteType:
        "WebSite",

      defaultOgType:
        "website"

    };

  }


  function getPageSeo() {

    return window.EMIFORMULA_PAGE_SEO || {};

  }


  function getMetaByName(name) {

    return document.querySelector(
      'meta[name="' + name + '"]'
    );

  }


  function getMetaByProperty(property) {

    return document.querySelector(
      'meta[property="' + property + '"]'
    );

  }


  function createMetaByName(name) {

    var meta =
      document.createElement("meta");

    meta.setAttribute(
      "name",
      name
    );

    document.head.appendChild(meta);

    return meta;

  }


  function createMetaByProperty(property) {

    var meta =
      document.createElement("meta");

    meta.setAttribute(
      "property",
      property
    );

    document.head.appendChild(meta);

    return meta;

  }


  function setMetaByName(
    name,
    content
  ) {

    if (!content) {
      return;
    }

    var meta =
      getMetaByName(name);

    if (!meta) {

      meta =
        createMetaByName(name);

    }

    meta.setAttribute(
      "content",
      content
    );

  }


  function setMetaByProperty(
    property,
    content
  ) {

    if (!content) {
      return;
    }

    var meta =
      getMetaByProperty(property);

    if (!meta) {

      meta =
        createMetaByProperty(property);

    }

    meta.setAttribute(
      "content",
      content
    );

  }


  function getTitle() {

    var siteSeo =
      getSiteSeo();

    var pageSeo =
      getPageSeo();

    var title =
      pageSeo.title ||
      document.title ||
      siteSeo.defaultTitle;

    return title.trim();

  }


  function getDescription() {

    var siteSeo =
      getSiteSeo();

    var pageSeo =
      getPageSeo();

    return (
      pageSeo.description ||
      siteSeo.defaultDescription
    ).trim();

  }


  function getRobots() {

    var siteSeo =
      getSiteSeo();

    var pageSeo =
      getPageSeo();

    return (
      pageSeo.robots ||
      siteSeo.defaultRobots
    ).trim();

  }


  function setTitle() {

    var title =
      getTitle();

    document.title =
      title;

  }


  function setBasicMeta() {

    setMetaByName(
      "description",
      getDescription()
    );

    setMetaByName(
      "robots",
      getRobots()
    );

  }


  function setOpenGraph() {

    var siteSeo =
      getSiteSeo();

    var pageSeo =
      getPageSeo();

    var title =
      getTitle();

    var description =
      getDescription();

    var ogType =
      pageSeo.ogType ||
      siteSeo.defaultOgType ||
      "website";


    setMetaByProperty(
      "og:title",
      title
    );

    setMetaByProperty(
      "og:description",
      description
    );

    setMetaByProperty(
      "og:type",
      ogType
    );

    if (pageSeo.ogImage) {

      setMetaByProperty(
        "og:image",
        pageSeo.ogImage
      );

    }

  }

  function setCanonical() {

    var config =
      window.EMIFORMULA_CONFIG;

    var pageSeo =
      getPageSeo();


    if (
      !config ||
      !config.baseUrl
    ) {
      return;
    }


    if (
      pageSeo.canonical ===
      false
    ) {
      return;
    }


    var baseUrl =
      config.baseUrl
        .replace(/\/+$/, "");


    var pathPrefix =
      config.pathPrefix || "";


    pathPrefix =
      "/" +
      pathPrefix
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");


    var path =
      window.location.pathname;


    if (
      pathPrefix !== "/" &&
      path.indexOf(pathPrefix) === 0
    ) {

      path =
        path.substring(
          pathPrefix.length
        );

    }


    if (!path) {
      path = "/";
    }


    if (
      path.charAt(0) !== "/"
    ) {
      path =
        "/" + path;
    }


    var canonicalUrl =
      baseUrl +
      path;


    var canonical =
      document.querySelector(
        'link[rel="canonical"]'
      );


    if (!canonical) {

      canonical =
        document.createElement(
          "link"
        );

      canonical.setAttribute(
        "rel",
        "canonical"
      );

      document.head.appendChild(
        canonical
      );

    }


    canonical.setAttribute(
      "href",
      canonicalUrl
    );

  }


  function initialize() {

    setTitle();

    setBasicMeta();

    setOpenGraph();

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
