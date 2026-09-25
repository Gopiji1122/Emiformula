(function () {
  "use strict";

  function initializeCalculatorSchema() {
    var calculatorSchema =
      window.EMIFORMULA_CALCULATOR_SCHEMA || null;

    if (!calculatorSchema) {
      return;
    }

    if (
      typeof calculatorSchema !== "object" ||
      Array.isArray(calculatorSchema)
    ) {
      return;
    }

    var existing =
      Array.isArray(
        window.EMIFORMULA_SCHEMA
      )
        ? window.EMIFORMULA_SCHEMA
        : [];

    window.EMIFORMULA_SCHEMA =
      existing.concat([
        calculatorSchema
      ]);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeCalculatorSchema
    );
  } else {
    initializeCalculatorSchema();
  }
})();
