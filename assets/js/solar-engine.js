/* ==========================================================================
   EMIFORMULA — PM SURYA GHAR ROOFTOP SOLAR CALCULATION ENGINE
   Verified against Ministry of New and Renewable Energy (MNRE) Guidelines
   for PM Surya Ghar: Muft Bijli Yojana (7% Bank Loan & Direct Subsidy).
   ========================================================================== */

(function () {
  "use strict";

  var BENCHMARK_COSTS = {
    1: 50000,
    2: 100000,
    3: 145000
  };
  var COST_PER_ADDITIONAL_KW = 45000;
  var DEFAULT_TARIFF = 7.5; // Average residential grid tariff (₹/kWh)
  var MONTHLY_UNITS_PER_KW = 120; // Average monthly kWh generation per kW
  var ROOF_AREA_PER_KW = 100; // Shadow-free roof area (sq. ft. per kW)
  var SOLAR_LOAN_RATE = 7.0; // Concessional repo-linked solar loan interest rate (%)
  var DEFAULT_DOWN_PAYMENT_PCT = 10; // Minimum 10% down payment
  var LIFETIME_YEARS = 25; // Standard solar PV panel warrantied lifetime
  var CO2_PER_KW_YEAR = 1.2; // Tons of CO2 emissions avoided per kW per year

  function calculateSubsidy(kw) {
    if (kw <= 0) return 0;
    if (kw <= 1) return 30000;
    if (kw <= 2) return 60000;
    return 78000; // Capped at ₹78,000 for 3 kW and above
  }

  function calculateSystemCost(kw) {
    if (kw <= 0) return 0;
    if (kw <= 1) return BENCHMARK_COSTS[1];
    if (kw <= 2) return BENCHMARK_COSTS[2];
    if (kw <= 3) return BENCHMARK_COSTS[3];
    return BENCHMARK_COSTS[3] + (kw - 3) * COST_PER_ADDITIONAL_KW;
  }

  function recommendCapacity(monthlyBill, tariff) {
    var rate = tariff > 0 ? tariff : DEFAULT_TARIFF;
    var monthlyUnits = monthlyBill / rate;
    var rawKw = monthlyUnits / MONTHLY_UNITS_PER_KW;
    if (rawKw <= 1.3) return 1;
    if (rawKw <= 2.3) return 2;
    if (rawKw <= 3.3) return 3;
    if (rawKw <= 4.3) return 4;
    if (rawKw <= 5.3) return 5;
    return Math.min(10, Math.round(rawKw));
  }

  function calcLoanEmi(principal, annualRate, tenureMonths) {
    if (principal <= 0 || tenureMonths <= 0) return 0;
    var r = annualRate / 1200;
    if (r <= 0) return principal / tenureMonths;
    var factor = Math.pow(1 + r, tenureMonths);
    return Math.round((principal * r * factor) / (factor - 1));
  }

  function calculateSolarPlan(params) {
    var monthlyBill = Math.max(0, Number(params.monthlyBill) || 0);
    var tariff = Number(params.tariff) > 0 ? Number(params.tariff) : DEFAULT_TARIFF;
    var capacityKw = Number(params.capacityKw) > 0 ? Number(params.capacityKw) : recommendCapacity(monthlyBill, tariff);
    capacityKw = Math.min(10, Math.max(1, Math.round(capacityKw)));

    var isLoan = params.financingMode === "loan";
    var loanTenureMonths = Math.min(120, Math.max(12, Math.round((Number(params.loanTenureYears) || 5) * 12)));
    var loanInterestRate = Number(params.loanInterestRate) > 0 ? Number(params.loanInterestRate) : SOLAR_LOAN_RATE;
    var downPaymentPct = Number(params.downPaymentPct) >= 0 ? Number(params.downPaymentPct) : DEFAULT_DOWN_PAYMENT_PCT;

    var grossCost = calculateSystemCost(capacityKw);
    var subsidy = calculateSubsidy(capacityKw);
    var netCost = Math.max(0, grossCost - subsidy);

    var monthlyGenerationKwh = Math.round(capacityKw * MONTHLY_UNITS_PER_KW);
    var annualGenerationKwh = monthlyGenerationKwh * 12;
    var roofAreaSqFt = Math.round(capacityKw * ROOF_AREA_PER_KW);

    var monthlySavings = Math.round(Math.min(monthlyBill, monthlyGenerationKwh * tariff));
    if (monthlyBill === 0) {
      monthlySavings = Math.round(monthlyGenerationKwh * tariff);
    }
    var annualSavings = monthlySavings * 12;

    var downPayment = isLoan ? Math.round((grossCost * downPaymentPct) / 100) : netCost;
    var loanAmount = isLoan ? Math.max(0, grossCost - downPayment) : 0;
    var monthlyEmi = isLoan ? calcLoanEmi(loanAmount, loanInterestRate, loanTenureMonths) : 0;
    var totalLoanRepayment = isLoan ? monthlyEmi * loanTenureMonths : 0;
    var totalLoanInterest = isLoan ? Math.max(0, totalLoanRepayment - loanAmount) : 0;

    // Direct Benefit Transfer (DBT): Homeowner receives subsidy in bank within ~30 days
    // Net investment = Total outflow minus subsidy
    var totalCustomerOutflow = isLoan ? (downPayment + totalLoanRepayment - subsidy) : netCost;

    var netMonthlyCashflow = monthlySavings - monthlyEmi;

    var paybackYears = annualSavings > 0 ? Math.round((netCost / annualSavings) * 10) / 10 : 0;

    // 25-Year Cumulative Financial Impact (accounting for 0.7% annual panel degradation)
    var lifetimeSavings = 0;
    for (var yr = 1; yr <= LIFETIME_YEARS; yr++) {
      var degradationFactor = Math.pow(1 - 0.007, yr - 1);
      lifetimeSavings += Math.round(annualSavings * degradationFactor);
    }
    var net25YrProfit = Math.round(lifetimeSavings - totalCustomerOutflow);

    var annualCo2SavedTons = Math.round(capacityKw * CO2_PER_KW_YEAR * 10) / 10;
    var lifetimeCo2SavedTons = Math.round(annualCo2SavedTons * LIFETIME_YEARS);

    return {
      capacityKw: capacityKw,
      grossCost: grossCost,
      subsidy: subsidy,
      netCost: netCost,
      monthlyGenerationKwh: monthlyGenerationKwh,
      annualGenerationKwh: annualGenerationKwh,
      roofAreaSqFt: roofAreaSqFt,
      monthlySavings: monthlySavings,
      annualSavings: annualSavings,
      isLoan: isLoan,
      downPayment: downPayment,
      loanAmount: loanAmount,
      loanInterestRate: loanInterestRate,
      loanTenureMonths: loanTenureMonths,
      monthlyEmi: monthlyEmi,
      totalLoanInterest: totalLoanInterest,
      totalCustomerOutflow: totalCustomerOutflow,
      netMonthlyCashflow: netMonthlyCashflow,
      paybackYears: paybackYears,
      lifetimeSavings: lifetimeSavings,
      net25YrProfit: net25YrProfit,
      annualCo2SavedTons: annualCo2SavedTons,
      lifetimeCo2SavedTons: lifetimeCo2SavedTons
    };
  }

  window.EMIFORMULA_SOLAR = Object.freeze({
    calculateSubsidy: calculateSubsidy,
    calculateSystemCost: calculateSystemCost,
    recommendCapacity: recommendCapacity,
    calcLoanEmi: calcLoanEmi,
    calculateSolarPlan: calculateSolarPlan,
    DEFAULT_TARIFF: DEFAULT_TARIFF,
    SOLAR_LOAN_RATE: SOLAR_LOAN_RATE
  });
})();
