(function () {
  "use strict";

  /*
   * ============================================================
   * EMIFORMULA EMI CALCULATOR UI CONTROLLER
   * ============================================================
   *
   * This file controls:
   *
   * 1. Loan amount input
   * 2. Loan amount slider
   * 3. Interest rate input
   * 4. Interest rate slider
   * 5. Loan tenure input
   * 6. Loan tenure slider
   * 7. Years / Months toggle
   * 8. Processing fee
   * 9. Extra monthly payment
   * 10. One-time prepayment
   * 11. Prepayment month
   * 12. Live Update
   * 13. Calculate EMI button
   * 14. Reset button
   * 15. Question mark help panels
   * 16. EMI result
   * 17. Total interest
   * 18. Total payment
   * 19. Payoff time
   * 20. Payment breakdown
   * 21. Donut chart
   * 22. Loan balance chart
   * 23. Yearly summary
   * 24. Amortization schedule
   * 25. Savings information
   *
   * The calculation engine itself remains in:
   * assets/js/calculator-engine.js
   *
   * The formatting utilities remain in:
   * assets/js/calculator-utils.js
   *
   * ============================================================
   */

  var config =
    window.EMIFORMULA_EMI_CONFIG;

  var calculator =
    window.EMIFORMULA_CALCULATOR;

  var utils =
    window.EMIFORMULA_CALCULATOR_UTILS;


  /*
   * ============================================================
   * DEPENDENCY CHECK
   * ============================================================
   */

  if (
    !config ||
    !calculator ||
    !utils
  ) {

    console.error(
      "EMIFORMULA calculator dependencies are missing."
    );

    return;

  }


  /*
   * ============================================================
   * CALCULATOR STATE
   * ============================================================
   */

  var tenureMode = "years";

  var liveUpdate = true;

  var calculationTimer = null;

  var helpOpen = false;


  /*
   * ============================================================
   * ELEMENT REFERENCES
   * ============================================================
   */

  var loanAmount =
    document.getElementById(
      "loan-amount"
    );

  var loanSlider =
    document.getElementById(
      "loan-amount-slider"
    );

  var interestRate =
    document.getElementById(
      "interest-rate"
    );

  var rateSlider =
    document.getElementById(
      "interest-rate-slider"
    );

  var tenure =
    document.getElementById(
      "loan-tenure"
    );

  var tenureSlider =
    document.getElementById(
      "loan-tenure-slider"
    );


  /*
   * Advanced fields
   */

  var processingFee =
    document.getElementById(
      "processing-fee"
    );

  var extraMonthly =
    document.getElementById(
      "extra-monthly"
    );

  var prepayment =
    document.getElementById(
      "prepayment"
    );

  var prepaymentMonth =
    document.getElementById(
      "prepayment-month"
    );


  /*
   * Main buttons
   */

  var calculateButton =
    document.getElementById(
      "calculate-emi"
    );

  var resetButton =
    document.getElementById(
      "reset-emi"
    );


  /*
   * Live update checkbox
   */

  var liveUpdateInput =
    document.getElementById(
      "live-update"
    );


  /*
   * Results
   */

  var results =
    document.getElementById(
      "calculator-results"
    );

  var errorBox =
    document.getElementById(
      "emi-error"
    );


  /*
   * ============================================================
   * BASIC HELPER FUNCTIONS
   * ============================================================
   */

  function byId(id) {

    return document.getElementById(
      id
    );

  }


  function clamp(
    value,
    min,
    max
  ) {

    value =
      Number(value);

    if (
      !Number.isFinite(value)
    ) {

      return min;

    }

    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );

  }


  function numberValue(
    value,
    fallback
  ) {

    var number =
      Number(value);

    if (
      Number.isFinite(number)
    ) {

      return number;

    }

    return fallback;

  }


  function readInput(
    element,
    fallback
  ) {

    if (!element) {

      return fallback;

    }

    var raw =
      String(
        element.value == null
          ? ""
          : element.value
      ).trim();


    if (
      raw === "" ||
      raw === "." ||
      raw === "-"
    ) {

      return fallback;

    }


    var value =
      Number(raw);


    if (
      !Number.isFinite(value)
    ) {

      return fallback;

    }


    return value;

  }


  function setText(
    id,
    value
  ) {

    var element =
      byId(id);

    if (element) {

      element.textContent =
        value;

    }

  }


  function setHidden(
    id,
    hidden
  ) {

    var element =
      byId(id);

    if (element) {

      element.hidden =
        hidden;

    }

  }


  function formatCurrency(
    value
  ) {

    return utils.formatCurrency(
      numberValue(
        value,
        0
      )
    );

  }


  function formatNumber(
    value,
    decimals
  ) {

    return utils.formatNumber(
      numberValue(
        value,
        0
      ),
      decimals
    );

  }


  /*
   * ============================================================
   * ERROR HANDLING
   * ============================================================
   */

  function clearError() {

    if (errorBox) {

      errorBox.textContent =
        "";

      errorBox.hidden =
        true;

    }

  }


  function showError(
    message
  ) {

    if (results) {

      results.hidden =
        true;

    }


    if (errorBox) {

      errorBox.textContent =
        message;

      errorBox.hidden =
        false;

      errorBox.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }

  }


  /*
   * ============================================================
   * LIVE DISPLAY
   * ============================================================
   */

  function updateLiveValues() {

    var loanValue =
      readInput(
        loanAmount,
        0
      );


    var rateValue =
      readInput(
        interestRate,
        0
      );


    var tenureValue =
      readInput(
        tenure,
        0
      );


    setText(
      "loan-live",
      formatCurrency(
        loanValue
      )
    );


    setText(
      "rate-live",
      formatNumber(
        rateValue,
        2
      ) +
      "%"
    );


    var unit =
      tenureMode === "years"
        ? (
            tenureValue === 1
              ? "Year"
              : "Years"
          )
        : (
            tenureValue === 1
              ? "Month"
              : "Months"
          );


    setText(
      "tenure-live",
      formatNumber(
        tenureValue,
        0
      ) +
      " " +
      unit
    );

  }


  /*
   * ============================================================
   * LOAN AMOUNT
   * ============================================================
   */

  function syncLoan(
    value,
    writeInput
  ) {

    value =
      clamp(
        value,
        1000,
        100000000
      );


    value =
      Math.round(value);


    if (
      writeInput !== false &&
      loanAmount
    ) {

      loanAmount.value =
        String(value);

    }


    if (loanSlider) {

      loanSlider.value =
        String(value);

    }


    updateLiveValues();

  }


  /*
   * ============================================================
   * INTEREST RATE
   * ============================================================
   */

  function syncRate(
    value,
    writeInput
  ) {

    value =
      clamp(
        value,
        0,
        40
      );


    if (
      writeInput !== false &&
      interestRate
    ) {

      interestRate.value =
        String(value);

    }


    if (rateSlider) {

      rateSlider.value =
        String(value);

    }


    updateLiveValues();

  }


  /*
   * ============================================================
   * INTEREST RATE TYPING
   * ============================================================
   *
   * Important:
   *
   * The field is intentionally NOT rewritten with Number()
   * during every keystroke.
   *
   * This prevents the cursor from jumping when entering:
   *
   * 7.45
   * 8.25
   * 9.75
   *
   * ============================================================
   */

  function sanitizeInterestInput() {

    if (!interestRate) {

      return;

    }


    var value =
      String(
        interestRate.value
      );


    value =
      value.replace(
        /[^0-9.]/g,
        ""
      );


    var firstDot =
      value.indexOf(".");


    if (
      firstDot !== -1
    ) {

      var before =
        value.slice(
          0,
          firstDot
        );


      var after =
        value.slice(
          firstDot + 1
        );


      after =
        after.replace(
          /\./g,
          ""
        );


      before =
        before.slice(
          0,
          2
        );


      after =
        after.slice(
          0,
          2
        );


      value =
        before +
        "." +
        after;

    } else {

      value =
        value.slice(
          0,
          2
        );

    }


    if (
      Number(value) > 40
    ) {

      value =
        "40";

    }


    interestRate.value =
      value;

  }


  function normalizeInterest() {

    if (!interestRate) {

      return;

    }


    var value =
      readInput(
        interestRate,
        0
      );


    value =
      clamp(
        value,
        0,
        40
      );


    value =
      Math.round(
        value * 100
      ) / 100;


    interestRate.value =
      String(value);


    if (rateSlider) {

      rateSlider.value =
        String(value);

    }


    updateLiveValues();

  }


  /*
   * ============================================================
   * TENURE LIMITS
   * ============================================================
   */

  function updateTenureLimits() {

    if (
      !tenure ||
      !tenureSlider
    ) {

      return;

    }


    if (
      tenureMode === "years"
    ) {

      tenure.min =
        "1";

      tenure.max =
        "30";

      tenure.step =
        "1";


      tenureSlider.min =
        "1";

      tenureSlider.max =
        "30";

      tenureSlider.step =
        "1";


      setText(
        "tenure-unit",
        "Years"
      );

      setText(
        "tenure-min",
        "1 Year"
      );

      setText(
        "tenure-max",
        "30 Years"
      );

    } else {

      tenure.min =
        "1";

      tenure.max =
        "360";

      tenure.step =
        "1";


      tenureSlider.min =
        "1";

      tenureSlider.max =
        "360";

      tenureSlider.step =
        "1";


      setText(
        "tenure-unit",
        "Months"
      );

      setText(
        "tenure-min",
        "1 Month"
      );

      setText(
        "tenure-max",
        "360 Months"
      );

    }

  }


  /*
   * ============================================================
   * TENURE VALUE
   * ============================================================
   */

  function getTenureValue() {

    if (!tenure) {

      return 1;

    }


    var minimum =
      Number(
        tenure.min
      ) || 1;


    var maximum =
      Number(
        tenure.max
      ) || 30;


    var value =
      readInput(
        tenure,
        minimum
      );


    return clamp(
      value,
      minimum,
      maximum
    );

  }


  function syncTenure(
    value,
    writeInput
  ) {

    if (!tenure) {

      return;

    }


    var minimum =
      Number(
        tenure.min
      ) || 1;


    var maximum =
      Number(
        tenure.max
      ) || 30;


    value =
      clamp(
        value,
        minimum,
        maximum
      );


    value =
      Math.round(value);


    if (
      writeInput !== false
    ) {

      tenure.value =
        String(value);

    }


    if (tenureSlider) {

      tenureSlider.value =
        String(value);

    }


    updateLiveValues();

  }


  function getMonths() {

    var value =
      getTenureValue();


    if (
      tenureMode === "years"
    ) {

      return Math.round(
        value * 12
      );

    }


    return Math.round(
      value
    );

  }


  /*
   * ============================================================
   * TENURE MODE
   * ============================================================
   */

  function setTenureMode(
    mode,
    shouldCalculate
  ) {

    var currentMonths =
      getMonths();


    if (
      mode !== "years" &&
      mode !== "months"
    ) {

      mode =
        "years";

    }


    tenureMode =
      mode;


    updateTenureLimits();


    if (
      mode === "years"
    ) {

      syncTenure(
        Math.max(
          1,
          Math.round(
            currentMonths / 12
          )
        )
      );


      var yearsButton =
        byId(
          "years-toggle"
        );


      var monthsButton =
        byId(
          "months-toggle"
        );


      if (yearsButton) {

        yearsButton.classList.add(
          "active"
        );

      }


      if (monthsButton) {

        monthsButton.classList.remove(
          "active"
        );

      }

    } else {

      syncTenure(
        Math.max(
          1,
          currentMonths
        )
      );


      var yearsButton2 =
        byId(
          "years-toggle"
        );


      var monthsButton2 =
        byId(
          "months-toggle"
        );


      if (monthsButton2) {

        monthsButton2.classList.add(
          "active"
        );

      }


      if (yearsButton2) {

        yearsButton2.classList.remove(
          "active"
        );

      }

    }


    updateLiveValues();


    if (
      shouldCalculate !== false &&
      liveUpdate
    ) {

      calculate();

    }

  }


  /*
   * ============================================================
   * OPTIONS
   * ============================================================
   */

  function getOptions() {

    var principal =
      readInput(
        loanAmount,
        0
      );


    var annualRate =
      readInput(
        interestRate,
        0
      );


    var processing =
      readInput(
        processingFee,
        0
      );


    var extra =
      readInput(
        extraMonthly,
        0
      );


    var lumpSum =
      readInput(
        prepayment,
        0
      );


    var prepaymentAt =
      readInput(
        prepaymentMonth,
        1
      );


    var months =
      getMonths();


    return {

      principal:
        principal,

      annualRate:
        annualRate,

      months:
        months,

      processingFee:
        Math.max(
          0,
          processing
        ),

      extraMonthly:
        Math.max(
          0,
          extra
        ),

      prepayment:
        Math.max(
          0,
          lumpSum
        ),

      prepaymentMonth:
        Math.max(
          1,
          Math.round(
            prepaymentAt
          )
        )

    };

  }


  /*
   * ============================================================
   * VALIDATION
   * ============================================================
   */

  function validateOptions(
    options
  ) {

    if (
      !Number.isFinite(
        options.principal
      )
    ) {

      return "Please enter a valid loan amount.";

    }


    if (
      options.principal < 1000
    ) {

      return "Loan amount should be at least ₹1,000.";

    }


    if (
      options.principal > 100000000
    ) {

      return "Loan amount cannot be more than ₹10 crore.";

    }


    if (
      !Number.isFinite(
        options.annualRate
      )
    ) {

      return "Please enter a valid interest rate.";

    }


    if (
      options.annualRate < 0
    ) {

      return "Interest rate cannot be negative.";

    }


    if (
      options.annualRate > 40
    ) {

      return "Interest rate cannot be more than 40%.";

    }


    if (
      !Number.isFinite(
        options.months
      )
    ) {

      return "Please enter a valid loan tenure.";

    }


    if (
      options.months < 1
    ) {

      return "Loan tenure should be at least 1 month.";

    }


    if (
      options.months > 360
    ) {

      return "Loan tenure cannot be more than 30 years.";

    }


    return "";

  }


  /*
   * ============================================================
   * RESULT ANIMATION
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
      Number(target);


    if (
      !Number.isFinite(target)
    ) {

      target =
        0;

    }


    var reducedMotion =
      false;


    if (
      window.matchMedia
    ) {

      reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

    }


    if (reducedMotion) {

      element.textContent =
        formatter(target);

      element.dataset.number =
        String(target);

      return;

    }


    var start =
      Number(
        element.dataset.number ||
        0
      );


    if (
      !Number.isFinite(start)
    ) {

      start =
        0;

    }


    var startTime =
      null;


    function frame(
      timestamp
    ) {

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
          ) /
          duration
        );


      var eased =
        1 -
        Math.pow(
          1 -
          progress,
          3
        );


      var current =
        start +
        (
          target -
          start
        ) *
        eased;


      element.textContent =
        formatter(
          current
        );


      if (
        progress < 1
      ) {

        window.requestAnimationFrame(
          frame
        );

      } else {

        element.dataset.number =
          String(target);

      }

    }


    window.requestAnimationFrame(
      frame
    );

  }


  /*
   * ============================================================
   * DONUT CHART
   * ============================================================
   */

  function drawDonut(
    data
  ) {

    var principalCircle =
      byId(
        "donut-principal"
      );


    var interestCircle =
      byId(
        "donut-interest"
      );


    if (
      !principalCircle ||
      !interestCircle
    ) {

      return;

    }


    var radius =
      Number(
        principalCircle.getAttribute(
          "r"
        )
      ) || 70;


    var circumference =
      2 *
      Math.PI *
      radius;


    var principalPercent =
      clamp(
        data.principalPercentage,
        0,
        100
      );


    var interestPercent =
      clamp(
        data.interestPercentage,
        0,
        100
      );


    var principalLength =
      circumference *
      principalPercent /
      100;


    var interestLength =
      circumference *
      interestPercent /
      100;


    principalCircle.style.strokeDasharray =
      principalLength +
      " " +
      circumference;


    principalCircle.style.strokeDashoffset =
      "0";


    interestCircle.style.strokeDasharray =
      interestLength +
      " " +
      circumference;


    interestCircle.style.strokeDashoffset =
      String(
        -principalLength
      );

  }
    /*
   * ============================================================
   * BALANCE CHART
   * ============================================================
   */

  function drawBalanceChart(
    schedule
  ) {

    var container =
      byId(
        "balance-chart"
      );

    if (!container) {
      return;
    }

    if (
      !schedule ||
      !schedule.length
    ) {

      container.innerHTML =
        "";

      return;

    }

    var width = 640;
    var height = 240;

    var left = 24;
    var right = 14;
    var top = 18;
    var bottom = 34;

    var availableWidth =
      width -
      left -
      right;

    var availableHeight =
      height -
      top -
      bottom;

    var maxBalance = 0;

    schedule.forEach(
      function (row) {

        maxBalance =
          Math.max(
            maxBalance,
            Number(
              row.openingBalance
            ) || 0
          );

      }
    );

    if (
      maxBalance <= 0
    ) {

      maxBalance = 1;

    }

    var points = [];

    schedule.forEach(
      function (
        row,
        index
      ) {

        var denominator =
          Math.max(
            1,
            schedule.length - 1
          );

        var x =
          left +
          (
            index /
            denominator
          ) *
          availableWidth;

        var balance =
          Math.max(
            0,
            Number(
              row.closingBalance
            ) || 0
          );

        var y =
          top +
          (
            1 -
            (
              balance /
              maxBalance
            )
          ) *
          availableHeight;

        points.push({
          x: x,
          y: y
        });

      }
    );

    var path = "";

    points.forEach(
      function (
        point,
        index
      ) {

        path +=
          (
            index === 0
              ? "M "
              : " L "
          ) +
          point.x +
          " " +
          point.y;

      }
    );

    var first =
      points[0];

    var last =
      points[
        points.length - 1
      ];

    var baseline =
      height -
      bottom;

    var areaPath =
      path +
      " L " +
      last.x +
      " " +
      baseline +
      " L " +
      first.x +
      " " +
      baseline +
      " Z";

    container.innerHTML =

      '<svg ' +
      'class="calc-balance-svg" ' +
      'viewBox="0 0 ' +
      width +
      ' ' +
      height +
      '" ' +
      'role="img" ' +
      'aria-label="Loan balance over time">' +

      '<line ' +
      'class="calc-chart-grid" ' +
      'x1="' +
      left +
      '" ' +
      'y1="' +
      top +
      '" ' +
      'x2="' +
      (
        width -
        right
      ) +
      '" ' +
      'y2="' +
      top +
      '"></line>' +

      '<line ' +
      'class="calc-chart-grid" ' +
      'x1="' +
      left +
      '" ' +
      'y1="' +
      (
        top +
        availableHeight / 2
      ) +
      '" ' +
      'x2="' +
      (
        width -
        right
      ) +
      '" ' +
      'y2="' +
      (
        top +
        availableHeight / 2
      ) +
      '"></line>' +

      '<line ' +
      'class="calc-chart-grid" ' +
      'x1="' +
      left +
      '" ' +
      'y1="' +
      baseline +
      '" ' +
      'x2="' +
      (
        width -
        right
      ) +
      '" ' +
      'y2="' +
      baseline +
      '"></line>' +

      '<path ' +
      'class="calc-chart-area" ' +
      'd="' +
      areaPath +
      '"></path>' +

      '<path ' +
      'class="calc-chart-line" ' +
      'd="' +
      path +
      '"></path>' +

      '<text ' +
      'class="calc-chart-label" ' +
      'x="' +
      left +
      '" ' +
      'y="' +
      (
        height - 10
      ) +
      '">Start</text>' +

      '<text ' +
      'class="calc-chart-label" ' +
      'x="' +
      (
        width - 45
      ) +
      '" ' +
      'y="' +
      (
        height - 10
      ) +
      '">End</text>' +

      '</svg>';

  }


  /*
   * ============================================================
   * YEARLY SUMMARY
   * ============================================================
   */

  function drawYearlySummary(
    rows
  ) {

    var container =
      byId(
        "yearly-summary"
      );

    if (!container) {
      return;
    }

    if (
      !rows ||
      !rows.length
    ) {

      container.innerHTML =
        "";

      return;

    }

    var html = "";

    html +=
      '<table class="calc-table">';

    html +=
      "<thead>";

    html +=
      "<tr>";

    html +=
      "<th>Year</th>";

    html +=
      "<th>Payment</th>";

    html +=
      "<th>Principal</th>";

    html +=
      "<th>Interest</th>";

    html +=
      "<th>Balance</th>";

    html +=
      "</tr>";

    html +=
      "</thead>";

    html +=
      "<tbody>";

    rows.forEach(
      function (row) {

        html +=
          "<tr>";

        html +=
          "<td>" +
          row.year +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.payment
          ) +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.principal
          ) +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.interest
          ) +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.closingBalance
          ) +
          "</td>";

        html +=
          "</tr>";

      }
    );

    html +=
      "</tbody>";

    html +=
      "</table>";

    container.innerHTML =
      html;

  }


  /*
   * ============================================================
   * AMORTIZATION SCHEDULE
   * ============================================================
   */

  function drawSchedule(
    rows
  ) {

    var container =
      byId(
        "amortization-table"
      );

    if (!container) {
      return;
    }

    if (
      !rows ||
      !rows.length
    ) {

      container.innerHTML =
        "";

      return;

    }

    var html = "";

    html +=
      '<table class="calc-table">';

    html +=
      "<thead>";

    html +=
      "<tr>";

    html +=
      "<th>Month</th>";

    html +=
      "<th>Payment</th>";

    html +=
      "<th>Principal</th>";

    html +=
      "<th>Interest</th>";

    html +=
      "<th>Extra</th>";

    html +=
      "<th>Balance</th>";

    html +=
      "</tr>";

    html +=
      "</thead>";

    html +=
      "<tbody>";

    rows.forEach(
      function (row) {

        html +=
          "<tr>";

        html +=
          "<td>" +
          row.month +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.payment
          ) +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.principal
          ) +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.interest
          ) +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.extraPayment
          ) +
          "</td>";

        html +=
          "<td>" +
          formatCurrency(
            row.closingBalance
          ) +
          "</td>";

        html +=
          "</tr>";

      }
    );

    html +=
      "</tbody>";

    html +=
      "</table>";

    container.innerHTML =
      html;

  }


  /*
   * ============================================================
   * SAVINGS BOX
   * ============================================================
   */

  function updateSavings(
    data
  ) {

    var savingsBox =
      byId(
        "savings-box"
      );

    if (!savingsBox) {
      return;
    }

    var interestSaved =
      Number(
        data.interestSaved
      ) || 0;

    var monthsSaved =
      Number(
        data.monthsSaved
      ) || 0;

    if (
      interestSaved > 0 ||
      monthsSaved > 0
    ) {

      savingsBox.hidden =
        false;

      savingsBox.textContent =
        "Extra payments could save approximately " +
        formatCurrency(
          interestSaved
        ) +
        " in interest and " +
        utils.formatDuration(
          monthsSaved
        ) +
        " of repayment time.";

    } else {

      savingsBox.hidden =
        true;

      savingsBox.textContent =
        "";

    }

  }


  /*
   * ============================================================
   * DISPLAY RESULTS
   * ============================================================
   */

  function displayResults(
    data
  ) {

    clearError();

    if (results) {

      results.hidden =
        false;

    }

    animateNumber(
      byId("emi-value"),
      data.monthlyPayment,
      formatCurrency,
      650
    );

    animateNumber(
      byId("interest-value"),
      data.totalInterest,
      formatCurrency,
      750
    );

    animateNumber(
      byId("payment-value"),
      data.totalPayment,
      formatCurrency,
      850
    );

    setText(
      "duration-value",
      utils.formatDuration(
        data.actualMonths
      )
    );

    setText(
      "principal-percent",
      formatNumber(
        data.principalPercentage,
        1
      ) +
      "%"
    );

    setText(
      "interest-percent",
      formatNumber(
        data.interestPercentage,
        1
      ) +
      "%"
    );

    var emiBar =
      byId(
        "emi-bar"
      );

    if (emiBar) {

      emiBar.style.width =
        Math.max(
          5,
          Math.min(
            100,
            data.principalPercentage
          )
        ) +
        "%";

    }

    drawDonut(
      data
    );

    drawBalanceChart(
      data.schedule
    );

    drawYearlySummary(
      data.yearlySummary
    );

    drawSchedule(
      data.schedule
    );

    updateSavings(
      data
    );

    if (results) {

      results.classList.remove(
        "calculator-reveal"
      );

      void results.offsetWidth;

      results.classList.add(
        "calculator-reveal"
      );

    }

  }
    /*
   * ============================================================
   * CALCULATE
   * ============================================================
   */

  function calculate() {
    clearError();

    var options = getOptions();

    if (!validateOptions(options)) {
      return;
    }

    var calculator =
      window.EMIFORMULA_CALCULATOR;

    if (
      !calculator ||
      typeof calculator.calculate !== "function"
    ) {
      showError(
        "The calculator is temporarily unavailable. Please refresh the page and try again."
      );
      return;
    }

    var data =
      calculator.calculate(options);

    if (!data) {
      showError(
        "Please enter valid loan details and try again."
      );
      return;
    }

    lastCalculation = data;

    displayResults(data);
  }


  /*
   * ============================================================
   * MAYBE CALCULATE
   * ============================================================
   */

  function maybeCalculate() {
    if (!state.liveUpdate) {
      return;
    }

    calculate();
  }


  /*
   * ============================================================
   * LOAN AMOUNT EVENTS
   * ============================================================
   */

  if (elements.loanAmount) {

    elements.loanAmount.addEventListener(
      "input",
      function () {

        syncLoanAmountFromInput();

        updateLoanAmountRange();

        updateLiveLoanAmount();

        maybeCalculate();

      }
    );

  }


  if (elements.loanAmountRange) {

    elements.loanAmountRange.addEventListener(
      "input",
      function () {

        syncLoanAmountFromRange();

        updateLiveLoanAmount();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * INTEREST RATE EVENTS
   * ============================================================
   */

  if (elements.interestRate) {

    elements.interestRate.addEventListener(
      "input",
      function () {

        syncInterestRate();

        updateLiveInterestRate();

        maybeCalculate();

      }
    );

  }


  if (elements.interestRateRange) {

    elements.interestRateRange.addEventListener(
      "input",
      function () {

        syncInterestRateFromRange();

        updateLiveInterestRate();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * TENURE YEARS EVENTS
   * ============================================================
   */

  if (elements.tenureYears) {

    elements.tenureYears.addEventListener(
      "input",
      function () {

        syncTenureYears();

        updateTenureRange();

        updateLiveTenure();

        maybeCalculate();

      }
    );

  }


  if (elements.tenureYearsRange) {

    elements.tenureYearsRange.addEventListener(
      "input",
      function () {

        syncTenureYearsFromRange();

        updateLiveTenure();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * TENURE MONTHS EVENTS
   * ============================================================
   */

  if (elements.tenureMonths) {

    elements.tenureMonths.addEventListener(
      "input",
      function () {

        syncTenureMonths();

        updateTenureRange();

        updateLiveTenure();

        maybeCalculate();

      }
    );

  }


  if (elements.tenureMonthsRange) {

    elements.tenureMonthsRange.addEventListener(
      "input",
      function () {

        syncTenureMonthsFromRange();

        updateLiveTenure();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * PROCESSING FEE EVENTS
   * ============================================================
   */

  if (elements.processingFee) {

    elements.processingFee.addEventListener(
      "input",
      function () {

        updateProcessingFeeLimit();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * EXTRA MONTHLY PAYMENT EVENTS
   * ============================================================
   */

  if (elements.extraMonthly) {

    elements.extraMonthly.addEventListener(
      "input",
      function () {

        updateExtraPaymentLimit();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * PREPAYMENT EVENTS
   * ============================================================
   */

  if (elements.prepayment) {

    elements.prepayment.addEventListener(
      "input",
      function () {

        updatePrepaymentLimit();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * PREPAYMENT MONTH EVENTS
   * ============================================================
   */

  if (elements.prepaymentMonth) {

    elements.prepaymentMonth.addEventListener(
      "input",
      function () {

        updatePrepaymentMonthLimit();

        maybeCalculate();

      }
    );

  }


  /*
   * ============================================================
   * CALCULATE BUTTON
   * ============================================================
   */

  if (elements.calculateButton) {

    elements.calculateButton.addEventListener(
      "click",
      function () {

        calculate();

      }
    );

  }


  /*
   * ============================================================
   * RESET BUTTON
   * ============================================================
   */

  if (elements.resetButton) {

    elements.resetButton.addEventListener(
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

  if (elements.liveUpdate) {

    elements.liveUpdate.addEventListener(
      "change",
      function () {

        state.liveUpdate =
          Boolean(
            elements.liveUpdate.checked
          );

        if (state.liveUpdate) {
          calculate();
        }

      }
    );

  }


  /*
   * ============================================================
   * TENURE MODE BUTTONS
   * ============================================================
   */

  if (elements.tenureYearButton) {

    elements.tenureYearButton.addEventListener(
      "click",
      function () {

        setTenureMode("years");

      }
    );

  }


  if (elements.tenureMonthButton) {

    elements.tenureMonthButton.addEventListener(
      "click",
      function () {

        setTenureMode("months");

      }
    );

  }


  /*
   * ============================================================
   * ADVANCED OPTIONS
   * ============================================================
   */

  if (elements.advancedToggle) {

    elements.advancedToggle.addEventListener(
      "click",
      function () {

        toggleAdvancedOptions();

      }
    );

  }


  /*
   * ============================================================
   * HELP BUTTONS
   * ============================================================
   */

  document
    .querySelectorAll(
      "[data-calculator-help]"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            var key =
              button.getAttribute(
                "data-calculator-help"
              );

            openHelpPanel(key);

          }
        );

      }
    );


  /*
   * ============================================================
   * HELP PANEL CLOSE
   * ============================================================
   */

  if (elements.helpClose) {

    elements.helpClose.addEventListener(
      "click",
      function () {

        closeHelpPanel();

      }
    );

  }


  /*
   * ============================================================
   * HELP PANEL OVERLAY
   * ============================================================
   */

  if (elements.helpOverlay) {

    elements.helpOverlay.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          elements.helpOverlay
        ) {

          closeHelpPanel();

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
        event.key === "Escape"
      ) {

        closeHelpPanel();

      }

      if (
        event.key === "Enter" &&
        document.activeElement &&
        document.activeElement.matches(
          ".calc-input"
        )
      ) {

        calculate();

      }

    }
  );


  /*
   * ============================================================
   * INITIAL STATE
   * ============================================================
   */

  applyDefaults();

  updateLoanAmountRange();

  updateInterestRateRange();

  updateTenureRange();

  updateProcessingFeeLimit();

  updateExtraPaymentLimit();

  updatePrepaymentLimit();

  updatePrepaymentMonthLimit();

  updateLiveLoanAmount();

  updateLiveInterestRate();

  updateLiveTenure();

  setTenureMode(
    state.tenureMode
  );


  /*
   * ============================================================
   * INITIAL CALCULATION
   * ============================================================
   */

  calculate();


})();
