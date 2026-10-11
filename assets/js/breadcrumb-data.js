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
    "/calculators/gold-loan-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Gold Loan Calculator" }
    ],
    "/hi/calculators/gold-loan-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "गोल्ड लोन कैलकुलेटर" }
    ],
    "/mr/calculators/gold-loan-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "गोल्ड लोन कॅल्क्युलेटर" }
    ],
    "/gu/calculators/gold-loan-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "ગોલ્ડ લોન કેલ્ક્યુલેટર" }
    ],
    "/bn/calculators/gold-loan-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "গোল্ড লোন ক্যালকুলেটর" }
    ],
    "/ta/calculators/gold-loan-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "தங்கக் கடன் கால்குலேட்டர்" }
    ],
};

  window.EMIFORMULA_BREADCRUMBS = map[path] || [];
})();
