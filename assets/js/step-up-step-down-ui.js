(function () {
  'use strict';
  var E = window.StepUpDownEngine;
  var L = window.StepUpDownLocale;
  if (!E || !L) return;

  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var num = E.normalizeNumber;
  var state = {
    method: null,
    customCount: 1,
    currentSource: 'loan',
    lastResult: null,
    currency: '',
    customEntries: []
  };

  var loanIds = ['#sud-loan', '#sud-rate', '#sud-tenure'];
  var currentInput = $('#sud-current');
  var switchText = $('#sud-input-mode');
  var liveTimer = null;
  var calculating = false;

  function money(n) { return state.currency ? L.formatMoney(n, state.currency) : '—'; }
  function monthsText(m) {
    var years = Math.floor(m / 12), months = m % 12;
    if (!years) return months + ' months';
    if (!months) return years + (years === 1 ? ' year' : ' years');
    return years + (years === 1 ? ' year ' : ' years ') + months + ' months';
  }

  function setError(message) {
    var el = $('#sud-error');
    el.textContent = message || '';
    el.hidden = !message;
  }

  function clearFieldErrors() {
    $$('.sud-field input, .sud-field select, .sud-current input').forEach(function (el) {
      el.classList.remove('sud-invalid');
      el.removeAttribute('aria-invalid');
    });
  }

  function markInvalid(el) {
    if (!el) return;
    el.classList.add('sud-invalid');
    el.setAttribute('aria-invalid', 'true');
  }

  function setLoanDisabled(disabled) {
    loanIds.forEach(function (id) { $(id).disabled = disabled; });
  }

  function hasLoanDetails() {
    return loanIds.every(function (id) { return num($(id).value) > 0; });
  }

  function anyLoanDetail() {
    return loanIds.some(function (id) { return String($(id).value || '').trim() !== ''; });
  }

  function routeMode() {
    return state.currentSource;
  }

  function refreshCurrentEmi() {
    var display = $('#sud-current-value');
    var principal = num($('#sud-loan').value);
    var rate = num($('#sud-rate').value);
    var years = num($('#sud-tenure').value);
    currentInput.readOnly = true;
    setLoanDisabled(false);
    if (principal > 0 && years > 0 && rate >= 0) {
      var emi = E.standardEmi(principal, rate, Math.round(years * 12));
      currentInput.value = Math.round(emi * 100) / 100;
      if (display) display.textContent = money(emi) + ' / month';
      $('#sud-current-help').textContent = 'Calculated automatically from your Loan Amount, Interest Rate and Loan Tenure.';
      return emi;
    }
    currentInput.value = '';
    if (display) display.textContent = '—';
    $('#sud-current-help').textContent = 'Complete the 3 required loan details to calculate Current EMI.';
    return 0;
  }

  function updateCurrencyPlaceholders() {
    $('#sud-loan').placeholder = 'Enter loan amount';
    $('#sud-new-emi').placeholder = 'Enter new EMI';
    $$('.sud-custom-emi').forEach(function (input) { input.placeholder = 'Enter new EMI'; });
  }

  function applyCurrency() {
    state.currency = $('#sud-currency').value || '';
    updateCurrencyPlaceholders();
    refreshCurrentEmi();
    if (state.lastResult) renderResults(state.lastResult.result, state.lastResult.currentEmi, state.lastResult.schedule, state.lastResult.mode, true);
    else maybeLiveCalculate();
  }

  function applyDesktopModeClass() {
    var ua = navigator.userAgent || '';
    var desktopUA = !/Android|iPhone|iPad|iPod|Mobile/i.test(ua) || /Windows NT|Macintosh|X11; Linux/i.test(ua);
    if (desktopUA) document.querySelector('.sud-page').classList.add('sud-desktop-mode');
  }

  function initCurrency() {
    var select = $('#sud-currency');
    select.innerHTML = '<option value="">Select currency</option>';
    L.options.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.code;
      option.textContent = item.label;
      select.appendChild(option);
    });
    select.value = L.defaultCurrency || '';
    state.currency = select.value || '';
    select.addEventListener('change', applyCurrency);
  }

  function syncSourceFromLoanInput() {
    state.currentSource = 'loan';
    refreshCurrentEmi();
    scheduleLive();
  }

  function renderCustomRows() {
    var wrap = $('#sud-custom-rows');
    state.customEntries = state.customEntries.slice(0, state.customCount);
    wrap.innerHTML = '';
    for (var i = 0; i < state.customCount; i += 1) {
      var entry = state.customEntries[i] || {};
      var row = document.createElement('div');
      row.className = 'sud-custom-row';
      row.innerHTML = '<div class="sud-field"><label>New EMI <span class="sud-required" aria-hidden="true">*</span> <button type="button" class="sud-q" data-faq="faq-new-emi" aria-label="Learn about New EMI">?</button></label><div class="sud-input-wrap"><input type="number" min="0.01" step="0.01" class="sud-custom-emi" inputmode="decimal" placeholder="Enter new EMI"></div></div>' +
        '<div class="sud-field"><label>Starts From Month <span class="sud-required" aria-hidden="true">*</span> <button type="button" class="sud-q" data-faq="faq-change-month" aria-label="Learn about the change month">?</button></label><div class="sud-input-wrap"><input type="number" min="2" step="1" class="sud-custom-month" inputmode="numeric" placeholder="Enter month"></div></div>' +
        '<button type="button" class="sud-icon-btn" aria-label="Remove this change" data-remove="' + i + '">×</button>';
      wrap.appendChild(row);
      $('.sud-custom-emi', row).value = entry.emi || '';
      $('.sud-custom-month', row).value = entry.startMonth || '';
    }
    $('#sud-add-custom').disabled = state.customCount >= 5;
    updateCurrencyPlaceholders();
  }

  function captureCustomRows() {
    state.customEntries = $$('.sud-custom-row').map(function (row) {
      return { emi: $('.sud-custom-emi', row).value, startMonth: $('.sud-custom-month', row).value };
    });
  }

  function setDynamic() {
    captureCustomRows();
    $$('.sud-dynamic').forEach(function (el) { el.hidden = el.id !== 'sud-dynamic-' + state.method; });
    if (state.method === 'custom') renderCustomRows();
    scheduleLive();
  }

  function collectSchedule(currentEmi) {
    if (!state.method) throw new Error('Choose an EMI change method.');
    if (state.method === 'one-time') {
      var newEmi = num($('#sud-new-emi').value);
      var month = Math.floor(num($('#sud-change-month').value));
      if (!newEmi) { markInvalid($('#sud-new-emi')); throw new Error('Enter the new EMI.'); }
      if (month < 2) { markInvalid($('#sud-change-month')); throw new Error('Enter a starting month of 2 or later.'); }
      return [{ startMonth: 1, emi: currentEmi }, { startMonth: month, emi: newEmi }];
    }
    if (state.method === 'periodic') {
      var changeRaw = String($('#sud-periodic-change').value || '').trim();
      var change = Number(changeRaw);
      if (!changeRaw || !Number.isFinite(change) || change === 0 || change <= -100) {
        markInvalid($('#sud-periodic-change'));
        throw new Error('Enter a periodic EMI change percentage. Use a positive value to increase EMI or a negative value to decrease it.');
      }
      var frequency = $('#sud-periodic-frequency').value;
      if (!frequency) {
        markInvalid($('#sud-periodic-frequency'));
        throw new Error('Select how often the EMI should change.');
      }
      return E.buildPeriodic(currentEmi, change, frequency, 200);
    }
    captureCustomRows();
    var entries = state.customEntries.map(function (entry) {
      return { emi: num(entry.emi), startMonth: Math.floor(num(entry.startMonth)) };
    });
    if (!entries.length || entries.some(function (x) { return !x.emi || x.startMonth < 2; })) throw new Error('Complete every custom EMI and starting month.');
    for (var i = 1; i < entries.length; i += 1) {
      if (entries[i].startMonth <= entries[i - 1].startMonth) throw new Error('Each next custom change must start at least one month after the previous change.');
    }
    return E.buildCustom(entries, currentEmi);
  }

  function clearResults() {
    $('#sud-results').classList.add('sud-results-empty');
    $('#sud-kpi-payoff').textContent = '—';
    $('#sud-kpi-time').textContent = '—';
    $('#sud-kpi-interest').textContent = '—';
    $('#sud-kpi-interest-delta .value').textContent = '—';
    $('#sud-kpi-total').textContent = '—';
    $('#sud-kpi-impact .value').textContent = '—';
    $('#sud-insight').textContent = 'Complete the required loan details and choose an EMI change plan to see the full loan impact.';
    $('#sud-chart').innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="13">Loan balance comparison will appear when loan details are available.</text>';
    $('#sud-donut').style.setProperty('--principal-share', '0%');
    $('#sud-donut-center').textContent = '—';
    $('#sud-legend').innerHTML = '<span>Complete inputs to see breakdown</span>';
    $('#sud-schedule-body').innerHTML = '';
    $('#sud-monthly-details').open = false;
    state.lastResult = null;
  }

  function renderScheduleRows(rows) {
    $('#sud-schedule-body').innerHTML = rows.map(function (r) {
      return '<tr><td>' + r.month + '</td><td>' + money(r.emi) + '</td><td>' + money(r.interest) + '</td><td>' + money(r.principal) + '</td><td>' + money(r.balance) + '</td></tr>';
    }).join('');
  }

  function renderResults(result, currentEmi, schedule, mode, keepPosition) {
    var wrap = $('#sud-results');
    wrap.classList.remove('sud-results-empty');
    var full = result && result.valid;
    if (!full) { clearResults(); return; }
    var firstChanged = schedule.length > 1 ? schedule[1].emi : currentEmi;
    var diff = firstChanged - currentEmi;
    var loanPrincipal = num($('#sud-loan').value), loanRate = num($('#sud-rate').value), loanYears = num($('#sud-tenure').value);
    var standard = E.simulate(loanPrincipal, loanRate, [{ startMonth: 1, emi: E.standardEmi(loanPrincipal, loanRate, Math.round(loanYears * 12)) }], Math.max(1200, Math.round(loanYears * 12) + 24));

    var k1 = $('#sud-kpi-payoff'), k2 = $('#sud-kpi-time'), k3 = $('#sud-kpi-interest');
    var k4 = $('#sud-kpi-interest-delta'), k5 = $('#sud-kpi-total'), k6 = $('#sud-kpi-impact');
    var interestDelta = standard.interest - result.interest;
    k1.parentElement.querySelector('.label').innerHTML = 'Loan payoff time <button aria-label="Learn about loan payoff time" class="sud-q" data-faq="faq-payoff" type="button">?</button>';
    k1.textContent = monthsText(result.months);
    k2.parentElement.querySelector('.label').innerHTML = 'Time saved / extended <button aria-label="Learn about time saved" class="sud-q" data-faq="faq-time" type="button">?</button>';
    k2.textContent = standard.months - result.months >= 0 ? (standard.months - result.months) + ' months saved' : Math.abs(standard.months - result.months) + ' months longer';
    k3.parentElement.querySelector('.label').innerHTML = 'Total interest <button aria-label="Learn about total interest" class="sud-q" data-faq="faq-interest" type="button">?</button>';
    k3.textContent = money(result.interest);
    k4.className = 'sud-kpi ' + (interestDelta >= 0 ? 'good' : 'bad');
    k4.querySelector('.label').innerHTML = (interestDelta >= 0 ? 'Interest saved' : 'Additional interest') + ' <button type="button" class="sud-q" data-faq="faq-interest" aria-label="Learn about interest saved">?</button>';
    k4.querySelector('.value').textContent = money(Math.abs(interestDelta));
    k5.parentElement.querySelector('.label').innerHTML = 'Total repayment <button aria-label="Learn about total repayment" class="sud-q" data-faq="faq-total-repayment" type="button">?</button>';
    k5.textContent = money(result.paid);
    k6.className = 'sud-kpi ' + (diff >= 0 ? 'good' : 'bad');
    k6.querySelector('.label').innerHTML = (diff >= 0 ? 'Monthly EMI increase' : 'Monthly EMI reduction') + ' <button type="button" class="sud-q" data-faq="faq-monthly-impact" aria-label="Learn about monthly EMI impact">?</button>';
    k6.querySelector('.value').textContent = money(Math.abs(diff));

    var deltaMonths = standard.months - result.months;
    $('#sud-insight').textContent = deltaMonths >= 0
      ? 'Your EMI plan is estimated to repay the loan ' + deltaMonths + ' months earlier and save about ' + money(Math.abs(interestDelta)) + ' in interest.'
      : 'Your EMI plan is estimated to extend the loan by ' + Math.abs(deltaMonths) + ' months and add about ' + money(Math.abs(interestDelta)) + ' in interest.';

    var principalShare = result.paid ? (loanPrincipal / result.paid) * 100 : 0;
    $('#sud-donut').style.setProperty('--principal-share', Math.max(0, Math.min(100, principalShare)) + '%');
    $('#sud-donut-center').textContent = Math.round(principalShare) + '% principal';
    $('#sud-legend').innerHTML = '<span>Principal ' + money(loanPrincipal) + '</span><span>Interest ' + money(result.interest) + '</span>';
    drawChart(standard.rows, result.rows);
    var chartWrap = $('.sud-chart-wrap');
    if (chartWrap) chartWrap.hidden = false;
    $('#sud-monthly-details').hidden = false;
    $('#sud-schedule-body').innerHTML = '';
    $('#sud-monthly-details').open = false;
    state.lastResult = { result: result, standard: standard, schedule: schedule, currentEmi: currentEmi, mode: mode, currency: state.currency };

    if (!keepPosition && !calculating) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function drawChart(standardRows, planRows) {
    var svg = $('#sud-chart'), width = 720, height = 210, pad = 30;
    var maxPoints = 180;
    function sample(rows) {
      if (rows.length <= maxPoints) return rows;
      var out = [], step = (rows.length - 1) / (maxPoints - 1);
      for (var i = 0; i < maxPoints; i += 1) out.push(rows[Math.round(i * step)]);
      return out;
    }
    var standard = sample(standardRows), plan = sample(planRows);
    var points = Math.max(standard.length, plan.length), step = points > 1 ? (width - pad * 2) / (points - 1) : 1;
    var max = Math.max.apply(null, standard.concat(plan).map(function (r) { return r.balance; })) || 1;
    function path(rows) { return rows.map(function (r, i) { var x = pad + i * step; var y = height - pad - (r.balance / max) * (height - pad * 2); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join(' '); }
    svg.innerHTML = '<line x1="30" y1="180" x2="690" y2="180" stroke="#dce5f0"/><path d="' + path(standard) + '" fill="none" stroke="#9aaabd" stroke-width="3" stroke-linecap="round"/><path d="' + path(plan) + '" fill="none" stroke="#1557b0" stroke-width="3" stroke-linecap="round"/><text x="35" y="20" fill="#64748b" font-size="12">Outstanding balance</text><text x="520" y="25" fill="#64748b" font-size="12">Standard</text><line x1="475" y1="21" x2="510" y2="21" stroke="#9aaabd" stroke-width="3"/><text x="635" y="25" fill="#1557b0" font-size="12">Your plan</text><line x1="590" y1="21" x2="625" y2="21" stroke="#1557b0" stroke-width="3"/>';
  }

  function faqJump(id) {
    var target = document.getElementById(id);
    if (!target) return;
    target.open = true;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.remove('sud-jump');
    void target.offsetWidth;
    target.classList.add('sud-jump');
  }

  function validateForCalculation() {
    clearFieldErrors();
    if (!state.currency) throw new Error('Select a currency first.');
    var currentEmi = refreshCurrentEmi();
    if (!currentEmi) {
      markInvalid($('#sud-loan')); markInvalid($('#sud-rate')); markInvalid($('#sud-tenure'));
      throw new Error('Complete Loan Amount, Interest Rate and Loan Tenure.');
    }
    if (!state.method) throw new Error('Choose how your EMI will change.');
    var schedule = collectSchedule(currentEmi);
    var principal = num($('#sud-loan').value), rate = num($('#sud-rate').value), months = Math.round(num($('#sud-tenure').value) * 12);
    if (!principal || !months || rate < 0) throw new Error('Complete the 3 loan details for full analysis.');
    var result = E.simulate(principal, rate, schedule, Math.max(1200, months + 24));
    if (!result.valid) throw new Error(result.reason);
    return { result: result, currentEmi: currentEmi, schedule: schedule, mode: state.currentSource, partial: false };
  }

  function performCalculation(scrollToResult) {
    if (calculating) return;
    calculating = true;
    try {
      var data = validateForCalculation();
      renderResults(data.result, data.currentEmi, data.schedule, data.mode, !scrollToResult);
      setError('');
    } catch (err) {
      setError(err.message);
      clearResults();
    } finally {
      calculating = false;
    }
  }

  function maybeLiveCalculate() {
    if (!state.currency || !state.method) {
      clearResults();
      return;
    }
    var currentEmi = refreshCurrentEmi();
    var changeReady = false;
    if (state.method === 'one-time') changeReady = num($('#sud-new-emi').value) > 0 && num($('#sud-change-month').value) >= 2;
    if (state.method === 'periodic') changeReady = String($('#sud-periodic-change').value || '').trim() !== '' && Number($('#sud-periodic-change').value) !== 0 && !!$('#sud-periodic-frequency').value;
    if (state.method === 'custom') {
      captureCustomRows();
      changeReady = state.customEntries.length > 0 && state.customEntries.every(function (x) { return num(x.emi) > 0 && Math.floor(num(x.startMonth)) >= 2; });
    }
    if (currentEmi && changeReady) performCalculation(false);
    else clearResults();
  }

  function scheduleLive() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(maybeLiveCalculate, 120);
  }

  var printReport = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getPlanPrintDetails() {
    if (state.method === 'one-time') {
      return 'One-Time Change: ' + money(num($('#sud-new-emi').value)) + ' from Month ' + Math.floor(num($('#sud-change-month').value));
    }
    if (state.method === 'periodic') {
      var pct = String($('#sud-periodic-change').value || '').trim();
      var freq = $('#sud-periodic-frequency').value || '';
      return 'Periodic Change: ' + escapeHtml(pct) + '% ' + (Number(pct) > 0 ? 'increase' : 'decrease') + ', ' + escapeHtml(freq);
    }
    if (state.method === 'custom') {
      captureCustomRows();
      return 'Custom Schedule: ' + state.customEntries.length + ' EMI changes';
    }
    return 'No EMI change plan selected';
  }

  function buildPrintReport() {
    removePrintReport();
    if (!state.lastResult || !state.lastResult.result || !state.lastResult.result.valid) return;
    var data = state.lastResult;
    var result = data.result;
    var standard = data.standard;
    var loan = num($('#sud-loan').value);
    var rate = num($('#sud-rate').value);
    var years = num($('#sud-tenure').value);
    var interestDelta = standard.interest - result.interest;
    var timeDelta = standard.months - result.months;
    var firstChanged = data.schedule.length > 1 ? data.schedule[1].emi : data.currentEmi;
    var monthlyDelta = firstChanged - data.currentEmi;
    var methodText = state.method === 'one-time' ? 'One-Time Change' : state.method === 'periodic' ? 'Periodic Change' : 'Custom Schedule';
    var report = document.createElement('div');
    report.className = 'sud-print-report';
    report.innerHTML =
      '<div class="sud-print-page sud-print-summary-page">' +
        '<header class="sud-print-brand"><div><div class="sud-print-brand-name">E EMIFORMULA</div><h1>Step-Up / Step-Down EMI Analysis</h1><p>Loan impact report for your selected EMI change plan</p></div><div class="sud-print-currency">' + escapeHtml(state.currency || '') + '</div></header>' +
        '<div class="sud-print-columns">' +
          '<section class="sud-print-panel sud-print-inputs"><h2>Loan &amp; EMI Plan</h2>' +
            '<div class="sud-print-grid">' +
              '<div><span>Loan amount</span><strong>' + money(loan) + '</strong></div>' +
              '<div><span>Interest rate</span><strong>' + escapeHtml(rate) + '%</strong></div>' +
              '<div><span>Loan tenure</span><strong>' + escapeHtml(years) + ' years</strong></div>' +
              '<div><span>Current EMI</span><strong>' + money(data.currentEmi) + '</strong></div>' +
            '</div>' +
            '<div class="sud-print-plan"><span>EMI change plan</span><strong>' + methodText + '</strong><small>' + getPlanPrintDetails() + '</small></div>' +
          '</section>' +
          '<section class="sud-print-panel sud-print-results"><h2>Loan Impact</h2>' +
            '<div class="sud-print-kpis">' +
              '<div><span>Loan payoff time</span><strong>' + monthsText(result.months) + '</strong></div>' +
              '<div><span>Time saved / extended</span><strong class="' + (timeDelta >= 0 ? 'positive' : 'negative') + '">' + (timeDelta >= 0 ? timeDelta + ' months saved' : Math.abs(timeDelta) + ' months longer') + '</strong></div>' +
              '<div><span>Total interest</span><strong>' + money(result.interest) + '</strong></div>' +
              '<div><span>' + (interestDelta >= 0 ? 'Interest saved' : 'Additional interest') + '</span><strong class="' + (interestDelta >= 0 ? 'positive' : 'negative') + '">' + money(Math.abs(interestDelta)) + '</strong></div>' +
              '<div><span>Total repayment</span><strong>' + money(result.paid) + '</strong></div>' +
              '<div><span>Monthly EMI impact</span><strong class="' + (monthlyDelta >= 0 ? 'positive' : 'negative') + '">' + (monthlyDelta >= 0 ? '+' : '-') + money(Math.abs(monthlyDelta)) + '</strong></div>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="sud-print-insight"><strong>Key insight</strong><p>' + escapeHtml($('#sud-insight').textContent) + '</p></div>' +
        '<div class="sud-print-visuals"><section class="sud-print-visual-panel"><h2>Outstanding balance over time</h2><div class="sud-print-chart-holder"></div></section><section class="sud-print-visual-panel sud-print-donut-panel"><h2>Repayment composition</h2><div class="sud-print-donut-holder"></div><div class="sud-print-legend"></div></section></div>' +
        '<div class="sud-print-footer">EMIFORMULA · For informational and calculation purposes</div>' +
      '</div>' +
      '<div class="sud-print-page sud-print-schedule-page">' +
        '<header class="sud-print-section-header"><div><div class="sud-print-brand-name">E EMIFORMULA</div><h1>Month-by-Month Repayment Schedule</h1><p>Complete amortization schedule for the selected EMI plan</p></div><div class="sud-print-currency">' + escapeHtml(state.currency || '') + '</div></header>' +
        '<table class="sud-print-table"><thead><tr><th>Month</th><th>EMI</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody></tbody></table>' +
        '<div class="sud-print-footer">EMIFORMULA · Month-by-month schedule</div>' +
      '</div>';
    document.body.appendChild(report);

    var chart = $('#sud-chart');
    var chartHolder = $('.sud-print-chart-holder', report);
    if (chart && chartHolder) chartHolder.appendChild(chart.cloneNode(true));
    var donut = $('#sud-donut');
    var donutHolder = $('.sud-print-donut-holder', report);
    if (donut && donutHolder) donutHolder.appendChild(donut.cloneNode(true));
    var legend = $('#sud-legend');
    var legendHolder = $('.sud-print-legend', report);
    if (legend && legendHolder) legendHolder.innerHTML = legend.innerHTML;

    var tbody = $('.sud-print-table tbody', report);
    tbody.innerHTML = result.rows.map(function (r) {
      return '<tr><td>' + r.month + '</td><td>' + money(r.emi) + '</td><td>' + money(r.interest) + '</td><td>' + money(r.principal) + '</td><td>' + money(r.balance) + '</td></tr>';
    }).join('');
    printReport = report;
  }

  function removePrintReport() {
    if (printReport && printReport.parentNode) printReport.parentNode.removeChild(printReport);
    printReport = null;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.sud-q');
    if (btn) { e.preventDefault(); faqJump(btn.dataset.faq); }
  });

  $$('.sud-method').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.method = btn.dataset.method;
      $$('.sud-method').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      setDynamic();
      setError('');
    });
  });

  $('#sud-add-custom').addEventListener('click', function () {
    captureCustomRows();
    if (state.customCount < 5) { state.customCount += 1; renderCustomRows(); }
  });

  $('#sud-custom-rows').addEventListener('input', scheduleLive);
  $('#sud-custom-rows').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove]');
    if (!btn) return;
    captureCustomRows();
    var index = Number(btn.dataset.remove);
    state.customEntries.splice(index, 1);
    state.customCount = Math.max(1, state.customCount - 1);
    renderCustomRows();
    scheduleLive();
  });

  loanIds.forEach(function (id) { $(id).addEventListener('input', syncSourceFromLoanInput); });
  $$('.sud-dynamic input, .sud-dynamic select').forEach(function (el) { el.addEventListener('input', scheduleLive); el.addEventListener('change', scheduleLive); });

  $('#sud-calculate').addEventListener('click', function () {
    performCalculation(true);
  });

  $('#sud-monthly-details').addEventListener('toggle', function () {
    if (this.open && state.lastResult && state.lastResult.result && state.lastResult.result.valid) renderScheduleRows(state.lastResult.result.rows);
  });

  $('#sud-results').addEventListener('click', function (e) {
    var exportType = e.target.dataset.export;
    if (!exportType || !state.lastResult || !state.lastResult.result.valid) return;
    var r = state.lastResult.result;
    if (exportType === 'csv') {
      var csv = 'Currency,' + state.currency + '\nMonth,EMI,Interest,Principal,Balance\n' + r.rows.map(function (x) { return [x.month, x.emi, x.interest, x.principal, x.balance].join(','); }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'step-up-step-down-emi-schedule.csv'; a.click(); URL.revokeObjectURL(a.href);
    }
    if (exportType === 'json') {
      var blob = new Blob([JSON.stringify(state.lastResult, null, 2)], { type: 'application/json' }); var a2 = document.createElement('a'); a2.href = URL.createObjectURL(blob); a2.download = 'step-up-step-down-emi-result.json'; a2.click(); URL.revokeObjectURL(a2.href);
    }
    if (exportType === 'print') {
      buildPrintReport();
      window.print();
    }
  });

  window.addEventListener('afterprint', removePrintReport);

  window.addEventListener('scroll', function () { $('#sud-backtop').classList.toggle('is-visible', window.scrollY > 500); }, { passive: true });
  $('#sud-backtop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  applyDesktopModeClass();
  initCurrency();
  updateCurrencyPlaceholders();
  refreshCurrentEmi();
  setDynamic();
  clearResults();
}());
