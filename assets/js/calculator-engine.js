(function () {
  "use strict";

  window.EMIFORMULA_CALCULATOR = {

    calculateEMI: function (
      principal,
      annualRate,
      months
    ) {

      principal = Number(principal);
      annualRate = Number(annualRate);
      months = Number(months);

      if (
        !Number.isFinite(principal) ||
        !Number.isFinite(annualRate) ||
        !Number.isFinite(months)
      ) {
        return null;
      }

      if (
        principal <= 0 ||
        annualRate < 0 ||
        months <= 0
      ) {
        return null;
      }

      var monthlyRate =
        annualRate / 12 / 100;

      var emi;

      if (monthlyRate === 0) {

        emi = principal / months;

      } else {

        var factor =
          Math.pow(
            1 + monthlyRate,
            months
          );

        emi =
          principal *
          monthlyRate *
          factor /
          (factor - 1);
      }

      var totalPayment =
        emi * months;

      var totalInterest =
        totalPayment - principal;

      return {
        principal: principal,
        annualRate: annualRate,
        months: months,
        emi: emi,
        totalPayment: totalPayment,
        totalInterest: totalInterest
      };
    }

  };

})();
