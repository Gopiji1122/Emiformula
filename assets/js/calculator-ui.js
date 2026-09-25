(function () {
  "use strict";

  var config = window.EMIFORMULA_EMI_CONFIG;
  var calculator = window.EMIFORMULA_CALCULATOR;
  var utils = window.EMIFORMULA_CALCULATOR_UTILS;

  if (!config || !calculator || !utils) {
    console.error("EMIFORMULA calculator dependencies are missing.");
    return;
  }

  var tenureMode = "years";
  var liveUpdate = true;
  var lastFocusedHelp = null;

  var loanAmount = document.getElementById("loan-amount");
  var loanSlider = document.getElementById("loan-amount-slider");
  var interestRate = document.getElementById("interest-rate");
  var rateSlider = document.getElementById("interest-rate-slider");
  var tenure = document.getElementById("loan-tenure");
  var tenureSlider = document.getElementById("loan-tenure-slider");


  /* =====================================================
     BASIC HELPERS
  ===================================================== */

  function clamp(value, min, max) {
    value = Number(value);

    if (!Number.isFinite(value)) {
      return min;
    }

    return Math.max(min, Math.min(max, value));
  }


  function readDecimalInput(element, fallback) {
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
      raw === "-" ||
      raw === "-."
    ) {
      return fallback;
    }

    var value = Number(raw);

    return Number.isFinite(value)
      ? value
      : fallback;
  }


  function formatRate(value) {
    return Number(value).toFixed(2) + "%";
  }


  /* =====================================================
     LIVE DISPLAY VALUES
  ===================================================== */

  function updateLiveValues() {

    var loanValue =
      readDecimalInput(
        loanAmount,
        0
      );

    var rateValue =
      readDecimalInput(
        interestRate,
        0
      );

    var tenureValue =
      readDecimalInput(
        tenure,
        0
      );


    document.getElementById(
      "loan-live"
    ).textContent =
      utils.formatCurrency(
        loanValue
      );


    document.getElementById(
      "rate-live"
    ).textContent =
      formatRate(
        rateValue
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


    document.getElementById(
      "tenure-live"
    ).textContent =
      tenureValue +
      " " +
      unit;

  }


  /* =====================================================
     LOAN SYNC
  ===================================================== */

  function syncLoan(
    value,
    updateInput
  ) {

    value =
      clamp(
        value,
        1000,
        100000000
      );


    if (
      updateInput !== false
    ) {

      loanAmount.value =
        String(
          Math.round(value)
        );

    }


    loanSlider.value =
      String(
        Math.round(value)
      );


    updateLiveValues();

  }


  /* =====================================================
     RATE SYNC
  ===================================================== */

  function syncRate(
    value,
    updateInput
  ) {

    value =
      clamp(
        value,
        0,
        40
      );


    if (
      updateInput !== false
    ) {

      interestRate.value =
        String(value);

    }


    rateSlider.value =
      String(value);


    updateLiveValues();

  }


  /* =====================================================
     TENURE LIMITS
  ===================================================== */

  function updateTenureLimits() {

    if (
      tenureMode === "years"
    ) {

      tenure.min = "1";
      tenure.max = "30";
      tenure.step = "1";


      tenureSlider.min = "1";
      tenureSlider.max = "30";
      tenureSlider.step = "1";


      document.getElementById(
        "tenure-unit"
      ).textContent =
        "Years";


      document.getElementById(
        "tenure-min"
      ).textContent =
        "1 Year";


      document.getElementById(
        "tenure-max"
      ).textContent =
        "30 Years";

    } else {

      tenure.min = "1";
      tenure.max = "360";
      tenure.step = "1";


      tenureSlider.min = "1";
      tenureSlider.max = "360";
      tenureSlider.step = "1";


      document.getElementById(
        "tenure-unit"
      ).textContent =
        "Months";


      document.getElementById(
        "tenure-min"
      ).textContent =
        "1 Month";


      document.getElementById(
        "tenure-max"
      ).textContent =
        "360 Months";

    }

  }


  /* =====================================================
     TENURE
  ===================================================== */

  function getTenureValue() {

    return clamp(
      readDecimalInput(
        tenure,
        1
      ),
      Number(tenure.min),
      Number(tenure.max)
    );

  }


  function syncTenure(
    value,
    updateInput
  ) {

    value =
      clamp(
        value,
        Number(tenure.min),
        Number(tenure.max)
      );


    value =
      Math.round(value);


    if (
      updateInput !== false
    ) {

      tenure.value =
        String(value);

    }


    tenureSlider.value =
      String(value);


    updateLiveValues();

  }


  function getMonths() {

    var value =
      getTenureValue();


    if (
      tenureMode === "years"
    ) {

      return value * 12;

    }


    return value;

  }


  /* =====================================================
     TENURE MODE
  ===================================================== */

  function setTenureMode(
    mode,
    shouldCalculate
  ) {

    var currentMonths =
      getMonths();


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


      document.getElementById(
        "years-toggle"
      ).classList.add(
        "active"
      );


      document.getElementById(
        "months-toggle"
      ).classList.remove(
        "active"
      );

    } else {

      syncTenure(
        Math.max(
          1,
          Math.round(
            currentMonths
          )
        )
      );


      document.getElementById(
        "months-toggle"
      ).classList.add(
        "active"
      );


      document.getElementById(
        "years-toggle"
      ).classList.remove(
        "active"
      );

    }


    if (
      shouldCalculate !== false &&
      liveUpdate
    ) {

      calculate();

    }

  }


  /* =====================================================
     GET CALCULATOR OPTIONS
  ===================================================== */

  function getOptions() {

    var principal =
      readDecimalInput(
        loanAmount,
        0
      );


    var annualRate =
      readDecimalInput(
        interestRate,
        0
      );


    return {

      principal:
        principal,


      annualRate:
        annualRate,


      months:
        getMonths(),


      processingFee:
        readDecimalInput(
          document.getElementById(
            "processing-fee"
          ),
          0
        ),


      extraMonthly:
        readDecimalInput(
          document.getElementById(
            "extra-monthly"
          ),
          0
        ),


      prepayment:
        readDecimalInput(
          document.getElementById(
            "prepayment"
          ),
          0
        ),


      prepaymentMonth:
        Math.max(
          1,
          Math.round(
            readDecimalInput(
              document.getElementById(
                "prepayment-month"
              ),
              1
            )
          )
        )

    };

  }


  /* =====================================================
     ERROR
  ===================================================== */

  function showError(
    message
  ) {

    document.getElementById(
      "calculator-results"
    ).hidden =
      true;


    var error =
      document.getElementById(
        "emi-error"
      );


    error.textContent =
      message;


    error.hidden =
      false;

  }


  /* =====================================================
     DONUT CHART
  ===================================================== */

  function drawDonut(
    data
  ) {

    var radius = 70;


    var circumference =
      2 *
      Math.PI *
      radius;


    var principalLength =
      circumference *
      (
        data.principalPercentage /
        100
      );


    var interestLength =
      circumference *
      (
        data.interestPercentage /
        100
      );


    var principal =
      document.getElementById(
        "donut-principal"
      );


    var interest =
      document.getElementById(
        "donut-interest"
      );


    principal.style.strokeDasharray =
      principalLength +
      " " +
      circumference;


    principal.style.strokeDashoffset =
      "0";


    interest.style.strokeDasharray =
      interestLength +
      " " +
      circumference;


    interest.style.strokeDashoffset =
      String(
        -principalLength
      );

  }


  /* =====================================================
     BALANCE CHART
  ===================================================== */

  function drawBalanceChart(
    schedule
  ) {

    var container =
      document.getElementById(
        "balance-chart"
      );


    if (
      !schedule ||
      !schedule.length
    ) {

      container.innerHTML =
        "";

      return;

    }


    var width = 640;
    var height = 230;

    var left = 20;
    var right = 12;

    var top = 15;
    var bottom = 30;


    var maxBalance =
      Math.max.apply(
        null,
        schedule.map(
          function (row) {

            return row.openingBalance;

          }
        )
      );


    if (
      !Number.isFinite(
        maxBalance
      ) ||
      maxBalance <= 0
    ) {

      maxBalance = 1;

    }


    var points =
      schedule.map(
        function (
          row,
          index
        ) {

          var x =
            left +
            (
              index /
              Math.max(
                1,
                schedule.length - 1
              )
            ) *
            (
              width -
              left -
              right
            );


          var y =
            top +
            (
              1 -
              (
                row.closingBalance /
                maxBalance
              )
            ) *
            (
              height -
              top -
              bottom
            );


          return {
            x: x,
            y: y
          };

        }
      );


    var path =
      points.map(
        function (
          point,
          index
        ) {

          return (
            index === 0
              ? "M"
              : "L"
          ) +
          " " +
          point.x +
          " " +
          point.y;

        }
      ).join(
        " "
      );


    var first =
      points[0];


    var last =
      points[
        points.length - 1
      ];


    var areaPath =
      path +
      " L " +
      last.x +
      " " +
      (
        height -
        bottom
      ) +
      " L " +
      first.x +
      " " +
      (
        height -
        bottom
      ) +
      " Z";


    container.innerHTML =

      '<svg ' +
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
      left +
      '" ' +
      'y2="' +
      (
        height -
        bottom
      ) +
      '"></line>' +

      '<line ' +
      'class="calc-chart-grid" ' +
      'x1="' +
      left +
      '" ' +
      'y1="' +
      (
        height -
        bottom
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
        height -
        bottom
      ) +
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
        height -
        8
      ) +
      '">Start</text>' +

      '<text ' +
      'class="calc-chart-label" ' +
      'x="' +
      (
        width -
        45
      ) +
      '" ' +
      'y="' +
      (
        height -
        8
      ) +
      '">End</text>' +

      '</svg>';

  }


  /* =====================================================
     YEARLY SUMMARY
  ===================================================== */

  function drawYearlySummary(
    rows
  ) {

    var container =
      document.getElementById(
        "yearly-summary"
      );


    if (
      !rows ||
      !rows.length
    ) {

      container.innerHTML =
        "";

      return;

    }


    var html =
      '<table class="calc-table">' +
      '<thead>' +
      '<tr>' +
      '<th>Year</th>' +
      '<th>Payment</th>' +
      '<th>Principal</th>' +
      '<th>Interest</th>' +
      '<th>Balance</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';


    rows.forEach(
      function (row) {

        html +=

          '<tr>' +

          '<td>' +
          row.year +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.payment
          ) +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.principal
          ) +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.interest
          ) +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.closingBalance
          ) +
          '</td>' +

          '</tr>';

      }
    );


    container.innerHTML =
      html +
      "</tbody></table>";

  }


  /* =====================================================
     AMORTIZATION SCHEDULE
  ===================================================== */

  function drawSchedule(
    rows
  ) {

    var container =
      document.getElementById(
        "amortization-table"
      );


    if (
      !rows ||
      !rows.length
    ) {

      container.innerHTML =
        "";

      return;

    }


    var html =
      '<table class="calc-table">' +
      '<thead>' +
      '<tr>' +
      '<th>Month</th>' +
      '<th>Payment</th>' +
      '<th>Principal</th>' +
      '<th>Interest</th>' +
      '<th>Extra</th>' +
      '<th>Balance</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>';


    rows.forEach(
      function (row) {

        html +=

          '<tr>' +

          '<td>' +
          row.month +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.payment
          ) +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.principal
          ) +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.interest
          ) +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.extraPayment
          ) +
          '</td>' +

          '<td>' +
          utils.formatCurrency(
            row.closingBalance
          ) +
          '</td>' +

          '</tr>';

      }
    );


    container.innerHTML =
      html +
      "</tbody></table>";

  }


  /* =====================================================
     NUMBER ANIMATION
  ===================================================== */

  function animateNumber(
    element,
    target,
    formatter,
    duration
  ) {

    if (!element) {
      return;
    }


    if (
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {

      element.textContent =
        formatter(target);

      return;

    }


    var start =
      Number(
        element.dataset.lastNumber ||
        0
      );


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


      element.dataset.lastNumber =
        String(
          target
        );


      if (
        progress < 1
      ) {

        window.requestAnimationFrame(
          frame
        );

      }

    }


    window.requestAnimationFrame(
      frame
    );

  }


  /* =====================================================
     DISPLAY RESULTS
  ===================================================== */

  function displayResults(
    data
  ) {

    document.getElementById(
      "calculator-results"
    ).hidden =
      false;


    document.getElementById(
      "emi-error"
    ).hidden =
      true;


    animateNumber(

      document.getElementById(
        "emi-value"
      ),

      data.monthlyPayment,

      utils.formatCurrency,

      650

    );


    animateNumber(

      document.getElementById(
        "interest-value"
      ),

      data.totalInterest,

      utils.formatCurrency,

      800

    );


    animateNumber(

      document.getElementById(
        "payment-value"
      ),

      data.totalPayment,

      utils.formatCurrency,

      900

    );


    document.getElementById(
      "duration-value"
    ).textContent =
      utils.formatDuration(
        data.actualMonths
      );


    document.getElementById(
      "principal-percent"
    ).textContent =
      utils.formatNumber(
        data.principalPercentage,
        1
      ) +
      "%";


    document.getElementById(
      "interest-percent"
    ).textContent =
      utils.formatNumber(
        data.interestPercentage,
        1
      ) +
      "%";


    document.getElementById(
      "emi-bar"
    ).style.width =
      Math.max(
        8,
        Math.min(
          100,
          data.principalPercentage
        )
      ) +
      "%";


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


    var savingsBox =
      document.getElementById(
        "savings-box"
      );


    if (
      data.interestSaved > 0 ||
      data.monthsSaved > 0
    ) {

      savingsBox.hidden =
        false;


      savingsBox.textContent =

        "Extra payments could save approximately " +

        utils.formatCurrency(
          data.interestSaved
        ) +

        " in interest and " +

        utils.formatDuration(
          data.monthsSaved
        ) +

        " of repayment time.";

    } else {

      savingsBox.hidden =
        true;

    }

  }


  /* =====================================================
     CALCULATE
  ===================================================== */

  function calculate() {

    var options =
      getOptions();


    if (
      options.principal < 1000 ||
      options.principal > 100000000 ||
      options.annualRate < 0 ||
      options.annualRate > 40 ||
      options.months < 1 ||
      options.months > 360
    ) {

      showError
          "Please enter values within
  the allowed loan, interest and
  tenure ranges."
);

return;

}

var prepaymentMonth =
  options.prepaymentMonth;

if (
  prepaymentMonth >
  options.months
) {

  options.prepaymentMonth =
    options.months;

}

var data =
  calculator.calculate(
    options
  );

if (!data) {

  showError(
    "Please enter valid loan details."
  );

  return;

}

displayResults(
  data
);

}

/* ====================================================
   LIVE CALCULATION
==================================================== */

function maybeCalculate() {

  if (liveUpdate) {

    calculate();

  }

}

/* ====================================================
   SLIDER SYNC
==================================================== */

function updateSliderFromTextInput() {

  var loan =
    readDecimalInput(
      loanAmount,
      null
    );

  if (
    loan !== null &&
    loan >= 1000 &&
    loan <= 100000000
  ) {

    loanSlider.value =
      String(
        Math.round(loan)
      );

  }

  var rate =
    readDecimalInput(
      interestRate,
      null
    );

  if (
    rate !== null &&
    rate >= 0 &&
    rate <= 40
  ) {

    rateSlider.value =
      String(rate);

  }

  var tenureValue =
    readDecimalInput(
      tenure,
      null
    );

  if (
    tenureValue !== null &&
    tenureValue >=
      Number(tenure.min) &&
    tenureValue <=
      Number(tenure.max)
  ) {

    tenureSlider.value =
      String(
        Math.round(
          tenureValue
        )
      );

  }

}/* ====================================================
   INTEREST RATE TYPING
==================================================== */

function sanitizeInterestTyping(
  event
) {

  var value =
    interestRate.value;

  /*
   * Keep the decimal point while
   * the user is typing.
   *
   * Examples:
   * 7
   * 7.
   * 7.4
   * 7.45
   */

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

    value =
      value.slice(
        0,
        firstDot + 1
      ) +
      value
        .slice(firstDot + 1)
        .replace(/\./g, "");

    var parts =
      value.split(".");

    value =
      parts[0].slice(0, 2) +
      "." +
      (
        parts[1] || ""
      ).slice(0, 2);

  } else {

    value =
      value.slice(0, 2);

  }

  if (
    Number(value) > 40
  ) {

    value = "40";

  }

  interestRate.value =
    value;

}

function normalizeInterestOnBlur() {

  var value =
    readDecimalInput(
      interestRate,
      0
    );

  value =
    clamp(
      value,
      0,
      40
    );

  interestRate.value =
    String(value);

  rateSlider.value =
    String(value);

  updateLiveValues();

  maybeCalculate();

}

/* ====================================================
   HELP PANEL
==================================================== */

function openHelp(
  key,
  button
) {

  var help = {

    "loan-amount": [
      "Loan Amount",
      "Enter the amount you plan to borrow. Use the amount of the loan itself, not the total amount you expect to repay."
    ],

    "interest-rate": [
      "Interest Rate",
      "Enter the yearly interest rate offered by the lender. You can enter decimal rates such as 7.45%. The calculator converts the yearly rate into a monthly rate for the EMI calculation."
    ],

    "loan-tenure": [
      "Loan Tenure",
      "Choose how long you plan to repay the loan. A longer tenure can reduce the monthly EMI, but it can also increase the total interest paid."
    ],

    "processing-fee": [
      "Processing Fee",
      "Enter the fee charged for processing the loan if you want it included in the overall cost shown by the calculator. This is separate from the EMI formula."
    ],

    "extra-monthly": [
      "Extra Monthly Payment",
      "Enter any additional amount you plan to pay every month above your normal EMI. The calculator shows how this can reduce interest and repayment time."
    ],

    "prepayment": [
      "One-Time Prepayment",
      "Enter a lump-sum amount you plan to pay toward the loan before the scheduled end date."
    ],

    "prepayment-month": [
      "Prepayment Month",
      "Choose the month in which you expect to make the one-time prepayment."
    ],

    "total-interest": [
      "Total Interest",
      "This is the total interest paid over the calculated repayment period."
    ],

    "total-payment": [
      "Total Payment",
      "This is the total of principal and interest paid through the calculated repayment schedule. Processing fee is shown separately where applicable."
    ],

    "payoff-time": [
      "Payoff Time",
      "This shows how long the loan takes to finish based on the payment options entered."
    ],

    "monthly-emi": [
      "Monthly EMI",
      "This is the regular monthly instalment calculated from the loan amount, interest rate and selected tenure."
    ],

    "payment-breakdown": [
      "Payment Breakdown",
      "This shows how the calculated total payment is divided between the loan principal and interest."
    ],

    "loan-balance": [
      "Loan Balance",
      "This graph shows how the outstanding loan balance falls as payments are made over time."
    ]

  };

  var item =
    help[key];

  if (!item) {
    return;
  }

  var panel =
    document.getElementById(
      "calc-help-panel"
    );

  var title =
    document.getElementById(
      "calc-help-title"
    );

  var text =
    document.getElementById(
      "calc-help-text"
    );

  if (!panel || !title || !text) {
    return;
  }

  title.textContent =
    item[0];

  text.textContent =
    item[1];

  panel.hidden =
    false;

  if (button) {
    button.setAttribute(
      "aria-expanded",
      "true"
    );
  }

}

function closeHelp() {

  var panel =
    document.getElementById(
      "calc-help-panel"
    );

  if (panel) {
    panel.hidden =
      true;
  }

  document
    .querySelectorAll(
      "[data-help]"
    )
    .forEach(
      function (button) {

        button.setAttribute(
          "aria-expanded",
          "false"
        );

      }
    );

}/* ====================================================
   INPUT EVENTS
==================================================== */

loanAmount.addEventListener(
  "input",
  function () {

    updateSliderFromTextInput();
    maybeCalculate();

  }
);

interestRate.addEventListener(
  "input",
  function (event) {

    sanitizeInterestTyping(
      event
    );

    updateSliderFromTextInput();
    updateLiveValues();
    maybeCalculate();

  }
);

interestRate.addEventListener(
  "blur",
  function () {

    normalizeInterestOnBlur();

  }
);

tenure.addEventListener(
  "input",
  function () {

    updateSliderFromTextInput();
    updateLiveValues();
    maybeCalculate();

  }
);

/* ====================================================
   SLIDER EVENTS
==================================================== */

loanSlider.addEventListener(
  "input",
  function () {

    loanAmount.value =
      String(
        Math.round(
          Number(
            loanSlider.value
          )
        )
      );

    updateLiveValues();
    maybeCalculate();

  }
);

rateSlider.addEventListener(
  "input",
  function () {

    interestRate.value =
      String(
        Number(
          rateSlider.value
        )
      );

    updateLiveValues();
    maybeCalculate();

  }
);

tenureSlider.addEventListener(
  "input",
  function () {

    tenure.value =
      String(
        Math.round(
          Number(
            tenureSlider.value
          )
        )
      );

    updateLiveValues();
    maybeCalculate();

  }
);

/* ====================================================
   ADVANCED OPTIONS
==================================================== */

[
  "processing-fee",
  "extra-monthly",
  "prepayment",
  "prepayment-month"
].forEach(
  function (id) {

    var field =
      document.getElementById(
        id
      );

    field.addEventListener(
      "input",
      function () {

        if (
          id ===
          "prepayment-month"
        ) {

          var months =
            getMonths();

          var value =
            readDecimalInput(
              field,
              1
            );

          field.value =
            String(
              Math.max(
                1,
                Math.min(
                  months,
                  Math.round(value)
                )
              )
            );

        }

        maybeCalculate();

      }
    );

  }
);

/* ====================================================
   TENURE TOGGLE
==================================================== */

document
  .getElementById(
    "years-toggle"
  )
  .addEventListener(
    "click",
    function () {

      setTenureMode(
        "years"
      );

      calculate();

    }
  );

document
  .getElementById(
    "months-toggle"
  )
  .addEventListener(
    "click",
    function () {

      setTenureMode(
        "months"
      );

      calculate();

    }
  );

/* ====================================================
   CALCULATE BUTTON
==================================================== */

document
  .getElementById(
    "calculate-emi"
  )
  .addEventListener(
    "click",
    calculate
  );

/* ====================================================
   LIVE UPDATE SWITCH
==================================================== */

document
  .getElementById(
    "live-update"
  )
  .addEventListener(
    "change",
    function () {

      liveUpdate =
        this.checked;

      if (liveUpdate) {
        calculate();
      }

    }
  );

/* ====================================================
   HELP BUTTONS
==================================================== */

document
  .querySelectorAll(
    "[data-help]"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          openHelp(
            button.dataset.help,
            button
          );

        }
      );

    }
  );

document
  .getElementById(
    "calc-help-close"
  )
  .addEventListener(
    "click",
    closeHelp
  );/* ====================================================
   RESET
==================================================== */

document
  .getElementById(
    "reset-emi"
  )
  .addEventListener(
    "click",
    function () {

      liveUpdate =
        true;

      document
        .getElementById(
          "live-update"
        )
        .checked =
        true;

      syncLoan(
        config.defaults.principal
      );

      syncRate(
        config.defaults.annualRate
      );

      setTenureMode(
        "years",
        false
      );

      syncTenure(
        config.defaults.years
      );

      document
        .getElementById(
          "processing-fee"
        )
        .value =
        "0";

      document
        .getElementById(
          "extra-monthly"
        )
        .value =
        "0";

      document
        .getElementById(
          "prepayment"
        )
        .value =
        "0";

      document
        .getElementById(
          "prepayment-month"
        )
        .value =
        "12";

      closeHelp();

      calculate();

    }
  );

/* ====================================================
   INITIAL STATE
==================================================== */

updateTenureLimits();

syncLoan(
  config.defaults.principal
);

syncRate(
  config.defaults.annualRate
);

syncTenure(
  config.defaults.years
);

calculate();

})();
