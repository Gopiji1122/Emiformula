(function () {
  'use strict';

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  function monthlyRate(annualRate) { return annualRate / 100 / 12; }

  function standardEmi(principal, annualRate, months) {
    var r = monthlyRate(annualRate);
    if (!principal || !months || annualRate < 0) return 0;
    if (r === 0) return principal / months;
    var factor = Math.pow(1 + r, months);
    return principal * r * factor / (factor - 1);
  }

  function normalizeNumber(value) {
    var n = Number(String(value || '').replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function simulate(principal, annualRate, schedule, maxMonths) {
    var balance = principal;
    var r = monthlyRate(annualRate);
    var rows = [];
    var interest = 0;
    var paid = 0;
    var month = 0;
    var lastEmi = 0;
    var safety = maxMonths || 1200;
    var scheduleSorted = schedule.slice().sort(function (a, b) { return a.startMonth - b.startMonth; });

    while (balance > 0.005 && month < safety) {
      month += 1;
      var active = scheduleSorted[0];
      for (var i = 0; i < scheduleSorted.length; i += 1) {
        if (scheduleSorted[i].startMonth <= month) active = scheduleSorted[i];
        else break;
      }
      var emi = Math.max(0, active ? active.emi : 0);
      var monthInterest = balance * r;
      var payment = Math.min(emi, balance + monthInterest);
      var principalPart = payment - monthInterest;

      if (payment <= monthInterest + 0.000001) {
        return { valid: false, reason: 'EMI is not high enough to reduce the loan balance.', rows: rows };
      }

      balance = Math.max(0, balance - principalPart);
      interest += monthInterest;
      paid += payment;
      lastEmi = payment;
      rows.push({
        month: month,
        emi: round2(payment),
        interest: round2(monthInterest),
        principal: round2(principalPart),
        balance: round2(balance)
      });
    }

    return {
      valid: balance <= 0.005,
      reason: balance > 0.005 ? 'The repayment schedule did not finish within the calculation limit.' : '',
      rows: rows,
      months: month,
      interest: round2(interest),
      paid: round2(paid),
      finalEmi: round2(lastEmi)
    };
  }

  function buildPeriodic(startEmi, changePct, frequency, maxChanges) {
    var periodMonths = frequency === 'quarterly' ? 3 : frequency === 'monthly' ? 1 : 12;
    var rows = [{ startMonth: 1, emi: startEmi }];
    var current = startEmi;
    for (var i = 1; i < (maxChanges || 20); i += 1) {
      current = current * (1 + changePct / 100);
      rows.push({ startMonth: 1 + i * periodMonths, emi: current });
    }
    return rows;
  }

  function buildCustom(entries, currentEmi) {
    var schedule = [{ startMonth: 1, emi: currentEmi }];
    entries.forEach(function (entry) {
      schedule.push({ startMonth: entry.startMonth, emi: entry.emi });
    });
    return schedule.sort(function (a, b) { return a.startMonth - b.startMonth; });
  }

  window.StepUpDownEngine = Object.freeze({
    standardEmi: standardEmi,
    simulate: simulate,
    buildPeriodic: buildPeriodic,
    buildCustom: buildCustom,
    normalizeNumber: normalizeNumber,
    round2: round2
  });
}());
