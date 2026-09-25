(function () {
  "use strict";

  var registry = {

    "emi-calculator": {
      id: "emi-calculator",
      name: "EMI Calculator",
      category: "EMI",
      description:
        "Calculate monthly EMI, total interest, total payment and loan repayment details.",
      url: "/calculators/emi-calculator.html",
      status: "active"
    },

    "personal-loan-calculator": {
      id: "personal-loan-calculator",
      name: "Personal Loan Calculator",
      category: "Loan",
      description:
        "Calculate personal loan EMI, total interest, total payment and repayment details.",
      url: "/calculators/personal-loan-calculator.html",
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
