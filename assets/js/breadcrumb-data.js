/* EMIFORMULA — PAGE BREADCRUMB DATA */
(function () {
  "use strict";

  var path = window.location.pathname.replace(/\/+$/, "") || "/";

  var map = {
    "/Emiformula/calculators/emi-calculator.html": [
      { title: "EMI", url: "/Emiformula/categories/emi.html" },
      { title: "EMI Calculator" }
    ],
    "/Emiformula/calculators/personal-loan-calculator.html": [
      { title: "Loan", url: "/Emiformula/categories/loan.html" },
      { title: "Personal Loan Calculator" }
    ],
    "/Emiformula/calculators/compound-interest-calculator.html": [
      { title: "Financial", url: "/Emiformula/categories/financial.html" },
      { title: "Compound Interest Calculator" }
    ],
    "/Emiformula/guides/emi-guide.html": [
      { title: "EMI", url: "/Emiformula/categories/emi.html" },
      { title: "EMI Guide" }
    ],
    "/Emiformula/guides/personal-loan-guide.html": [
      { title: "Loan", url: "/Emiformula/categories/loan.html" },
      { title: "Personal Loan Guide" }
    ],
    "/Emiformula/guides/compound-interest-guide.html": [
      { title: "Financial", url: "/Emiformula/categories/financial.html" },
      { title: "Compound Interest Guide" }
    ]
  };

  window.EMIFORMULA_BREADCRUMBS = map[path] || [];
})();
