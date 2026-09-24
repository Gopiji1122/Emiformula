(function () {
  "use strict";

  function number(value) {
    return Number(value);
  }

  function formatNumber(
    value,
    decimals
  ) {
    if (!Number.isFinite(number(value))) {
      return "-";
    }

    return number(value).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits:
          decimals === undefined
            ? 2
            : decimals,
        minimumFractionDigits:
          decimals === undefined
            ? 0
            : decimals
      }
    );
  }

  function formatCurrency(value) {
    if (!Number.isFinite(number(value))) {
      return "-";
    }

    return number(value).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
      }
    );
  }

  function formatShortCurrency(value) {
    value = number(value);

    if (!Number.isFinite(value)) {
      return "-";
    }

    if (Math.abs(value) >= 10000000) {
      return (
        "₹" +
        formatNumber(
          value / 10000000,
          2
        ) +
        " Cr"
      );
    }

    if (Math.abs(value) >= 100000) {
      return (
        "₹" +
        formatNumber(
          value / 100000,
          2
        ) +
        " L"
      );
    }

    if (Math.abs(value) >= 1000) {
      return (
        "₹" +
        formatNumber(
          value / 1000,
          1
        ) +
        "K"
      );
    }

    return formatCurrency(value);
  }

  function formatDuration(months) {
    months = Math.max(
      0,
      Math.round(number(months))
    );

    var years =
      Math.floor(months / 12);

    var remaining =
      months % 12;

    if (years === 0) {
      return remaining + " months";
    }

    if (remaining === 0) {
      return (
        years +
        (years === 1 ? " year" : " years")
      );
    }

    return (
      years +
      (years === 1 ? " year " : " years ") +
      remaining +
      (remaining === 1 ? " month" : " months")
    );
  }

  window.EMIFORMULA_CALCULATOR_UTILS = {

    formatNumber:
      formatNumber,

    formatCurrency:
      formatCurrency,

    formatShortCurrency:
      formatShortCurrency,

    formatDuration:
      formatDuration

  };

})();
