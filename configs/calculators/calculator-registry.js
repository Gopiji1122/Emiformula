(function () {
  "use strict";

  var registry = {
    "emi-calculator": {
      id: "emi-calculator",
      name: "EMI Calculator",
      category: "EMI Calculators",
      description: "Calculate monthly EMI, total interest, total payment and loan repayment details.",
      url: "/calculators/emi-calculator.html",
      status: "active"
    },
    "personal-loan-calculator": {
      id: "personal-loan-calculator",
      name: "Personal Loan Calculator",
      category: "Loan Calculators",
      description: "Calculate personal loan cost, net amount received, interest, repayment and rate or tenure impact.",
      url: "/calculators/personal-loan-calculator.html",
      status: "active"
    },
    "step-up-step-down-emi-calculator": {
      id: "step-up-step-down-emi-calculator",
      name: "Step-Up / Step-Down EMI Calculator",
      category: "EMI Calculators",
      description: "Compare one-time, periodic or custom EMI changes and their effect on payoff time, interest and repayment.",
      url: "/calculators/step-up-step-down-emi-calculator.html",
      status: "active"
    },
    "compound-interest-calculator": {
      id: "compound-interest-calculator",
      name: "Compound Interest Calculator",
      category: "Financial Calculators",
      description: "Calculate future value, contributions, compound interest and investment growth.",
      url: "/calculators/compound-interest-calculator.html",
      status: "active"
    },
    "loan-comparison-calculator": {
      id: "loan-comparison-calculator",
      name: "Loan Comparison Calculator",
      category: "Loan Calculators",
      description: "Compare two loans by payment, interest, fees, total estimated cost and payoff time.",
      url: "/calculators/loan-comparison-calculator.html",
      alternates: { en: "/calculators/loan-comparison-calculator.html", hi: "/hi/calculators/loan-comparison-calculator.html", mr: "/mr/calculators/loan-comparison-calculator.html", gu: "/gu/calculators/loan-comparison-calculator.html", bn: "/bn/calculators/loan-comparison-calculator.html", ta: "/ta/calculators/loan-comparison-calculator.html" },
      status: "active"
    },
    "shg-loan-calculator": {
      id: "shg-loan-calculator",
      name: "SHG / Bachat Gat Financial Calculator",
      category: "Financial Calculators",
      description: "Estimate SHG member-loan schedules, savings, irregular repayments, group corpus and indicative bank-linkage planning.",
      url: "/calculators/shg-loan-calculator.html",
      alternates: { en: "/calculators/shg-loan-calculator.html", hi: "/hi/calculators/shg-loan-calculator.html", mr: "/mr/calculators/shg-loan-calculator.html", gu: "/gu/calculators/shg-loan-calculator.html", bn: "/bn/calculators/shg-loan-calculator.html", ta: "/ta/calculators/shg-loan-calculator.html" },
      status: "active"
    },
    "gold-loan-calculator": {
      id: "gold-loan-calculator",
      name: "Gold Loan Calculator",
      category: "Loan Calculators",
      description: "Estimate gold loan amount or gold required using gold weight, purity, gold price and LTV assumptions.",
      url: "/calculators/gold-loan-calculator.html",
      alternates: { en: "/calculators/gold-loan-calculator.html", hi: "/hi/calculators/gold-loan-calculator.html", mr: "/mr/calculators/gold-loan-calculator.html", gu: "/gu/calculators/gold-loan-calculator.html", bn: "/bn/calculators/gold-loan-calculator.html", ta: "/ta/calculators/gold-loan-calculator.html" },
      status: "active"
    },
    balanceTransfer: {
      id: "balance-transfer",
      name: "Balance Transfer Break-Even Calculator",
      category: "Loan Calculators",
      description: "Compare a current loan with a new offer, switching costs, interest impact and break-even analysis.",
      url: "/calculators/balance-transfer-calculator.html"
    },
  };

  window.EMIFORMULA_CALCULATOR_REGISTRY = Object.freeze(registry);
  window.EMIFORMULA_GET_CALCULATOR = function (id) {
    return registry[id] || null;
  };
})();
