/* =========================================================
   EMIFORMULA — STRUCTURED DATA ENGINE
   STEP 3.3
   ========================================================= */

(function () {

  "use strict";


  function getSchemaData() {

    return window.EMIFORMULA_SCHEMA || [];

  }


  function addSchema(schemaObject) {

    if (!schemaObject) {
      return;
    }


    var script =
      document.createElement("script");

    script.type =
      "application/ld+json";


    script.textContent =
      JSON.stringify(
        schemaObject,
        null,
        2
      );


    document.head.appendChild(
      script
    );

  }


  function initialize() {

    var schemas =
      getSchemaData();


    if (!Array.isArray(schemas)) {
      return;
    }


    schemas.forEach(
      function (schema) {

        addSchema(schema);

      }
    );

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
