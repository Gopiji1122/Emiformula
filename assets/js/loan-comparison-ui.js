(function () {
  "use strict";

  var locale = document.documentElement.getAttribute("data-locale") || "en";
  var DICT = {
    en: {
      summaryHeading:"What the numbers show",
      loanA:"Loan A",
      loanB:"Loan B",
      month:"month",
      months:"months",
      year:"year",
      years:"years",
      bothTotal:"Both loans have the same estimated total cost within rounding.",
      totalLower:"Loan {loan} has the lower estimated total cost by {value}.",
      bothPayment:"Both loans have the same scheduled payment within rounding.",
      paymentLower:"Loan {loan} has the lower scheduled payment by {value} per payment.",
      bothInterest:"Both loans have the same estimated total interest within rounding.",
      interestLower:"Loan {loan} has the lower estimated interest by {value}.",
      bothFees:"Both loans have the same estimated fees within rounding.",
      feesLower:"Loan {loan} has the lower estimated fees by {value}.",
      bothTerm:"Both loans have the same calculated payoff time within rounding.",
      termLower:"Loan {loan} reaches a zero balance earlier by about {value}.",
      disclaimer:"These are mathematical comparisons from the entered assumptions. They are not lender offers or personal financial recommendations.",
      period:"Period",
      loan:"Loan",
      payment:"Payment",
      principal:"Principal",
      interest:"Interest",
      balance:"Balance",
      opening:"Opening balance",
      recurring:"Recurring fee",
      closing:"Closing balance",
      comparisonCaption:"Loan A and Loan B payment-by-payment comparison",
      fee:"Fee",
      totalFees:"Total fees",
      processing:"Processing / origination",
      application:"Application",
      documentation:"Documentation",
      legal:"Legal",
      valuation:"Valuation / appraisal",
      insurance:"Insurance",
      broker:"Broker / adviser",
      otherUpfront:"Other upfront",
      prepayment:"Prepayment / early repayment",
      otherCost:"Other cost",
      recurringFees:"Recurring fees",
      chartAria:"Cumulative estimated cost for Loan A and Loan B",
      scheduleA:"Loan A amortization schedule",
      scheduleB:"Loan B amortization schedule",
      interestLabel:"Interest",
      feesLabel:"Fees",
      payoff:"Payoff time",
      timeline:"Calculated timeline",
      costStructure:"Cost structure"
    },
    hi: {
      summaryHeading:"What the Numbers Show",
      loanA:"लोन A",
      loanB:"लोन B",
      month:"महीना",
      months:"महीने",
      year:"साल",
      years:"साल",
      bothTotal:"राउंडिंग के हिसाब से दोनों लोन की कुल अनुमानित लागत समान है।",
      totalLower:"लोन {loan} की कुल अनुमानित लागत {value} कम है।",
      bothPayment:"राउंडिंग के हिसाब से दोनों लोन का scheduled payment समान है।",
      paymentLower:"लोन {loan} का हर scheduled payment {value} कम है।",
      bothInterest:"राउंडिंग के हिसाब से दोनों लोन का estimated interest समान है।",
      interestLower:"लोन {loan} का estimated interest {value} कम है।",
      bothFees:"राउंडिंग के हिसाब से दोनों लोन की estimated fees समान हैं।",
      feesLower:"लोन {loan} की estimated fees {value} कम हैं।",
      bothTerm:"राउंडिंग के हिसाब से दोनों लोन का payoff time समान है।",
      termLower:"लोन {loan} लगभग {value} पहले zero balance तक पहुँचता है।",
      disclaimer:"ये आपके दिए गए inputs पर आधारित mathematical comparison हैं। ये lender offer या personal financial advice नहीं हैं।",
      period:"Period",
      loan:"लोन",
      payment:"Payment",
      principal:"Principal",
      interest:"Interest",
      balance:"Balance",
      opening:"Opening balance",
      recurring:"Recurring fee",
      closing:"Closing balance",
      comparisonCaption:"लोन A और लोन B की हर payment की तुलना",
      fee:"Fee",
      totalFees:"Total fees",
      processing:"Processing / origination",
      application:"Application",
      documentation:"Documentation",
      legal:"Legal",
      valuation:"Valuation / appraisal",
      insurance:"Insurance",
      broker:"Broker / adviser",
      otherUpfront:"Other upfront",
      prepayment:"Prepayment / early repayment",
      otherCost:"Other cost",
      recurringFees:"Recurring fees",
      chartAria:"लोन A और लोन B की cumulative estimated cost",
      scheduleA:"लोन A का amortization schedule",
      scheduleB:"लोन B का amortization schedule",
      interestLabel:"Interest",
      feesLabel:"Fees",
      payoff:"Payoff time",
      timeline:"Calculated timeline",
      costStructure:"Cost structure"
    },
    mr: {
      summaryHeading:"आकडे काय सांगतात",
      loanA:"लोन A",
      loanB:"लोन B",
      month:"महिना",
      months:"महिने",
      year:"वर्ष",
      years:"वर्षे",
      bothTotal:"राउंडिंगनुसार दोन्ही लोनची एकूण अंदाजे किंमत समान आहे.",
      totalLower:"लोन {loan} ची एकूण अंदाजे किंमत {value} ने कमी आहे.",
      bothPayment:"राउंडिंगनुसार दोन्ही लोनचा scheduled payment समान आहे.",
      paymentLower:"लोन {loan} चा प्रत्येक scheduled payment {value} ने कमी आहे.",
      bothInterest:"राउंडिंगनुसार दोन्ही लोनचे estimated interest समान आहे.",
      interestLower:"लोन {loan} चे estimated interest {value} ने कमी आहे.",
      bothFees:"राउंडिंगनुसार दोन्ही लोनच्या estimated fees समान आहेत.",
      feesLower:"लोन {loan} च्या estimated fees {value} ने कमी आहेत.",
      bothTerm:"राउंडिंगनुसार दोन्ही लोनचा payoff time समान आहे.",
      termLower:"लोन {loan} सुमारे {value} आधी zero balance वर पोहोचते.",
      disclaimer:"हे तुमच्या inputs वर आधारित mathematical comparison आहे. हे lender offer किंवा personal financial advice नाही.",
      period:"Period",
      loan:"लोन",
      payment:"Payment",
      principal:"Principal",
      interest:"Interest",
      balance:"Balance",
      opening:"Opening balance",
      recurring:"Recurring fee",
      closing:"Closing balance",
      comparisonCaption:"लोन A आणि लोन B च्या प्रत्येक payment ची तुलना",
      fee:"Fee",
      totalFees:"Total fees",
      processing:"Processing / origination",
      application:"Application",
      documentation:"Documentation",
      legal:"Legal",
      valuation:"Valuation / appraisal",
      insurance:"Insurance",
      broker:"Broker / adviser",
      otherUpfront:"Other upfront",
      prepayment:"Prepayment / early repayment",
      otherCost:"Other cost",
      recurringFees:"Recurring fees",
      chartAria:"लोन A आणि लोन B ची cumulative estimated cost",
      scheduleA:"लोन A चे amortization schedule",
      scheduleB:"लोन B चे amortization schedule",
      interestLabel:"Interest",
      feesLabel:"Fees",
      payoff:"Payoff time",
      timeline:"Calculated timeline",
      costStructure:"Cost structure"
    },
    gu: {
      summaryHeading:"આંકડા શું બતાવે છે",
      loanA:"લોન A",
      loanB:"લોન B",
      month:"મહિનો",
      months:"મહિના",
      year:"વર્ષ",
      years:"વર્ષ",
      bothTotal:"રાઉન્ડિંગ મુજબ બંને લોનનો કુલ અંદાજિત ખર્ચ સમાન છે.",
      totalLower:"લોન {loan}નો કુલ અંદાજિત ખર્ચ {value} ઓછો છે.",
      bothPayment:"રાઉન્ડિંગ મુજબ બંને લોનની scheduled payment સમાન છે.",
      paymentLower:"લોન {loan}ની દરેક scheduled payment {value} ઓછી છે.",
      bothInterest:"રાઉન્ડિંગ મુજબ બંને લોનનું estimated interest સમાન છે.",
      interestLower:"લોન {loan}નું estimated interest {value} ઓછું છે.",
      bothFees:"રાઉન્ડિંગ મુજબ બંને લોનની estimated fees સમાન છે.",
      feesLower:"લોન {loan}ની estimated fees {value} ઓછી છે.",
      bothTerm:"રાઉન્ડિંગ મુજબ બંને લોનનો payoff time સમાન છે.",
      termLower:"લોન {loan} લગભગ {value} વહેલી zero balance પર પહોંચે છે.",
      disclaimer:"આ તમારા inputs પર આધારિત mathematical comparison છે. આ lender offer અથવા personal financial advice નથી.",
      period:"Period",
      loan:"લોન",
      payment:"Payment",
      principal:"Principal",
      interest:"Interest",
      balance:"Balance",
      opening:"Opening balance",
      recurring:"Recurring fee",
      closing:"Closing balance",
      comparisonCaption:"લોન A અને લોન Bની દરેક payment ની સરખામણી",
      fee:"Fee",
      totalFees:"Total fees",
      processing:"Processing / origination",
      application:"Application",
      documentation:"Documentation",
      legal:"Legal",
      valuation:"Valuation / appraisal",
      insurance:"Insurance",
      broker:"Broker / adviser",
      otherUpfront:"Other upfront",
      prepayment:"Prepayment / early repayment",
      otherCost:"Other cost",
      recurringFees:"Recurring fees",
      chartAria:"લોન A અને લોન Bનો cumulative estimated cost",
      scheduleA:"લોન Aનું amortization schedule",
      scheduleB:"લોન Bનું amortization schedule",
      interestLabel:"Interest",
      feesLabel:"Fees",
      payoff:"Payoff time",
      timeline:"Calculated timeline",
      costStructure:"Cost structure"
    },
    bn: {
      summaryHeading:"সংখ্যাগুলো কী দেখায়",
      loanA:"লোন A",
      loanB:"লোন B",
      month:"মাস",
      months:"মাস",
      year:"বছর",
      years:"বছর",
      bothTotal:"রাউন্ডিং অনুযায়ী দুই লোনের মোট আনুমানিক খরচ একই।",
      totalLower:"লোন {loan}-এর মোট আনুমানিক খরচ {value} কম।",
      bothPayment:"রাউন্ডিং অনুযায়ী দুই লোনের scheduled payment একই।",
      paymentLower:"লোন {loan}-এর প্রতি scheduled payment {value} কম।",
      bothInterest:"রাউন্ডিং অনুযায়ী দুই লোনের estimated interest একই।",
      interestLower:"লোন {loan}-এর estimated interest {value} কম।",
      bothFees:"রাউন্ডিং অনুযায়ী দুই লোনের estimated fees একই।",
      feesLower:"লোন {loan}-এর estimated fees {value} কম।",
      bothTerm:"রাউন্ডিং অনুযায়ী দুই লোনের payoff time একই।",
      termLower:"লোন {loan} প্রায় {value} আগে zero balance-এ পৌঁছায়।",
      disclaimer:"এগুলো আপনার দেওয়া inputs-এর ভিত্তিতে mathematical comparison। এগুলো lender offer বা personal financial advice নয়।",
      period:"Period",
      loan:"লোন",
      payment:"Payment",
      principal:"Principal",
      interest:"Interest",
      balance:"Balance",
      opening:"Opening balance",
      recurring:"Recurring fee",
      closing:"Closing balance",
      comparisonCaption:"লোন A ও লোন B-এর প্রতিটি payment-এর তুলনা",
      fee:"Fee",
      totalFees:"Total fees",
      processing:"Processing / origination",
      application:"Application",
      documentation:"Documentation",
      legal:"Legal",
      valuation:"Valuation / appraisal",
      insurance:"Insurance",
      broker:"Broker / adviser",
      otherUpfront:"Other upfront",
      prepayment:"Prepayment / early repayment",
      otherCost:"Other cost",
      recurringFees:"Recurring fees",
      chartAria:"লোন A ও লোন B-এর cumulative estimated cost",
      scheduleA:"লোন A-এর amortization schedule",
      scheduleB:"লোন B-এর amortization schedule",
      interestLabel:"Interest",
      feesLabel:"Fees",
      payoff:"Payoff time",
      timeline:"Calculated timeline",
      costStructure:"Cost structure"
    },
    ta: {
      summaryHeading:"இந்த எண்கள் என்ன காட்டுகின்றன",
      loanA:"லோன் A",
      loanB:"லோன் B",
      month:"மாதம்",
      months:"மாதங்கள்",
      year:"ஆண்டு",
      years:"ஆண்டுகள்",
      bothTotal:"ரௌண்டிங் படி இரண்டு லோன்களின் மொத்த மதிப்பிடப்பட்ட செலவும் ஒன்றே.",
      totalLower:"லோன் {loan}-ன் மொத்த மதிப்பிடப்பட்ட செலவு {value} குறைவு.",
      bothPayment:"ரௌண்டிங் படி இரண்டு லோன்களின் scheduled payment ஒன்றே.",
      paymentLower:"லோன் {loan}-ன் ஒவ்வொரு scheduled payment-மும் {value} குறைவு.",
      bothInterest:"ரௌண்டிங் படி இரண்டு லோன்களின் estimated interest ஒன்றே.",
      interestLower:"லோன் {loan}-ன் estimated interest {value} குறைவு.",
      bothFees:"ரௌண்டிங் படி இரண்டு லோன்களின் estimated fees ஒன்றே.",
      feesLower:"லோன் {loan}-ன் estimated fees {value} குறைவு.",
      bothTerm:"ரௌண்டிங் படி இரண்டு லோன்களின் payoff time ஒன்றே.",
      termLower:"லோன் {loan} சுமார் {value} முன்பே zero balance-க்கு வருகிறது.",
      disclaimer:"இவை நீங்கள் கொடுத்த inputs அடிப்படையிலான mathematical comparison. இது lender offer அல்லது personal financial advice அல்ல.",
      period:"Period",
      loan:"லோன்",
      payment:"Payment",
      principal:"Principal",
      interest:"Interest",
      balance:"Balance",
      opening:"Opening balance",
      recurring:"Recurring fee",
      closing:"Closing balance",
      comparisonCaption:"லோன் A மற்றும் லோன் B-ன் ஒவ்வொரு payment-ஐ ஒப்பிடுதல்",
      fee:"Fee",
      totalFees:"Total fees",
      processing:"Processing / origination",
      application:"Application",
      documentation:"Documentation",
      legal:"Legal",
      valuation:"Valuation / appraisal",
      insurance:"Insurance",
      broker:"Broker / adviser",
      otherUpfront:"Other upfront",
      prepayment:"Prepayment / early repayment",
      otherCost:"Other cost",
      recurringFees:"Recurring fees",
      chartAria:"லோன் A மற்றும் லோன் B-ன் cumulative estimated cost",
      scheduleA:"லோன் A-ன் amortization schedule",
      scheduleB:"லோன் B-ன் amortization schedule",
      interestLabel:"Interest",
      feesLabel:"Fees",
      payoff:"Payoff time",
      timeline:"Calculated timeline",
      costStructure:"Cost structure"
    }
  };
  var T = DICT[locale] || DICT.en;
  function tr(key, vars) {
    var text = T[key] || DICT.en[key] || key;
    Object.keys(vars || {}).forEach(function (keyName) { text = text.replace(new RegExp("\\{" + keyName + "\\}", "g"), vars[keyName]); });
    return text;
  }

  var CURRENCIES = {
    INR: { symbol:"₹", name:"Indian Rupee", locale:"en-IN" },
    USD: { symbol:"$", name:"US Dollar", locale:"en-US" },
    GBP: { symbol:"£", name:"British Pound", locale:"en-GB" },
    EUR: { symbol:"€", name:"Euro", locale:"en-IE" },
    CAD: { symbol:"CA$", name:"Canadian Dollar", locale:"en-CA" },
    AUD: { symbol:"A$", name:"Australian Dollar", locale:"en-AU" },
    AED: { symbol:"د.إ", name:"UAE Dirham", locale:"en-AE" },
    SGD: { symbol:"S$", name:"Singapore Dollar", locale:"en-SG" }
  };
  function getAutoDefaultCurrency() {
    if (locale !== "en") return "INR";

    var lang = ((navigator.languages && navigator.languages[0]) || navigator.language || "").toLowerCase();
    var tz = ((Intl.DateTimeFormat().resolvedOptions().timeZone) || "").toLowerCase();

    var localeMap = [
      [/^en-us(?:-|$)/, "USD"],
      [/^en-gb(?:-|$)/, "GBP"],
      [/^en-au(?:-|$)/, "AUD"],
      [/^en-ca(?:-|$)/, "CAD"],
      [/^en-sg(?:-|$)/, "SGD"],
      [/^en-ae(?:-|$)/, "AED"],
      [/^en-in(?:-|$)/, "INR"],
      [/^en-ie(?:-|$)/, "EUR"],
      [/^(de|fr|it|es|pt|nl|el|fi|et|lv|lt|sk|sl|mt)-/, "EUR"],
      [/^ja-/, "JPY"],
      [/^ko-/, "KRW"],
      [/^zh-(cn|sg)/, "CNY"],
      [/^zh-tw/, "TWD"],
      [/^th-/, "THB"],
      [/^id-/, "IDR"],
      [/^ms-/, "MYR"],
      [/^fil-/, "PHP"],
      [/^tr-/, "TRY"],
      [/^pl-/, "PLN"],
      [/^cs-/, "CZK"],
      [/^da-/, "DKK"],
      [/^sv-/, "SEK"],
      [/^no-/, "NOK"],
      [/^hu-/, "HUF"],
      [/^ro-/, "RON"],
      [/^bg-/, "BGN"],
      [/^uk-/, "UAH"],
      [/^vi-/, "VND"],
      [/^he-/, "ILS"],
      [/^ar-ae(?:-|$)/, "AED"],
      [/^ar-sa(?:-|$)/, "SAR"],
      [/^en-za(?:-|$)/, "ZAR"]
    ];

    for (var i = 0; i < localeMap.length; i++) {
      if (localeMap[i][0].test(lang) && CURRENCIES[localeMap[i][1]]) return localeMap[i][1];
    }

    if (tz === "asia/kolkata" || tz === "asia/calcutta") return "INR";
    if (tz === "europe/london") return "GBP";
    if (tz.indexOf("australia/") === 0 && CURRENCIES.AUD) return "AUD";
    if (tz.indexOf("canada/") === 0 && CURRENCIES.CAD) return "CAD";
    if (tz.indexOf("europe/") === 0 && CURRENCIES.EUR) return "EUR";
    if (tz === "asia/dubai" && CURRENCIES.AED) return "AED";
    if (tz === "asia/singapore" && CURRENCIES.SGD) return "SGD";
    if (tz.indexOf("america/") === 0 && CURRENCIES.USD) return "USD";

    return "INR";
  }

  var currencyCode = getAutoDefaultCurrency();
  var state = { comparison: null, currency: currencyCode };
  function currencyInfo() { return CURRENCIES[state.currency] || CURRENCIES.INR; }
  function currencyText(value) {
    var info = currencyInfo();
    return new Intl.NumberFormat(info.locale, { style:"currency", currency:state.currency, currencyDisplay:"symbol", minimumFractionDigits:2, maximumFractionDigits:2 }).format(Number(value) || 0);
  }
  function updateCurrencyUI() {
    var info = currencyInfo();
    var selector = id("currencySelector");
    if (selector && selector.value !== state.currency) selector.value = state.currency;
    document.querySelectorAll("[data-currency-symbol]").forEach(function (el) { el.textContent = info.symbol; });
    document.querySelectorAll("[data-currency-name]").forEach(function (el) { el.textContent = info.name + " (" + state.currency + ")"; });
  }
  function setupCurrencyControl() {
    var selector = id("currencySelector");
    var fixed = id("fixedCurrency");
    if (selector) {
      selector.value = state.currency;
      selector.addEventListener("change", function () {
        state.currency = CURRENCIES[this.value] ? this.value : "INR";
        updateCurrencyUI();
        if (state.comparison) render(state.comparison);
      });
    }
    if (fixed) updateCurrencyUI();
  }
  function id(name) { return document.getElementById(name); }
  function field(name) { return document.querySelector('[name="' + name + '"]'); }
  function value(name) { var el = field(name); return el ? el.value : ""; }
  function number(name) { var n = Number(value(name)); return Number.isFinite(n) ? n : 0; }
  function money(v) { return currencyText(v); }
  function percent(v) { return (Number(v) || 0).toFixed(2) + "%"; }
  function duration(months) {
    var m = Math.max(0, Math.round(Number(months) || 0)), y = Math.floor(m / 12), r = m % 12;
    if (!y) return r + " " + (r === 1 ? T.month : T.months);
    if (!r) return y + " " + (y === 1 ? T.year : T.years);
    return y + " " + (y === 1 ? T.year : T.years) + " " + r + " " + (r === 1 ? T.month : T.months);
  }
  function esc(text) { return String(text == null ? "" : text).replace(/[&<>]/g, function (c) { return { "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c]; }); }
  function set(name, text) { var el = id(name); if (el) el.textContent = text; }
  function showError(messages) {
    var box = id("formErrors"); if (!box) return;
    if (!messages.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false; box.innerHTML = "<ul>" + messages.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>";
  }
  function loan(prefix) {
    return { amount:number(prefix+"Amount"), annualRate:number(prefix+"Rate"), termMonths:number(prefix+"Term"), paymentFrequency:value(prefix+"Frequency"), fees:{detailed:{
      processing:number(prefix+"Processing"), application:number(prefix+"Application"), documentation:number(prefix+"Documentation"), legal:number(prefix+"Legal"), valuation:number(prefix+"Valuation"), insurance:number(prefix+"Insurance"), broker:number(prefix+"Broker"), otherUpfront:number(prefix+"OtherUpfront"), prepayment:number(prefix+"Prepayment"), otherCost:number(prefix+"OtherCost"), otherRecurring:number(prefix+"OtherRecurring")
    }}};
  }
  function renderBar(container, label, a, b) {
    var max = Math.max(Math.abs(a), Math.abs(b), 1);
    container.insertAdjacentHTML("beforeend", '<div class="lc-bar-row"><div class="lc-bar-label"><span>' + esc(label) + '</span><span>' + T.loanA + ' ' + money(a) + ' · ' + T.loanB + ' ' + money(b) + '</span></div><div class="lc-bars"><div class="lc-bar a" style="width:' + Math.max(2, Math.min(100, Math.abs(a)/max*100)) + '%"></div><div class="lc-bar b" style="width:' + Math.max(2, Math.min(100, Math.abs(b)/max*100)) + '%"></div></div></div>');
  }
  function renderScheduleTable(schedule, label) {
    var rows = schedule.map(function (r) { return '<tr><td>'+r.period+'</td><td>'+money(r.openingBalance)+'</td><td>'+money(r.payment)+'</td><td>'+money(r.principal)+'</td><td>'+money(r.interest)+'</td><td>'+money(r.recurringFee)+'</td><td>'+money(r.closingBalance)+'</td></tr>'; }).join("");
    return '<table><caption>'+esc(label)+'</caption><thead><tr><th>'+T.period+'</th><th>'+T.opening+'</th><th>'+T.payment+'</th><th>'+T.principal+'</th><th>'+T.interest+'</th><th>'+T.recurring+'</th><th>'+T.closing+'</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function renderComparisonSchedule(a,b) {
    var max=Math.max(a.schedule.length,b.schedule.length), rows=[];
    for(var i=0;i<max;i+=1){ var x=a.schedule[i], y=b.schedule[i];
      rows.push('<tr class="lc-matrix-row"><th class="lc-period-cell" rowspan="2">'+(i+1)+'</th><th class="lc-loan-label lc-loan-a">'+T.loanA+'</th><td>'+(x?money(x.payment):'—')+'</td><td>'+(x?money(x.principal):'—')+'</td><td>'+(x?money(x.interest):'—')+'</td><td>'+(x?money(x.closingBalance):'—')+'</td></tr>'+
        '<tr class="lc-matrix-row"><th class="lc-loan-label lc-loan-b">'+T.loanB+'</th><td>'+(y?money(y.payment):'—')+'</td><td>'+(y?money(y.principal):'—')+'</td><td>'+(y?money(y.interest):'—')+'</td><td>'+(y?money(y.closingBalance):'—')+'</td></tr>'); }
    return '<table class="lc-comparison-table"><caption>'+T.comparisonCaption+'</caption><thead><tr><th>'+T.period+'</th><th>'+T.loan+'</th><th>'+T.payment+'</th><th>'+T.principal+'</th><th>'+T.interest+'</th><th>'+T.balance+'</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>';
  }
  function renderFeeBreakdown(a,b) {
    var names={processing:T.processing,application:T.application,documentation:T.documentation,legal:T.legal,valuation:T.valuation,insurance:T.insurance,broker:T.broker,otherUpfront:T.otherUpfront,prepayment:T.prepayment,otherCost:T.otherCost,recurringPerPeriod:T.recurringFees};
    var keys=Object.keys(names), html='<table><thead><tr><th>'+T.fee+'</th><th>'+T.loanA+'</th><th>'+T.loanB+'</th></tr></thead><tbody>';
    keys.forEach(function(key){var av=key==='recurringPerPeriod'?(a.feeBreakdown.recurring||0):(a.feeBreakdown[key]||0), bv=key==='recurringPerPeriod'?(b.feeBreakdown.recurring||0):(b.feeBreakdown[key]||0); html+='<tr><th>'+esc(names[key])+'</th><td>'+money(av)+'</td><td>'+money(bv)+'</td></tr>';});
    html+='<tr><th>'+T.totalFees+'</th><td><strong>'+money(a.totalFees)+'</strong></td><td><strong>'+money(b.totalFees)+'</strong></td></tr></tbody></table>';
    id('feeBreakdown').innerHTML=html;
  }
  function renderCumulativeChart(a,b){
    var max=Math.max(a.schedule.length,b.schedule.length), width=760,height=280,pad=34;
    if(!max){id('cumulativeCostChart').innerHTML='';return;}
    var maxCost=0,cumA=0,cumB=0,pointsA=[],pointsB=[];
    for(var i=0;i<max;i+=1){if(a.schedule[i])cumA+=a.schedule[i].totalOutflow;if(b.schedule[i])cumB+=b.schedule[i].totalOutflow;maxCost=Math.max(maxCost,cumA,cumB);pointsA.push([i,cumA]);pointsB.push([i,cumB]);}
    function path(points){return points.map(function(pt,idx){var x=pad+(pt[0]/Math.max(1,max-1))*(width-pad*2),y=height-pad-(pt[1]/Math.max(1,maxCost))*(height-pad*2);return(idx?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);}).join(' ');}
    var endA=pointsA[pointsA.length-1],endB=pointsB[pointsB.length-1];
    var svg='<svg viewBox="0 0 '+width+' '+height+'" class="lc-chart-svg" role="img" aria-label="'+esc(T.chartAria)+'"><line x1="'+pad+'" y1="'+(height-pad)+'" x2="'+(width-pad)+'" y2="'+(height-pad)+'" class="lc-chart-axis"/><line x1="'+pad+'" y1="'+pad+'" x2="'+pad+'" y2="'+(height-pad)+'" class="lc-chart-axis"/><path d="'+path(pointsA)+'" class="lc-chart-a"/><path d="'+path(pointsB)+'" class="lc-chart-b"/><circle cx="'+(pad+endA[0]/Math.max(1,max-1)*(width-pad*2))+'" cy="'+(height-pad-endA[1]/maxCost*(height-pad*2))+'" r="4" class="lc-chart-dot-a"/><circle cx="'+(pad+endB[0]/Math.max(1,max-1)*(width-pad*2))+'" cy="'+(height-pad-endB[1]/maxCost*(height-pad*2))+'" r="4" class="lc-chart-dot-b"/></svg><div class="lc-chart-legend"><span><i class="lc-dot-a"></i>'+T.loanA+'</span><span><i class="lc-dot-b"></i>'+T.loanB+'</span></div>';
    id('cumulativeCostChart').innerHTML=svg;
  }
  function render(result){
    state.comparison=result; var a=result.loanA,b=result.loanB;
    set('paymentA',money(a.payment));set('paymentB',money(b.payment));set('interestA',money(a.totalInterest));set('interestB',money(b.totalInterest));set('feesA',money(a.totalFees));set('feesB',money(b.totalFees));set('costA',money(a.totalCost));set('costB',money(b.totalCost));
    set('amountA',money(a.input.amount));set('amountB',money(b.input.amount));set('rateA',percent(a.input.annualRate));set('rateB',percent(b.input.annualRate));set('termA',duration(a.actualTermMonths));set('termB',duration(b.actualTermMonths));set('scheduledA',money(a.scheduledPayment));set('scheduledB',money(b.scheduledPayment));set('interestTableA',money(a.totalInterest));set('interestTableB',money(b.totalInterest));set('feesTableA',money(a.totalFees));set('feesTableB',money(b.totalFees));set('repaymentA',money(a.totalRepayment));set('repaymentB',money(b.totalRepayment));set('costTableA',money(a.totalCost));set('costTableB',money(b.totalCost));
    var costs=id('costBars'); if(costs){costs.innerHTML='';renderBar(costs,T.interestLabel,a.totalInterest,b.totalInterest);renderBar(costs,T.feesLabel,a.totalFees,b.totalFees);}
    var timeline=id('timelineCompare');if(timeline)timeline.innerHTML='<div class="lc-timeline-item"><strong>'+T.loanA+'</strong><span>'+duration(a.actualTermMonths)+'</span></div><div class="lc-timeline-item"><strong>'+T.loanB+'</strong><span>'+duration(b.actualTermMonths)+'</span></div>';
    var d=result.difference,lines=[];
    lines.push(result.lowerTotalCostLoan==='tie'?T.bothTotal:tr('totalLower',{loan:result.lowerTotalCostLoan,value:money(Math.abs(d.totalCost))}));
    lines.push(result.lowerPaymentLoan==='tie'?T.bothPayment:tr('paymentLower',{loan:result.lowerPaymentLoan,value:money(Math.abs(d.payment))}));
    lines.push(result.lowerInterestLoan==='tie'?T.bothInterest:tr('interestLower',{loan:result.lowerInterestLoan,value:money(Math.abs(d.interest))}));
    lines.push(result.lowerFeesLoan==='tie'?T.bothFees:tr('feesLower',{loan:result.lowerFeesLoan,value:money(Math.abs(d.fees))}));
    lines.push(result.shorterTermLoan==='tie'?T.bothTerm:tr('termLower',{loan:result.shorterTermLoan,value:duration(Math.abs(d.termMonths))}));
    id('comparisonSummary').innerHTML='<h3>'+ T.summaryHeading || 'What the numbers show' +'</h3>'+lines.map(function(x){return '<p>'+esc(x)+'</p>';}).join('')+'<p class="lc-disclaimer">'+T.disclaimer+'</p>';
    id('scheduleComparison').innerHTML=renderComparisonSchedule(a,b);id('scheduleA').innerHTML=renderScheduleTable(a.schedule,T.scheduleA);id('scheduleB').innerHTML=renderScheduleTable(b.schedule,T.scheduleB);renderFeeBreakdown(a,b);renderCumulativeChart(a,b);id('results').hidden=false;var exports=id('exportSection');if(exports)exports.hidden=false;
  }
  document.addEventListener('DOMContentLoaded',function(){setupCurrencyControl();var form=id('loanComparisonForm');if(!form||!window.EMIFORMULA_LOAN_COMPARISON)return;form.addEventListener('submit',function(event){event.preventDefault();var result=window.EMIFORMULA_LOAN_COMPARISON.compareLoans(loan('a'),loan('b'));if(!result.ok){showError(result.errors||['Please check the loan inputs.']);id('results').hidden=true;return;}showError([]);render(result);id('results').scrollIntoView({behavior:'auto',block:'start'});});});
  window.EMIFORMULA_LOAN_COMPARISON_UI={getComparison:function(){return state.comparison;},getLoanInputs:function(prefix){return loan(prefix);},getCurrency:function(){return {code:state.currency,symbol:currencyInfo().symbol,name:currencyInfo().name};}};
})();
