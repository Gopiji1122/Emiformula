(function () {
  "use strict";
  var toolbar = document.querySelector('[data-export-type="emi"]');
  if (!toolbar) return;
  var status = toolbar.querySelector('[data-export-status]');
  function field(id) { return document.getElementById(id); }
  function getScenario() {
    var amount = field("loan-amount"), rate = field("interest-rate"), tenure = field("loan-tenure"), unit = field("tenure-unit");
    if (!amount || !rate || !tenure) return null;
    return { amount: amount.value, rate: rate.value, tenure: tenure.value, unit: unit ? unit.textContent.trim().toLowerCase() : "years", fee: field("processing-fee") ? field("processing-fee").value : "0", extra: field("extra-monthly") ? field("extra-monthly").value : "0", prepayment: field("prepayment") ? field("prepayment").value : "0", prepaymentMonth: field("prepayment-month") ? field("prepayment-month").value : "1" };
  }
  function buildUrl() {
    var data = getScenario(); if (!data) return window.location.href;
    var url = new URL(window.location.href);
    Object.keys(data).forEach(function (key) { url.searchParams.set(key, data[key]); });
    url.hash = "calculator-results";
    return url.toString();
  }
  function setStatus(message) { if (status) { status.hidden = false; status.textContent = message; } }
  function restoreScenario() {
    var params = new URLSearchParams(window.location.search);
    if (!params.has("amount") && !params.has("rate") && !params.has("tenure")) return;
    var mapping = { amount:"loan-amount", rate:"interest-rate", tenure:"loan-tenure", fee:"processing-fee", extra:"extra-monthly", prepayment:"prepayment", prepaymentMonth:"prepayment-month" };
    Object.keys(mapping).forEach(function (key) { var el = field(mapping[key]); var val = params.get(key); if (el && val !== null && val !== "" && Number.isFinite(Number(val))) el.value = val; });
    var unit = (params.get("unit") || "years").toLowerCase();
    var unitButton = unit.indexOf("month") === 0 ? field("months-toggle") : field("years-toggle");
    if (unitButton) unitButton.click();
    ["loan-amount", "interest-rate", "loan-tenure", "processing-fee", "extra-monthly", "prepayment", "prepayment-month"].forEach(function (id) { var el = field(id); if (el) el.dispatchEvent(new Event("input", { bubbles:true })); });
    var calculate = field("calculate-emi"); if (calculate) calculate.click();
  }
  var copyButton = toolbar.querySelector("[data-share-calculation]");
  var whatsAppButton = toolbar.querySelector("[data-share-whatsapp]");
  if (copyButton) copyButton.addEventListener("click", function () { var url = buildUrl(); if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { setStatus("Share link copied. Opening it restores these inputs."); }).catch(function () { window.prompt("Copy this calculation link:", url); }); } else { window.prompt("Copy this calculation link:", url); } });
  if (whatsAppButton) whatsAppButton.addEventListener("click", function () { var url = buildUrl(); var data = getScenario(); var text = "My EMI calculation on EMIFORMULA\nLoan amount: ₹" + Number(data.amount).toLocaleString("en-IN") + "\nInterest rate: " + data.rate + "% p.a.\nTenure: " + data.tenure + " " + data.unit + "\nView this scenario: " + url; window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener,noreferrer"); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", restoreScenario); else restoreScenario();
})();
