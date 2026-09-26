(function () {
  "use strict";

  var root = document.querySelector("[data-export-toolbar]");
  if (!root) return;

  var buttons = root.querySelectorAll("[data-export-action]");
  var status = root.querySelector("[data-export-status]");

  function num(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function money(value) {
    return "₹" + num(value).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  function number(value, decimals) {
    return num(value).toLocaleString("en-IN", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    });
  }

  function duration(months) {
    months = Math.max(0, Math.round(num(months)));
    var years = Math.floor(months / 12);
    var remaining = months % 12;
    if (!years) return remaining + (remaining === 1 ? " month" : " months");
    if (!remaining) return years + (years === 1 ? " year" : " years");
    return years + (years === 1 ? " year " : " years ") + remaining + (remaining === 1 ? " month" : " months");
  }

  function csvCell(value) {
    var text = value == null ? "" : String(value);
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function download(filename, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function getResult() {
    if (!window.EMIFORMULA_EMI_UI || typeof window.EMIFORMULA_EMI_UI.getState !== "function") {
      return null;
    }
    var state = window.EMIFORMULA_EMI_UI.getState();
    return state && state.lastResult ? state.lastResult : null;
  }

  function getInputs() {
    var get = function (id) {
      var el = document.getElementById(id);
      return el ? el.value : "";
    };
    var tenureUnit = document.getElementById("tenure-unit");
    return {
      loanAmount: num(get("loan-amount")),
      interestRate: num(get("interest-rate")),
      tenureInput: num(get("loan-tenure")),
      tenureUnit: tenureUnit ? tenureUnit.textContent.trim() : "Years",
      processingFee: num(get("processing-fee")),
      extraMonthly: num(get("extra-monthly")),
      prepayment: num(get("prepayment")),
      prepaymentMonth: Math.max(1, Math.round(num(get("prepayment-month"))))
    };
  }

  function getData() {
    var result = getResult();
    if (!result) return null;
    return { result: result, inputs: getInputs() };
  }

  function setStatus(message) {
    if (!status) return;
    status.textContent = message || "";
    status.hidden = !message;
    if (message) setTimeout(function () { status.hidden = true; }, 3500);
  }

  function sampleSchedule(schedule, maxRows) {
    var rows = Array.isArray(schedule) ? schedule : [];
    if (rows.length <= maxRows) return rows;
    var output = [];
    for (var i = 0; i < maxRows; i += 1) {
      var index = Math.round(i * (rows.length - 1) / (maxRows - 1));
      if (!output.length || output[output.length - 1].month !== rows[index].month) output.push(rows[index]);
    }
    return output;
  }

  function svgEsc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function balanceChartSvg(schedule) {
    var rows = sampleSchedule(schedule, 24);
    if (!rows.length) return "<div class='empty-chart'>No schedule available.</div>";
    var width = 900, height = 250, left = 58, right = 24, top = 22, bottom = 42;
    var plotW = width - left - right, plotH = height - top - bottom;
    var max = Math.max.apply(null, rows.map(function (r) { return num(r.openingBalance); }).concat([num(rows[rows.length - 1].closingBalance)]));
    max = Math.max(1, max);
    var points = rows.map(function (r, i) {
      var x = left + (rows.length === 1 ? plotW / 2 : i * plotW / (rows.length - 1));
      var y = top + (1 - num(r.closingBalance) / max) * plotH;
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
    var area = left + "," + (top + plotH) + " " + points + " " + (left + plotW) + "," + (top + plotH);
    return "<svg viewBox='0 0 " + width + " " + height + "' role='img' aria-label='Loan balance trend'>" +
      "<line x1='" + left + "' y1='" + (top + plotH) + "' x2='" + (left + plotW) + "' y2='" + (top + plotH) + " stroke='#cbd5e1'/>" +
      "<line x1='" + left + "' y1='" + top + "' x2='" + left + "' y2='" + (top + plotH) + " stroke='#cbd5e1'/>" +
      "<polygon points='" + area + "' fill='#e8f0ff' opacity='0.9'/>" +
      "<polyline points='" + points + "' fill='none' stroke='#2563eb' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/>" +
      "<text x='" + left + "' y='" + (height - 12) + "' font-size='12' fill='#64748b'>Month 1</text>" +
      "<text x='" + (left + plotW) + "' y='" + (height - 12) + "' text-anchor='end' font-size='12' fill='#64748b'>Month " + svgEsc(rows[rows.length - 1].month) + "</text>" +
      "<text x='" + (left - 8) + "' y='" + (top + 5) + "' text-anchor='end' font-size='12' fill='#64748b'>" + svgEsc(money(max)) + "</text>" +
      "<text x='" + (left - 8) + "' y='" + (top + plotH) + "' text-anchor='end' font-size='12' fill='#64748b'>₹0</text>" +
      "</svg>";
  }

  function donutSvg(result) {
    var principal = Math.max(0, num(result.principal));
    var interest = Math.max(0, num(result.totalInterest));
    var total = Math.max(1, principal + interest);
    var pct = principal / total;
    var radius = 58, circumference = 2 * Math.PI * radius;
    var principalDash = (circumference * pct).toFixed(2);
    var interestDash = (circumference * (1 - pct)).toFixed(2);
    return "<div class='donut-wrap'><svg viewBox='0 0 180 180' aria-label='Principal and interest breakdown'>" +
      "<circle cx='90' cy='90' r='58' fill='none' stroke='#e2e8f0' stroke-width='22'/>" +
      "<circle cx='90' cy='90' r='58' fill='none' stroke='#2563eb' stroke-width='22' stroke-dasharray='" + principalDash + " " + circumference.toFixed(2) + "' transform='rotate(-90 90 90)'/>" +
      "<circle cx='90' cy='90' r='58' fill='none' stroke='#f59e0b' stroke-width='22' stroke-dasharray='" + interestDash + " " + circumference.toFixed(2) + "' stroke-dashoffset='-" + principalDash + "' transform='rotate(-90 90 90)'/>" +
      "<text x='90' y='86' text-anchor='middle' font-size='18' font-weight='700' fill='#0f172a'>" + Math.round(pct * 100) + "%</text>" +
      "<text x='90' y='105' text-anchor='middle' font-size='11' fill='#64748b'>principal</text>" +
      "</svg><div class='donut-legend'><span><i class='blue'></i>Principal " + svgEsc(money(principal)) + "</span><span><i class='amber'></i>Interest " + svgEsc(money(interest)) + "</span></div></div>";
  }

  function yearlyTable(result) {
    var rows = result.yearlySummary || [];
    if (!rows.length) return "<p>No yearly summary available.</p>";
    var html = "<table><thead><tr><th>Year</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Closing balance</th></tr></thead><tbody>";
    rows.forEach(function (r) {
      html += "<tr><td>" + svgEsc(r.year) + "</td><td>" + svgEsc(money(r.payment)) + "</td><td>" + svgEsc(money(r.principal)) + "</td><td>" + svgEsc(money(r.interest)) + "</td><td>" + svgEsc(money(r.closingBalance)) + "</td></tr>";
    });
    return html + "</tbody></table>";
  }

  function amortizationTable(result) {
    var rows = result.schedule || [];
    var html = "<table><thead><tr><th>Month</th><th>Opening balance</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Extra / prepayment</th><th>Closing balance</th></tr></thead><tbody>";
    rows.forEach(function (r) {
      var extra = num(r.extraPayment);
      html += "<tr><td>" + r.month + "</td><td>" + money(r.openingBalance) + "</td><td>" + money(r.payment) + "</td><td>" + money(r.principal) + "</td><td>" + money(r.interest) + "</td><td>" + money(extra) + "</td><td>" + money(r.closingBalance) + "</td></tr>";
    });
    return html + "</tbody></table>";
  }

  function buildReport(data) {
    var result = data.result;
    var input = data.inputs;
    var hasOptimization = num(input.extraMonthly) > 0 || num(input.prepayment) > 0;
    var now = new Date();
    var dateText = now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    var tenureText = duration(result.plannedMonths);
    var feeText = money(result.processingFee);
    var extraText = money(input.extraMonthly);
    var prepaymentText = input.prepayment > 0 ? money(input.prepayment) + " in month " + input.prepaymentMonth : "None";
    var savingsBlock = hasOptimization
      ? "<div class='callout'><strong>Modeled repayment improvement</strong><span>Estimated interest saved: " + money(result.interestSaved) + " · Time saved: " + duration(result.monthsSaved) + "</span></div>"
      : "<div class='callout neutral'><strong>No extra-payment scenario</strong><span>This report uses the standard repayment schedule because no extra monthly payment or one-time prepayment was entered.</span></div>";

    return "<!doctype html><html lang='en'><head><meta charset='utf-8'><title>EMIFORMULA EMI Report</title><style>" + reportCss() + "</style></head><body>" +
      "<header class='report-head'><div><div class='brand'>EMIFORMULA</div><h1>EMI Calculator Report</h1><p>Personalized loan repayment estimate</p></div><div class='meta'>Generated<br><strong>" + svgEsc(dateText) + "</strong></div></header>" +
      "<section class='hero-grid'><div class='panel inputs'><div class='section-title'>Loan inputs</div>" +
        row("Loan amount", money(input.loanAmount)) + row("Interest rate", number(input.interestRate, 2) + "% p.a.") + row("Planned tenure", tenureText) + row("Processing fee", feeText) + row("Extra monthly payment", extraText) + row("One-time prepayment", prepaymentText) +
      "</div><div class='panel result-panel'><div class='section-title'>Calculated results</div><div class='kpi-grid'>" +
        kpi("Monthly EMI", money(result.monthlyPayment), "regular scheduled payment") + kpi("Total interest", money(result.totalInterest), "over modeled repayment") + kpi("Total payment", money(result.totalPayment), "principal + interest") + kpi("Payoff time", duration(result.actualMonths), "calculated schedule") + kpi("Processing fee", feeText, "separate cost") + kpi("Total cost", money(result.totalCost), "repayment + fee") +
      "</div></div></section>" +
      savingsBlock +
      "<section class='two-col'><div class='panel'><div class='section-title'>Payment composition</div>" + donutSvg(result) + "</div><div class='panel'><div class='section-title'>Loan balance trend</div><div class='chart'>" + balanceChartSvg(result.schedule) + "</div></div></section>" +
      "<section class='panel page-break-before'><div class='section-title'>Year-wise loan summary</div>" + yearlyTable(result) + "</section>" +
      "<section class='panel page-break-before'><div class='section-title'>Full amortization schedule</div>" + amortizationTable(result) + "</section>" +
      "<section class='notes'><h2>Assumptions and notes</h2><ul><li>The report is generated from the calculator values at export time.</li><li>The calculation uses the reducing-balance EMI method implemented by EMIFORMULA.</li><li>Actual lender EMI, rounding, fees, taxes, interest-rate rules and prepayment conditions can differ.</li><li>Processing fee is shown separately and does not alter the standard EMI formula.</li><li>Extra payments and prepayments are modeled according to the calculator's repayment logic.</li></ul><p class='footer-note'>EMIFORMULA provides estimates for planning and comparison. This report is not a loan offer, approval or lender-issued repayment schedule.</p></section>" +
      "<footer>EMIFORMULA · EMI Calculator · " + svgEsc(dateText) + "</footer></body></html>";
  }

  function row(label, value) { return "<div class='input-row'><span>" + svgEsc(label) + "</span><strong>" + svgEsc(value) + "</strong></div>"; }
  function kpi(label, value, note) { return "<div class='kpi'><span>" + svgEsc(label) + "</span><strong>" + svgEsc(value) + "</strong><small>" + svgEsc(note) + "</small></div>"; }

  function reportCss() {
    return "@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;margin:0;font-size:10px;background:#fff}.report-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:14px}.brand{font-size:13px;font-weight:800;letter-spacing:.08em;color:#2563eb}.report-head h1{font-size:24px;margin:4px 0}.report-head p{margin:0;color:#64748b;font-size:11px}.meta{text-align:right;color:#64748b;line-height:1.5}.meta strong{color:#0f172a}.hero-grid,.two-col{display:grid;grid-template-columns:1fr 1.65fr;gap:12px;margin-bottom:12px}.two-col{grid-template-columns:1fr 1.65fr}.panel{border:1px solid #dbe3ee;border-radius:10px;padding:12px;background:#fff;break-inside:avoid}.inputs{background:#f8fafc}.section-title{font-size:12px;font-weight:800;margin-bottom:9px;color:#0f172a}.input-row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #e5e7eb}.input-row:last-child{border-bottom:0}.input-row span{color:#64748b}.input-row strong{font-size:10.5px;text-align:right}.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kpi{border:1px solid #e2e8f0;border-radius:8px;padding:9px;background:#f8fafc;min-height:72px}.kpi span{display:block;color:#64748b;font-size:9px}.kpi strong{display:block;font-size:16px;margin:5px 0 3px}.kpi small{color:#94a3b8}.callout{border-left:4px solid #2563eb;background:#eff6ff;border-radius:7px;padding:10px 12px;margin-bottom:12px}.callout strong{display:block;font-size:11px}.callout span{display:block;color:#475569;margin-top:3px}.callout.neutral{border-left-color:#64748b;background:#f8fafc}.donut-wrap{display:flex;align-items:center;gap:16px}.donut-wrap svg{width:150px;height:150px}.donut-legend{display:grid;gap:8px}.donut-legend span{display:flex;align-items:center;gap:7px}.donut-legend i{width:9px;height:9px;border-radius:50%;display:inline-block}.donut-legend .blue{background:#2563eb}.donut-legend .amber{background:#f59e0b}.chart svg{width:100%;height:auto;display:block}.empty-chart{color:#64748b;padding:30px}table{width:100%;border-collapse:collapse;font-size:8.5px}th{background:#f1f5f9;text-align:left;font-weight:800}th,td{border:1px solid #dbe3ee;padding:5px 6px}td:not(:first-child),th:not(:first-child){text-align:right}tbody tr:nth-child(even){background:#fafafa}.page-break-before{break-before:page}.notes{margin-top:14px;padding:11px 12px;border:1px solid #dbe3ee;border-radius:9px;background:#f8fafc}.notes h2{font-size:12px;margin:0 0 6px}.notes ul{margin:0 0 8px;padding-left:18px;color:#475569}.notes li{margin:3px 0}.footer-note{color:#64748b;margin:7px 0 0}footer{margin-top:12px;padding-top:7px;border-top:1px solid #dbe3ee;color:#94a3b8;font-size:8px;text-align:center}@media print{.panel,.callout{break-inside:avoid}table{break-inside:auto}tr{break-inside:avoid;break-after:auto}thead{display:table-header-group}}";
  }

  function exportPdf() {
    var data = getData();
    if (!data) {
      setStatus("Calculate your EMI before exporting.");
      return;
    }
    var win = window.open("", "_blank");
    if (!win) {
      setStatus("Please allow pop-ups for EMIFORMULA to create the PDF report.");
      return;
    }
    win.document.open();
    win.document.write(buildReport(data));
    win.document.close();
    win.focus();
    setTimeout(function () {
      try { win.print(); } catch (e) { setStatus("The report opened in a new tab. Use Print / Save as PDF there."); }
    }, 450);
  }

  function exportCsv() {
    var data = getData();
    if (!data) { setStatus("Calculate your EMI before exporting."); return; }
    var r = data.result, i = data.inputs;
    var lines = [
      ["EMIFORMULA EMI Calculator Report"],
      ["Generated", new Date().toLocaleString("en-IN")],
      [],
      ["Inputs"],
      ["Loan amount", i.loanAmount],
      ["Interest rate (% p.a.)", i.interestRate],
      ["Tenure input", i.tenureInput],
      ["Tenure unit", i.tenureUnit],
      ["Processing fee", i.processingFee],
      ["Extra monthly payment", i.extraMonthly],
      ["One-time prepayment", i.prepayment],
      ["Prepayment month", i.prepaymentMonth],
      [],
      ["Results"],
      ["Monthly EMI", r.monthlyPayment],
      ["Total interest", r.totalInterest],
      ["Total payment", r.totalPayment],
      ["Payoff months", r.actualMonths],
      ["Processing fee", r.processingFee],
      ["Total cost", r.totalCost],
      ["Interest saved", r.interestSaved],
      ["Months saved", r.monthsSaved],
      [],
      ["Amortization schedule"],
      ["Month", "Opening balance", "Payment", "Principal", "Interest", "Extra payment", "Prepayment", "Closing balance"]
    ];
    (r.schedule || []).forEach(function (row) {
      lines.push([row.month, row.openingBalance, row.payment, row.principal, row.interest, row.extraPayment, row.prepayment, row.closingBalance]);
    });
    download("emiformula-emi-report.csv", lines.map(function (line) { return line.map(csvCell).join(","); }).join("\r\n"), "text/csv;charset=utf-8");
    setStatus("CSV exported.");
  }

  function exportJson() {
    var data = getData();
    if (!data) { setStatus("Calculate your EMI before exporting."); return; }
    var payload = {
      schemaVersion: "1.0",
      calculator: "EMI Calculator",
      generatedAt: new Date().toISOString(),
      inputs: data.inputs,
      results: data.result
    };
    download("emiformula-emi-report.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
    setStatus("JSON exported.");
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var action = button.getAttribute("data-export-action");
      if (action === "pdf") exportPdf();
      if (action === "csv") exportCsv();
      if (action === "json") exportJson();
    });
  });

  window.EMIFORMULA_EXPORT = {
    pdf: exportPdf,
    csv: exportCsv,
    json: exportJson
  };
})();
