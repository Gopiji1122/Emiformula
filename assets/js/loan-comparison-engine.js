(function (global) {
  "use strict";

  var FREQUENCIES = Object.freeze({
    monthly: 12,
    biweekly: 26,
    weekly: 52
  });

  var EPSILON = 0.0000001;
  var MAX_PERIODS = 5200;

  function toFiniteNumber(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : (fallback === undefined ? 0 : fallback);
  }

  function nonNegative(value) {
    var number = toFiniteNumber(value);
    return number >= 0 ? number : 0;
  }

  function positive(value) {
    var number = toFiniteNumber(value);
    return number > 0 ? number : 0;
  }

  function roundCurrency(value) {
    return Math.round((toFiniteNumber(value) + Number.EPSILON) * 100) / 100;
  }

  function normalizeFrequency(value) {
    var key = String(value || "monthly").toLowerCase();
    return Object.prototype.hasOwnProperty.call(FREQUENCIES, key) ? key : "monthly";
  }

  function normalizeFees(fees) {
    fees = fees || {};
    var detailed = fees.detailed || {};
    var processing = nonNegative(detailed.processing);
    var application = nonNegative(detailed.application);
    var documentation = nonNegative(detailed.documentation);
    var legal = nonNegative(detailed.legal);
    var valuation = nonNegative(detailed.valuation);
    var insurance = nonNegative(detailed.insurance);
    var broker = nonNegative(detailed.broker);
    var otherUpfront = nonNegative(detailed.otherUpfront);
    var prepayment = nonNegative(detailed.prepayment);
    var otherCost = nonNegative(detailed.otherCost);
    var otherRecurring = nonNegative(detailed.otherRecurring);
    var legacyUpfront = nonNegative(fees.upfront);
    var legacyRecurring = nonNegative(fees.recurringPerPeriod);
    var detailedUpfront = processing + application + documentation + legal + valuation + insurance + broker + otherUpfront + prepayment + otherCost;
    var upfront = legacyUpfront + detailedUpfront;
    var recurringPerPeriod = legacyRecurring + otherRecurring;
    return {
      upfront: upfront,
      recurringPerPeriod: recurringPerPeriod,
      detailed: {processing:processing,application:application,documentation:documentation,legal:legal,valuation:valuation,insurance:insurance,broker:broker,otherUpfront:otherUpfront,prepayment:prepayment,otherCost:otherCost,otherRecurring:otherRecurring},
      breakdown: {legacyUpfront:legacyUpfront,legacyRecurring:legacyRecurring,detailedUpfront:detailedUpfront,detailedRecurringPerPeriod:otherRecurring}
    };
  }

  function validateLoanInput(input) {
    input = input || {};

    var errors = [];
    var amount = toFiniteNumber(input.amount);
    var annualRate = toFiniteNumber(input.annualRate);
    var termMonths = toFiniteNumber(input.termMonths);
    var paymentFrequency = normalizeFrequency(input.paymentFrequency);
    var paymentsPerYear = FREQUENCIES[paymentFrequency];
    var rawPeriods = termMonths / 12 * paymentsPerYear;

    if (!(amount > 0)) {
      errors.push("Loan amount must be greater than 0.");
    }

    if (!(annualRate >= 0)) {
      errors.push("Annual interest rate cannot be negative.");
    }

    var feeValues = [
      ["processing", input.fees && input.fees.processing],
      ["application", input.fees && input.fees.application],
      ["documentation", input.fees && input.fees.documentation],
      ["legal", input.fees && input.fees.legal],
      ["valuation", input.fees && input.fees.valuation],
      ["insurance", input.fees && input.fees.insurance],
      ["broker", input.fees && input.fees.broker],
      ["otherUpfront", input.fees && input.fees.otherUpfront],
      ["prepayment", input.fees && input.fees.prepayment],
      ["otherCost", input.fees && input.fees.otherCost],
      ["otherRecurring", input.fees && input.fees.otherRecurring],
      ["upfront", input.fees && input.fees.upfront],
      ["recurringPerPeriod", input.fees && input.fees.recurringPerPeriod]
    ];
    feeValues.forEach(function (entry) {
      if (entry[1] !== undefined && entry[1] !== null && entry[1] !== "" && (!Number.isFinite(Number(entry[1])) || Number(entry[1]) < 0)) {
        errors.push("Fee " + entry[0] + " must be a valid non-negative number.");
      }
    });

    if (!(termMonths > 0)) {
      errors.push("Loan term must be greater than 0 months.");
    }

    if (!(rawPeriods > 0) || !Number.isFinite(rawPeriods)) {
      errors.push("Loan term and payment frequency must produce a valid number of payments.");
    }

    var periods = Number.isFinite(rawPeriods) && rawPeriods > 0 ? Math.round(rawPeriods) : 0;
    if (periods < 1 && termMonths > 0) {
      periods = 1;
    }
    if (periods > MAX_PERIODS) {
      errors.push("The requested term creates too many payment periods. Please use a shorter term or a less frequent payment schedule.");
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      amount: amount,
      annualRate: annualRate,
      termMonths: termMonths,
      paymentFrequency: paymentFrequency,
      paymentsPerYear: paymentsPerYear,
      periods: periods
    };
  }

  function periodicRate(annualRate, paymentsPerYear) {
    return nonNegative(annualRate) / 100 / paymentsPerYear;
  }

  function paymentFor(principal, annualRate, periods, paymentsPerYear) {
    principal = positive(principal);
    annualRate = nonNegative(annualRate);
    periods = Math.max(1, Math.round(toFiniteNumber(periods)));
    paymentsPerYear = Math.max(1, Math.round(toFiniteNumber(paymentsPerYear, 12)));

    if (!principal) {
      return 0;
    }

    var rate = periodicRate(annualRate, paymentsPerYear);
    if (rate === 0) {
      return principal / periods;
    }

    var growth = Math.pow(1 + rate, periods);
    return principal * rate * growth / (growth - 1);
  }

  function calculateLoan(input) {
    input = input || {};
    var validation = validateLoanInput(input);

    if (!validation.valid) {
      return {
        ok: false,
        errors: validation.errors
      };
    }

    var fees = normalizeFees(input.fees);
    var principal = validation.amount;
    var paymentsPerYear = validation.paymentsPerYear;
    var periods = validation.periods;
    var rate = periodicRate(validation.annualRate, paymentsPerYear);
    var scheduledPayment = paymentFor(
      principal,
      validation.annualRate,
      periods,
      paymentsPerYear
    );

    if (!(scheduledPayment >= 0) || !Number.isFinite(scheduledPayment)) {
      return {
        ok: false,
        errors: ["Unable to calculate a valid scheduled payment for this loan."]
      };
    }

    var balance = principal;
    var totalInterest = 0;
    var totalPrincipal = 0;
    var totalScheduledPayments = 0;
    var totalRecurringFees = 0;
    var schedule = [];

    for (var period = 1; period <= periods && balance > EPSILON; period += 1) {
      var openingBalance = balance;
      var interest = rate === 0 ? 0 : openingBalance * rate;
      var principalPayment = scheduledPayment - interest;

      if (principalPayment <= 0) {
        return {
          ok: false,
          errors: ["The scheduled payment does not reduce the loan balance."]
        };
      }

      principalPayment = Math.min(principalPayment, openingBalance);
      var actualPayment = interest + principalPayment;
      balance = Math.max(0, openingBalance - principalPayment);
      var recurringFee = fees.recurringPerPeriod;

      totalInterest += interest;
      totalPrincipal += principalPayment;
      totalScheduledPayments += actualPayment;
      totalRecurringFees += recurringFee;

      schedule.push({
        period: period,
        openingBalance: roundCurrency(openingBalance),
        payment: roundCurrency(actualPayment),
        principal: roundCurrency(principalPayment),
        interest: roundCurrency(interest),
        recurringFee: roundCurrency(recurringFee),
        totalOutflow: roundCurrency(actualPayment + recurringFee),
        closingBalance: roundCurrency(balance)
      });
    }

    if (balance > EPSILON) {
      return {
        ok: false,
        errors: ["The loan schedule could not reach a zero balance within the calculated term."]
      };
    }

    var totalFees = fees.upfront + totalRecurringFees;
    var totalCost = totalScheduledPayments + totalFees;
    var totalRepayment = totalScheduledPayments;
    var costBeyondPrincipal = totalInterest + totalFees;
    var actualPeriods = schedule.length;
    var actualTermMonths = actualPeriods / paymentsPerYear * 12;

    return {
      ok: true,
      input: {
        amount: principal,
        annualRate: validation.annualRate,
        termMonths: validation.termMonths,
        paymentFrequency: validation.paymentFrequency,
        paymentsPerYear: paymentsPerYear,
        periods: periods,
        fees: fees
      },
      payment: scheduledPayment,
      scheduledPayment: scheduledPayment,
      totalInterest: totalInterest,
      totalPrincipal: totalPrincipal,
      totalScheduledPayments: totalScheduledPayments,
      totalRepayment: totalRepayment,
      upfrontFees: fees.upfront,
      recurringFees: totalRecurringFees,
      totalFees: totalFees,
      totalCost: totalCost,
      costBeyondPrincipal: costBeyondPrincipal,
      costBeyondPrincipalRatio: principal ? costBeyondPrincipal / principal * 100 : 0,
      feeBreakdown: {upfront: fees.upfront, recurring: totalRecurringFees, recurringPerPeriod: fees.recurringPerPeriod, total: totalFees, detailed: fees.detailed, breakdown: fees.breakdown},
      actualPeriods: actualPeriods,
      actualTermMonths: actualTermMonths,
      schedule: schedule
    };
  }

  function compareLoans(loanA, loanB) {
    var resultA = calculateLoan(loanA);
    var resultB = calculateLoan(loanB);

    if (!resultA.ok || !resultB.ok) {
      var errorsA = (resultA.errors || []).map(function (message) {
        return "Loan A: " + message;
      });
      var errorsB = (resultB.errors || []).map(function (message) {
        return "Loan B: " + message;
      });

      return {
        ok: false,
        loanA: resultA,
        loanB: resultB,
        errors: errorsA.concat(errorsB)
      };
    }

    var difference = {
      totalCost: resultA.totalCost - resultB.totalCost,
      payment: resultA.payment - resultB.payment,
      interest: resultA.totalInterest - resultB.totalInterest,
      fees: resultA.totalFees - resultB.totalFees,
      repayment: resultA.totalRepayment - resultB.totalRepayment,
      periods: resultA.actualPeriods - resultB.actualPeriods,
      termMonths: resultA.actualTermMonths - resultB.actualTermMonths
    };

    return {
      ok: true,
      loanA: resultA,
      loanB: resultB,
      difference: difference,
      lowerTotalCostLoan: difference.totalCost === 0 ? "tie" : (difference.totalCost < 0 ? "A" : "B"),
      lowerPaymentLoan: difference.payment === 0 ? "tie" : (difference.payment < 0 ? "A" : "B"),
      lowerInterestLoan: difference.interest === 0 ? "tie" : (difference.interest < 0 ? "A" : "B"),
      lowerFeesLoan: difference.fees === 0 ? "tie" : (difference.fees < 0 ? "A" : "B"),
      shorterTermLoan: difference.periods === 0 ? "tie" : (difference.periods < 0 ? "A" : "B")
    };
  }
  global.EMIFORMULA_LOAN_COMPARISON = Object.freeze({
    frequencies: FREQUENCIES,
    validateLoanInput: validateLoanInput,
    paymentFor: paymentFor,
    calculateLoan: calculateLoan,
    compareLoans: compareLoans,
    roundCurrency: roundCurrency
  });
})(window);
