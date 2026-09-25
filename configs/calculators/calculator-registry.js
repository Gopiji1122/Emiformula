(function () {
  "use strict";
  var registry = {
    "emi-calculator": {
      id:"emi-calculator", name:"EMI Calculator", category:"EMI Calculators",
      description:"Calculate monthly EMI, total interest, total payment and loan repayment details.",
      url:"/Emiformula/calculators/emi-calculator.html", status:"active"
    },
    "personal-loan-calculator": {
      id:"personal-loan-calculator", name:"Personal Loan Calculator", category:"Loan Calculators",
      description:"Calculate personal loan cost, net amount received, interest, repayment and rate or tenure impact.",
      url:"/Emiformula/calculators/personal-loan-calculator.html", status:"active"
    }
  };
  window.EMIFORMULA_CALCULATOR_REGISTRY = Object.freeze(registry);
  window.EMIFORMULA_GET_CALCULATOR = function (id) { return registry[id] || null; };
})();
