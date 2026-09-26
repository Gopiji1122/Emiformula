(function (global) {
  'use strict';

  function emi(principal, annualRate, months) {
    if (!(principal > 0) || !(months > 0)) return 0;
    if (annualRate === 0) return principal / months;
    var r = annualRate / 1200;
    var factor = Math.pow(1 + r, months);
    return principal * r * factor / (factor - 1);
  }

  function schedule(principal, annualRate, months) {
    var payment = emi(principal, annualRate, months);
    var balance = principal;
    var rows = [];
    var totalInterest = 0;
    var totalPayment = 0;

    for (var month = 1; month <= months; month++) {
      var interest = annualRate === 0 ? 0 : balance * (annualRate / 1200);
      var principalPart = payment - interest;
      var actualPayment = payment;
      if (month === months || principalPart > balance) {
        principalPart = balance;
        actualPayment = principalPart + interest;
      }
      balance = Math.max(0, balance - principalPart);
      totalInterest += interest;
      totalPayment += actualPayment;
      rows.push({ month: month, payment: actualPayment, interest: interest, principal: principalPart, balance: balance });
    }
    return { payment: payment, totalInterest: totalInterest, totalPayment: totalPayment, rows: rows };
  }

  function calculate(input) {
    var P = Number(input.balance);
    var oldRate = Number(input.oldRate);
    var oldMonths = Number(input.oldMonths);
    var newRate = Number(input.newRate);
    var newMonths = Number(input.newMonths);

    if (!(P > 0) || !(oldMonths > 0) || !(newMonths > 0) || oldRate < 0 || newRate < 0) {
      return { valid: false, error: 'Enter valid loan amount, rates and tenures.' };
    }

    var current = schedule(P, oldRate, oldMonths);
    var next = schedule(P, newRate, newMonths);
    var switchingCosts = Math.max(0, Number(input.foreclosure) || 0) + Math.max(0, Number(input.foreclosureGST) || 0) + Math.max(0, Number(input.processing) || 0) + Math.max(0, Number(input.processingGST) || 0) + Math.max(0, Number(input.other) || 0);
    var grossInterestSaving = current.totalInterest - next.totalInterest;
    var netSaving = grossInterestSaving - switchingCosts;
    var horizon = Math.max(oldMonths, newMonths);
    var cumulative = -switchingCosts;
    var breakEvenMonth = null;
    var timeline = [];
    var monthlyComparison = [];
    var annualSummary = [];
    var annualMap = {};

    for (var m = 1; m <= horizon; m++) {
      var oldPayment = m <= oldMonths ? current.rows[m - 1].payment : 0;
      var newPayment = m <= newMonths ? next.rows[m - 1].payment : 0;
      cumulative += oldPayment - newPayment;
      var oldRow = m <= oldMonths ? current.rows[m - 1] : null;
      var newRow = m <= newMonths ? next.rows[m - 1] : null;
      var monthRow = {
        month: m, oldPayment: oldPayment, newPayment: newPayment,
        oldInterest: oldRow ? oldRow.interest : 0, newInterest: newRow ? newRow.interest : 0,
        oldPrincipal: oldRow ? oldRow.principal : 0, newPrincipal: newRow ? newRow.principal : 0,
        oldBalance: oldRow ? oldRow.balance : 0, newBalance: newRow ? newRow.balance : 0,
        monthlyCashflowSaving: oldPayment - newPayment, cumulative: cumulative
      };
      monthlyComparison.push(monthRow);
      var yearNo = Math.ceil(m / 12);
      if (!annualMap[yearNo]) annualMap[yearNo] = { year: yearNo, oldPayment: 0, newPayment: 0, oldInterest: 0, newInterest: 0, oldPrincipal: 0, newPrincipal: 0, oldBalance: 0, newBalance: 0 };
      annualMap[yearNo].oldPayment += oldPayment;
      annualMap[yearNo].newPayment += newPayment;
      annualMap[yearNo].oldInterest += monthRow.oldInterest;
      annualMap[yearNo].newInterest += monthRow.newInterest;
      annualMap[yearNo].oldPrincipal += monthRow.oldPrincipal;
      annualMap[yearNo].newPrincipal += monthRow.newPrincipal;
      annualMap[yearNo].oldBalance = monthRow.oldBalance;
      annualMap[yearNo].newBalance = monthRow.newBalance;
      if (breakEvenMonth === null && cumulative >= 0) breakEvenMonth = m;
      if (m === 1 || m === 12 || m % 12 === 0 || m === horizon || m === breakEvenMonth) timeline.push({ month: m, cumulative: cumulative });
    }
    Object.keys(annualMap).forEach(function (key) { annualSummary.push(annualMap[key]); });

    var monthlyEmiDifference = current.payment - next.payment;
    var simpleBreakEven = monthlyEmiDifference > 0 ? Math.ceil(switchingCosts / monthlyEmiDifference) : null;
    var interestSavingPct = current.totalInterest > 0 ? (grossInterestSaving / current.totalInterest) * 100 : 0;
    var rateDifference = oldRate - newRate;
    var tenureDifference = oldMonths - newMonths;
    var totalCashflowSaving = current.totalPayment - next.totalPayment;

    return {
      valid: true, currentEMI: current.payment, newEMI: next.payment,
      currentInterest: current.totalInterest, newInterest: next.totalInterest,
      currentTotalPayment: current.totalPayment, newTotalPayment: next.totalPayment,
      grossInterestSaving: grossInterestSaving, switchingCosts: switchingCosts,
      netSaving: netSaving, totalCashflowSaving: totalCashflowSaving,
      monthlyEmiDifference: monthlyEmiDifference, breakEvenMonth: breakEvenMonth,
      simpleBreakEvenMonth: simpleBreakEven, interestSavingPct: interestSavingPct,
      rateDifference: rateDifference, tenureDifference: tenureDifference,
      timeline: timeline, monthlyComparison: monthlyComparison, annualSummary: annualSummary,
      oldMonths: oldMonths, newMonths: newMonths
    };
  }

  global.EMIFORMULA_BALANCE_TRANSFER = { calculate: calculate };
})(window);
