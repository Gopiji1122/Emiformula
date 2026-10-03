/* EMIFORMULA — PAGE BREADCRUMB DATA */
(function () {
  "use strict";

  var path = window.location.pathname.replace(/\/+$/, "") || "/";

  var map = {
    "/calculators/emi-calculator.html": [
      { title: "EMI", url: "/categories/emi.html" },
      { title: "EMI Calculator" }
    ],
    "/calculators/step-up-step-down-emi-calculator.html": [
      { title: "EMI", url: "/categories/emi.html" },
      { title: "Step-Up / Step-Down EMI Calculator" }
    ],
    "/calculators/personal-loan-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Personal Loan Calculator" }
    ],
    "/calculators/loan-comparison-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Loan Comparison Calculator" }
    ],
    "/calculators/compound-interest-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "Compound Interest Calculator" }
    ],
    "/guides/emi-guide.html": [
      { title: "EMI", url: "/categories/emi.html" },
      { title: "EMI Guide" }
    ],
    "/guides/personal-loan-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Personal Loan Guide" }
    ],
    "/guides/compound-interest-guide.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "Compound Interest Guide" }
    ]
  };

  window.EMIFORMULA_BREADCRUMBS = map[path] || [];
})();
