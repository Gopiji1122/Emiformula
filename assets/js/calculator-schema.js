(function () {
  "use strict";

  function getCalculatorSchema() {
    return window.EMIFORMULA_CALCULATOR_SCHEMA || null;
  }

  function addSchema(schemaObject) {
    if (!schemaObject) return;

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaObject, null, 2);

    document.head.appendChild(script);
  }

  function initialize() {
    var schema = getCalculatorSchema();

    if (!schema) return;

    addSchema(schema);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
