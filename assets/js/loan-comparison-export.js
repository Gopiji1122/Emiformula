(function (global) {
  "use strict";

  function ui() { return global.EMIFORMULA_LOAN_COMPARISON_UI; }
  function money(v) { return Number(v || 0).toFixed(2); }
  function csvCell(v) { var s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function download(name, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name; a.style.display = "none";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function csvRows(comparison) {
    var rows = [
      ["EMIFORMULA Loan Comparison"],
      [],
      ["Metric", "Loan A", "Loan B"],
      ["Loan amount", comparison.loanA.input.amount, comparison.loanB.input.amount],
      ["Annual interest rate", comparison.loanA.input.annualRate, comparison.loanB.input.annualRate],
      ["Term (months)", comparison.loanA.input.termMonths, comparison.loanB.input.termMonths],
      ["Payment frequency", comparison.loanA.input.paymentFrequency, comparison.loanB.input.paymentFrequency],
      ["Scheduled payment", money(comparison.loanA.payment), money(comparison.loanB.payment)],
      ["Total interest", money(comparison.loanA.totalInterest), money(comparison.loanB.totalInterest)],
      ["Total fees", money(comparison.loanA.totalFees), money(comparison.loanB.totalFees)],
      ["Total repayment", money(comparison.loanA.totalRepayment), money(comparison.loanB.totalRepayment)],
      ["Total estimated cost", money(comparison.loanA.totalCost), money(comparison.loanB.totalCost)],
      ["Payoff periods", comparison.loanA.actualPeriods, comparison.loanB.actualPeriods],
      [], ["Fee breakdown", "Loan A", "Loan B"]
    ];
    var feeNames = {processing:"Processing / origination",application:"Application",documentation:"Documentation",legal:"Legal",valuation:"Valuation / appraisal",insurance:"Insurance",broker:"Broker / adviser",otherUpfront:"Other upfront",prepayment:"Prepayment / early repayment",otherCost:"Other cost",otherRecurring:"Recurring fees"};
    Object.keys(feeNames).forEach(function (key) {
      var av = key === "otherRecurring" ? comparison.loanA.feeBreakdown.recurring : comparison.loanA.feeBreakdown.detailed[key];
      var bv = key === "otherRecurring" ? comparison.loanB.feeBreakdown.recurring : comparison.loanB.feeBreakdown.detailed[key];
      rows.push([feeNames[key], money(av), money(bv)]);
    });
    rows.push([], ["Amortization comparison"], ["Period", "A Payment", "A Principal", "A Interest", "A Balance", "B Payment", "B Principal", "B Interest", "B Balance"]);
    var max = Math.max(comparison.loanA.schedule.length, comparison.loanB.schedule.length);
    for (var i = 0; i < max; i++) {
      var a = comparison.loanA.schedule[i], b = comparison.loanB.schedule[i];
      rows.push([i + 1, a ? money(a.payment) : "", a ? money(a.principal) : "", a ? money(a.interest) : "", a ? money(a.closingBalance) : "", b ? money(b.payment) : "", b ? money(b.principal) : "", b ? money(b.interest) : "", b ? money(b.closingBalance) : ""]);
    }
    return rows.map(function (row) { return row.map(csvCell).join(","); }).join("\n");
  }
  function exportJson() {
    var api = ui(), comparison = api && api.getComparison();
    if (!comparison) return;
    download("emiformula-loan-comparison.json", JSON.stringify({ exportedAt: new Date().toISOString(), comparison: comparison }, null, 2), "application/json;charset=utf-8");
  }
  function exportCsv() {
    var api = ui(), comparison = api && api.getComparison();
    if (!comparison) return;
    download("emiformula-loan-comparison.csv", csvRows(comparison), "text/csv;charset=utf-8");
  }
  function printReport() {
    if (!ui() || !ui().getComparison()) return;
    var style = document.createElement("style");
    style.id = "lc-print-style";
    style.textContent = "@media print{body>*:not(#loanComparisonCalculator){display:none!important}#loanComparisonCalculator{display:block!important}#loanComparisonCalculator .lc-form,#loanComparisonCalculator #loanComparisonCalculator .lc-export,#loanComparisonCalculator header{display:none!important}#loanComparisonCalculator .lc-results{display:block!important}#loanComparisonCalculator details{display:block!important}#loanComparisonCalculator details>summary{display:none!important}.lc-table-wrap{overflow:visible!important}.lc-table-wrap table{font-size:8pt!important}.lc-chart{break-inside:avoid}.lc-visual-card,.lc-amortization{break-inside:avoid;margin-bottom:12pt}*{box-shadow:none!important}}";
    document.head.appendChild(style);
    window.print();
    setTimeout(function () { style.remove(); }, 1000);
  }
  document.addEventListener("DOMContentLoaded", function () {
    var csv = document.getElementById("exportCsv"), json = document.getElementById("exportJson"), pdf = document.getElementById("exportPdf");
    if (csv) csv.addEventListener("click", exportCsv);
    if (json) json.addEventListener("click", exportJson);
    if (pdf) pdf.addEventListener("click", printReport);
  });
})(window);
