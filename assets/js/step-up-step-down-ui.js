(function () {
  'use strict';
  var E = window.StepUpDownEngine;
  var L = window.StepUpDownLocale;
  if (!E || !L) return;

  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var num = E.normalizeNumber;
  var state = {
    method: 'one-time', customCount: 1, currentSource: 'none', lastResult: null,
    currency: L.defaultCurrency, customEntries: []
  };

  var loanIds = ['#sud-loan', '#sud-rate', '#sud-tenure'];
  var currentInput = $('#sud-current');
  var switchText = $('#sud-input-mode');

  function money(n) { return L.formatMoney(n, state.currency); }
  function monthsText(m) {
    var years = Math.floor(m / 12), months = m % 12;
    if (!years) return months + ' months';
    if (!months) return years + (years === 1 ? ' year' : ' years');
    return years + (years === 1 ? ' year ' : ' years ') + months + ' months';
  }

  function setLoanDisabled(disabled) {
    loanIds.forEach(function (id) { $(id).disabled = disabled; });
  }

  function hasLoanDetails() {
    return loanIds.every(function (id) { return num($(id).value) > 0; });
  }

  function routeMode() {
    if (state.currentSource === 'loan') return 'loan';
    if (state.currentSource === 'emi') return 'emi';
    return 'none';
  }

  function refreshCurrentEmi() {
    var box = $('#sud-current-display'), display = $('#sud-current-value');
    if (state.currentSource === 'loan') {
      var principal = num($('#sud-loan').value), rate = num($('#sud-rate').value), years = num($('#sud-tenure').value);
      currentInput.readOnly = true;
      setLoanDisabled(false);
      if (!principal || !years || rate < 0) {
        currentInput.value = '';
        display.textContent = '—';
        box.hidden = false;
        box.querySelector('small').textContent = 'Complete Loan Amount, Interest Rate and Loan Tenure to calculate EMI.';
        return 0;
      }
      var emi = E.standardEmi(principal, rate, Math.round(years * 12));
      currentInput.value = Math.round(emi * 100) / 100;
      display.textContent = money(emi) + ' / month';
      box.hidden = false;
      box.querySelector('small').textContent = 'Calculated from your loan details.';
      return emi;
    }
    if (state.currentSource === 'emi') {
      currentInput.readOnly = false;
      setLoanDisabled(true);
      var direct = num(currentInput.value);
      display.textContent = direct ? money(direct) + ' / month' : '—';
      box.hidden = false;
      box.querySelector('small').textContent = 'Entered by you.';
      return direct;
    }
    currentInput.readOnly = false;
    setLoanDisabled(false);
    box.hidden = true;
    return 0;
  }

  function updateCurrencyPlaceholders() {
    var currency = state.currency;
    var sample = L.formatMoney(1000, currency).replace(/[\d.,\s]/g, '').trim() || currency + ' ';
    $('#sud-loan').placeholder = sample + '10,000';
    $('#sud-current').placeholder = sample + '500';
    $('#sud-new-emi').placeholder = sample + '750';
    $$('.sud-custom-emi').forEach(function (input) { input.placeholder = sample + '600'; });
  }

  function applyCurrency() {
    var currency = $('#sud-currency').value || L.defaultCurrency;
    state.currency = currency;
    updateCurrencyPlaceholders();
    if (state.currentSource) refreshCurrentEmi();
    if (state.lastResult) renderResults(state.lastResult.result, state.lastResult.currentEmi, state.lastResult.schedule, state.lastResult.mode, true);
  }

  function initCurrency() {
    var select = $('#sud-currency');
    L.options.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.code; option.textContent = item.label;
      select.appendChild(option);
    });
    select.value = state.currency;
    select.addEventListener('change', applyCurrency);
  }

  function syncSourceFromLoanInput() {
    if (hasLoanDetails()) {
      state.currentSource = 'loan';
    } else if (loanIds.some(function (id) { return num($(id).value) > 0; })) {
      state.currentSource = 'loan';
    } else if (!num(currentInput.value)) {
      state.currentSource = 'none';
    }
    refreshCurrentEmi();
    switchText.textContent = state.currentSource === 'loan'
      ? 'Current EMI is calculated automatically from the 3 loan details.'
      : state.currentSource === 'emi'
        ? 'Using the Current EMI you entered. Add loan details to unlock full loan-impact analysis.'
        : 'Enter either all 3 loan details or only your Current EMI.';
  }

  function syncSourceFromCurrentInput() {
    if (num(currentInput.value) > 0) {
      state.currentSource = 'emi';
    } else if (!loanIds.some(function (id) { return num($(id).value) > 0; })) {
      state.currentSource = 'none';
    }
    refreshCurrentEmi();
    switchText.textContent = state.currentSource === 'emi'
      ? 'Using the Current EMI you entered. Add loan details to unlock full loan-impact analysis.'
      : 'Enter either all 3 loan details or only your Current EMI.';
  }

  function renderCustomRows() {
    var wrap = $('#sud-custom-rows');
    state.customEntries = state.customEntries.slice(0, state.customCount);
    wrap.innerHTML = '';
    for (var i = 0; i < state.customCount; i += 1) {
      var entry = state.customEntries[i] || {};
      var row = document.createElement('div');
      row.className = 'sud-custom-row';
      row.innerHTML = '<div class="sud-field"><label>New EMI <button type="button" class="sud-q" data-faq="faq-new-emi" aria-label="Learn about New EMI">?</button></label><div class="sud-input-wrap"><input type="number" min="0.01" step="0.01" class="sud-custom-emi" inputmode="decimal" placeholder="600"></div></div>' +
        '<div class="sud-field"><label>Starts From Month <button type="button" class="sud-q" data-faq="faq-change-month" aria-label="Learn about the change month">?</button></label><div class="sud-input-wrap"><input type="number" min="2" step="1" class="sud-custom-month" inputmode="numeric" placeholder="13"></div></div>' +
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
  }

  function collectSchedule(currentEmi) {
    if (state.method === 'one-time') {
      var newEmi = num($('#sud-new-emi').value);
      var month = Math.floor(num($('#sud-change-month').value));
      if (!newEmi || month < 2) throw new Error('Enter the new EMI and a starting month of 2 or later.');
      return [{ startMonth: 1, emi: currentEmi }, { startMonth: month, emi: newEmi }];
    }
    if (state.method === 'periodic') {
      var change = Number($('#sud-periodic-change').value);
      if (!Number.isFinite(change) || change === 0 || change <= -100) throw new Error('Enter an EMI change percentage greater than -100% and not equal to 0%. Use a positive value to increase EMI or a negative value to decrease it.');
      var frequency = $('#sud-periodic-frequency').value;
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

  function renderScheduleRows(rows) {
    $('#sud-schedule-body').innerHTML = rows.map(function (r) {
      return '<tr><td>' + r.month + '</td><td>' + money(r.emi) + '</td><td>' + money(r.interest) + '</td><td>' + money(r.principal) + '</td><td>' + money(r.balance) + '</td></tr>';
    }).join('');
  }

  function renderResults(result, currentEmi, schedule, mode, keepPosition) {
    var wrap = $('#sud-results');
    wrap.hidden = false;
    var full = result && result.valid;
    var loanPrincipal = num($('#sud-loan').value), loanRate = num($('#sud-rate').value), loanYears = num($('#sud-tenure').value);
    var standard = full ? E.simulate(loanPrincipal, loanRate, [{ startMonth: 1, emi: E.standardEmi(loanPrincipal, loanRate, Math.round(loanYears * 12)) }], Math.max(1200, Math.round(loanYears * 12) + 24)) : null;
    var firstChanged = schedule.length > 1 ? schedule[1].emi : currentEmi;
    var diff = firstChanged - currentEmi;

    $('#sud-kpi-payoff').textContent = full ? monthsText(result.months) : 'Needs loan details';
    $('#sud-kpi-time').textContent = full ? (standard.months - result.months >= 0 ? (standard.months - result.months) + ' months saved' : Math.abs(standard.months - result.months) + ' months longer') : '—';
    $('#sud-kpi-interest').textContent = full ? money(result.interest) : 'Needs loan details';
    var interestDelta = full ? standard.interest - result.interest : 0;
    var interestCard = $('#sud-kpi-interest-delta');
    interestCard.className = 'sud-kpi ' + (interestDelta >= 0 ? 'good' : 'bad');
    $('#sud-kpi-interest-delta .label').innerHTML = (interestDelta >= 0 ? 'Interest saved' : 'Additional interest') + ' <button type="button" class="sud-q" data-faq="faq-interest" aria-label="Learn about interest saved">?</button>';
    $('#sud-kpi-interest-delta .value').textContent = full ? money(Math.abs(interestDelta)) : '—';
    $('#sud-kpi-total').textContent = full ? money(result.paid) : 'Needs loan details';
    var impactCard = $('#sud-kpi-impact');
    impactCard.className = 'sud-kpi ' + (diff >= 0 ? 'good' : 'bad');
    $('#sud-kpi-impact .label').innerHTML = (diff >= 0 ? 'Monthly EMI increase' : 'Monthly EMI reduction') + ' <button type="button" class="sud-q" data-faq="faq-monthly-impact" aria-label="Learn about monthly EMI impact">?</button>';
    $('#sud-kpi-impact .value').textContent = money(Math.abs(diff));

    var insight = $('#sud-insight');
    if (!full) {
      insight.textContent = 'Your EMI plan is ready, but a full payoff and interest analysis needs Loan Amount, Interest Rate and Loan Tenure. Current EMI alone cannot determine the outstanding balance.';
    } else {
      var deltaMonths = standard.months - result.months;
      if (deltaMonths >= 0) insight.textContent = 'Your EMI plan is estimated to repay the loan ' + deltaMonths + ' months earlier and save about ' + money(Math.abs(interestDelta)) + ' in interest.';
      else insight.textContent = 'Your EMI plan is estimated to extend the loan by ' + Math.abs(deltaMonths) + ' months and add about ' + money(Math.abs(interestDelta)) + ' in interest.';
    }

    var principalShare = full && result.paid ? (loanPrincipal / result.paid) * 100 : 0;
    $('#sud-donut').style.setProperty('--principal-share', Math.max(0, Math.min(100, principalShare)) + '%');
    $('#sud-donut-center').textContent = full ? Math.round(principalShare) + '% principal' : '—';
    $('#sud-legend').innerHTML = full ? '<span>Principal ' + money(loanPrincipal) + '</span><span>Interest ' + money(result.interest) + '</span>' : '<span>Complete loan details for breakdown</span>';

    if (full) drawChart(standard.rows, result.rows);
    else $('#sud-chart').innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="13">Enter all 3 loan details for the balance chart</text>';

    $('#sud-schedule-body').innerHTML = '';
    $('#sud-monthly-details').open = false;
    state.lastResult = { result: result, standard: standard, schedule: schedule, currentEmi: currentEmi, mode: mode, currency: state.currency };
    if (!keepPosition) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    svg.innerHTML = '<line x1="30" y1="180" x2="690" y2="180" stroke="#dce5f0"/><path d="' + path(standard) + '" fill="none" stroke="#9aaabd" stroke-width="3" stroke-linecap="round"/><path d="' + path(plan) + '" fill="none" stroke="#1557b0" stroke-width="3" stroke-linecap="round"/><text x="35" y="20" fill="#64748b" font-size="12">Outstanding balance</text><text x="510" y="202" fill="#64748b" font-size="12">Loan timeline</text><text x="520" y="25" fill="#64748b" font-size="12">Standard</text><line x1="475" y1="21" x2="510" y2="21" stroke="#9aaabd" stroke-width="3"/><text x="635" y="25" fill="#1557b0" font-size="12">Your plan</text><line x1="590" y1="21" x2="625" y2="21" stroke="#1557b0" stroke-width="3"/>';
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

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.sud-q');
    if (btn) { e.preventDefault(); faqJump(btn.dataset.faq); }
  });

  $$('.sud-method').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.method = btn.dataset.method;
      $$('.sud-method').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      setDynamic();
    });
  });

  $('#sud-add-custom').addEventListener('click', function () {
    captureCustomRows();
    if (state.customCount < 5) { state.customCount += 1; renderCustomRows(); }
  });

  $('#sud-custom-rows').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove]');
    if (!btn) return;
    captureCustomRows();
    var index = Number(btn.dataset.remove);
    state.customEntries.splice(index, 1);
    state.customCount = Math.max(1, state.customCount - 1);
    renderCustomRows();
  });

  loanIds.forEach(function (id) { $(id).addEventListener('input', syncSourceFromLoanInput); });
  currentInput.addEventListener('input', syncSourceFromCurrentInput);

  $('#sud-calculate').addEventListener('click', function () {
    try {
      var mode = routeMode();
      var currentEmi = refreshCurrentEmi();
      if (!currentEmi) throw new Error('Enter either all 3 loan details or your Current EMI.');
      if (mode === 'loan' && !hasLoanDetails()) throw new Error('Complete Loan Amount, Interest Rate and Loan Tenure.');
      var schedule = collectSchedule(currentEmi);
      if (mode === 'loan') {
        var principal = num($('#sud-loan').value), rate = num($('#sud-rate').value), months = Math.round(num($('#sud-tenure').value) * 12);
        var result = E.simulate(principal, rate, schedule, Math.max(1200, months + 24));
        if (!result.valid) throw new Error(result.reason);
        renderResults(result, currentEmi, schedule, mode, false);
      } else {
        renderResults({ valid: false }, currentEmi, schedule, mode, false);
      }
      $('#sud-error').hidden = true;
    } catch (err) {
      $('#sud-error').textContent = err.message;
      $('#sud-error').hidden = false;
    }
  });

  $('#sud-monthly-details').addEventListener('toggle', function () {
    if (this.open && state.lastResult && state.lastResult.result.valid) renderScheduleRows(state.lastResult.result.rows);
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
    if (exportType === 'print') window.print();
  });

  window.addEventListener('scroll', function () { $('#sud-backtop').classList.toggle('is-visible', window.scrollY > 500); }, { passive: true });
  $('#sud-backtop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  initCurrency();
  refreshCurrentEmi();
  setDynamic();
}());
