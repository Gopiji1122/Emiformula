(function () {
  "use strict";

  function n(v) {
    var x = Number(v);
    return Number.isFinite(x) ? x : 0;
  }

  function emi(principal, annualRate, months) {
    principal = n(principal);
    annualRate = n(annualRate);
    months = Math.round(n(months));
    if (principal <= 0 || months <= 0 || annualRate < 0) return 0;
    var r = annualRate / 12 / 100;
    if (r === 0) return principal / months;
    var f = Math.pow(1 + r, months);
    return principal * r * f / (f - 1);
  }

  function schedule(options) {
    var principal = Math.max(0, n(options.principal));
    var rate = Math.max(0, n(options.annualRate));
    var months = Math.max(1, Math.round(n(options.months)));
    var extra = Math.max(0, n(options.extraMonthly));
    var prepayment = Math.max(0, n(options.prepayment));
    var prepaymentMonth = Math.max(1, Math.round(n(options.prepaymentMonth)));
    if (!principal) return null;

    var monthly = rate / 12 / 100;
    var baseEmi = emi(principal, rate, months);
    var balance = principal;
    var rows = [];
    var totalInterest = 0;
    var totalPayment = 0;

    for (var month = 1; balance > 0.005 && month <= 1200; month++) {
      var opening = balance;
      var interest = monthly === 0 ? 0 : opening * monthly;
      var scheduledPrincipal = Math.max(0, baseEmi - interest);
      var extraPayment = extra;
      var prepay = month === prepaymentMonth ? prepayment : 0;
      var principalPaid = Math.min(balance, scheduledPrincipal + extraPayment + prepay);
      var payment = interest + principalPaid;
      balance = Math.max(0, balance - principalPaid);

      rows.push({
        month: month,
        openingBalance: opening,
        payment: payment,
        principal: principalPaid,
        interest: interest,
        extraPayment: Math.max(0, principalPaid - scheduledPrincipal),
        prepayment: Math.min(prepay, Math.max(0, principalPaid - scheduledPrincipal - extraPayment)),
        closingBalance: balance
      });
      totalInterest += interest;
      totalPayment += payment;
    }

    return {
      baseEmi: baseEmi,
      actualMonths: rows.length,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
      schedule: rows
    };
  }

  function calculate(options) {
    options = options || {};
    var amount = Math.max(0, n(options.amount));
    var rate = Math.max(0, n(options.annualRate));
    var months = Math.max(1, Math.round(n(options.months)));
    var feePercent = Math.max(0, n(options.processingFeePercent));
    var insurance = Math.max(0, n(options.insurance));
    var extra = Math.max(0, n(options.extraMonthly));
    var prepayment = Math.max(0, n(options.prepayment));
    var prepaymentMonth = Math.max(1, Math.round(n(options.prepaymentMonth)));
    if (amount <= 0 || months <= 0 || rate < 0) return null;

    var normal = schedule({ principal: amount, annualRate: rate, months: months });
    var optimized = schedule({
      principal: amount,
      annualRate: rate,
      months: months,
      extraMonthly: extra,
      prepayment: prepayment,
      prepaymentMonth: prepaymentMonth
    });
    var processingFee = amount * feePercent / 100;
    var netReceived = Math.max(0, amount - processingFee - insurance);
    var totalBorrowingCost = optimized.totalInterest + processingFee + insurance;
    var effectiveCostPercent = netReceived > 0
      ? (totalBorrowingCost / netReceived) * 100
      : 0;

    var yearly = {};
    optimized.schedule.forEach(function (row) {
      var year = Math.ceil(row.month / 12);
      if (!yearly[year]) yearly[year] = { year: year, payment: 0, principal: 0, interest: 0, closingBalance: row.closingBalance };
      yearly[year].payment += row.payment;
      yearly[year].principal += row.principal;
      yearly[year].interest += row.interest;
      yearly[year].closingBalance = row.closingBalance;
    });

    var interestSaved = Math.max(0, normal.totalInterest - optimized.totalInterest);
    var monthsSaved = Math.max(0, normal.actualMonths - optimized.actualMonths);

    return {
      amount: amount,
      annualRate: rate,
      plannedMonths: months,
      processingFeePercent: feePercent,
      processingFee: processingFee,
      insurance: insurance,
      netReceived: netReceived,
      emi: optimized.baseEmi,
      firstPayment: optimized.schedule.length ? optimized.schedule[0].payment : optimized.baseEmi,
      totalInterest: optimized.totalInterest,
      totalRepayment: optimized.totalPayment,
      totalBorrowingCost: totalBorrowingCost,
      totalOutflow: optimized.totalPayment + processingFee + insurance,
      effectiveCostPercent: effectiveCostPercent,
      actualMonths: optimized.actualMonths,
      monthsSaved: monthsSaved,
      interestSaved: interestSaved,
      principalShare: optimized.totalPayment ? amount / optimized.totalPayment * 100 : 0,
      interestShare: optimized.totalPayment ? optimized.totalInterest / optimized.totalPayment * 100 : 0,
      schedule: optimized.schedule,
      normalSchedule: normal.schedule,
      yearlySummary: Object.keys(yearly).map(function (key) { return yearly[key]; })
    };
  }

  function compareRate(options) {
    options = options || {};
    var amount = n(options.amount);
    var rate = n(options.rate);
    var months = Math.max(1, Math.round(n(options.months)));
    var feePercent = Math.max(0, n(options.feePercent));
    var rates = [rate - 2, rate - 1, rate, rate + 1, rate + 2].map(function (r) { return Math.max(0, r); });
    return rates.map(function (r) {
      var result = schedule({ principal: amount, annualRate: r, months: months });
      return {
        rate: r,
        emi: result.baseEmi,
        interest: result.totalInterest,
        fee: amount * feePercent / 100,
        total: result.totalPayment + amount * feePercent / 100
      };
    });
  }

  function tenureCompare(options) {
    options = options || {};
    var amount = n(options.amount);
    var rate = n(options.rate);
    var baseYears = Math.max(1, Math.round(n(options.years)));
    return [baseYears - 2, baseYears - 1, baseYears, baseYears + 1, baseYears + 2]
      .filter(function (y) { return y >= 1 && y <= 30; })
      .filter(function (y, i, arr) { return arr.indexOf(y) === i; })
      .map(function (y) {
        var months = y * 12;
        var result = schedule({ principal: amount, annualRate: rate, months: months });
        return { years: y, emi: result.baseEmi, interest: result.totalInterest, total: result.totalPayment };
      });
  }

  window.EMIFORMULA_PERSONAL_LOAN = Object.freeze({
    emi: emi,
    schedule: schedule,
    calculate: calculate,
    compareRate: compareRate,
    tenureCompare: tenureCompare
  });
})();
