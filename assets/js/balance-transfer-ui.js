(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    balance: $('bt-balance'), balanceRange: $('bt-balance-range'), balanceVal: $('bt-balance-val'),
    oldRate: $('bt-old-rate'), oldMonths: $('bt-old-months'), newRate: $('bt-new-rate'), newMonths: $('bt-new-months'),
    foreclosure: $('bt-foreclosure'), processing: $('bt-processing'), foreclosureGST: $('bt-foreclosure-gst'),
    processingGST: $('bt-processing-gst'), other: $('bt-other'), otherVal: $('bt-other-val'), floating: $('bt-floating'),
    purpose: $('bt-purpose'), year: $('bt-year'), regNote: $('bt-reg-note'), verdict: $('bt-verdict'),
    oldEmi: $('res-old-emi'), newEmi: $('res-new-emi'), fees: $('res-fees'), net: $('res-net'), breakEven: $('res-breakeven'),
    breakCopy: $('res-break-copy'), gross: $('res-gross'), oldInterest: $('res-old-interest'), newInterest: $('res-new-interest'),
    monthly: $('res-monthly'), costsBar: $('bar-costs'), savingsBar: $('bar-savings'), costsLabel: $('label-costs'), savingsLabel: $('label-savings'),
    timeline: $('bt-timeline'), donut: $('bt-interest-donut'), donutPercent: $('bt-donut-percent'), legendNew: $('bt-legend-new-interest'),
    legendSaving: $('bt-legend-saving'), legendCost: $('bt-legend-cost'), cumulativeChart: $('bt-cumulative-chart'), heroRateGap: $('hero-rate-gap'), heroTenureGap: $('hero-tenure-gap'), compareOldEmi: $('compare-old-emi'), compareNewEmi: $('compare-new-emi'), compareOldRate: $('compare-old-rate'), compareNewRate: $('compare-new-rate'), compareOldMonths: $('compare-old-months'), compareNewMonths: $('compare-new-months'), interestPct: $('insight-interest-pct'), insightMonthly: $('insight-monthly'), insightTotal: $('insight-total'), breakPill: $('bt-break-pill'), breakPillMobile: $('bt-break-pill-mobile'), annualChart: $('bt-annual-chart'), advancedRateGap: $('bt-advanced-rate-gap'), costRatio: $('bt-cost-ratio'), advancedMonthly: $('bt-advanced-monthly')
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
      var cls = row.cumulative >= 0 ? 'positive' : '';
      return '<div class="bt-timeline-row ' + cls + '"><span>Month ' + row.month + '</span><strong>' + money(row.cumulative) + '</strong></div>';
    }).join('');
  }

  function renderDonut(result) {
    var currentInterest = Math.max(0, Number(result.currentInterest) || 0);
    var newInterest = Math.max(0, Number(result.newInterest) || 0);
    var saving = Math.max(0, Number(result.grossInterestSaving) || 0);
    var ratio = currentInterest > 0 ? pct(saving / currentInterest * 100) : 0;
    var degrees = ratio * 3.6;
    if (el.donut) el.donut.style.background = 'conic-gradient(var(--bt-accent) 0deg ' + degrees + 'deg, #cbd5e1 ' + degrees + 'deg 360deg)';
    animateNumber(el.donutPercent, ratio, function (v) { return Math.round(v) + '%'; }, 650);
    el.legendNew.textContent = money(newInterest);
    el.legendSaving.textContent = money(saving);
    el.legendCost.textContent = money(result.switchingCosts);
  }

  function renderCumulativeChart(rows, breakEvenMonth) {
    if (!rows || !rows.length) { el.cumulativeChart.innerHTML = '<div class="bt-chart-empty">No timeline available.</div>'; return; }
    var width = 820, height = 260, left = 54, right = 22, top = 22, bottom = 38;
    var pw = width - left - right, ph = height - top - bottom;
    var values = rows.map(function (r) { return Number(r.cumulative) || 0; });
    var min = Math.min.apply(null, values.concat([0])), max = Math.max.apply(null, values.concat([0]));
    if (max === min) max = min + 1;
    var x = function (i) { return left + (rows.length === 1 ? pw / 2 : i * pw / (rows.length - 1)); };
    var y = function (v) { return top + (max - v) / (max - min) * ph; };
    var points = rows.map(function (r, i) { return x(i).toFixed(1) + ',' + y(Number(r.cumulative) || 0).toFixed(1); }).join(' ');
    var zeroY = y(0).toFixed(1);
    var breakIndex = rows.findIndex(function (r) { return Number(r.month) === Number(breakEvenMonth); });
    var breakMark = '';
    if (breakIndex >= 0) {
      var bx = x(breakIndex), by = y(Number(rows[breakIndex].cumulative) || 0);
      breakMark = '<line x1="' + bx + '" y1="' + top + '" x2="' + bx + '" y2="' + (top + ph) + '" stroke="#14b8a6" stroke-dasharray="5 5"/><circle cx="' + bx + '" cy="' + by + '" r="6" fill="#fff" stroke="#0f766e" stroke-width="3"/><text x="' + bx + '" y="' + (top + 13) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#0f766e">Month ' + esc(breakEvenMonth) + '</text>';
    }
    var area = left + ',' + (top + ph) + ' ' + points + ' ' + (left + pw) + ',' + (top + ph);
    el.cumulativeChart.innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Cumulative transfer benefit chart">' +
      '<defs><linearGradient id="btAreaGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#14b8a6" stop-opacity=".24"/><stop offset="1" stop-color="#14b8a6" stop-opacity="0"/></linearGradient></defs>' +
      '<line x1="' + left + '" y1="' + zeroY + '" x2="' + (left + pw) + '" y2="' + zeroY + '" stroke="#94a3b8" stroke-dasharray="5 5"/>' +
      '<polygon points="' + area + '" fill="url(#btAreaGrad)"/>' +
      '<polyline points="' + points + '" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      breakMark +
      '<text x="' + left + '" y="' + (height - 12) + '" font-size="11" fill="#64748b">Month ' + rows[0].month + '</text>' +
      '<text x="' + (left + pw) + '" y="' + (height - 12) + '" text-anchor="end" font-size="11" fill="#64748b">Month ' + rows[rows.length - 1].month + '</text>' +
      '<text x="' + (left - 8) + '" y="' + (top + 5) + '" text-anchor="end" font-size="11" fill="#64748b">' + esc(money(max)) + '</text>' +
      '<text x="' + (left - 8) + '" y="' + (top + ph) + '" text-anchor="end" font-size="11" fill="#64748b">' + esc(money(min)) + '</text>' +
      '</svg>';
  }

  function renderAnnualChart(rows) {
    if (!el.annualChart) return;
    rows = Array.isArray(rows) ? rows : [];
    if (!rows.length) { el.annualChart.innerHTML = '<div class="bt-chart-empty">No annual comparison available.</div>'; return; }
    var width = 820, height = 250, left = 58, right = 20, top = 22, bottom = 34;
    var pw = width - left - right, ph = height - top - bottom;
    var values = [];
    rows.forEach(function (r) { values.push(Number(r.oldBalance)||0, Number(r.newBalance)||0); });
    var max = Math.max.apply(null, values.concat([1]));
    var x = function(i){ return left + (rows.length === 1 ? pw/2 : i*pw/(rows.length-1)); };
    var y = function(v){ return top + (max-v)/max*ph; };
    var oldPts = rows.map(function(r,i){ return x(i).toFixed(1)+','+y(Number(r.oldBalance)||0).toFixed(1); }).join(' ');
    var newPts = rows.map(function(r,i){ return x(i).toFixed(1)+','+y(Number(r.newBalance)||0).toFixed(1); }).join(' ');
    var labels = rows.map(function(r,i){ return '<text x="'+x(i)+'" y="'+(height-10)+'" text-anchor="middle" font-size="10" fill="#64748b">Y'+esc(r.year)+'</text>'; }).join('');
    el.annualChart.innerHTML = '<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Annual remaining balance comparison chart">' +
      '<line x1="'+left+'" y1="'+(top+ph)+'" x2="'+(left+pw)+'" y2="'+(top+ph)+'" stroke="#dbe5e9"/>' +
      '<polyline points="'+oldPts+'" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      '<polyline points="'+newPts+'" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' + labels + '</svg>';
  }

  function updateAdvancedSummary(result) {
    if (!result) return;
    var gap = Math.abs(Number(result.rateDifference)||0);
    var ratio = Number(result.grossInterestSaving) > 0 ? (Number(result.switchingCosts)||0) / Number(result.grossInterestSaving) * 100 : 0;
    if (el.advancedRateGap) el.advancedRateGap.textContent = gap.toFixed(2) + ' pp';
    if (el.costRatio) el.costRatio.textContent = Math.round(Math.max(0, ratio)) + '%';
    if (el.advancedMonthly) el.advancedMonthly.textContent = money(result.monthlyEmiDifference);
  }

  function applyPreset(name) {
    if (!name) return;
    if (name === 'same-tenure') el.newMonths.value = el.oldMonths.value;
    if (name === 'lower-rate') el.newRate.value = Math.max(0, Number(el.oldRate.value || 0) - 1).toFixed(1);
    if (name === 'fee-shock') el.other.value = '25000';
    if (name === 'clear-fees') { el.foreclosure.value = '0'; el.processing.value = '0'; el.foreclosureGST.value = '0'; el.processingGST.value = '0'; el.other.value = '0'; }
    calculate();
    document.querySelectorAll('[data-bt-preset]').forEach(function(btn){ btn.classList.toggle('active', btn.getAttribute('data-bt-preset') === name); });
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
    animateNumber(el.fees, result.switchingCosts, money); animateNumber(el.net, result.netSaving, money);
    animateNumber(el.gross, result.grossInterestSaving, money); animateNumber(el.oldInterest, result.currentInterest, money);
    animateNumber(el.newInterest, result.newInterest, money); animateNumber(el.monthly, result.monthlyEmiDifference, money);

    if (el.heroRateGap) el.heroRateGap.textContent = Math.abs(result.rateDifference).toFixed(2) + ' pp';
    if (el.heroTenureGap) el.heroTenureGap.textContent = (result.tenureDifference > 0 ? '-' : result.tenureDifference < 0 ? '+' : '') + Math.abs(result.tenureDifference) + ' mo';
    if (el.compareOldEmi) el.compareOldEmi.textContent = money(result.currentEMI);
    if (el.compareNewEmi) el.compareNewEmi.textContent = money(result.newEMI);
    if (el.compareOldRate) el.compareOldRate.textContent = Number(el.oldRate.value).toFixed(2) + '%';
    if (el.compareNewRate) el.compareNewRate.textContent = Number(el.newRate.value).toFixed(2) + '%';
    if (el.compareOldMonths) el.compareOldMonths.textContent = result.oldMonths + ' mo';
    if (el.compareNewMonths) el.compareNewMonths.textContent = result.newMonths + ' mo';
    if (el.interestPct) el.interestPct.textContent = Math.max(0, result.interestSavingPct).toFixed(1) + '%';
    if (el.insightMonthly) el.insightMonthly.textContent = money(result.monthlyEmiDifference);
    if (el.insightTotal) el.insightTotal.textContent = money(result.totalCashflowSaving);

    var previousBreak = el.breakEven.dataset.value || '';
    var breakText = result.breakEvenMonth !== null ? 'Month ' + result.breakEvenMonth : 'Not reached';
    el.breakEven.textContent = breakText;
    el.breakEven.dataset.value = result.breakEvenMonth == null ? '' : String(result.breakEvenMonth);
    if (previousBreak !== el.breakEven.dataset.value) { el.breakEven.classList.remove('bt-pop'); void el.breakEven.offsetWidth; el.breakEven.classList.add('bt-pop'); }
    el.breakCopy.textContent = result.breakEvenMonth !== null ? 'Based on the entered assumptions, cumulative savings recover the switching costs in month ' + result.breakEvenMonth + '.' : 'The calculated savings do not recover the switching costs within the compared repayment horizon.';
    if (el.breakPill) el.breakPill.textContent = result.breakEvenMonth !== null ? '● Break-even: month ' + result.breakEvenMonth : '● Break-even not reached';
    if (el.breakPillMobile) el.breakPillMobile.textContent = result.breakEvenMonth !== null ? 'Switching costs recovered by month ' + result.breakEvenMonth : 'Switching costs are not recovered within the comparison horizon';

    var maxBar = Math.max(result.switchingCosts, result.grossInterestSaving, 1);
    requestAnimationFrame(function () { el.costsBar.style.width = pct(result.switchingCosts / maxBar * 100) + '%'; el.savingsBar.style.width = pct(Math.max(0, result.grossInterestSaving) / maxBar * 100) + '%'; });
    el.costsLabel.textContent = money(result.switchingCosts); el.savingsLabel.textContent = money(result.grossInterestSaving);

    if (result.netSaving > 0 && result.breakEvenMonth !== null) {
      el.verdict.className = 'bt-verdict bt-good';
      el.verdict.innerHTML = '<strong>Estimated positive saving</strong><span>Estimated net saving: ' + money(result.netSaving) + '. Break-even occurs around month ' + result.breakEvenMonth + ' under these assumptions.</span>';
    } else if (result.netSaving <= 0) {
      el.verdict.className = 'bt-verdict bt-bad';
      el.verdict.innerHTML = '<strong>Estimated savings are negative</strong><span>Switching costs exceed the calculated gross interest saving by ' + money(Math.abs(result.netSaving)) + ' under these assumptions.</span>';
    } else {
      el.verdict.className = 'bt-verdict bt-neutral';
      el.verdict.innerHTML = '<strong>Break-even is not reached</strong><span>The calculated transfer does not recover its switching costs within the compared repayment horizon.</span>';
    }

    renderDonut(result);
    renderCumulativeChart(result.monthlyComparison || [], result.breakEvenMonth);
    renderAnnualChart(result.annualSummary || []);
    updateAdvancedSummary(result);
    renderTimeline(result.timeline || []);
  }

  document.querySelectorAll('[data-bt-preset]').forEach(function (btn) { btn.addEventListener('click', function () { applyPreset(btn.getAttribute('data-bt-preset')); }); });

  var inputs = [el.balance,el.oldRate,el.oldMonths,el.newRate,el.newMonths,el.foreclosure,el.processing,el.foreclosureGST,el.processingGST,el.other,el.floating,el.purpose,el.year];
  inputs.forEach(function (node) { node.addEventListener('input', calculate); node.addEventListener('change', calculate); });
  el.balance.addEventListener('input', function () { el.balanceRange.value = el.balance.value; });
  el.balanceRange.addEventListener('input', function () { el.balance.value = el.balanceRange.value; calculate(); });
  calculate();
})();
