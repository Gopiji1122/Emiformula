(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    balance: $('bt-balance'), balanceRange: $('bt-balance-range'), balanceVal: $('bt-balance-val'),
    oldRate: $('bt-old-rate'), oldMonths: $('bt-old-months'), newRate: $('bt-new-rate'), newMonths: $('bt-new-months'),
    foreclosure: $('bt-foreclosure'), processing: $('bt-processing'), foreclosureGST: $('bt-foreclosure-gst'),
    processingGST: $('bt-processing-gst'), other: $('bt-other'), otherVal: $('bt-other-val'), reset: $('bt-reset'), floating: $('bt-floating'),
    purpose: $('bt-purpose'), year: $('bt-year'), regNote: $('bt-reg-note'), verdict: $('bt-verdict'),
    oldEmi: $('res-old-emi'), newEmi: $('res-new-emi'), fees: $('res-fees'), net: $('res-net'), breakEven: $('res-breakeven'),
    breakCopy: $('res-break-copy'), gross: $('res-gross'), oldInterest: $('res-old-interest'), newInterest: $('res-new-interest'),
    monthly: $('res-monthly'), costsBar: $('bar-costs'), savingsBar: $('bar-savings'), costsLabel: $('label-costs'), savingsLabel: $('label-savings'),
    timeline: $('bt-timeline'), donut: $('bt-interest-donut'), donutPercent: $('bt-donut-percent'), legendNew: $('bt-legend-new-interest'),
    legendSaving: $('bt-legend-saving'), legendCost: $('bt-legend-cost'), cumulativeChart: $('bt-cumulative-chart'), heroRateGap: $('hero-rate-gap'), heroTenureGap: $('hero-tenure-gap'), heroCost: $('hero-cost'), newRateVal: $('bt-new-rate-val'), newMonthsVal: $('bt-new-months-val'), compareOldEmi: $('compare-old-emi'), compareNewEmi: $('compare-new-emi'), compareOldRate: $('compare-old-rate'), compareNewRate: $('compare-new-rate'), compareOldMonths: $('compare-old-months'), compareNewMonths: $('compare-new-months'), interestPct: $('insight-interest-pct'), interestPctLabel: $('insight-interest-label'), insightMonthly: $('insight-monthly'), insightTotal: $('insight-total'), breakPill: $('bt-break-pill'), breakPillMobile: $('bt-break-pill-mobile'), breakRing: document.querySelector('.bt-break-ring')
  };

  var lastResult = null;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function money(value) {
    var n = Number(value) || 0;
    return (n < 0 ? '-₹' : '₹') + Math.round(Math.abs(n)).toLocaleString('en-IN');
  }
  function pct(value) { return Math.max(0, Math.min(100, value)); }
  function esc(value) { return String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function animateNumber(node, value, formatter, duration) {
    if (!node) return;
    var target = Number(value) || 0;
    if (reducedMotion) { node.textContent = formatter(target); return; }
    var start = Number(node.dataset.numericValue);
    if (!Number.isFinite(start)) start = 0;
    var began = performance.now();
    var span = duration || 500;
    node.dataset.numericValue = String(target);
    function frame(now) {
      var progress = Math.min(1, (now - began) / span);
      var eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = formatter(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function updateRegulatoryNote() {
    var floating = el.floating.checked, individual = el.purpose.value === 'individual', year = Number(el.year.value);
    if (floating && individual && year >= 2026) {
      el.regNote.textContent = 'The entered details may fall within RBI pre-payment-charge restrictions applicable from January 1, 2026. Confirm the actual charge in your lender documents before setting it to ₹0.';
    } else if (floating && individual) {
      el.regNote.textContent = 'Floating-rate individual non-business loans may be subject to applicable RBI pre-payment-charge restrictions. Check the sanction/renewal date and lender documents.';
    } else {
      el.regNote.textContent = 'Do not assume an RBI pre-payment-charge waiver for this combination of loan purpose and rate type. Use the actual charge shown by your lender.';
    }
  }

  function renderTimeline(rows) {
    if (!rows.length) { el.timeline.innerHTML = '<p class="loan-note">No timeline available.</p>'; return; }
    el.timeline.innerHTML = rows.map(function (row) {
      var value = Number(row.economicPosition);
      var cls = value >= 0 ? 'positive' : '';
      return '<div class="bt-timeline-row ' + cls + '"><span>Month ' + row.month + '</span><strong>' + money(value) + '</strong></div>';
    }).join('');
  }

  function renderDonut(result) {
    var currentInterest = Math.max(0, Number(result.currentInterest) || 0);
    var newInterest = Math.max(0, Number(result.newInterest) || 0);
    var gross = Number(result.grossInterestSaving) || 0;
    var magnitude = currentInterest > 0 ? Math.min(100, Math.abs(gross) / currentInterest * 100) : 0;
    var degrees = magnitude * 3.6;
    var negative = gross < 0;
    var color = negative ? '#d45b63' : '#15956f';
    if (el.donut) el.donut.style.background = 'conic-gradient(' + color + ' 0deg ' + degrees + 'deg, #dbe4ea ' + degrees + 'deg 360deg)';
    animateNumber(el.donutPercent, magnitude, function (v) { return Math.round(v) + '%'; }, 650);
    if (el.legendNew) el.legendNew.textContent = money(newInterest);
    if (el.legendSaving) el.legendSaving.textContent = money(gross);
    if (el.legendCost) el.legendCost.textContent = money(result.switchingCosts);
    var savingLabel = el.legendSaving ? el.legendSaving.parentElement.querySelector('span') : null;
    if (savingLabel) savingLabel.textContent = negative ? 'Interest cost increase' : 'Gross interest saving';
    var centerLabel = el.donut ? el.donut.querySelector('.bt-donut-center span') : null;
    if (centerLabel) centerLabel.textContent = negative ? 'interest increase' : 'interest saved';
    if (el.donut) el.donut.classList.toggle('is-negative', negative);
  }

  function renderCumulativeChart(rows, breakEvenMonth) {
    if (!rows || !rows.length) { el.cumulativeChart.innerHTML = '<div class="bt-chart-empty">No timeline available.</div>'; return; }
    var width = 820, height = 260, left = 54, right = 22, top = 22, bottom = 38;
    var pw = width - left - right, ph = height - top - bottom;
    var values = rows.map(function (r) { return Number(r.economicPosition) || 0; });
    var min = Math.min.apply(null, values.concat([0])), max = Math.max.apply(null, values.concat([0]));
    if (max === min) max = min + 1;
    var x = function (i) { return left + (rows.length === 1 ? pw / 2 : i * pw / (rows.length - 1)); };
    var y = function (v) { return top + (max - v) / (max - min) * ph; };
    var points = rows.map(function (r, i) { return x(i).toFixed(1) + ',' + y(Number(r.economicPosition) || 0).toFixed(1); }).join(' ');
    var finalNegative = (Number(rows[rows.length - 1].economicPosition) || 0) < 0;
    var chartColor = finalNegative ? '#d45b63' : '#0f766e';
    var fillTop = finalNegative ? '#d45b63' : '#14b8a6';
    var zeroY = y(0).toFixed(1);
    var breakIndex = rows.findIndex(function (r) { return Number(r.month) === Number(breakEvenMonth); });
    var breakMark = '';
    if (breakIndex >= 0) {
      var bx = x(breakIndex), by = y(Number(rows[breakIndex].economicPosition) || 0);
      breakMark = '<line x1="' + bx + '" y1="' + top + '" x2="' + bx + '" y2="' + (top + ph) + '" stroke="#14b8a6" stroke-dasharray="5 5"/><circle cx="' + bx + '" cy="' + by + '" r="6" fill="#fff" stroke="#0f766e" stroke-width="3"/><text x="' + bx + '" y="' + (top + 13) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#0f766e">Month ' + esc(breakEvenMonth) + '</text>';
    }
    var area = left + ',' + (top + ph) + ' ' + points + ' ' + (left + pw) + ',' + (top + ph);
    el.cumulativeChart.innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Economic position after switching costs and outstanding balance adjustment">' +
      '<defs><linearGradient id="btAreaGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + fillTop + '" stop-opacity=".24"/><stop offset="1" stop-color="' + fillTop + '" stop-opacity="0"/></linearGradient></defs>' +
      '<line x1="' + left + '" y1="' + zeroY + '" x2="' + (left + pw) + '" y2="' + zeroY + '" stroke="#94a3b8" stroke-dasharray="5 5"/>' +
      '<polygon points="' + area + '" fill="url(#btAreaGrad)"/>' +
      '<polyline points="' + points + '" fill="none" stroke="' + chartColor + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      breakMark +
      '<text x="' + left + '" y="' + (height - 12) + '" font-size="11" fill="#64748b">Month ' + rows[0].month + '</text>' +
      '<text x="' + (left + pw) + '" y="' + (height - 12) + '" text-anchor="end" font-size="11" fill="#64748b">Month ' + rows[rows.length - 1].month + '</text>' +
      '<text x="' + (left - 8) + '" y="' + (top + 5) + '" text-anchor="end" font-size="11" fill="#64748b">' + esc(money(max)) + '</text>' +
      '<text x="' + (left - 8) + '" y="' + (top + ph) + '" text-anchor="end" font-size="11" fill="#64748b">' + esc(money(min)) + '</text>' +
      '</svg>';
  }

  function calculate() {
    el.balanceVal.textContent = money(Number(el.balance.value) || 0);
    el.otherVal.textContent = money(Number(el.other.value) || 0);
    updateRegulatoryNote();

    var result = window.EMIFORMULA_BALANCE_TRANSFER.calculate({
      balance: Number(el.balance.value), oldRate: Number(el.oldRate.value), oldMonths: Number(el.oldMonths.value),
      newRate: Number(el.newRate.value), newMonths: Number(el.newMonths.value), foreclosure: Number(el.foreclosure.value),
      foreclosureGST: Number(el.foreclosureGST.value), processing: Number(el.processing.value), processingGST: Number(el.processingGST.value),
      other: Number(el.other.value)
    });
    if (!result.valid) {
      lastResult = null;
      el.verdict.className = 'bt-verdict bt-neutral';
      el.verdict.innerHTML = '<strong>Enter valid loan details</strong><span>' + esc(result.error) + '</span>';
      return;
    }
    lastResult = result;
    animateNumber(el.oldEmi, result.currentEMI, money); animateNumber(el.newEmi, result.newEMI, money);
    animateNumber(el.fees, result.switchingCosts, money); animateNumber(el.net, result.netSaving, money); if (el.otherVal) el.otherVal.textContent = money(result.switchingCosts);
    animateNumber(el.gross, result.grossInterestSaving, money); animateNumber(el.oldInterest, result.currentInterest, money);
    animateNumber(el.newInterest, result.newInterest, money); animateNumber(el.monthly, result.monthlyEmiDifference, money);

    if (el.heroRateGap) el.heroRateGap.textContent = (result.rateDifference >= 0 ? '' : '+') + Math.abs(result.rateDifference).toFixed(2) + ' pp';
    if (el.heroTenureGap) el.heroTenureGap.textContent = (result.tenureDifference > 0 ? '+' : result.tenureDifference < 0 ? '−' : '') + Math.abs(result.tenureDifference) + ' mo';
    if (el.heroCost) animateNumber(el.heroCost, result.switchingCosts, money, 450);
    if (el.newRateVal) el.newRateVal.textContent = Number(el.newRate.value).toFixed(2) + '%';
    if (el.newMonthsVal) el.newMonthsVal.textContent = result.newMonths + ' months';
    if (el.compareOldEmi) el.compareOldEmi.textContent = money(result.currentEMI);
    if (el.compareNewEmi) el.compareNewEmi.textContent = money(result.newEMI);
    if (el.compareOldRate) el.compareOldRate.textContent = Number(el.oldRate.value).toFixed(2) + '%';
    if (el.compareNewRate) el.compareNewRate.textContent = Number(el.newRate.value).toFixed(2) + '%';
    if (el.compareOldMonths) el.compareOldMonths.textContent = result.oldMonths + ' mo';
    if (el.compareNewMonths) el.compareNewMonths.textContent = result.newMonths + ' mo';
    if (el.interestPct) el.interestPct.textContent = Math.abs(result.interestSavingPct).toFixed(1) + '%';
    if (el.interestPctLabel) el.interestPctLabel.textContent = result.grossInterestSaving < 0 ? 'Interest increase' : 'Interest reduction';
    if (el.insightMonthly) el.insightMonthly.textContent = money(result.monthlyEmiDifference);
    if (el.insightTotal) el.insightTotal.textContent = money(result.totalCashflowSaving);

    var previousBreak = el.breakEven.dataset.value || '';
    var breakText = result.totalCostBreakEvenMonth !== null ? 'Month ' + result.totalCostBreakEvenMonth : 'Not reached';
    el.breakEven.textContent = breakText;
    el.breakEven.dataset.value = result.totalCostBreakEvenMonth == null ? '' : String(result.totalCostBreakEvenMonth);
    if (previousBreak !== el.breakEven.dataset.value) { el.breakEven.classList.remove('bt-pop'); void el.breakEven.offsetWidth; el.breakEven.classList.add('bt-pop'); }
    if (result.totalCostBreakEvenMonth !== null) {
      el.breakCopy.textContent = 'After switching costs and the remaining-loan balance are accounted for, the total-cost position reaches break-even in month ' + result.totalCostBreakEvenMonth + '.';
    } else if (result.cashFlowRecoveryMonth !== null && result.netSaving < 0) {
      el.breakCopy.textContent = 'The lower EMI recovers the switching cost on a cash-flow basis in month ' + result.cashFlowRecoveryMonth + ', but the total-cost position remains negative because the repayment path is longer or otherwise more expensive.';
    } else {
      el.breakCopy.textContent = 'The total-cost position does not recover the switching costs within the compared repayment horizon.';
    }
    if (el.breakPill) el.breakPill.textContent = result.totalCostBreakEvenMonth !== null ? '● Total-cost break-even: month ' + result.totalCostBreakEvenMonth : '● Total-cost break-even not reached';
    if (el.breakPillMobile) el.breakPillMobile.textContent = result.cashFlowRecoveryMonth !== null && result.totalCostBreakEvenMonth === null ? 'Cash-flow recovery: month ' + result.cashFlowRecoveryMonth + ' · total-cost break-even not reached' : (result.totalCostBreakEvenMonth !== null ? 'Total-cost recovery by month ' + result.totalCostBreakEvenMonth : 'No total-cost recovery within the comparison horizon');

    var maxBar = Math.max(result.switchingCosts, Math.abs(result.grossInterestSaving), 1);
    requestAnimationFrame(function () { el.costsBar.style.width = pct(result.switchingCosts / maxBar * 100) + '%'; el.savingsBar.style.width = pct(Math.abs(result.grossInterestSaving) / maxBar * 100) + '%'; });
    el.costsLabel.textContent = money(result.switchingCosts); el.savingsLabel.textContent = money(result.grossInterestSaving);
    if (el.savingsBar) el.savingsBar.classList.toggle('bt-negative', result.grossInterestSaving < 0);
    var savingsName = document.getElementById('label-savings-name');
    if (savingsName) savingsName.textContent = result.grossInterestSaving < 0 ? 'Interest cost increase' : 'Gross interest saved';

    if (el.breakRing) {
      var horizon = Math.max(1, result.oldMonths || result.newMonths || 1);
      var progress = result.totalCostBreakEvenMonth !== null ? Math.max(8, Math.min(96, result.totalCostBreakEvenMonth / horizon * 100)) : 0;
      var ringColor = result.netSaving < 0 ? '#d45b63' : '#55d8c7';
      el.breakRing.style.background = progress > 0 ? 'conic-gradient(' + ringColor + ' 0 ' + progress + '%, rgba(255,255,255,.1) ' + progress + '% 100%)' : 'conic-gradient(#d45b63 0 3%, rgba(255,255,255,.1) 3% 100%)';
      el.breakRing.classList.toggle('is-negative', result.netSaving < 0);
    }

    el.net.classList.remove('bt-result-positive', 'bt-result-negative');
    el.gross.classList.remove('bt-result-positive', 'bt-result-negative');
    if (el.insightTotal) el.insightTotal.classList.remove('bt-result-positive', 'bt-result-negative');
    if (result.netSaving > 0) {
      el.net.classList.add('bt-result-positive');
      el.verdict.className = 'bt-verdict bt-good';
      el.verdict.innerHTML = '<strong>Estimated net saving</strong><span>Estimated total saving: ' + money(result.netSaving) + (result.totalCostBreakEvenMonth !== null ? '. Total-cost break-even occurs in month ' + result.totalCostBreakEvenMonth + '.' : '.') + '</span>';
    } else {
      el.net.classList.add('bt-result-negative');
      el.gross.classList.add('bt-result-negative');
      if (el.insightTotal) el.insightTotal.classList.add('bt-result-negative');
      el.verdict.className = 'bt-verdict bt-bad';
      var detail = result.cashFlowRecoveryMonth !== null && result.monthlyEmiDifference > 0
        ? 'Monthly EMI is lower by ' + money(result.monthlyEmiDifference) + ', but the total-cost position does not break even.'
        : 'The calculated total cost remains higher after accounting for switching costs.';
      el.verdict.innerHTML = '<strong>Estimated net saving is negative</strong><span>' + detail + ' Net difference: ' + money(result.netSaving) + '.</span>';
    }

    renderDonut(result);
    renderCumulativeChart(result.monthlyComparison || [], result.totalCostBreakEvenMonth);
    renderTimeline(result.timeline || []);
  }

  var inputs = [el.balance,el.oldRate,el.oldMonths,el.newRate,el.newMonths,el.foreclosure,el.processing,el.foreclosureGST,el.processingGST,el.other,el.floating,el.purpose,el.year];
  inputs.forEach(function (node) { if (!node) return; node.addEventListener('input', calculate); node.addEventListener('change', calculate); });

  var rangePairs = [
    ['bt-balance','bt-balance-range'],['bt-old-rate','bt-old-rate-range'],['bt-old-months','bt-old-months-range'],
    ['bt-new-rate','bt-new-rate-range'],['bt-new-months','bt-new-months-range']
  ];
  rangePairs.forEach(function(pair){
    var field=document.getElementById(pair[0]), range=document.getElementById(pair[1]);
    if(!field || !range) return;
    field.addEventListener('input',function(){ range.value=field.value; });
    range.addEventListener('input',function(){ field.value=range.value; calculate(); });
  });

  document.querySelectorAll('[data-bt-preset]').forEach(function(btn){
    btn.addEventListener('click',function(){
      el.balance.value=btn.getAttribute('data-bt-preset');
      var r=document.getElementById('bt-balance-range'); if(r) r.value=el.balance.value;
      document.querySelectorAll('[data-bt-preset]').forEach(function(b){b.classList.remove('active')}); btn.classList.add('active');
      calculate();
    });
  });
  if(el.reset){ el.reset.addEventListener('click',function(){
    var defaults={balance:2000000,oldRate:10.5,oldMonths:120,newRate:9,newMonths:120,foreclosure:0,processing:20000,foreclosureGST:0,processingGST:3600,other:0};
    Object.keys(defaults).forEach(function(k){ if(el[k]) el[k].value=defaults[k]; });
    if(el.floating) el.floating.checked=true; if(el.purpose) el.purpose.value='individual'; if(el.year) el.year.value='2026';
    rangePairs.forEach(function(pair){var f=document.getElementById(pair[0]),r=document.getElementById(pair[1]);if(f&&r)r.value=f.value});
    document.querySelectorAll('[data-bt-preset]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-bt-preset')==='2000000')});
    calculate();
  });}
  calculate();
})();
