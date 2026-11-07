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
    "/calculators/balance-transfer-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Balance Transfer Break-Even Calculator" }
    ],
    "/calculators/loan-comparison-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Loan Comparison Calculator" }
    ],
    "/hi/calculators/loan-comparison-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "लोन तुलना कैलकुलेटर" }
    ],
    "/mr/calculators/loan-comparison-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "कर्ज तुलना कॅल्क्युलेटर" }
    ],
    "/gu/calculators/loan-comparison-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "લોન સરખામણી કેલ્ક્યુલેટર" }
    ],
    "/bn/calculators/loan-comparison-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "লোন তুলনা ক্যালকুলেটর" }
    ],
    "/ta/calculators/loan-comparison-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "கடன் ஒப்பீட்டு கால்குலேட்டர்" }
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
    "/calculators/compound-interest-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "Compound Interest Calculator" }
    ],
    "/calculators/ppf-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "PPF Calculator & Savings Planner" }
    ],
    "/hi/calculators/ppf-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "PPF कैलकुलेटर और बचत प्लानर" }
    ],
    "/mr/calculators/ppf-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "PPF कॅल्क्युलेटर आणि बचत नियोजक" }
    ],
    "/gu/calculators/ppf-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "PPF કેલ્ક્યુલેટર અને બચત પ્લાનર" }
    ],
    "/bn/calculators/ppf-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "PPF ক্যালকুলেটর ও সঞ্চয় পরিকল্পক" }
    ],
    "/ta/calculators/ppf-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "PPF கணிப்பான் மற்றும் சேமிப்பு திட்டம்" }
    ],
    "/calculators/shg-loan-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "SHG / Bachat Gat Financial Calculator" }
    ],
    "/hi/calculators/shg-loan-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "स्वयं सहायता समूह ऋण और बचत कैलकुलेटर" }
    ],
    "/mr/calculators/shg-loan-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "बचत गट कर्ज आणि बचत कॅल्क्युलेटर" }
    ],
    "/gu/calculators/shg-loan-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "SHG લોન અને બચત કેલ્ક્યુલેટર" }
    ],
    "/bn/calculators/shg-loan-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "SHG ঋণ ও সঞ্চয় ক্যালকুলেটর" }
    ],
    "/ta/calculators/shg-loan-calculator.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "SHG கடன் மற்றும் சேமிப்பு கால்குலேட்டர்" }
    ],
    "/guides/emi-guide.html": [
      { title: "EMI", url: "/categories/emi.html" },
      { title: "EMI Guide" }
    ],
    "/guides/personal-loan-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Personal Loan Guide" }
    ],
    "/guides/balance-transfer-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Balance Transfer Guide" }
    ],
    "/guides/gold-loan-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "Gold Loan Guide" }
    ],
    "/hi/guides/gold-loan-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "गोल्ड लोन गाइड" }
    ],
    "/mr/guides/gold-loan-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "गोल्ड लोन मार्गदर्शक" }
    ],
    "/gu/guides/gold-loan-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "ગોલ્ડ લોન માર્ગદર્શિકા" }
    ],
    "/bn/guides/gold-loan-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "গোল্ড লোন গাইড" }
    ],
    "/ta/guides/gold-loan-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "தங்கக் கடன் வழிகாட்டி" }
    ],
    "/guides/shg-loan-guide.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "SHG Loan Guide" }
    ],
    "/guides/compound-interest-guide.html": [
      { title: "Financial", url: "/categories/financial.html" },
      { title: "Compound Interest Guide" }
    ],
    "/calculators/pmay-subsidy-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "PMAY-Urban 2.0 Subsidy Calculator" }
    ],
    "/hi/calculators/pmay-subsidy-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "पीएम आवास योजना 2.0 सब्सिडी कैलकुलेटर" }
    ],
    "/mr/calculators/pmay-subsidy-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "पीएम आवास योजना 2.0 अनुदान कॅल्क्युलेटर" }
    ],
    "/gu/calculators/pmay-subsidy-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "પીએમ આવાસ યોજના 2.0 સબસિડી કેલ્ક્યુલેટર" }
    ],
    "/bn/calculators/pmay-subsidy-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "পিএম আবাস যোজনা ২.০ ভর্তুকি ক্যালকুলেটর" }
    ],
    "/ta/calculators/pmay-subsidy-calculator.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "PMAY 2.0 மானிய கால்குலேட்டர்" }
    ],
    "/guides/pmay-subsidy-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "PMAY-Urban 2.0 Subsidy Guide" }
    ],
    "/hi/guides/pmay-subsidy-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "पीएम आवास योजना 2.0 गाइड" }
    ],
    "/mr/guides/pmay-subsidy-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "पीएम आवास योजना 2.0 मार्गदर्शक" }
    ],
    "/gu/guides/pmay-subsidy-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "પીએમ આવાસ યોજના 2.0 માર્ગદર્શિકા" }
    ],
    "/bn/guides/pmay-subsidy-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "পিএম আবাস যোজনা ২.০ গাইড" }
    ],
    "/ta/guides/pmay-subsidy-guide.html": [
      { title: "Loan", url: "/categories/loan.html" },
      { title: "PMAY 2.0 வழிகாட்டி" }
    ]
  };

  window.EMIFORMULA_BREADCRUMBS = map[path] || [];
})();
