(function () {
  "use strict";

  /*
   * ============================================================
   * EMIFORMULA EMI CALCULATOR V4
   * PART 1 — CORE SETUP + ELEMENTS + BASIC HELPERS
   * ============================================================
   */

  var config =
    window.EMIFORMULA_EMI_CONFIG || {};

  var calculator =
    window.EMIFORMULA_CALCULATOR || {};

  var utils =
    window.EMIFORMULA_CALCULATOR_UTILS || {};

  var state = {
    liveUpdate: true,
    tenureMode: "years",
    lastResult: null
  };


  /*
   * ============================================================
   * ELEMENT REFERENCES
   * ============================================================
   */

  var loanAmount =
    document.getElementById("loan-amount");

  var loanAmountSlider =
    document.getElementById("loan-amount-slider");

  var interestRate =
    document.getElementById("interest-rate");

  var interestRateSlider =
    document.getElementById("interest-rate-slider");

  var loanTenure =
    document.getElementById("loan-tenure");

  var tenureUnit =
    document.getElementById("tenure-unit");

  var tenureSlider =
    document.getElementById("loan-tenure-slider");

  var yearsToggle =
    document.getElementById("years-toggle");

  var monthsToggle =
    document.getElementById("months-toggle");

  var processingFee =
    document.getElementById("processing-fee");

  var extraMonthly =
    document.getElementById("extra-monthly");

  var prepayment =
    document.getElementById("prepayment");

  var prepaymentMonth =
    document.getElementById("prepayment-month");

  var liveUpdate =
    document.getElementById("live-update");

  var loanLive =
    document.getElementById("loan-live");

  var rateLive =
    document.getElementById("rate-live");

  var tenureLive =
    document.getElementById("tenure-live");

  var tenureMin =
    document.getElementById("tenure-min");

  var tenureMax =
    document.getElementById("tenure-max");

  var calculateButton =
    document.getElementById("calculate-emi");

  var resetButton =
    document.getElementById("reset-emi");

  var errorBox =
    document.getElementById("emi-error");

  var resultsBox =
    document.getElementById("calculator-results");

  var helpPanel =
    document.getElementById("calc-help-panel");

  var helpTitle =
    document.getElementById("calc-help-title");

  var helpText =
    document.getElementById("calc-help-text");

  var helpClose =
    document.getElementById("calc-help-close");

  var emiValue =
    document.getElementById("emi-value");

  var emiBar =
    document.getElementById("emi-bar");

  var interestValue =
    document.getElementById("interest-value");

  var paymentValue =
    document.getElementById("payment-value");

  var durationValue =
    document.getElementById("duration-value");

  var savingsBox =
    document.getElementById("savings-box");

  var donutPrincipal =
    document.getElementById("donut-principal");

  var donutInterest =
    document.getElementById("donut-interest");

  var principalPercent =
    document.getElementById("principal-percent");

  var interestPercent =
    document.getElementById("interest-percent");

  var balanceChart =
    document.getElementById("balance-chart");

  var yearlySummary =
    document.getElementById("yearly-summary");

  var amortizationTable =
    document.getElementById("amortization-table");


  /*
   * ============================================================
   * CONFIG HELPERS
   * ============================================================
   */

  function getLimits() {
    return config.limits || {};
  }


  function getDefaults() {
    return config.defaults || {};
  }


  function getLimit(name, key, fallback) {
    var limits = getLimits();

    if (
      limits[name] &&
      Number.isFinite(
        Number(limits[name][key])
      )
    ) {
      return Number(limits[name][key]);
    }

    return fallback;
  }


  /*
   * ============================================================
   * NUMBER HELPERS
   * ============================================================
   */

  function toNumber(value) {
    var number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  }


  function clamp(value, min, max) {
    value = toNumber(value);

    return Math.min(
      max,
      Math.max(min, value)
    );
  }


  function round(value, decimals) {
    var factor =
      Math.pow(
        10,
        decimals || 0
      );

    return (
      Math.round(
        value * factor
      ) / factor
    );
  }


  function formatCurrency(value) {
    if (
      typeof utils.formatCurrency ===
      "function"
    ) {
      return utils.formatCurrency(value);
    }

    return "₹" +
      Number(value || 0)
        .toLocaleString("en-IN", {
          maximumFractionDigits: 2
        });
  }


  function formatShortCurrency(value) {
    if (
      typeof utils.formatShortCurrency ===
      "function"
    ) {
      return utils.formatShortCurrency(value);
    }

    return formatCurrency(value);
  }


  function formatNumber(value, decimals) {
    if (
      typeof utils.formatNumber ===
      "function"
    ) {
      return utils.formatNumber(
        value,
        decimals
      );
    }

    return Number(value || 0)
      .toLocaleString("en-IN", {
        maximumFractionDigits:
          decimals === undefined
            ? 2
            : decimals
      });
  }


  function formatDuration(months) {
    if (
      typeof utils.formatDuration ===
      "function"
    ) {
      return utils.formatDuration(months);
    }

    months = Math.max(
      0,
      Math.round(toNumber(months))
    );

    var years =
      Math.floor(months / 12);

    var remaining =
      months % 12;

    if (!years) {
      return remaining + " months";
    }

    if (!remaining) {
      return (
        years +
        (years === 1
          ? " year"
          : " years")
      );
    }

    return (
      years +
      (years === 1
        ? " year "
        : " years ") +
      remaining +
      (remaining === 1
        ? " month"
        : " months")
    );
  }


  /*
   * ============================================================
   * ERROR HANDLING
   * ============================================================
   */

  function clearError() {
    if (!errorBox) {
      return;
    }

    errorBox.hidden = true;
    errorBox.textContent = "";
  }


  function showError(message) {
    if (!errorBox) {
      return;
    }

    errorBox.textContent =
      message || "Please enter valid loan details.";

    errorBox.hidden = false;
  }


  /*
   * ============================================================
   * LIVE LABELS
   * ============================================================
   */

  function updateLoanLive() {
    if (!loanLive || !loanAmount) {
      return;
    }

    loanLive.textContent =
      formatCurrency(
        toNumber(loanAmount.value)
      );
  }


  function updateRateLive() {
    if (!rateLive || !interestRate) {
      return;
    }

    var value =
      toNumber(interestRate.value);

    rateLive.textContent =
      value.toFixed(2) + "%";
  }


  function updateTenureLive() {
    if (!tenureLive || !loanTenure) {
      return;
    }

    var months =
      getTenureMonths();

    tenureLive.textContent =
      formatDuration(months);
  }


  /*
   * ============================================================
   * TENURE CONVERSION
   * ============================================================
   */

  function getTenureMonths() {
    var value =
      Math.max(
        1,
        Math.round(
          toNumber(
            loanTenure
              ? loanTenure.value
              : 1
          )
        )
      );

    if (
      state.tenureMode === "months"
    ) {
      return value;
    }

    return value * 12;
  }


  function setTenureMonths(months) {
    months = Math.max(
      1,
      Math.round(
        toNumber(months)
      )
    );

    if (!loanTenure) {
      return;
    }

    if (
      state.tenureMode === "months"
    ) {
      loanTenure.value =
        months;
    } else {
      loanTenure.value =
        Math.max(
          1,
          Math.round(
            months / 12
          )
        );
    }

    updateTenureSlider();
    updateTenureLive();
  }


  /*
   * ============================================================
   * TENURE MODE
   * ============================================================
   */

  function setTenureMode(mode) {
    if (
      mode !== "months" &&
      mode !== "years"
    ) {
      mode = "years";
    }

    var months =
      getTenureMonths();

    state.tenureMode =
      mode;

    if (tenureUnit) {
      tenureUnit.textContent =
        mode === "months"
          ? "months"
          : "years";
    }

    if (yearsToggle) {
      yearsToggle.classList.toggle(
        "active",
        mode === "years"
      );

      yearsToggle.setAttribute(
        "aria-pressed",
        mode === "years"
          ? "true"
          : "false"
      );
    }

    if (monthsToggle) {
      monthsToggle.classList.toggle(
        "active",
        mode === "months"
      );

      monthsToggle.setAttribute(
        "aria-pressed",
        mode === "months"
          ? "true"
          : "false"
      );
    }

    if (loanTenure) {
      if (mode === "months") {
        loanTenure.min =
          getLimit(
            "months",
            "min",
            1
          );

        loanTenure.max =
          getLimit(
            "months",
            "max",
            360
          );
      } else {
        loanTenure.min =
          getLimit(
            "years",
            "min",
            1
          );

        loanTenure.max =
          getLimit(
            "years",
            "max",
            30
          );
      }
    }

    setTenureMonths(months);
    updateTenureSlider();
  }


  /*
   * ============================================================
   * RANGE SLIDER HELPERS
   * ============================================================
   */

  function updateLoanSlider() {
    if (
      !loanAmountSlider ||
      !loanAmount
    ) {
      return;
    }

    loanAmountSlider.value =
      loanAmount.value;
  }


  function updateRateSlider() {
    if (
      !interestRateSlider ||
      !interestRate
    ) {
      return;
    }

    interestRateSlider.value =
      interestRate.value;
  }


  function updateTenureSlider() {
    if (
      !tenureSlider ||
      !loanTenure
    ) {
      return;
    }

    tenureSlider.value =
      loanTenure.value;

    if (state.tenureMode === "months") {
      tenureSlider.min =
        getLimit(
          "months",
          "min",
          1
        );

      tenureSlider.max =
        getLimit(
          "months",
          "max",
          360
        );

      if (tenureMin) {
        tenureMin.textContent =
          "1 Month";
      }

      if (tenureMax) {
        tenureMax.textContent =
          "360 Months";
      }
    } else {
      tenureSlider.min =
        getLimit(
          "years",
          "min",
          1
        );

      tenureSlider.max =
        getLimit(
          "years",
          "max",
          30
        );

      if (tenureMin) {
        tenureMin.textContent =
          "1 Year";
      }

      if (tenureMax) {
        tenureMax.textContent =
          "30 Years";
      }
    }
  }


  /*
   * ============================================================
   * PREPAYMENT LIMIT
   * ============================================================
   */

  function updatePrepaymentMonthLimit() {
    if (
      !prepaymentMonth
    ) {
      return;
    }

    var months =
      getTenureMonths();

    prepaymentMonth.max =
      Math.max(
        1,
        months
      );

    var current =
      toNumber(
        prepaymentMonth.value
      );

    if (current > months) {
      prepaymentMonth.value =
        months;
    }
        }
    /*
   * ============================================================
   * INPUT SYNCHRONIZATION
   * ============================================================
   */

  function syncLoanFromInput() {
    if (
      !loanAmount ||
      !loanAmountSlider
    ) {
      return;
    }

    var min =
      getLimit(
        "principal",
        "min",
        1000
      );

    var max =
      getLimit(
        "principal",
        "max",
        100000000
      );

    var value =
      clamp(
        toNumber(
          loanAmount.value
        ),
        min,
        max
      );

    loanAmountSlider.value =
      value;

    updateLoanLive();
  }


  function syncLoanFromSlider() {
    if (
      !loanAmount ||
      !loanAmountSlider
    ) {
      return;
    }

    loanAmount.value =
      loanAmountSlider.value;

    updateLoanLive();
  }


  function syncRateFromInput() {
    if (
      !interestRate ||
      !interestRateSlider
    ) {
      return;
    }

    var min =
      getLimit(
        "annualRate",
        "min",
        0
      );

    var max =
      getLimit(
        "annualRate",
        "max",
        40
      );

    var value =
      clamp(
        toNumber(
          interestRate.value
        ),
        min,
        max
      );

    interestRateSlider.value =
      value;

    updateRateLive();
  }


  function syncRateFromSlider() {
    if (
      !interestRate ||
      !interestRateSlider
    ) {
      return;
    }

    interestRate.value =
      interestRateSlider.value;

    updateRateLive();
  }


  function syncTenureFromInput() {
    if (
      !loanTenure ||
      !tenureSlider
    ) {
      return;
    }

    var min =
      state.tenureMode === "months"
        ? getLimit(
            "months",
            "min",
            1
          )
        : getLimit(
            "years",
            "min",
            1
          );

    var max =
      state.tenureMode === "months"
        ? getLimit(
            "months",
            "max",
            360
          )
        : getLimit(
            "years",
            "max",
            30
          );

    var value =
      clamp(
        Math.round(
          toNumber(
            loanTenure.value
          )
        ),
        min,
        max
      );

    loanTenure.value =
      value;

    tenureSlider.value =
      value;

    updateTenureLive();
    updatePrepaymentMonthLimit();
  }


  function syncTenureFromSlider() {
    if (
      !loanTenure ||
      !tenureSlider
    ) {
      return;
    }

    loanTenure.value =
      tenureSlider.value;

    updateTenureLive();
    updatePrepaymentMonthLimit();
  }


  /*
   * ============================================================
   * VALIDATION
   * ============================================================
   */

  function validateInputs() {
    var principal =
      toNumber(
        loanAmount
          ? loanAmount.value
          : 0
      );

    var rate =
      toNumber(
        interestRate
          ? interestRate.value
          : 0
      );

    var months =
      getTenureMonths();

    var principalMin =
      getLimit(
        "principal",
        "min",
        1000
      );

    var principalMax =
      getLimit(
        "principal",
        "max",
        100000000
      );

    var rateMin =
      getLimit(
        "annualRate",
        "min",
        0
      );

    var rateMax =
      getLimit(
        "annualRate",
        "max",
        40
      );

    var monthsMin =
      getLimit(
        "months",
        "min",
        1
      );

    var monthsMax =
      getLimit(
        "months",
        "max",
        360
      );

    if (
      principal < principalMin ||
      principal > principalMax
    ) {
      showError(
        "Please enter a loan amount between " +
        formatCurrency(principalMin) +
        " and " +
        formatCurrency(principalMax) +
        "."
      );

      return false;
    }

    if (
      rate < rateMin ||
      rate > rateMax
    ) {
      showError(
        "Please enter an interest rate between " +
        rateMin.toFixed(2) +
        "% and " +
        rateMax.toFixed(2) +
        "%."
      );

      return false;
    }

    if (
      months < monthsMin ||
      months > monthsMax
    ) {
      showError(
        "Please enter a loan tenure between " +
        monthsMin +
        " and " +
        monthsMax +
        " months."
      );

      return false;
    }

    return true;
  }


  /*
   * ============================================================
   * OPTIONS BUILDER
   * ============================================================
   */

  function getOptions() {
    var months =
      getTenureMonths();

    return {
      principal:
        toNumber(
          loanAmount
            ? loanAmount.value
            : 0
        ),

      annualRate:
        toNumber(
          interestRate
            ? interestRate.value
            : 0
        ),

      months:
        months,

      processingFee:
        toNumber(
          processingFee
            ? processingFee.value
            : 0
        ),

      extraMonthly:
        toNumber(
          extraMonthly
            ? extraMonthly.value
            : 0
        ),

      prepayment:
        toNumber(
          prepayment
            ? prepayment.value
            : 0
        ),

      prepaymentMonth:
        Math.max(
          1,
          Math.round(
            toNumber(
              prepaymentMonth
                ? prepaymentMonth.value
                : 1
            )
          )
        )
    };
  }


  /*
   * ============================================================
   * ANIMATION HELPERS
   * ============================================================
   */

  function animateNumber(
    element,
    target,
    formatter,
    duration
  ) {
    if (!element) {
      return;
    }

    target =
      toNumber(target);

    duration =
      duration || 650;

    var start =
      toNumber(
        element.getAttribute(
          "data-number-value"
        )
      );

    if (!Number.isFinite(start)) {
      start = 0;
    }

    var startTime =
      null;

    function frame(timestamp) {
      if (!startTime) {
        startTime =
          timestamp;
      }

      var progress =
        Math.min(
          1,
          (
            timestamp -
            startTime
          ) / duration
        );

      var eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      var value =
        start +
        (
          target -
          start
        ) * eased;

      element.textContent =
        formatter
          ? formatter(value)
          : formatCurrency(value);

      if (
        progress < 1
      ) {
        window.requestAnimationFrame(
          frame
        );
      } else {
        element.setAttribute(
          "data-number-value",
          String(target)
        );
      }
    }

    window.requestAnimationFrame(
      frame
    );
  }


  function revealResults() {
    if (!resultsBox) {
      return;
    }

    resultsBox.classList.remove(
      "is-visible"
    );

    void resultsBox.offsetWidth;

    resultsBox.classList.add(
      "is-visible"
    );
  }


  /*
   * ============================================================
   * DONUT CHART
   * ============================================================
   */

  function drawDonut(
    principal,
    interest
  ) {
    var total =
      principal +
      interest;

    var principalRatio =
      total > 0
        ? principal / total
        : 0;

    var interestRatio =
      total > 0
        ? interest / total
        : 0;

    var principalAngle =
      principalRatio * 360;

    var interestAngle =
      interestRatio * 360;

    if (
      donutPrincipal
    ) {
      donutPrincipal.style.setProperty(
        "--donut-angle",
        principalAngle + "deg"
      );

      donutPrincipal.style.setProperty(
        "--donut-interest-angle",
        interestAngle + "deg"
      );

      donutPrincipal.style.setProperty(
        "--principal-percent",
        (
          principalRatio * 100
        ).toFixed(2) + "%"
      );

      donutPrincipal.style.setProperty(
        "--interest-percent",
        (
          interestRatio * 100
        ).toFixed(2) + "%"
      );
    }

    if (
      donutInterest
    ) {
      donutInterest.style.setProperty(
        "--donut-angle",
        interestAngle + "deg"
      );

      donutInterest.style.setProperty(
        "--donut-principal-angle",
        principalAngle + "deg"
      );
    }

    if (
      principalPercent
    ) {
      principalPercent.textContent =
        (
          principalRatio * 100
        ).toFixed(1) +
        "%";
    }

    if (
      interestPercent
    ) {
      interestPercent.textContent =
        (
          interestRatio * 100
        ).toFixed(1) +
        "%";
    }
  }


  /*
   * ============================================================
   * BALANCE CHART
   * ============================================================
   */

  function drawBalanceChart(
    schedule
  ) {
    if (
      !balanceChart ||
      !Array.isArray(schedule) ||
      !schedule.length
    ) {
      return;
    }

    balanceChart.innerHTML = "";

    var canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      Math.max(
        700,
        balanceChart.clientWidth || 700
      );

    canvas.height = 300;

    canvas.setAttribute(
      "aria-label",
      "Loan balance over time"
    );

    balanceChart.appendChild(
      canvas
    );

    var ctx =
      canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    var width =
      canvas.width;

    var height =
      canvas.height;

    var paddingLeft = 55;
    var paddingRight = 20;
    var paddingTop = 25;
    var paddingBottom = 45;

    var chartWidth =
      width -
      paddingLeft -
      paddingRight;

    var chartHeight =
      height -
      paddingTop -
      paddingBottom;

    var maxBalance =
      Math.max(
        schedule[0].openingBalance,
        1
      );

    schedule.forEach(
      function (row) {
        maxBalance =
          Math.max(
            maxBalance,
            toNumber(
              row.closingBalance
            )
          );
      }
    );

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    ctx.font =
      "12px Arial";

    ctx.lineWidth = 1;

    for (
      var grid = 0;
      grid <= 4;
      grid++
    ) {
      var ratio =
        grid / 4;

      var y =
        paddingTop +
        chartHeight *
        ratio;

      ctx.beginPath();

      ctx.moveTo(
        paddingLeft,
        y
      );

      ctx.lineTo(
        width -
        paddingRight,
        y
      );

      ctx.strokeStyle =
        "rgba(100,116,139,0.16)";

      ctx.stroke();

      var labelValue =
        maxBalance *
        (1 - ratio);

      ctx.fillStyle =
        "#64748b";

      ctx.fillText(
        formatShortCurrency(
          labelValue
        ),
        5,
        y + 4
      );
    }

    var points = [];

    schedule.forEach(
      function (row, index) {
        var x =
          paddingLeft +
          (
            index /
            Math.max(
              1,
              schedule.length - 1
            )
          ) *
          chartWidth;

        var ratio =
          toNumber(
            row.closingBalance
          ) /
          maxBalance;

        var y =
          paddingTop +
          (
            1 - ratio
          ) *
          chartHeight;

        points.push({
          x: x,
          y: y
        });
      }
    );

    if (!points.length) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo(
      points[0].x,
      paddingTop +
      chartHeight
    );

    points.forEach(
      function (point) {
        ctx.lineTo(
          point.x,
          point.y
        );
      }
    );

    ctx.lineTo(
      points[
        points.length - 1
      ].x,
      paddingTop +
      chartHeight
    );

    ctx.closePath();

    ctx.fillStyle =
      "rgba(37,99,235,0.10)";

    ctx.fill();

    ctx.beginPath();

    points.forEach(
      function (point, index) {

        if (index === 0) {
          ctx.moveTo(
            point.x,
            point.y
          );
        } else {
          ctx.lineTo(
            point.x,
            point.y
          );
        }

      }
    );

    ctx.strokeStyle =
      "#2563eb";

    ctx.lineWidth = 3;

    ctx.stroke();

    ctx.fillStyle =
      "#64748b";

    ctx.fillText(
      "Month 1",
      paddingLeft,
      height - 15
    );

    ctx.fillText(
      "Month " +
      schedule.length,
      Math.max(
        paddingLeft,
        width -
        paddingRight -
        75
      ),
      height - 15
    );
  }


  /*
   * ============================================================
   * YEARLY SUMMARY
   * ============================================================
   */

  function renderYearlySummary(
    yearly
  ) {
    if (!yearlySummary) {
      return;
    }

    yearlySummary.innerHTML = "";

    if (
      !Array.isArray(yearly) ||
      !yearly.length
    ) {
      yearlySummary.textContent =
        "Yearly repayment details will appear here.";
      return;
    }

    var table =
      document.createElement(
        "table"
      );

    table.className =
      "yearly-summary-table";

    table.innerHTML =
      "<thead>" +
      "<tr>" +
      "<th>Year</th>" +
      "<th>Payment</th>" +
      "<th>Principal</th>" +
      "<th>Interest</th>" +
      "<th>Balance</th>" +
      "</tr>" +
      "</thead>";

    var tbody =
      document.createElement(
        "tbody"
      );

    yearly.forEach(
      function (row) {

        var tr =
          document.createElement(
            "tr"
          );

        tr.innerHTML =
          "<td>" +
          row.year +
          "</td>" +

          "<td>" +
          formatCurrency(
            row.payment
          ) +
          "</td>" +

          "<td>" +
          formatCurrency(
            row.principal
          ) +
          "</td>" +

          "<td>" +
          formatCurrency(
            row.interest
          ) +
          "</td>" +

          "<td>" +
          formatCurrency(
            row.closingBalance
          ) +
          "</td>";

        tbody.appendChild(
          tr
        );
      }
    );

    table.appendChild(
      tbody
    );

    yearlySummary.appendChild(
      table
    );
        }
    /*
   * ============================================================
   * AMORTIZATION SCHEDULE
   * ============================================================
   */

  function renderAmortization(
    schedule
  ) {
    if (!amortizationTable) {
      return;
    }

    amortizationTable.innerHTML = "";

    if (
      !Array.isArray(schedule) ||
      !schedule.length
    ) {
      amortizationTable.textContent =
        "Your monthly repayment schedule will appear here.";
      return;
    }

    var table =
      document.createElement(
        "table"
      );

    table.className =
      "amortization-table";

    table.innerHTML =
      "<thead>" +
      "<tr>" +
      "<th>Month</th>" +
      "<th>Payment</th>" +
      "<th>Principal</th>" +
      "<th>Interest</th>" +
      "<th>Balance</th>" +
      "</tr>" +
      "</thead>";

    var tbody =
      document.createElement(
        "tbody"
      );

    /*
     * Keep the full schedule available,
     * but initially show a manageable number
     * of rows on the page.
     */

    var visibleRows =
      Math.min(
        schedule.length,
        60
      );

    for (
      var index = 0;
      index < visibleRows;
      index++
    ) {

      var row =
        schedule[index];

      var tr =
        document.createElement(
          "tr"
        );

      tr.innerHTML =
        "<td>" +
        row.month +
        "</td>" +

        "<td>" +
        formatCurrency(
          row.payment
        ) +
        "</td>" +

        "<td>" +
        formatCurrency(
          row.principal
        ) +
        "</td>" +

        "<td>" +
        formatCurrency(
          row.interest
        ) +
        "</td>" +

        "<td>" +
        formatCurrency(
          row.closingBalance
        ) +
        "</td>";

      tbody.appendChild(
        tr
      );
    }

    table.appendChild(
      tbody
    );

    amortizationTable.appendChild(
      table
    );

    /*
     * Inform the user when the loan has
     * more rows than the initial display.
     */

    if (
      schedule.length >
      visibleRows
    ) {

      var note =
        document.createElement(
          "p"
        );

      note.className =
        "amortization-note";

      note.textContent =
        "Showing the first " +
        visibleRows +
        " months of " +
        schedule.length +
        " total months.";

      amortizationTable.appendChild(
        note
      );
    }
  }


  /*
   * ============================================================
   * SAVINGS SUMMARY
   * ============================================================
   */

  function renderSavings(
    data
  ) {
    if (!savingsBox) {
      return;
    }

    var interestSaved =
      Math.max(
        0,
        toNumber(
          data.interestSaved
        )
      );

    var monthsSaved =
      Math.max(
        0,
        Math.round(
          toNumber(
            data.monthsSaved
          )
        )
      );

    var hasSavings =
      interestSaved > 0 ||
      monthsSaved > 0;

    if (!hasSavings) {

      savingsBox.innerHTML =
        "<div class=\"savings-empty\">" +
        "<strong>Want to save on interest?</strong>" +
        "<p>" +
        "Try adding an extra monthly payment " +
        "or a one-time prepayment in Advanced Options." +
        "</p>" +
        "</div>";

      return;
    }

    savingsBox.innerHTML =
      "<div class=\"savings-content\">" +

      "<div class=\"savings-highlight\">" +
      "<span class=\"savings-label\">" +
      "Potential interest saved" +
      "</span>" +
      "<strong>" +
      formatCurrency(
        interestSaved
      ) +
      "</strong>" +
      "</div>" +

      "<div class=\"savings-highlight\">" +
      "<span class=\"savings-label\">" +
      "Loan closed earlier by" +
      "</span>" +
      "<strong>" +
      formatDuration(
        monthsSaved
      ) +
      "</strong>" +
      "</div>" +

      "</div>";
  }


  /*
   * ============================================================
   * RESULT DISPLAY
   * ============================================================
   */

  function displayResults(
    data
  ) {
    if (!data) {
      return;
    }

    state.lastResult =
      data;

    /*
     * Main EMI
     */

    animateNumber(
      emiValue,
      data.monthlyPayment,
      formatCurrency,
      700
    );


    /*
     * Total interest
     */

    animateNumber(
      interestValue,
      data.totalInterest,
      formatCurrency,
      700
    );


    /*
     * Total payment
     */

    animateNumber(
      paymentValue,
      data.totalPayment,
      formatCurrency,
      700
    );


    /*
     * Payoff duration
     */

    if (durationValue) {
      durationValue.textContent =
        formatDuration(
          data.actualMonths
        );
    }


    /*
     * EMI progress / visual bar
     */

    if (emiBar) {

      var plannedPayment =
        Math.max(
          1,
          toNumber(
            data.baseEmi
          )
        );

      var actualPayment =
        Math.max(
          0,
          toNumber(
            data.monthlyPayment
          )
        );

      var paymentRatio =
        Math.min(
          1,
          actualPayment /
          plannedPayment
        );

      emiBar.style.width =
        (
          paymentRatio * 100
        ) + "%";
    }


    /*
     * Principal / interest donut
     */

    drawDonut(
      data.principal,
      data.totalInterest
    );


    /*
     * Loan balance chart
     */

    drawBalanceChart(
      data.schedule
    );


    /*
     * Yearly summary
     */

    renderYearlySummary(
      data.yearlySummary
    );


    /*
     * Amortization
     */

    renderAmortization(
      data.schedule
    );


    /*
     * Savings
     */

    renderSavings(
      data
    );


    /*
     * Additional result values
     * supported by the current HTML.
     */

    var baseEmiValue =
      document.getElementById(
        "base-emi-value"
      );

    if (baseEmiValue) {
      baseEmiValue.textContent =
        formatCurrency(
          data.baseEmi
        );
    }


    var principalValue =
      document.getElementById(
        "principal-value"
      );

    if (principalValue) {
      principalValue.textContent =
        formatCurrency(
          data.principal
        );
    }


    var rateValue =
      document.getElementById(
        "rate-value"
      );

    if (rateValue) {
      rateValue.textContent =
        toNumber(
          data.annualRate
        ).toFixed(2) +
        "%";
    }


    var plannedDurationValue =
      document.getElementById(
        "planned-duration-value"
      );

    if (plannedDurationValue) {
      plannedDurationValue.textContent =
        formatDuration(
          data.plannedMonths
        );
    }


    var actualDurationValue =
      document.getElementById(
        "actual-duration-value"
      );

    if (actualDurationValue) {
      actualDurationValue.textContent =
        formatDuration(
          data.actualMonths
        );
    }


    var feeValue =
      document.getElementById(
        "processing-fee-value"
      );

    if (feeValue) {
      feeValue.textContent =
        formatCurrency(
          data.processingFee
        );
    }


    var totalCostValue =
      document.getElementById(
        "total-cost-value"
      );

    if (totalCostValue) {
      totalCostValue.textContent =
        formatCurrency(
          data.totalCost
        );
    }


    var interestSavedValue =
      document.getElementById(
        "interest-saved-value"
      );

    if (interestSavedValue) {
      interestSavedValue.textContent =
        formatCurrency(
          data.interestSaved
        );
    }


    var monthsSavedValue =
      document.getElementById(
        "months-saved-value"
      );

    if (monthsSavedValue) {
      monthsSavedValue.textContent =
        formatDuration(
          data.monthsSaved
        );
    }


    /*
     * Reveal result area after values
     * have been prepared.
     */

    if (resultsBox) {
      resultsBox.hidden = false;
    }

    revealResults();


    /*
     * Scroll only when the user explicitly
     * pressed Calculate. Live updates should
     * not constantly move the page.
     */
  }


  /*
   * ============================================================
   * CALCULATE
   * ============================================================
   */

  function calculate() {
    clearError();

    if (
      !calculator ||
      typeof calculator.calculate !==
        "function"
    ) {
      showError(
        "The calculator is temporarily unavailable. Please refresh the page and try again."
      );

      return;
    }

    /*
     * Keep the input values synchronized
     * before validation.
     */

    syncLoanFromInput();
    syncRateFromInput();
    syncTenureFromInput();

    updatePrepaymentMonthLimit();

    if (!validateInputs()) {
      return;
    }

    var options =
      getOptions();

    var result =
      calculator.calculate(
        options
      );

    if (!result) {
      showError(
        "Please check your loan details and try again."
      );

      return;
    }

    displayResults(
      result
    );
  }


  /*
   * ============================================================
   * LIVE CALCULATION
   * ============================================================
   */

  function maybeCalculate() {
    if (
      !state.liveUpdate
    ) {
      return;
    }

    calculate();
  }


  /*
   * ============================================================
   * INPUT EVENTS
   * ============================================================
   */

  if (loanAmount) {

    loanAmount.addEventListener(
      "input",
      function () {

        syncLoanFromInput();

        maybeCalculate();

      }
    );

  }


  if (loanAmountSlider) {

    loanAmountSlider.addEventListener(
      "input",
      function () {

        syncLoanFromSlider();

        maybeCalculate();

      }
    );

  }


  if (interestRate) {

    interestRate.addEventListener(
      "input",
      function () {

        syncRateFromInput();

        maybeCalculate();

      }
    );

  }


  if (interestRateSlider) {

    interestRateSlider.addEventListener(
      "input",
      function () {

        syncRateFromSlider();

        maybeCalculate();

      }
    );

  }


  if (loanTenure) {

    loanTenure.addEventListener(
      "input",
      function () {

        syncTenureFromInput();

        maybeCalculate();

      }
    );

  }


  if (tenureSlider) {

    tenureSlider.addEventListener(
      "input",
      function () {

        syncTenureFromSlider();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * ADVANCED INPUT EVENTS
   * ============================================================
   */

  if (processingFee) {

    processingFee.addEventListener(
      "input",
      function () {

        maybeCalculate();

      }
    );

  }


  if (extraMonthly) {

    extraMonthly.addEventListener(
      "input",
      function () {

        maybeCalculate();

      }
    );

  }


  if (prepayment) {

    prepayment.addEventListener(
      "input",
      function () {

        maybeCalculate();

      }
    );

  }


  if (prepaymentMonth) {

    prepaymentMonth.addEventListener(
      "input",
      function () {

        updatePrepaymentMonthLimit();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * TENURE TOGGLE EVENTS
   * ============================================================
   */

  if (yearsToggle) {

    yearsToggle.addEventListener(
      "click",
      function () {

        setTenureMode(
          "years"
        );

        maybeCalculate();

      }
    );

  }


  if (monthsToggle) {

    monthsToggle.addEventListener(
      "click",
      function () {

        setTenureMode(
          "months"
        );

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * CALCULATE BUTTON
   * ============================================================
   */

  if (calculateButton) {

    calculateButton.addEventListener(
      "click",
      function () {

        calculate();

      }
    );

}
    /*
   * ============================================================
   * RESET
   * ============================================================
   */

  function resetCalculator() {

    var defaults =
      getDefaults();

    if (loanAmount) {
      loanAmount.value =
        defaults.principal !== undefined
          ? defaults.principal
          : 500000;
    }

    if (interestRate) {
      interestRate.value =
        defaults.annualRate !== undefined
          ? defaults.annualRate
          : 10;
    }

    if (processingFee) {
      processingFee.value =
        defaults.processingFee !== undefined
          ? defaults.processingFee
          : 0;
    }

    if (extraMonthly) {
      extraMonthly.value =
        defaults.extraMonthly !== undefined
          ? defaults.extraMonthly
          : 0;
    }

    if (prepayment) {
      prepayment.value =
        defaults.prepayment !== undefined
          ? defaults.prepayment
          : 0;
    }

    if (prepaymentMonth) {
      prepaymentMonth.value =
        defaults.prepaymentMonth !== undefined
          ? defaults.prepaymentMonth
          : 12;
    }

    /*
     * Reset tenure using the currently
     * selected unit.
     */

    if (state.tenureMode === "months") {

      if (loanTenure) {
        loanTenure.value =
          defaults.months !== undefined
            ? defaults.months
            : 60;
      }

    } else {

      if (loanTenure) {
        loanTenure.value =
          defaults.years !== undefined
            ? defaults.years
            : 5;
      }

    }

    /*
     * Restore live calculation.
     */

    state.liveUpdate = true;

    if (liveUpdate) {
      liveUpdate.checked = true;
    }

    /*
     * Synchronize every visual control.
     */

    syncLoanFromInput();
    syncRateFromInput();
    syncTenureFromInput();

    updatePrepaymentMonthLimit();

    updateLoanLive();
    updateRateLive();
    updateTenureLive();

    clearError();

    calculate();
  }


  /*
   * ============================================================
   * RESET BUTTON
   * ============================================================
   */

  if (resetButton) {

    resetButton.addEventListener(
      "click",
      function () {

        resetCalculator();

      }
    );

  }


  /*
   * ============================================================
   * LIVE UPDATE SWITCH
   * ============================================================
   */

  if (liveUpdate) {

    state.liveUpdate =
      liveUpdate.checked;

    liveUpdate.addEventListener(
      "change",
      function () {

        state.liveUpdate =
          liveUpdate.checked;

        if (
          state.liveUpdate
        ) {
          calculate();
        }

      }
    );

  }


  /*
   * ============================================================
   * HELP CONTENT
   * ============================================================
   */

  var helpContent = {

    "loan-amount": {
      title: "Loan Amount",
      text:
        "Enter the amount you plan to borrow. " +
        "You can type the amount directly or use " +
        "the slider to adjust it."
    },

    "interest-rate": {
      title: "Interest Rate",
      text:
        "Enter the annual interest rate charged " +
        "on the loan. You can enter decimal values " +
        "such as 7.45%."
    },

    "loan-tenure": {
      title: "Loan Tenure",
      text:
        "Choose how long you plan to repay the loan. " +
        "You can switch between years and months."
    },

    "processing-fee": {
      title: "Processing Fee",
      text:
        "This is an additional fee charged for " +
        "processing the loan. It is shown separately " +
        "from the regular loan repayment."
    },

    "extra-monthly": {
      title: "Extra Monthly Payment",
      text:
        "Enter an amount you may pay in addition " +
        "to your regular EMI each month. Extra " +
        "payments can reduce the outstanding balance."
    },

    "prepayment": {
      title: "One-Time Prepayment",
      text:
        "Enter an optional one-time amount you plan " +
        "to pay toward the loan before the scheduled " +
        "loan completion."
    },

    "prepayment-month": {
      title: "Prepayment Month",
      text:
        "Choose the month in which you expect to make " +
        "the one-time prepayment."
    },

    "emi": {
      title: "Monthly EMI",
      text:
        "This is the regular monthly payment calculated " +
        "from your loan amount, interest rate and tenure."
    },

    "total-interest": {
      title: "Total Interest",
      text:
        "This is the total interest estimated across " +
        "the repayment schedule."
    },

    "total-payment": {
      title: "Total Payment",
      text:
        "This is the total amount paid toward the loan, " +
        "including principal and interest."
    },

    "payoff-time": {
      title: "Payoff Time",
      text:
        "This shows the estimated time required to " +
        "finish the loan based on the selected inputs."
    },

    "interest-saved": {
      title: "Interest Saved",
      text:
        "This shows the estimated reduction in interest " +
        "when extra monthly payments or a prepayment " +
        "are included."
    }
  };


  /*
   * ============================================================
   * OPEN HELP PANEL
   * ============================================================
   */

  function openHelp(key) {

    if (!helpPanel) {
      return;
    }

    var item =
      helpContent[key];

    if (!item) {
      item = {
        title: "About this field",
        text:
          "Enter the value for this field to " +
          "see how it affects your loan calculation."
      };
    }

    if (helpTitle) {
      helpTitle.textContent =
        item.title;
    }

    if (helpText) {
      helpText.textContent =
        item.text;
    }

    helpPanel.hidden =
      false;

    helpPanel.classList.add(
      "is-open"
    );

    document.body.classList.add(
      "calculator-help-open"
    );

    if (helpClose) {
      helpClose.focus();
    }
  }


  /*
   * ============================================================
   * CLOSE HELP PANEL
   * ============================================================
   */

  function closeHelp() {

    if (!helpPanel) {
      return;
    }

    helpPanel.classList.remove(
      "is-open"
    );

    helpPanel.hidden =
      true;

    document.body.classList.remove(
      "calculator-help-open"
    );
  }


  /*
   * ============================================================
   * HELP BUTTONS
   * ============================================================
   *
   * Supports both:
   *
   * data-help="loan-amount"
   *
   * and:
   *
   * data-calculator-help="loan-amount"
   *
   * so the controller remains compatible
   * with the current V4 HTML.
   * ============================================================
   */

  var helpButtons =
    document.querySelectorAll(
      "[data-help], [data-calculator-help]"
    );

  helpButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          var key =
            button.getAttribute(
              "data-help"
            );

          if (!key) {
            key =
              button.getAttribute(
                "data-calculator-help"
              );
          }

          openHelp(key);

        }
      );

    }
  );


  /*
   * ============================================================
   * HELP CLOSE BUTTON
   * ============================================================
   */

  if (helpClose) {

    helpClose.addEventListener(
      "click",
      function () {

        closeHelp();

      }
    );

  }


  /*
   * ============================================================
   * HELP PANEL OUTSIDE CLICK
   * ============================================================
   */

  if (helpPanel) {

    helpPanel.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          helpPanel
        ) {

          closeHelp();

        }

      }
    );

  }


  /*
   * ============================================================
   * KEYBOARD SUPPORT
   * ============================================================
   */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Escape"
      ) {

        closeHelp();

      }

      if (
        event.key ===
        "Enter"
      ) {

        var target =
          event.target;

        if (
          target &&
          (
            target === loanAmount ||
            target === interestRate ||
            target === loanTenure ||
            target === processingFee ||
            target === extraMonthly ||
            target === prepayment ||
            target === prepaymentMonth
          )
        ) {

          event.preventDefault();

          calculate();

        }

      }

    }
  );


  /*
   * ============================================================
   * INPUT LIMITS
   * ============================================================
   */

  function applyInputLimits() {

    if (loanAmount) {

      loanAmount.min =
        getLimit(
          "principal",
          "min",
          1000
        );

      loanAmount.max =
        getLimit(
          "principal",
          "max",
          100000000
        );

    }


    if (loanAmountSlider) {

      loanAmountSlider.min =
        getLimit(
          "principal",
          "min",
          1000
        );

      loanAmountSlider.max =
        getLimit(
          "principal",
          "max",
          100000000
        );

    }


    if (interestRate) {

      interestRate.min =
        getLimit(
          "annualRate",
          "min",
          0
        );

      interestRate.max =
        getLimit(
          "annualRate",
          "max",
          40
        );

      interestRate.step =
        "0.01";

    }


    if (interestRateSlider) {

      interestRateSlider.min =
        getLimit(
          "annualRate",
          "min",
          0
        );

      interestRateSlider.max =
        getLimit(
          "annualRate",
          "max",
          40
        );

      interestRateSlider.step =
        "0.01";

    }


    if (processingFee) {

      processingFee.min =
        getLimit(
          "processingFee",
          "min",
          0
        );

      processingFee.max =
        getLimit(
          "processingFee",
          "max",
          10000000
        );

    }


    if (extraMonthly) {

      extraMonthly.min =
        getLimit(
          "extraMonthly",
          "min",
          0
        );

      extraMonthly.max =
        getLimit(
          "extraMonthly",
          "max",
          1000000
        );

    }


    if (prepayment) {

      prepayment.min =
        getLimit(
          "prepayment",
          "min",
          0
        );

      prepayment.max =
        getLimit(
          "prepayment",
          "max",
          10000000
        );

    }

  }


  /*
   * ============================================================
   * INITIALIZE DEFAULT VALUES
   * ============================================================
   */

  function initializeDefaults() {

    var defaults =
      getDefaults();


    if (loanAmount) {

      loanAmount.value =
        defaults.principal !== undefined
          ? defaults.principal
          : 500000;

    }


    if (interestRate) {

      interestRate.value =
        defaults.annualRate !== undefined
          ? defaults.annualRate
          : 10;

    }


    if (loanTenure) {

      if (
        state.tenureMode ===
        "months"
      ) {

        loanTenure.value =
          defaults.months !== undefined
            ? defaults.months
            : 60;

      } else {

        loanTenure.value =
          defaults.years !== undefined
            ? defaults.years
            : 5;

      }

    }


    if (processingFee) {

      processingFee.value =
        defaults.processingFee !== undefined
          ? defaults.processingFee
          : 0;

    }


    if (extraMonthly) {

      extraMonthly.value =
        defaults.extraMonthly !== undefined
          ? defaults.extraMonthly
          : 0;

    }


    if (prepayment) {

      prepayment.value =
        defaults.prepayment !== undefined
          ? defaults.prepayment
          : 0;

    }


    if (prepaymentMonth) {

      prepaymentMonth.value =
        defaults.prepaymentMonth !== undefined
          ? defaults.prepaymentMonth
          : 12;

    }

  }
    /*
   * ============================================================
   * QUICK LOAN PRESETS
   * ============================================================
   */

  var presetButtons =
    document.querySelectorAll(
      "[data-loan-preset]"
    );

  presetButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          var presetValue =
            toNumber(
              button.getAttribute(
                "data-loan-preset"
              )
            );

          if (
            !loanAmount ||
            presetValue <= 0
          ) {
            return;
          }

          loanAmount.value =
            presetValue;

          syncLoanFromInput();

          /*
           * Update active preset styling.
           */

          presetButtons.forEach(
            function (item) {

              item.classList.remove(
                "active"
              );

            }
          );

          button.classList.add(
            "active"
          );

          /*
           * Recalculate immediately.
           */

          calculate();

        }
      );

    }
  );
    /*
   * ============================================================
   * FINAL INITIALIZATION
   * ============================================================
   */

  applyInputLimits();

  initializeDefaults();

  /*
   * Set the default tenure mode.
   */

  setTenureMode(
    state.tenureMode
  );

  /*
   * Synchronize all controls.
   */

  syncLoanFromInput();

  syncRateFromInput();

  syncTenureFromInput();

  updateLoanLive();

  updateRateLive();

  updateTenureLive();

  updatePrepaymentMonthLimit();

  /*
   * Make sure the live-update switch
   * reflects the internal state.
   */

  if (liveUpdate) {

    liveUpdate.checked =
      state.liveUpdate;

  }

  /*
   * Clear any old error message.
   */

  clearError();

  /*
   * Run the first calculation so the
   * calculator opens with useful results.
   */

  calculate();


  /*
   * ============================================================
   * PUBLIC CALCULATOR API
   * ============================================================
   *
   * Expose only the small public interface
   * needed for debugging or future shared
   * calculator components.
   * ============================================================
   */

  window.EMIFORMULA_EMI_UI = {

    calculate:
      calculate,

    reset:
      resetCalculator,

    getState:
      function () {
        return {
          liveUpdate:
            state.liveUpdate,

          tenureMode:
            state.tenureMode,

          lastResult:
            state.lastResult
        };
      },

    openHelp:
      openHelp,

    closeHelp:
      closeHelp

  };


  /*
   * ============================================================
   * FINAL INITIALIZATION EVENT
   * ============================================================
   */

  document.dispatchEvent(
    new CustomEvent(
      "emiformula:calculator-ready",
      {
        detail: {
          calculator:
            "emi-calculator"
        }
      }
    )
  );


  /*
   * ============================================================
   * END OF EMI CALCULATOR V4
   * ============================================================
   */

})();
