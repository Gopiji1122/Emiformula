(function () {
  "use strict";

  var registry = {

    "emi-calculator": {
      id: "emi-calculator",
      name: "EMI Calculator",
      category: "Loan Calculators",
      url: "/calculators/emi-calculator.html",
      status: "active"
    }

  };

  window.EMIFORMULA_CALCULATOR_REGISTRY =
    Object.freeze(registry);
  window.EMIFORMULA_GET_CALCULATOR =
    function (calculatorId) {

      return registry[calculatorId] || null;

    };
})();
