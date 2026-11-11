window.EMIFORMULA_PERSONAL_LOAN_CONFIG = Object.freeze({
  calculatorId: "personal-loan-calculator",
  name: "Personal Loan Calculator",
  limits: {
    amount: { min: 10000, max: 100000000 },
    annualRate: { min: 0, max: 40 },
    years: { min: 1, max: 20 },
    processingFeePercent: { min: 0, max: 20 },
    insurance: { min: 0, max: 1000000 },
    extraMonthly: { min: 0, max: 1000000 },
    prepayment: { min: 0, max: 10000000 },
    prepaymentMonth: { min: 1, max: 240 }
  },
  defaults: {
    amount: 500000,
    annualRate: 12,
    years: 5,
    processingFeePercent: 2,
    insurance: 0,
    extraMonthly: 0,
    prepayment: 0,
    prepaymentMonth: 12,
    compareRateLow: 10,
    compareRateHigh: 14
  }
});
