window.EMIFORMULA_EMI_CONFIG = Object.freeze({

  calculatorId: "emi-calculator",

  name: "EMI Calculator",

  inputs: {
    principal: {
      label: "Loan Amount",
      min: 1,
      step: 1000
    },

    annualRate: {
      label: "Interest Rate",
      min: 0,
      step: 0.01
    },

    months: {
      label: "Loan Tenure",
      min: 1,
      step: 1
    }
  },

  defaults: {
    principal: 500000,
    annualRate: 10,
    months: 60
  }

});
