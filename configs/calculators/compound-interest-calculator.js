window.EMIFORMULA_COMPOUND_INTEREST_CONFIG = Object.freeze({
  calculatorId: "compound-interest-calculator",
  name: "Compound Interest Calculator",
  defaults: {
    principal: 100000,
    monthlyContribution: 5000,
    annualRate: 8,
    years: 10,
    frequency: 12,
    annualStepUp: 0,
    inflation: 0
  },
  limits: {
    principal: { min: 0, max: 100000000 },
    monthlyContribution: { min: 0, max: 1000000 },
    annualRate: { min: 0, max: 50 },
    years: { min: 1, max: 50 },
    annualStepUp: { min: 0, max: 50 },
    inflation: { min: 0, max: 20 }
  }
});