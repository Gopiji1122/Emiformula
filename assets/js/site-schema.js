(function () {
  "use strict";

  function initializeSiteSchema() {
    var siteSchema = window.EMIFORMULA_SITE_SCHEMA || [];

    if (!Array.isArray(siteSchema)) {
      return;
    }

    window.EMIFORMULA_SCHEMA = siteSchema;
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeSiteSchema
    );
  } else {
    initializeSiteSchema();
  }
})();
