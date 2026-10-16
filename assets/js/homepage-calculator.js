(function () {
  "use strict";
  var amount = document.getElementById("home-loan-amount");
  var rate = document.getElementById("home-interest-rate");
  var years = document.getElementById("home-loan-tenure");
  if (!amount || !rate || !years) return;
  var fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  function money(value) { return "₹" + fmt.format(Math.round(value)); }
  function calculate() {
    var principal = Math.max(0, Number(amount.value) || 0);
    var annualRate = Math.max(0, Number(rate.value) || 0);
    var months = Math.max(1, (Number(years.value) || 1) * 12);
    var monthlyRate = annualRate / 1200;
    var emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    var total = emi * months;
    var interest = total - principal;
    document.getElementById("home-loan-amount-value").textContent = money(principal);
    document.getElementById("home-interest-rate-value").textContent = annualRate.toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + "%";
    document.getElementById("home-loan-tenure-value").textContent = years.value + (Number(years.value) === 1 ? " year" : " years");
    document.getElementById("home-emi-value").textContent = money(emi);
    document.getElementById("home-emi-description").textContent = months + " monthly payments under a standard reducing-balance calculation.";
    document.getElementById("home-total-principal").textContent = money(principal);
    document.getElementById("home-total-interest").textContent = money(interest);
    document.getElementById("home-total-repayment").textContent = money(total);
    document.getElementById("home-example-explanation").textContent = "At " + rate.value + "% over " + years.value + (Number(years.value) === 1 ? " year, " : " years, ") + "the estimated interest is " + money(interest) + " on a " + money(principal) + " loan. Change the assumptions to see how the cost moves.";
  }
  [amount, rate, years].forEach(function (control) { control.addEventListener("input", calculate); });
  calculate();
})();
