/* ==========================================================================
   EMIFORMULA — PM SURYA GHAR ROOFTOP SOLAR UI CONTROLLER
   Supports 6 native languages: English (en), Hindi (hi), Marathi (mr),
   Gujarati (gu), Bengali (bn), Tamil (ta).
   ========================================================================== */

(function () {
  "use strict";

  var root = document.getElementById("solarCalculator");
  if (!root || !window.EMIFORMULA_SOLAR) return;

  var locale = document.documentElement.getAttribute("data-locale") || document.documentElement.lang || "en";

  var L10N = {
    en: {
      statusSuccess: "✅ Eligible for up to ₹78,000 Direct Central Subsidy",
      statusDesc: function (cap, sub, sav) {
        return "A " + cap + " kW rooftop system qualifies for " + sub + " direct subsidy. You generate ~" + (cap * 120) + " free units/month, saving approx " + sav + " every month on electricity bills.";
      },
      cashflowPositive: function (profit) {
        return "💰 Positive Cashflow: You save " + profit + " every month even after paying your solar loan EMI!";
      },
      cashflowCash: "Zero monthly loan liability — 100% free solar power from day one.",
      paybackText: function (yrs) {
        return "Your entire system pays for itself in just " + yrs + " years through electricity savings.";
      },
      tableMetric: "Financial Parameter",
      tableCashVal: "Direct Upfront Payment",
      tableLoanVal: "With 7% Concessional Loan",
      grossCost: "Total Solar System Benchmark Cost",
      centralSubsidy: "Central Government Subsidy (DBT)",
      netInvestment: "Net Out-of-Pocket Cost",
      downPayment: "Down Payment (10% Margin)",
      loanAmount: "Bank Loan Financed (90%)",
      monthlyEmi: "Monthly Solar Loan EMI (7% p.a.)",
      monthlySavings: "Monthly Electricity Bill Savings",
      netMonthlyBenefit: "Net Monthly Cash Savings (Savings - EMI)",
      paybackPeriod: "Estimated Payback Time",
      lifetimeProfit: "25-Year Net Lifetime Profit",
      co2Offset: "CO₂ Emissions Avoided (25 Yrs)",
      unitsSuffix: " kWh/month",
      sqftSuffix: " sq. ft.",
      tonsSuffix: " tons"
    },
    hi: {
      statusSuccess: "✅ ₹78,000 तक की सीधी केंद्रीय सब्सिडी के लिए पात्र",
      statusDesc: function (cap, sub, sav) {
        return cap + " kW रूफटॉप सोलर लगाने पर आपको " + sub + " की सीधी सरकारी सब्सिडी मिलेगी। हर महीने करीब " + (cap * 120) + " यूनिट बिजली बनेगी, जिससे बिजली बिल में " + sav + " की बचत होगी।";
      },
      cashflowPositive: function (profit) {
        return "💰 पहले महीने से फायदा: सोलर लोन की EMI चुकाने के बाद भी आपकी हर महीने " + profit + " की शुद्ध बचत होगी!";
      },
      cashflowCash: "लोन की कोई झंझट नहीं — पहले दिन से ही 100% मुफ्त सौर ऊर्जा।",
      paybackText: function (yrs) {
        return "बिजली बिल की बचत से पूरा सोलर सिस्टम केवल " + yrs + " साल में अपनी लागत वसूल कर देगा।";
      },
      tableMetric: "वित्तीय विवरण",
      tableCashVal: "नकद भुगतान पर",
      tableLoanVal: "7% बैंक लोन के साथ",
      grossCost: "सोलर सिस्टम की कुल अनुमानित लागत",
      centralSubsidy: "केंद्र सरकार की सब्सिडी (DBT)",
      netInvestment: "सब्सिडी के बाद आपकी जेब से लागत",
      downPayment: "डाउन पेमेंट (10% मार्जिन मनी)",
      loanAmount: "बैंक लोन राशि (90%)",
      monthlyEmi: "मासिक सोलर लोन EMI (7% ब्याज)",
      monthlySavings: "हर महीने बिजली बिल में बचत",
      netMonthlyBenefit: "हर महीने शुद्ध बचत (बचत - EMI)",
      paybackPeriod: "लागत वसूली समय (Payback)",
      lifetimeProfit: "25 सालों में कुल शुद्ध मुनाफा",
      co2Offset: "25 सालों में बचा हुआ कार्बन (CO₂)",
      unitsSuffix: " यूनिट/माह",
      sqftSuffix: " वर्ग फीट",
      tonsSuffix: " टन"
    },
    mr: {
      statusSuccess: "✅ ₹78,000 पर्यंत थेट केंद्र सरकारी अनुदानासाठी पात्र",
      statusDesc: function (cap, sub, sav) {
        return cap + " kW रूफटॉप सोलरसाठी तुम्हाला " + sub + " थेट सरकारी अनुदान मिळेल. दरमहा सुमारे " + (cap * 120) + " युनिट वीज तयार होईल आणि विजेच्या बिलात " + sav + " बचत होईल.";
      },
      cashflowPositive: function (profit) {
        return "💰 पहिल्या महिन्यापासून नफा: सोलर कर्जाचा EMI भरल्यानंतरही तुमची दरमहा " + profit + " निव्वळ बचत होईल!";
      },
      cashflowCash: "कर्जाची कोणतीही चिंता नाही — पहिल्या दिवसापासून 100% मोफत वीज.",
      paybackText: function (yrs) {
        return "विजेच्या बिलातील बचतीतून संपूर्ण सोलर सिस्टम अवघ्या " + yrs + " वर्षांत वसूल होईल.";
      },
      tableMetric: "आर्थिक तपशील",
      tableCashVal: "रोख भरणा",
      tableLoanVal: "7% सवलतीच्या बँक कर्जासह",
      grossCost: "सोलर सिस्टमचा एकूण खर्च",
      centralSubsidy: "केंद्र सरकारचे अनुदान (DBT)",
      netInvestment: "अनुदानानंतर प्रत्यक्ष खर्च",
      downPayment: "डाऊन पेमेंट (10%)",
      loanAmount: "बँक कर्ज रक्कम (90%)",
      monthlyEmi: "मासिक सोलर कर्ज हप्ता (EMI)",
      monthlySavings: "दरमहा वीज बिलात बचत",
      netMonthlyBenefit: "निव्वळ मासिक बचत (बचत - EMI)",
      paybackPeriod: "खर्च परतफेडीचा कालावधी (Payback)",
      lifetimeProfit: "25 वर्षांतील एकूण निव्वळ नफा",
      co2Offset: "25 वर्षांत कमी झालेले कार्बन उत्सर्जन",
      unitsSuffix: " युनिट/महिना",
      sqftSuffix: " चौ. फूट",
      tonsSuffix: " टन"
    },
    gu: {
      statusSuccess: "✅ ₹78,000 સુધીની સીધી સરકારી સબસિડી માટે પાત્ર",
      statusDesc: function (cap, sub, sav) {
        return cap + " kW રૂફટોપ સોલર સિસ્ટમ પર તમને " + sub + " સીધી સબસિડી મળશે. દર મહિને આશરે " + (cap * 120) + " યુનિટ વીજળી બનશે અને બિલમાં " + sav + " ની બચત થશે.";
      },
      cashflowPositive: function (profit) {
        return "💰 પ્રથમ મહિનાથી જ નફો: સોલર લોનનો હપ્તો (EMI) ભર્યા પછી પણ તમારી દર મહિને " + profit + " ની ચોખ્ખી બચત થશે!";
      },
      cashflowCash: "લોનની કોઈ ચિંતા નહીં — પ્રથમ દિવસથી જ 100% મફત સૌર વીજળી.",
      paybackText: function (yrs) {
        return "વીજળી બિલની બચતથી સમગ્ર સોલર સિસ્ટમ માત્ર " + yrs + " વર્ષમાં પોતાનો ખર્ચ વસૂલ કરી લેશે.";
      },
      tableMetric: "નાણાકીય વિગત",
      tableCashVal: "રોકડ ચુકવણી",
      tableLoanVal: "7% બેંક લોન સાથે",
      grossCost: "સોલર સિસ્ટમનો કુલ ખર્ચ",
      centralSubsidy: "કેન્દ્ર સરકારની સબસિડી (DBT)",
      netInvestment: "સબસિડી બાદ ચોખ્ખો ખર્ચ",
      downPayment: "ડાઉન પેમેન્ટ (10%)",
      loanAmount: "બેંક લોન રકમ (90%)",
      monthlyEmi: "માસિક સોલર લોન હપ્તો (EMI)",
      monthlySavings: "દર મહિને વીજળી બિલમાં બચત",
      netMonthlyBenefit: "ચોખ્ખી માસિક બચત (બચત - EMI)",
      paybackPeriod: "ખર્ચ વસૂલાત સમય (Payback)",
      lifetimeProfit: "25 વર્ષમાં કુલ ચોખ્ખો નફો",
      co2Offset: "25 વર્ષમાં કાર્બન ઉત્સર્જનમાં ઘટાડો",
      unitsSuffix: " યુનિટ/માસ",
      sqftSuffix: " ચો. ફૂટ",
      tonsSuffix: " ટન"
    },
    bn: {
      statusSuccess: "✅ সর্বোচ্চ ₹৭৮,০০০ সরাসরি কেন্দ্রীয় ভর্তুকির জন্য যোগ্য",
      statusDesc: function (cap, sub, sav) {
        return cap + " kW ছাদের সোলার সিস্টেমের জন্য আপনি " + sub + " সরাসরি সরকারি ভর্তুকি পাবেন। প্রতি মাসে প্রায় " + (cap * 120) + " ইউনিট বিদ্যুৎ উৎপাদন হবে এবং বিলে " + sav + " সাশ্রয় হবে।";
      },
      cashflowPositive: function (profit) {
        return "💰 প্রথম মাস থেকেই লাভ: সোলার লোনের EMI দেওয়ার পরেও প্রতি মাসে আপনার " + profit + " খাঁটি সাশ্রয় থাকবে!";
      },
      cashflowCash: "লোনের কোনো ঝামেলা নেই — প্রথম দিন থেকেই ১০০% বিনামূল্যে সৌর বিদ্যুৎ।",
      paybackText: function (yrs) {
        return "বিদ্যুৎ বিলের সাশ্রয়ের মাধ্যমে পুরো সোলার সিস্টেমের খরচ মাত্র " + yrs + " বছরে উঠে আসবে।";
      },
      tableMetric: "আর্থিক বিবরণ",
      tableCashVal: "নগদ পেমেন্টে",
      tableLoanVal: "৭% ব্যাঙ্ক লোনের সাথে",
      grossCost: "সোলার সিস্টেমের মোট খরচ",
      centralSubsidy: "কেন্দ্রীয় সরকারি ভর্তুকি (DBT)",
      netInvestment: "ভর্তুকি বাদে আপনার মোট খরচ",
      downPayment: "ডাউন পেমেন্ট (১০%)",
      loanAmount: "ব্যাঙ্ক লোন সুবিধা (৯০%)",
      monthlyEmi: "মাসিক সোলার লোন কিস্তি (EMI)",
      monthlySavings: "প্রতি মাসে বিদ্যুৎ বিলের সাশ্রয়",
      netMonthlyBenefit: "মাসিক খাঁটি লাভ (সাশ্রয় - EMI)",
      paybackPeriod: "খরচ ওঠার সময়সীমা (Payback)",
      lifetimeProfit: "২৫ বছরে মোট খাঁটি লাভ",
      co2Offset: "২৫ বছরে কার্বন নির্গমন হ্রাস",
      unitsSuffix: " ইউনিট/মাস",
      sqftSuffix: " বর্গফুট",
      tonsSuffix: " টন"
    },
    ta: {
      statusSuccess: "✅ ₹78,000 வரை நேரடி மத்திய அரசு மானியத்திற்கு நீங்கள் தகுதியானவர்",
      statusDesc: function (cap, sub, sav) {
        return cap + " kW கூரை சோலார் அமைப்பிற்கு உங்களுக்கு " + sub + " நேரடி அரசு மானியம் கிடைக்கும். மாதந்தோறும் சுமார் " + (cap * 120) + " யூனிட் மின்சாரம் உற்பத்தியாகி மின் கட்டணத்தில் " + sav + " சேமிப்பாகும்.";
      },
      cashflowPositive: function (profit) {
        return "💰 முதல் மாதத்திலிருந்தே லாபம்: சோலார் கடன் EMI செலுத்திய பிறகும் உங்களுக்கு மாதந்தோறும் " + profit + " நிகர சேமிப்பு கிடைக்கும்!";
      },
      cashflowCash: "கடன் கவலை இல்லை — முதல் நாளிலிருந்தே 100% இலவச சூரிய மின்சாரம்.",
      paybackText: function (yrs) {
        return "மின் கட்டண சேமிப்பு மூலம் முழு சோலார் அமைப்பின் முதலீடும் வெறும் " + yrs + " ஆண்டுகளில் திரும்பக் கிடைக்கும்.";
      },
      tableMetric: "நிதி விவரம்",
      tableCashVal: "ரொக்கக் கட்டணம்",
      tableLoanVal: "7% எளிய வங்கிக் கடனுடன்",
      grossCost: "சோலார் அமைப்பின் மொத்த செலவு",
      centralSubsidy: "மத்திய அரசு மானியம் (DBT)",
      netInvestment: "மானியத்திற்குப் பின் நேரடிச் செலவு",
      downPayment: "முன்பணம் (10% Down Payment)",
      loanAmount: "வங்கி கடன் தொகை (90%)",
      monthlyEmi: "மாதாந்திர சோலார் கடன் தவணை (EMI)",
      monthlySavings: "மாதாந்திர மின் கட்டணச் சேமிப்பு",
      netMonthlyBenefit: "நிகர மாதாந்திர லாபம் (சேமிப்பு - EMI)",
      paybackPeriod: "முதலீடு திரும்பக் கிடைக்கும் காலம்",
      lifetimeProfit: "25 ஆண்டுகளில் மொத்த நிகர லாபம்",
      co2Offset: "25 ஆண்டுகளில் தவிர்க்கப்பட்ட கார்பன் (CO₂)",
      unitsSuffix: " யூனிட்/மாதம்",
      sqftSuffix: " சதுர அடி",
      tonsSuffix: " டன்"
    }
  };

  var T = L10N[locale] || L10N.en;

  function formatMoney(num) {
    var val = Math.round(Number(num) || 0);
    return "₹" + val.toLocaleString("en-IN");
  }

  // Inputs
  var billInput = document.getElementById("solBill");
  var billRange = document.getElementById("solBillRange");
  var tariffInput = document.getElementById("solTariff");
  var tariffRange = document.getElementById("solTariffRange");
  var kwInput = document.getElementById("solCapacity");
  var kwRange = document.getElementById("solCapacityRange");
  var modeCash = document.getElementById("solModeCash");
  var modeLoan = document.getElementById("solModeLoan");
  var tenureSelect = document.getElementById("solLoanTenure");
  var loanFields = document.getElementById("solLoanFields");
  var resetBtn = document.getElementById("solResetBtn");
  var calcBtn = document.getElementById("solCalcBtn");

  // Output Elements
  var statusBanner = document.getElementById("solStatusBanner");
  var statusTitle = document.getElementById("solStatusTitle");
  var statusDesc = document.getElementById("solStatusDesc");
  var kpiCapacity = document.getElementById("solKpiCapacity");
  var kpiSubsidy = document.getElementById("solKpiSubsidy");
  var kpiMonthlySavings = document.getElementById("solKpiMonthlySavings");
  var kpiNetMonthlyProfit = document.getElementById("solKpiNetProfit");
  var kpiPayback = document.getElementById("solKpiPayback");
  var kpiLifetime = document.getElementById("solKpiLifetime");
  var roiDesc = document.getElementById("solRoiDesc");

  // Comparison Table Elements
  var valGrossCost = document.getElementById("solValGrossCost");
  var valSubsidy = document.getElementById("solValSubsidy");
  var valNetCost = document.getElementById("solValNetCost");
  var valDownPayment = document.getElementById("solValDownPayment");
  var valLoanAmount = document.getElementById("solValLoanAmount");
  var valMonthlyEmi = document.getElementById("solValMonthlyEmi");
  var valMonthlySavings = document.getElementById("solValMonthlySavings");
  var valNetCashflow = document.getElementById("solValNetCashflow");

  var currentMode = "loan";

  function sync(textEl, rangeEl, isFloat) {
    if (!textEl || !rangeEl) return;
    textEl.addEventListener("input", function () {
      var v = isFloat ? parseFloat(textEl.value) : parseInt(textEl.value, 10);
      if (!isNaN(v)) {
        rangeEl.value = v;
        calculateAndRender();
      }
    });
    rangeEl.addEventListener("input", function () {
      textEl.value = rangeEl.value;
      calculateAndRender();
    });
  }

  sync(billInput, billRange, false);
  sync(tariffInput, tariffRange, true);
  sync(kwInput, kwRange, false);

  if (modeCash && modeLoan) {
    modeCash.addEventListener("click", function () {
      currentMode = "cash";
      modeCash.classList.add("is-active");
      modeLoan.classList.remove("is-active");
      if (loanFields) loanFields.style.display = "none";
      calculateAndRender();
    });
    modeLoan.addEventListener("click", function () {
      currentMode = "loan";
      modeLoan.classList.add("is-active");
      modeCash.classList.remove("is-active");
      if (loanFields) loanFields.style.display = "block";
      calculateAndRender();
    });
  }

  if (tenureSelect) {
    tenureSelect.addEventListener("change", calculateAndRender);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (billInput) billInput.value = 3000;
      if (billRange) billRange.value = 3000;
      if (tariffInput) tariffInput.value = 7.5;
      if (tariffRange) tariffRange.value = 7.5;
      if (kwInput) kwInput.value = 3;
      if (kwRange) kwRange.value = 3;
      currentMode = "loan";
      if (modeLoan && modeCash) {
        modeLoan.classList.add("is-active");
        modeCash.classList.remove("is-active");
      }
      if (loanFields) loanFields.style.display = "block";
      if (tenureSelect) tenureSelect.value = "5";
      try {
        if (history.replaceState) history.replaceState(null, "", location.pathname);
      } catch (e) {}
      calculateAndRender();
    });
  }

  if (calcBtn) {
    calcBtn.addEventListener("click", function (e) {
      e.preventDefault();
      calculateAndRender();
      if (statusBanner) {
        statusBanner.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function calculateAndRender() {
    var billVal = billInput ? Number(billInput.value) || 0 : 3000;
    var tariffVal = tariffInput ? Number(tariffInput.value) || 7.5 : 7.5;
    var kwVal = kwInput ? Number(kwInput.value) || 3 : 3;
    var tenureVal = tenureSelect ? Number(tenureSelect.value) || 5 : 5;

    var plan = window.EMIFORMULA_SOLAR.calculateSolarPlan({
      monthlyBill: billVal,
      tariff: tariffVal,
      capacityKw: kwVal,
      financingMode: currentMode,
      loanTenureYears: tenureVal,
      loanInterestRate: 7.0,
      downPaymentPct: 10
    });

    if (statusTitle) statusTitle.textContent = T.statusSuccess;
    if (statusDesc) {
      statusDesc.textContent = T.statusDesc(plan.capacityKw, formatMoney(plan.subsidy), formatMoney(plan.monthlySavings));
    }

    if (kpiCapacity) kpiCapacity.textContent = plan.capacityKw + " kW";
    if (kpiSubsidy) kpiSubsidy.textContent = formatMoney(plan.subsidy);
    if (kpiMonthlySavings) kpiMonthlySavings.textContent = formatMoney(plan.monthlySavings) + "/mo";
    
    if (kpiNetMonthlyProfit) {
      if (plan.isLoan) {
        var prefix = plan.netMonthlyCashflow >= 0 ? "+" : "-";
        kpiNetMonthlyProfit.textContent = prefix + formatMoney(Math.abs(plan.netMonthlyCashflow)) + "/mo";
      } else {
        kpiNetMonthlyProfit.textContent = "+" + formatMoney(plan.monthlySavings) + "/mo";
      }
    }

    if (kpiPayback) kpiPayback.textContent = plan.paybackYears + " Yrs";
    if (kpiLifetime) kpiLifetime.textContent = formatMoney(plan.net25YrProfit);

    if (roiDesc) {
      if (plan.isLoan) {
        roiDesc.textContent = T.cashflowPositive(formatMoney(Math.max(0, plan.netMonthlyCashflow))) + " " + T.paybackText(plan.paybackYears);
      } else {
        roiDesc.textContent = T.cashflowCash + " " + T.paybackText(plan.paybackYears);
      }
    }

    // Comparison Table
    if (valGrossCost) valGrossCost.textContent = formatMoney(plan.grossCost);
    if (valSubsidy) valSubsidy.textContent = "-" + formatMoney(plan.subsidy);
    if (valNetCost) valNetCost.textContent = formatMoney(plan.netCost);
    if (valDownPayment) valDownPayment.textContent = plan.isLoan ? formatMoney(plan.downPayment) : formatMoney(plan.netCost);
    if (valLoanAmount) valLoanAmount.textContent = plan.isLoan ? formatMoney(plan.loanAmount) : "₹0 (No Loan)";
    if (valMonthlyEmi) valMonthlyEmi.textContent = plan.isLoan ? formatMoney(plan.monthlyEmi) + "/mo" : "₹0/mo";
    if (valMonthlySavings) valMonthlySavings.textContent = formatMoney(plan.monthlySavings) + "/mo";
    if (valNetCashflow) {
      var netProfit = plan.isLoan ? plan.netMonthlyCashflow : plan.monthlySavings;
      var pSign = netProfit >= 0 ? "+" : "-";
      valNetCashflow.textContent = pSign + formatMoney(Math.abs(netProfit)) + "/mo";
    }
  }

  // Export Buttons
  var btnPrint = document.getElementById("solBtnPrint");
  var btnCsv = document.getElementById("solBtnCsv");
  var btnWhatsApp = document.getElementById("solBtnWhatsApp");
  var btnShare = document.getElementById("solBtnShare");

  if (btnPrint) {
    btnPrint.addEventListener("click", function () { window.print(); });
  }

  if (btnCsv) {
    btnCsv.addEventListener("click", function () {
      var billVal = billInput ? billInput.value : "3000";
      var kwVal = kwInput ? kwInput.value : "3";
      var plan = window.EMIFORMULA_SOLAR.calculateSolarPlan({
        monthlyBill: Number(billVal),
        capacityKw: Number(kwVal),
        financingMode: currentMode
      });
      var csv = "Metric,Value\n" +
        "Rooftop Solar Capacity," + plan.capacityKw + " kW\n" +
        "Central Government Subsidy," + plan.subsidy + "\n" +
        "Benchmark System Cost," + plan.grossCost + "\n" +
        "Net Cost After Subsidy," + plan.netCost + "\n" +
        "Monthly Electricity Bill Savings," + plan.monthlySavings + "\n" +
        "Monthly Solar Loan EMI (7%)," + plan.monthlyEmi + "\n" +
        "Net Monthly Cash Profit," + (plan.monthlySavings - plan.monthlyEmi) + "\n" +
        "Payback Period," + plan.paybackYears + " Years\n" +
        "25-Year Net Lifetime Profit," + plan.net25YrProfit + "\n";
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "PM-Surya-Ghar-Solar-Calculation.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (btnWhatsApp) {
    btnWhatsApp.addEventListener("click", function () {
      var kw = kwInput ? kwInput.value : "3";
      var plan = window.EMIFORMULA_SOLAR.calculateSolarPlan({ capacityKw: Number(kw), financingMode: currentMode });
      var text = "☀️ PM Surya Ghar Rooftop Solar Calculation:\n" +
        "Capacity: " + plan.capacityKw + " kW\n" +
        "Govt Subsidy: " + formatMoney(plan.subsidy) + "\n" +
        "Monthly Savings: " + formatMoney(plan.monthlySavings) + "/mo\n" +
        "Payback: " + plan.paybackYears + " Years\n" +
        "Calculate yours on: " + window.location.href;
      window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(text), "_blank");
    });
  }

  if (btnShare) {
    btnShare.addEventListener("click", function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          alert("Link copied to clipboard!");
        });
      }
    });
  }

  // Initial Calculation
  calculateAndRender();
})();
