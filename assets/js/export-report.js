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

  function exportType() {
    return root.getAttribute("data-export-type") || "emi";
  }

  function personalData() {
    var engine = window.EMIFORMULA_PERSONAL_LOAN;
    if (!engine || typeof engine.calculate !== "function") return null;
    function value(id) { var el = document.getElementById(id); return el ? Number(el.value) || 0 : 0; }
    var input = {
      amount: value("loan-amount"), annualRate: value("loan-rate"), months: value("loan-years") * 12,
      years: value("loan-years"), processingFeePercent: value("loan-fee"), insurance: value("loan-insurance"),
      extraMonthly: value("loan-extra"), prepayment: value("loan-prepayment"), prepaymentMonth: Math.max(1, Math.round(value("loan-prepayment-month")))
    };
    var result = engine.calculate(input);
    return result ? { result: result, inputs: input } : null;
  }

  function balanceTransferData() {
    var engine = window.EMIFORMULA_BALANCE_TRANSFER;
    if (!engine || typeof engine.calculate !== "function") return null;
    function value(id) { var el = document.getElementById(id); return el ? Number(el.value) || 0 : 0; }
    var input = {
      balance: value("bt-balance"), oldRate: value("bt-old-rate"), oldMonths: value("bt-old-months"),
      newRate: value("bt-new-rate"), newMonths: value("bt-new-months"), foreclosure: value("bt-foreclosure"),
      foreclosureGST: value("bt-foreclosure-gst"), processing: value("bt-processing"),
      processingGST: value("bt-processing-gst"), other: value("bt-other"),
      floating: !!document.getElementById("bt-floating")?.checked, purpose: document.getElementById("bt-purpose")?.value || "individual",
      year: value("bt-year")
    };
    var result = engine.calculate(input);
    return result && result.valid ? { result: result, inputs: input } : null;
  }

  function getCurrentData() {
    var type = exportType();
    if (type === "personal-loan") return personalData();
    if (type === "balance-transfer") return balanceTransferData();
    return getData();
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

  function balanceChartSvgGeneric(rows) {
    rows = Array.isArray(rows) ? rows : [];
    if (!rows.length) return "<div class='empty-chart'>No schedule available.</div>";
    var width=900,height=250,left=58,right=24,top=22,bottom=42,plotW=width-left-right,plotH=height-top-bottom;
    var max=Math.max.apply(null,rows.map(function(r){return num(r.closingBalance != null ? r.closingBalance : r.balance);}).concat([1]));
    var points=rows.map(function(r,i){var v=num(r.closingBalance != null ? r.closingBalance : r.balance);var x=left+(rows.length===1?plotW/2:i*plotW/(rows.length-1));var y=top+(1-v/max)*plotH;return x.toFixed(1)+","+y.toFixed(1);}).join(" ");
    return "<svg viewBox='0 0 "+width+" "+height+"' role='img' aria-label='Balance trend'><line x1='"+left+"' y1='"+(top+plotH)+"' x2='"+(left+plotW)+"' y2='"+(top+plotH)+"' stroke='#cbd5e1'/><polyline points='"+points+"' fill='none' stroke='#2563eb' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/><text x='"+left+"' y='"+(height-12)+"' font-size='12' fill='#64748b'>Month 1</text><text x='"+(left+plotW)+"' y='"+(height-12)+"' text-anchor='end' font-size='12' fill='#64748b'>Month "+svgEsc(rows[rows.length-1].month)+"</text><text x='"+(left-8)+"' y='"+(top+5)+"' text-anchor='end' font-size='12' fill='#64748b'>"+svgEsc(money(max))+"</text><text x='"+(left-8)+"' y='"+(top+plotH)+"' text-anchor='end' font-size='12' fill='#64748b'>₹0</text></svg>";
  }

  function personalYearlyTable(result) {
    var rows=result.yearlySummary||[];
    var html="<table><thead><tr><th>Year</th><th>Paid</th><th>Principal</th><th>Interest</th><th>Closing balance</th></tr></thead><tbody>";
    rows.forEach(function(r){html+="<tr><td>Year "+r.year+"</td><td>"+money(r.payment)+"</td><td>"+money(r.principal)+"</td><td>"+money(r.interest)+"</td><td>"+money(r.closingBalance)+"</td></tr>";});
    return html+"</tbody></table>";
  }

  function personalAmortizationTable(result) {
    var rows=result.schedule||[];
    var html="<table><thead><tr><th>Month</th><th>Opening</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Extra / prepayment</th><th>Closing</th></tr></thead><tbody>";
    rows.forEach(function(r){html+="<tr><td>"+r.month+"</td><td>"+money(r.openingBalance)+"</td><td>"+money(r.payment)+"</td><td>"+money(r.principal)+"</td><td>"+money(r.interest)+"</td><td>"+money(num(r.extraPayment)+num(r.prepayment))+"</td><td>"+money(r.closingBalance)+"</td></tr>";});
    return html+"</tbody></table>";
  }

  function buildPersonalReport(data) {
    var r=data.result,i=data.inputs,now=new Date(),dateText=now.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"});
    var optimized=num(i.extraMonthly)>0||num(i.prepayment)>0;
    var scenario=optimized ? "Extra payments are included in the modeled schedule. Estimated interest saved: "+money(r.interestSaved)+" · Time saved: "+duration(r.monthsSaved) : "No extra-payment scenario was entered; the report uses the standard repayment schedule.";
    return [
      "<!doctype html><html lang='en'><head><meta charset='utf-8'><title>EMIFORMULA Personal Loan Report</title><style>",reportCss(),"</style></head><body>",
      "<header class='report-head'><div><div class='brand'>EMIFORMULA</div><h1>Personal Loan Calculator Report</h1><p>Loan cost, cash received and repayment estimate</p></div><div class='meta'>Generated<br><strong>",svgEsc(dateText),"</strong></div></header>",
      "<section class='hero-grid'><div class='panel inputs'><div class='section-title'>Loan inputs</div>",
      row("Loan amount",money(i.amount)),row("Interest rate",number(i.annualRate,2)+"% p.a."),row("Planned tenure",duration(i.months)),row("Processing fee",number(i.processingFeePercent,2)+"% ("+money(r.processingFee)+")"),row("Insurance / other upfront",money(i.insurance)),row("Extra monthly payment",money(i.extraMonthly)),row("One-time prepayment",i.prepayment>0?money(i.prepayment)+" in month "+i.prepaymentMonth:"None"),
      "</div><div class='panel result-panel'><div class='section-title'>Calculated results</div><div class='kpi-grid'>",
      kpi("Monthly EMI",money(r.emi),"scheduled EMI"),kpi("Amount received",money(r.netReceived),"after upfront deductions"),kpi("Total interest",money(r.totalInterest),"modeled repayment"),kpi("Total repayment",money(r.totalRepayment),"EMIs / principal + interest"),kpi("Borrowing cost",money(r.totalBorrowingCost),"interest + upfront costs"),kpi("Borrowing cost ratio",number(r.effectiveCostPercent,2)+"%","total cost ÷ cash received"),
      "</div></div></section>",
      "<div class='callout'><strong>Repayment scenario</strong><span>",svgEsc(scenario),"</span></div>",
      "<section class='two-col'><div class='panel'><div class='section-title'>Payment composition</div>",donutSvg({principal:r.amount,totalInterest:r.totalInterest}),"</div><div class='panel'><div class='section-title'>Balance reduction</div><div class='chart'>",balanceChartSvgGeneric(r.schedule),"</div></div></section>",
      "<section class='panel page-break-before'><div class='section-title'>Year-by-year repayment</div>",personalYearlyTable(r),"</section>",
      "<section class='panel page-break-before'><div class='section-title'>Full amortization schedule</div>",personalAmortizationTable(r),"</section>",
      "<section class='notes'><h2>Assumptions and notes</h2><ul><li>Processing fee and other upfront costs are treated separately from the EMI calculation.</li><li>The standard EMI is calculated on the sanctioned principal using a reducing-balance method.</li><li>Extra payments and prepayments are modeled according to EMIFORMULA's calculator logic.</li><li>Actual lender rounding, fees, taxes, rate changes and prepayment rules can differ.</li></ul><p class='footer-note'>This report is an estimate for planning and comparison, not a lender-issued repayment schedule or loan offer.</p></section><footer>EMIFORMULA · Personal Loan Calculator · ",svgEsc(dateText),"</footer></body></html>"
    ].join("");
  }

  function balanceTimelineChart(result) {
    var rows=result.timeline||[];
    if(!rows.length)return "<div class='empty-chart'>No break-even timeline available.</div>";
    var width=900,height=240,left=58,right=24,top=22,bottom=42,plotW=width-left-right,plotH=height-top-bottom;
    var vals=rows.map(function(r){return num(r.cumulative);}), min=Math.min.apply(null,vals.concat([0])),max=Math.max.apply(null,vals.concat([0]));
    if(max===min){max=min+1;}
    var y=function(v){return top+(max-v)/(max-min)*plotH;};
    var pts=rows.map(function(r,i){var x=left+(rows.length===1?plotW/2:i*plotW/(rows.length-1));return x.toFixed(1)+","+y(num(r.cumulative)).toFixed(1);}).join(" ");
    var zeroY=y(0).toFixed(1);
    return "<svg viewBox='0 0 "+width+" "+height+"' role='img' aria-label='Cumulative savings break-even timeline'><line x1='"+left+"' y1='"+zeroY+"' x2='"+(left+plotW)+"' y2='"+zeroY+"' stroke='#94a3b8' stroke-dasharray='5 4'/><polyline points='"+pts+"' fill='none' stroke='#16a34a' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/><text x='"+left+"' y='"+(height-12)+"' font-size='12' fill='#64748b'>Month "+rows[0].month+"</text><text x='"+(left+plotW)+"' y='"+(height-12)+"' text-anchor='end' font-size='12' fill='#64748b'>Month "+rows[rows.length-1].month+"</text><text x='"+(left-8)+"' y='"+(top+5)+"' text-anchor='end' font-size='12' fill='#64748b'>"+svgEsc(money(max))+"</text><text x='"+(left-8)+"' y='"+(top+plotH)+"' text-anchor='end' font-size='12' fill='#64748b'>"+svgEsc(money(min))+"</text></svg>";
  }

  function balanceCostRows(i) {
    return row("Old lender charge",money(i.foreclosure))+row("GST on old charge",money(i.foreclosureGST))+row("New lender processing",money(i.processing))+row("GST on processing",money(i.processingGST))+row("Other switching costs",money(i.other));
  }

  function buildBalanceReport(data) {
    var r=data.result,i=data.inputs,now=new Date(),dateText=now.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"});
    var interpretation=r.breakEvenMonth!==null ? "Cumulative savings recover the entered switching costs around month "+r.breakEvenMonth+" under these assumptions." : "The entered switching costs are not recovered within the compared repayment horizon.";
    return [
      "<!doctype html><html lang='en'><head><meta charset='utf-8'><title>EMIFORMULA Balance Transfer Report</title><style>",reportCss(),"</style></head><body>",
      "<header class='report-head'><div><div class='brand'>EMIFORMULA</div><h1>Balance Transfer Break-Even Report</h1><p>Current loan vs. proposed transfer scenario</p></div><div class='meta'>Generated<br><strong>",svgEsc(dateText),"</strong></div></header>",
      "<section class='hero-grid'><div class='panel inputs'><div class='section-title'>Transfer inputs</div>",
      row("Outstanding balance",money(i.balance)),row("Current rate",number(i.oldRate,2)+"% p.a."),row("Current remaining tenure",duration(i.oldMonths)),row("New rate",number(i.newRate,2)+"% p.a."),row("New tenure",duration(i.newMonths)),balanceCostRows(i),
      "</div><div class='panel result-panel'><div class='section-title'>Calculated results</div><div class='kpi-grid'>",
      kpi("Current EMI",money(r.currentEMI),"existing schedule"),kpi("New EMI",money(r.newEMI),"proposed schedule"),kpi("Switching costs",money(r.switchingCosts),"all entered charges"),kpi("Gross interest saving",money(r.grossInterestSaving),"before switching costs"),kpi("Net saving",money(r.netSaving),"gross saving − costs"),kpi("Break-even",r.breakEvenMonth!==null?"Month "+r.breakEvenMonth:"Not reached","cumulative comparison"),
      "</div></div></section>",
      "<div class='callout "+(r.netSaving>0?"":"neutral")+"'><strong>Result interpretation</strong><span>",svgEsc(interpretation),"</span></div>",
      "<section class='two-col'><div class='panel'><div class='section-title'>Cost vs. gross interest saving</div><div class='kpi-grid'><div class='kpi'><span>Switching costs</span><strong>",money(r.switchingCosts),"</strong></div><div class='kpi'><span>Interest saving</span><strong>",money(r.grossInterestSaving),"</strong></div></div></div><div class='panel'><div class='section-title'>Break-even timeline</div><div class='chart'>",balanceTimelineChart(r),"</div></div></section>",
      "<section class='panel'><div class='section-title'>Key comparison</div><table><thead><tr><th>Metric</th><th>Current loan</th><th>New loan</th></tr></thead><tbody><tr><td>Monthly EMI</td><td>",money(r.currentEMI),"</td><td>",money(r.newEMI),"</td></tr><tr><td>Remaining interest</td><td>",money(r.currentInterest),"</td><td>",money(r.newInterest),"</td></tr><tr><td>Tenure</td><td>",duration(r.oldMonths),"</td><td>",duration(r.newMonths),"</td></tr></tbody></table></section>",
      "<section class='notes'><h2>Assumptions and notes</h2><ul><li>The comparison uses month-by-month repayment schedules for the current and proposed loans.</li><li>Switching costs are the amounts entered by the user; GST is not assumed automatically.</li><li>RBI pre-payment-charge treatment depends on the applicable loan details and current rules; verify the actual lender charge.</li><li>Actual lender rates, rounding, fees, taxes and repayment conditions can differ.</li></ul><p class='footer-note'>This report is an estimate for comparison and planning. It is not a lender offer or regulatory determination.</p></section><footer>EMIFORMULA · Balance Transfer Calculator · ",svgEsc(dateText),"</footer></body></html>"
    ].join("");
  }

  function exportPdf() {
    var data = getCurrentData();
    if (!data) {
      setStatus("Calculate the loan before exporting.");
      return;
    }
    var win = window.open("", "_blank");
    if (!win) {
      setStatus("Please allow pop-ups for EMIFORMULA to create the PDF report.");
      return;
    }
    win.document.open();
    var type = exportType();
    win.document.write(type === "personal-loan" ? buildPersonalReport(data) : type === "balance-transfer" ? buildBalanceReport(data) : buildReport(data));
    win.document.close();
    win.focus();
    setTimeout(function () {
      try { win.print(); } catch (e) { setStatus("The report opened in a new tab. Use Print / Save as PDF there."); }
    }, 450);
  }

  function exportCsv() {
    var data = getCurrentData();
    if (!data) { setStatus("Calculate the loan before exporting."); return; }
    var r = data.result, i = data.inputs;
    if (exportType() === "personal-loan") {
      var pl = [["EMIFORMULA Personal Loan Calculator Report"],["Generated",new Date().toLocaleString("en-IN")],[],["Inputs"],["Loan amount",i.amount],["Interest rate (% p.a.)",i.annualRate],["Tenure (months)",i.months],["Processing fee (%)",i.processingFeePercent],["Insurance / other upfront cost",i.insurance],["Extra monthly payment",i.extraMonthly],["One-time prepayment",i.prepayment],["Prepayment month",i.prepaymentMonth],[],["Results"],["Monthly EMI",r.emi],["Amount received",r.netReceived],["Total interest",r.totalInterest],["Total repayment",r.totalRepayment],["Total borrowing cost",r.totalBorrowingCost],["Total cash outflow",r.totalOutflow],["Borrowing cost ratio (%)",r.effectiveCostPercent],["Actual payoff months",r.actualMonths],["Interest saved",r.interestSaved],["Months saved",r.monthsSaved],[],["Amortization schedule"],["Month","Opening balance","Payment","Principal","Interest","Extra payment","Prepayment","Closing balance"]];
      (r.schedule||[]).forEach(function(row){pl.push([row.month,row.openingBalance,row.payment,row.principal,row.interest,row.extraPayment,row.prepayment,row.closingBalance]);});
      download("emiformula-personal-loan-report.csv",pl.map(function(line){return line.map(csvCell).join(",");}).join("\r\n"),"text/csv;charset=utf-8"); setStatus("CSV exported."); return;
    }
    if (exportType() === "balance-transfer") {
      var bt = [["EMIFORMULA Balance Transfer Calculator Report"],["Generated",new Date().toLocaleString("en-IN")],[],["Inputs"],["Outstanding balance",i.balance],["Current rate (%)",i.oldRate],["Current tenure (months)",i.oldMonths],["New rate (%)",i.newRate],["New tenure (months)",i.newMonths],["Old lender charge",i.foreclosure],["GST on old charge",i.foreclosureGST],["New lender processing",i.processing],["GST on processing",i.processingGST],["Other switching costs",i.other],[],["Results"],["Current EMI",r.currentEMI],["New EMI",r.newEMI],["Switching costs",r.switchingCosts],["Gross interest saving",r.grossInterestSaving],["Net saving",r.netSaving],["Break-even month",r.breakEvenMonth==null?"Not reached":r.breakEvenMonth],["Current interest",r.currentInterest],["New interest",r.newInterest],["Monthly EMI difference",r.monthlyEmiDifference],[],["Break-even timeline"],["Month","Cumulative benefit after switching costs"]];
      (r.timeline||[]).forEach(function(row){bt.push([row.month,row.cumulative]);});
      download("emiformula-balance-transfer-report.csv",bt.map(function(line){return line.map(csvCell).join(",");}).join("\r\n"),"text/csv;charset=utf-8"); setStatus("CSV exported."); return;
    }
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
    var data = getCurrentData();
    if (!data) { setStatus("Calculate the loan before exporting."); return; }
    var type = exportType();
    var name = type === "personal-loan" ? "Personal Loan Calculator" : type === "balance-transfer" ? "Balance Transfer Break-Even Calculator" : "EMI Calculator";
    var slug = type === "personal-loan" ? "personal-loan" : type === "balance-transfer" ? "balance-transfer" : "emi";
    var payload = { schemaVersion: "1.0", calculator: name, generatedAt: new Date().toISOString(), inputs: data.inputs, results: data.result };
    download("emiformula-"+slug+"-report.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
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
