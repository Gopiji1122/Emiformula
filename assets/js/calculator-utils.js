(function () {
  "use strict";

  window.EMIFORMULA_CALCULATOR_UTILS = {

    formatNumber: function (
      value,
      maximumFractionDigits
    ) {

      if (!Number.isFinite(Number(value))) {
        return "-";
      }

      return Number(value).toLocaleString(
        "en-IN",
        {
          maximumFractionDigits:
            maximumFractionDigits === undefined
              ? 2
              : maximumFractionDigits
        }
      );
    },

    formatCurrency: function (value) {

      if (!Number.isFinite(Number(value))) {
        return "-";
      }

      return Number(value).toLocaleString(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2
        }
      );
    }

  };

})();
