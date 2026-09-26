(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    balance: $('bt-balance'),
    balanceRange: $('bt-balance-range'),
    balanceVal: $('bt-balance-val'),
    oldRate: $('bt-old-rate'),
    oldMonths: $('bt-old-months'),
    newRate: $('bt-new-rate'),
    newMonths: $('bt-new-months'),
    foreclosure: $('bt-foreclosure'),
    processing: $('bt-processing'),
    foreclosureGST: $('bt-foreclosure-gst'),
    processingGST: $('bt-processing-gst'),
    other: $('bt-other'),
    otherVal: $('bt-other-val'),
    floating: $('bt-floating'),
    purpose: $('bt-purpose'),
    year: $('bt-year'),
    regNote: $('bt-reg-note'),
    verdict: $('bt-verdict'),
    oldEmi: $('res-old-emi'),
    newEmi: $('res-new-emi'),
    fees: $('res-fees'),
    net: $('res-net'),
    breakEven: $('res-breakeven'),
    breakCopy: $('res-break-copy'),
    gross: $('res-gross'),
    oldInterest: $('res-old-interest'),
    newInterest: $('res-new-interest'),
    monthly: $('res-monthly'),
    costsBar: $('bar-costs'),
    savingsBar: $('bar-savings'),
    costsLabel: $('label-costs'),
    savingsLabel: $('label-savings'),
    timeline: $('bt-timeline')
  };

  function money(value) {
    var sign = value < 0 ? '-₹' : '₹';
    return sign + Math.round(Math.abs(value)).toLocaleString('en-IN');
  }

  function pct(value) {
    return Math.max(0, Math.min(100, value));
  }

  function updateRegulatoryNote() {
    var floating = el.floating.checked;
    var individual = el.purpose.value === 'individual';
    var year = Number(el.year.value);

    if (floating && individual && year >= 2026) {
      el.regNote.textContent =
        'The entered details may fall within RBI pre-payment-charge restrictions applicable from January 1, 2026. Confirm the actual charge in your lender documents before setting it to ₹0.';
    } else if (floating && individual) {
      el.regNote.textContent =
        'Floating-rate individual non-business loans may be subject to applicable RBI pre-payment-charge restrictions. Check the sanction/renewal date and lender documents.';
    } else {
      el.regNote.textContent =
        'Do not assume an RBI pre-payment-charge waiver for this combination of loan purpose and rate type. Use the actual charge shown by your lender.';
    }
  }

  function renderTimeline(rows) {
    if (!rows.length) {
      el.timeline.innerHTML = '<p class="loan-note">No timeline available.</p>';
      return;
    }
    el.timeline.innerHTML = rows.map(function (row) {
      var cls = row.cumulative >= 0 ? 'positive' : '';
      return '<div class="bt-timeline-row ' + cls + '">' +
        '<span>Month ' + row.month + '</span>' +
        '<strong>' + money(row.cumulative) + '</strong>' +
        '</div>';
    }).join('');
  }

  function calculate() {
    el.balanceVal.textContent = money(Number(el.balance.value) || 0);
    el.otherVal.textContent = money(Number(el.other.value) || 0);
    updateRegulatoryNote();

    var result = window.EMIFORMULA_BALANCE_TRANSFER.calculate({
      balance: Number(el.balance.value),
      oldRate: Number(el.oldRate.value),
      oldMonths: Number(el.oldMonths.value),
      newRate: Number(el.newRate.value),
      newMonths: Number(el.newMonths.value),
      foreclosure: Number(el.foreclosure.value),
      foreclosureGST: Number(el.foreclosureGST.value),
      processing: Number(el.processing.value),
      processingGST: Number(el.processingGST.value),
      other: Number(el.other.value)
    });

    if (!result.valid) {
      el.verdict.className = 'bt-verdict bt-neutral';
      el.verdict.innerHTML = '<strong>Enter valid loan details</strong><span>' + result.error + '</span>';
      return;
    }

    el.oldEmi.textContent = money(result.currentEMI);
    el.newEmi.textContent = money(result.newEMI);
    el.fees.textContent = money(result.switchingCosts);
    el.net.textContent = money(result.netSaving);
    el.gross.textContent = money(result.grossInterestSaving);
    el.oldInterest.textContent = money(result.currentInterest);
    el.newInterest.textContent = money(result.newInterest);
    el.monthly.textContent = money(result.monthlyEmiDifference);

    if (result.breakEvenMonth !== null) {
      el.breakEven.textContent = 'Month ' + result.breakEvenMonth;
      el.breakCopy.textContent =
        'Based on the entered assumptions, cumulative savings recover the switching costs in month ' +
        result.breakEvenMonth + '.';
    } else {
      el.breakEven.textContent = 'Not reached';
      el.breakCopy.textContent =
        'The calculated savings do not recover the switching costs within the compared repayment horizon.';
    }

    var maxBar = Math.max(result.switchingCosts, result.grossInterestSaving, 1);
    el.costsBar.style.width = pct(result.switchingCosts / maxBar * 100) + '%';
    el.savingsBar.style.width = pct(Math.max(0, result.grossInterestSaving) / maxBar * 100) + '%';
    el.costsLabel.textContent = money(result.switchingCosts);
    el.savingsLabel.textContent = money(result.grossInterestSaving);

    if (result.netSaving > 0 && result.breakEvenMonth !== null) {
      el.verdict.className = 'bt-verdict bt-good';
      el.verdict.innerHTML =
        '<strong>Estimated positive saving</strong><span>Estimated net saving: ' +
        money(result.netSaving) + '. Break-even occurs around month ' +
        result.breakEvenMonth + ' under these assumptions.</span>';
    } else if (result.netSaving <= 0) {
      el.verdict.className = 'bt-verdict bt-bad';
      el.verdict.innerHTML =
        '<strong>Estimated savings are negative</strong><span>Switching costs exceed the calculated gross interest saving by ' +
        money(Math.abs(result.netSaving)) + ' under these assumptions.</span>';
    } else {
      el.verdict.className = 'bt-verdict bt-neutral';
      el.verdict.innerHTML =
        '<strong>Break-even is not reached</strong><span>The calculated transfer does not recover its switching costs within the compared repayment horizon.</span>';
    }

    renderTimeline(result.timeline);
  }

  var inputs = [
    el.balance, el.oldRate, el.oldMonths, el.newRate, el.newMonths,
    el.foreclosure, el.processing, el.foreclosureGST, el.processingGST,
    el.other, el.floating, el.purpose, el.year
  ];

  inputs.forEach(function (node) {
    node.addEventListener('input', calculate);
    node.addEventListener('change', calculate);
  });

  el.balance.addEventListener('input', function () {
    el.balanceRange.value = el.balance.value;
  });

  el.balanceRange.addEventListener('input', function () {
    el.balance.value = el.balanceRange.value;
    calculate();
  });

  calculate();
})();
