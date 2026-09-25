window.EMIFORMULA_EMI_CONFIG = Object.freeze({

  calculatorId: "personal-loan-calculator",

  name: "Personal Loan Calculator",

  limits: {

    principal: {
      min: 10000,
      max: 50000000
    },

    annualRate: {
      min: 0,
      max: 40
    },

    years: {
      min: 1,
      max: 10
    },

    months: {
      min: 1,
      max: 120
    },

    processingFee: {
      min: 0,
      max: 5000000
    },

    extraMonthly: {
      min: 0,
      max: 1000000
    },

    prepayment: {
      min: 0,
      max: 10000000
    }

  },

  defaults: {

    principal: 500000,

    annualRate: 12,

    years: 3,

    months: 36,

    processingFee: 0,

    extraMonthly: 0,

    prepayment: 0,

    prepaymentMonth: 12

  }

});
