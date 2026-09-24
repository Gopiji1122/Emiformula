window.EMIFORMULA_EMI_CONFIG = Object.freeze({

  calculatorId: "emi-calculator",

  name: "EMI Calculator",

  limits: {

    principal: {
      min: 1000,
      max: 100000000
    },

    annualRate: {
      min: 0,
      max: 40
    },

    years: {
      min: 1,
      max: 30
    },

    months: {
      min: 1,
      max: 360
    },

    processingFee: {
      min: 0,
      max: 10000000
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

    annualRate: 10,

    years: 5,

    months: 60,

    processingFee: 0,

    extraMonthly: 0,

    prepayment: 0,

    prepaymentMonth: 12

  }

});
