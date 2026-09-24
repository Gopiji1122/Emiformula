(function () {
  "use strict";

  function toNumber(value) {
    var number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function calculateBaseEMI(principal, annualRate, months) {
    principal = toNumber(principal);
    annualRate = toNumber(annualRate);
    months = toNumber(months);

    if (principal <= 0 || months <= 0 || annualRate < 0) {
      return 0;
    }

    var monthlyRate = annualRate / 12 / 100;

    if (monthlyRate === 0) {
      return principal / months;
    }

    var factor = Math.pow(1 + monthlyRate, months);

    return (
      principal *
      monthlyRate *
      factor /
      (factor - 1)
    );
  }

  function buildSchedule(options) {
    var principal = toNumber(options.principal);
    var annualRate = toNumber(options.annualRate);
    var plannedMonths = Math.max(
      1,
      Math.round(toNumber(options.months))
    );

    var extraMonthly = Math.max(
      0,
      toNumber(options.extraMonthly)
    );

    var prepayment = Math.max(
      0,
      toNumber(options.prepayment)
    );

    var prepaymentMonth = Math.max(
      1,
      Math.round(toNumber(options.prepaymentMonth))
    );

    if (
      principal <= 0 ||
      plannedMonths <= 0 ||
      annualRate < 0
    ) {
      return null;
    }

    var baseEmi = calculateBaseEMI(
      principal,
      annualRate,
      plannedMonths
    );

    var monthlyRate = annualRate / 12 / 100;

    var balance = principal;
    var month = 0;

    var totalInterest = 0;
    var totalPrincipal = 0;
    var totalPayment = 0;

    var schedule = [];

    while (
      balance > 0.005 &&
      month < 1200
    ) {
      month += 1;

      var openingBalance = balance;

      var interest =
        monthlyRate === 0
          ? 0
          : balance * monthlyRate;

      var scheduledPrincipal =
        baseEmi - interest;

      if (scheduledPrincipal < 0) {
        scheduledPrincipal = 0;
      }

      var payment =
        interest +
        scheduledPrincipal +
        extraMonthly;

      var actualPrepayment = 0;

      if (
        month === prepaymentMonth &&
        prepayment > 0
      ) {
        actualPrepayment =
          Math.min(
            prepayment,
            Math.max(
              0,
              balance - scheduledPrincipal
            )
          );
      }

      var principalPaid =
        scheduledPrincipal +
        extraMonthly +
        actualPrepayment;

      principalPaid =
        Math.min(
          principalPaid,
          balance
        );

      payment =
        interest +
        principalPaid;

      balance =
        Math.max(
          0,
          balance - principalPaid
        );

      totalInterest += interest;
      totalPrincipal += principalPaid;
      totalPayment += payment;

      schedule.push({
        month: month,
        openingBalance: openingBalance,
        payment: payment,
        principal: principalPaid,
        interest: interest,
        extraPayment:
          Math.max(
            0,
            principalPaid -
            Math.max(
              0,
              scheduledPrincipal
            )
          ),
        prepayment: actualPrepayment,
        closingBalance: balance
      });
    }

    return {
      baseEmi: baseEmi,
      actualMonths: month,
      totalInterest: totalInterest,
      totalPrincipal: totalPrincipal,
      totalPayment: totalPayment,
      schedule: schedule
    };
  }

  function calculate(options) {
    options = options || {};

    var principal =
      toNumber(options.principal);

    var annualRate =
      toNumber(options.annualRate);

    var months =
      Math.round(
        toNumber(options.months)
      );

    var processingFee =
      Math.max(
        0,
        toNumber(options.processingFee)
      );

    var extraMonthly =
      Math.max(
        0,
        toNumber(options.extraMonthly)
      );

    var prepayment =
      Math.max(
        0,
        toNumber(options.prepayment)
      );

    var prepaymentMonth =
      Math.max(
        1,
        Math.round(
          toNumber(
            options.prepaymentMonth
          )
        )
      );

    if (
      principal <= 0 ||
      annualRate < 0 ||
      months <= 0
    ) {
      return null;
    }

    var normal = buildSchedule({
      principal: principal,
      annualRate: annualRate,
      months: months,
      extraMonthly: 0,
      prepayment: 0,
      prepaymentMonth: 1
    });

    var optimized = buildSchedule({
      principal: principal,
      annualRate: annualRate,
      months: months,
      extraMonthly: extraMonthly,
      prepayment: prepayment,
      prepaymentMonth: prepaymentMonth
    });

    if (!normal || !optimized) {
      return null;
    }

    var yearly = {};

    optimized.schedule.forEach(
      function (row) {

        var year =
          Math.ceil(row.month / 12);

        if (!yearly[year]) {
          yearly[year] = {
            year: year,
            payment: 0,
            principal: 0,
            interest: 0,
            closingBalance:
              row.closingBalance
          };
        }

        yearly[year].payment +=
          row.payment;

        yearly[year].principal +=
          row.principal;

        yearly[year].interest +=
          row.interest;

        yearly[year].closingBalance =
          row.closingBalance;
      }
    );

    var yearlySummary =
      Object.keys(yearly).map(
        function (key) {
          return yearly[key];
        }
      );

    var interestSaved =
      Math.max(
        0,
        normal.totalInterest -
        optimized.totalInterest
      );

    var monthsSaved =
      Math.max(
        0,
        normal.actualMonths -
        optimized.actualMonths
      );

    var processingFeeIncluded =
      processingFee;

    var totalCost =
      optimized.totalPayment +
      processingFeeIncluded;

    var principalPercentage =
      optimized.totalPayment > 0
        ? (
            principal /
            optimized.totalPayment
          ) * 100
        : 0;

    var interestPercentage =
      optimized.totalPayment > 0
        ? (
            optimized.totalInterest /
            optimized.totalPayment
          ) * 100
        : 0;

    return {
      principal: principal,
      annualRate: annualRate,
      plannedMonths: months,

      baseEmi:
        optimized.baseEmi,

      monthlyPayment:
        optimized.schedule.length > 0
          ? optimized.schedule[0].payment
          : optimized.baseEmi,

      totalInterest:
        optimized.totalInterest,

      totalPayment:
        optimized.totalPayment,

      processingFee:
        processingFeeIncluded,

      totalCost:
        totalCost,

      actualMonths:
        optimized.actualMonths,

      interestSaved:
        interestSaved,

      monthsSaved:
        monthsSaved,

      principalPercentage:
        principalPercentage,

      interestPercentage:
        interestPercentage,

      normalSchedule:
        normal.schedule,

      schedule:
        optimized.schedule,

      yearlySummary:
        yearlySummary
    };
  }

  window.EMIFORMULA_CALCULATOR = {

    calculateEMI:
      calculateBaseEMI,

    calculate:
      calculate,

    buildSchedule:
      buildSchedule

  };

})();
