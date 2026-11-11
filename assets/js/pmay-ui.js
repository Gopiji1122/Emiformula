/* ==========================================================================
   EMIFORMULA — PMAY-URBAN 2.0 INTEREST SUBSIDY (ISS) UI & EXPORT CONTROLLER
   Supports 6 native languages: English (en), Hindi (hi), Marathi (mr),
   Gujarati (gu), Bengali (bn), Tamil (ta).
   ========================================================================== */

(function () {
  "use strict";

  var root = document.getElementById("pmayCalculator");
  if (!root || !window.EMIFORMULA_PMAY) return;

  var locale = document.documentElement.getAttribute("data-locale") || document.documentElement.lang || "en";

  var L10N = {
    en: {
      catEWS: "Category: EWS (Up to ₹3L)",
      catLIG: "Category: LIG (₹3L – ₹6L)",
      catMIG: "Category: MIG (₹6L – ₹9L)",
      catOver: "Exceeds ₹9 Lakh Cap",
      eligibleTitle: "✅ Eligible for PMAY-Urban 2.0 Interest Subsidy (ISS)",
      eligibleDesc: function (sub, inst) {
        return "You qualify for a total government subsidy of " + sub + ", credited directly to your loan principal in 5 equal annual installments of " + inst + ".";
      },
      ineligibleTitle: "❌ Not Eligible under PMAY-Urban 2.0 Rules",
      reasons: {
        invalid_input: "Please enter valid positive numbers for income, property price, loan amount, and tenure.",
        income_exceeded: "Annual household income exceeds the official ₹9,00,000 maximum limit.",
        property_exceeded: "Property value exceeds the official ₹35,00,000 ceiling.",
        loan_exceeded: "Home loan amount exceeds the official ₹25,00,000 maximum limit.",
        loan_gt_property: "Loan amount cannot exceed the total property value.",
        tenure_short: "Loan tenure must be more than 5 years to receive all 5 annual subsidy installments.",
        owns_pucca: "Families already owning a pucca house anywhere in India are ineligible.",
        no_female_owner: "Female ownership or co-ownership is mandatory under PMAY-Urban 2.0 (unless there is no adult female in the household).",
        carpet_exceeded: "House carpet area must not exceed 120 sq. metres (~1,291 sq. ft.)."
      },
      tenureSaved: function (months) {
        if (months <= 0) return "No tenure change";
        var yrs = Math.floor(months / 12);
        var rem = months % 12;
        var parts = [];
        if (yrs > 0) parts.push(yrs + (yrs === 1 ? " yr" : " yrs"));
        if (rem > 0) parts.push(rem + (rem === 1 ? " mo" : " mos"));
        return parts.join(" ") + " earlier payoff";
      },
      emiReduced: function (base, fin) {
        var diff = Math.max(0, base - fin);
        return diff > 0 ? ("Drops to " + formatMoney(fin) + "/mo after 5 credits") : "Unchanged";
      },
      yearPrefix: "Year ",
      monthPrefix: " (Month ",
      statusCredited: "Credited (Principal > 50%)",
      statusBelow50: "Skipped (Principal ≤ 50%)",
      statusClosed: "Loan Already Closed",
      copied: "Shareable calculation link copied to clipboard!",
      csvLoaded: "CSV schedule downloaded.",
      waTitle: "PMAY-Urban 2.0 Home Loan Subsidy Summary",
      waIncome: "Household Income",
      waProp: "Property Value",
      waLoan: "Home Loan",
      waSub: "Govt. Subsidy",
      waIntSaved: "Bank Interest Saved",
      waTotal: "Total Lifetime Savings",
      waEmi: "Monthly EMI",
      waTenure: "Payoff Time"
    },
    hi: {
      catEWS: "श्रेणी: EWS (₹3 लाख तक)",
      catLIG: "श्रेणी: LIG (₹3 – ₹6 लाख)",
      catMIG: "श्रेणी: MIG (₹6 – ₹9 लाख)",
      catOver: "₹9 लाख की सीमा से अधिक",
      eligibleTitle: "✅ बधाई हो! आप PMAY अर्बन 2.0 ब्याज सब्सिडी के लिए पात्र हैं",
      eligibleDesc: function (sub, inst) {
        return "आपको कुल " + sub + " की सरकारी सब्सिडी मिलेगी, जो " + inst + " की 5 बराबर सालाना किस्तों में सीधे आपके होम लोन मूलधन में जमा होगी।";
      },
      ineligibleTitle: "❌ PMAY अर्बन 2.0 नियमों के तहत पात्र नहीं",
      reasons: {
        invalid_input: "कृपया आय, मकान कीमत, लोन राशि और अवधि सही भरें।",
        income_exceeded: "परिवार की सालाना आय ₹9,00,000 की सरकारी सीमा से अधिक है।",
        property_exceeded: "मकान की कुल कीमत ₹35,00,000 की अधिकतम सीमा से ज्यादा है।",
        loan_exceeded: "होम लोन की राशि ₹25,00,000 की सरकारी सीमा से अधिक है।",
        loan_gt_property: "लोन की राशि मकान की कुल कीमत से अधिक नहीं हो सकती।",
        tenure_short: "सभी 5 वार्षिक किस्तें पाने के लिए लोन की अवधि 5 वर्ष से अधिक होनी चाहिए।",
        owns_pucca: "परिवार के नाम भारत में पहले से पक्का मकान होने पर यह सब्सिडी नहीं मिलती।",
        no_female_owner: "रजिस्ट्री में परिवार की महिला (पत्नी/माता) का नाम या सह-स्वामित्व अनिवार्य है।",
        carpet_exceeded: "मकान का कार्पेट एरिया 120 वर्ग मीटर (1,291 वर्ग फुट) से अधिक नहीं होना चाहिए।"
      },
      tenureSaved: function (months) {
        if (months <= 0) return "अवधि में कोई बदलाव नहीं";
        var yrs = Math.floor(months / 12);
        var rem = months % 12;
        var parts = [];
        if (yrs > 0) parts.push(yrs + " साल");
        if (rem > 0) parts.push(rem + " महीने");
        return parts.join(" ") + " पहले लोन खत्म";
      },
      emiReduced: function (base, fin) {
        var diff = Math.max(0, base - fin);
        return diff > 0 ? ("5 किस्तों बाद घटकर " + formatMoney(fin) + "/माह") : "कोई बदलाव नहीं";
      },
      yearPrefix: "वर्ष ",
      monthPrefix: " (माह ",
      statusCredited: "जमा (मूलधन 50% से अधिक बकाया)",
      statusBelow50: "रोकी गई (मूलधन 50% से कम बचा)",
      statusClosed: "लोन पहले ही समाप्त",
      copied: "गणना का लिंक कॉपी हो गया है!",
      csvLoaded: "CSV शेड्यूल डाउनलोड हो गया।",
      waTitle: "पीएम आवास योजना (PMAY 2.0) सब्सिडी हिसाब",
      waIncome: "पारिवारिक आय",
      waProp: "मकान की कीमत",
      waLoan: "होम लोन",
      waSub: "सरकारी सब्सिडी",
      waIntSaved: "बैंक ब्याज में बचत",
      waTotal: "कुल वित्तीय बचत",
      waEmi: "मासिक किस्त (EMI)",
      waTenure: "लोन अवधि"
    },
    mr: {
      catEWS: "गट: EWS (₹3 लाखापर्यंत)",
      catLIG: "गट: LIG (₹3 ते ₹6 लाख)",
      catMIG: "गट: MIG (₹6 ते ₹9 लाख)",
      catOver: "₹9 लाख मर्यादेपेक्षा जास्त",
      eligibleTitle: "✅ अभिनंदन! तुम्ही PMAY अर्बन 2.0 व्याज अनुदानासाठी पात्र आहात",
      eligibleDesc: function (sub, inst) {
        return "तुम्हाला एकूण " + sub + " सरकारी अनुदान मिळेल, जे दरवर्षी " + inst + " च्या 5 समान हप्त्यांमध्ये थेट तुमच्या कर्ज मुद्दलात जमा होईल.";
      },
      ineligibleTitle: "❌ PMAY अर्बन 2.0 नियमांनुसार अपात्र",
      reasons: {
        invalid_input: "कृपया उत्पन्न, घराची किंमत, कर्ज रक्कम आणि कालावधी योग्य भरा.",
        income_exceeded: "कुटुंबाचे वार्षिक उत्पन्न ₹9,00,000 च्या सरकारी मर्यादेपेक्षा जास्त आहे.",
        property_exceeded: "घराची एकूण किंमत ₹35,00,000 च्या कमाल मर्यादेपेक्षा जास्त आहे.",
        loan_exceeded: "गृहकर्जाची रक्कम ₹25,00,000 च्या मर्यादेपेक्षा जास्त आहे.",
        loan_gt_property: "कर्जाची रक्कम घराच्या एकूण किमतीपेक्षा जास्त असू शकत नाही.",
        tenure_short: "अनुदानाचे सर्व 5 हप्ते मिळण्यासाठी कर्जाची मुदत 5 वर्षांपेक्षा जास्त असावी.",
        owns_pucca: "भारतात कुठेही कुटुंबाच्या नावावर पक्के घर असल्यास या योजनेचा लाभ मिळत नाही.",
        no_female_owner: "घराच्या खरेदीखतावर महिलेचे नाव (एकटी किंवा संयुक्त मालकी) असणे बंधनकारक आहे.",
        carpet_exceeded: "घराचा कार्पेट एरिया 120 चौ. मीटर (1,291 चौ. फूट) पेक्षा जास्त नसावा."
      },
      tenureSaved: function (months) {
        if (months <= 0) return "कालावधीत बदल नाही";
        var yrs = Math.floor(months / 12);
        var rem = months % 12;
        var parts = [];
        if (yrs > 0) parts.push(yrs + " वर्षे");
        if (rem > 0) parts.push(rem + " महिने");
        return parts.join(" ") + " लवकर कर्जमुक्त";
      },
      emiReduced: function (base, fin) {
        var diff = Math.max(0, base - fin);
        return diff > 0 ? ("5 हप्त्यांनंतर कमी होऊन " + formatMoney(fin) + "/महिना") : "बदल नाही";
      },
      yearPrefix: "वर्ष ",
      monthPrefix: " (महिना ",
      statusCredited: "जमा (मुद्दल 50% पेक्षा जास्त बाकी)",
      statusBelow50: "थांबवले (मुद्दल 50% पेक्षा कमी)",
      statusClosed: "कर्ज आधीच पूर्ण",
      copied: "हिशेबाची लिंक कॉपी झाली आहे!",
      csvLoaded: "CSV तक्ता डाउनलोड झाला.",
      waTitle: "पीएम आवास योजना (PMAY 2.0) अनुदान हिशेब",
      waIncome: "कौटुंबिक उत्पन्न",
      waProp: "घराची किंमत",
      waLoan: "गृहकर्ज",
      waSub: "सरकारी अनुदान",
      waIntSaved: "बँक व्याजात बचत",
      waTotal: "एकूण आर्थिक फायदा",
      waEmi: "मासिक हप्ता (EMI)",
      waTenure: "कर्ज कालावधी"
    },
    gu: {
      catEWS: "શ્રેણી: EWS (₹3 લાખ સુધી)",
      catLIG: "શ્રેણી: LIG (₹3 થી ₹6 લાખ)",
      catMIG: "શ્રેણી: MIG (₹6 થી ₹9 લાખ)",
      catOver: "₹9 લાખની મર્યાદાથી વધુ",
      eligibleTitle: "✅ અભિનંદન! તમે PMAY અર્બન 2.0 વ્યાજ સબસિડી માટે પાત્ર છો",
      eligibleDesc: function (sub, inst) {
        return "તમને કુલ " + sub + " ની સરકારી સબસિડી મળશે, જે દર વર્ષે " + inst + " ના 5 સરખા હપ્તામાં સીધી તમારા હોમ લોનના મુદ્દલમાં જમા થશે.";
      },
      ineligibleTitle: "❌ PMAY અર્બન 2.0 ના નિયમો મુજબ અપાત્ર",
      reasons: {
        invalid_input: "કૃપા કરીને આવક, મકાનની કિંમત, લોન રકમ અને મુદત સાચી દાખલ કરો.",
        income_exceeded: "પરિવારની વાર્ષિક આવક ₹9,00,000 ની સરકારી મર્યાદા કરતાં વધુ છે.",
        property_exceeded: "મકાનની કુલ કિંમત ₹35,00,000 ની મહત્તમ મર્યાદા કરતાં વધારે છે.",
        loan_exceeded: "હોમ લોનની રકમ ₹25,00,000 ની મર્યાદા કરતાં વધારે છે.",
        loan_gt_property: "લોનની રકમ મકાનની કુલ કિંમત કરતાં વધુ ન હોઈ શકે.",
        tenure_short: "સબસિડીના 5 હપ્તા મેળવવા લોનની મુદત 5 વર્ષથી વધુ હોવી જરૂરી છે.",
        owns_pucca: "ભારતમાં ક્યાંય પણ પરિવારના નામે પાકું મકાન હોય તો આ યોજનાનો લાભ મળતો નથી.",
        no_female_owner: "દસ્તાવેજમાં પરિવારની મહિલા સભ્યનું નામ (સ્વતંત્ર અથવા સંયુક્ત) હોવું ફરજિયાત છે.",
        carpet_exceeded: "મકાનનો કાર્પેટ એરિયા 120 ચો. મીટર (1,291 ચો. ફૂટ) થી વધુ ન હોવો જોઈએ."
      },
      tenureSaved: function (months) {
        if (months <= 0) return "મુદતમાં કોઈ ફેરફાર નહીં";
        var yrs = Math.floor(months / 12);
        var rem = months % 12;
        var parts = [];
        if (yrs > 0) parts.push(yrs + " વર્ષ");
        if (rem > 0) parts.push(rem + " મહિના");
        return parts.join(" ") + " વહેલી લોન પૂરી";
      },
      emiReduced: function (base, fin) {
        var diff = Math.max(0, base - fin);
        return diff > 0 ? ("5 હપ્તા પછી ઘટીને " + formatMoney(fin) + "/મહિને") : "કોઈ ફેરફાર નહીં";
      },
      yearPrefix: "વર્ષ ",
      monthPrefix: " (મહિનો ",
      statusCredited: "જમા (50% થી વધુ મુદ્દલ બાકી)",
      statusBelow50: "અટકાવેલ (50% થી ઓછું મુદ્દલ)",
      statusClosed: "લોન પહેલેથી પૂર્ણ",
      copied: "ગણતરીની લિંક કોપી થઈ ગઈ છે!",
      csvLoaded: "CSV શેડ્યૂલ ડાઉનલોડ થયું.",
      waTitle: "પીએમ આવાસ યોજના (PMAY 2.0) સબસિડી હિસાબ",
      waIncome: "પારિવારિક આવક",
      waProp: "મકાનની કિંમત",
      waLoan: "હોમ લોન",
      waSub: "સરકારી સબસિડી",
      waIntSaved: "બેંક વ્યાજમાં બચત",
      waTotal: "કુલ નાણાકીય લાભ",
      waEmi: "માસિક હપ્તો (EMI)",
      waTenure: "લોન મુદત"
    },
    bn: {
      catEWS: "শ্রেণি: EWS (₹৩ লক্ষ পর্যন্ত)",
      catLIG: "শ্রেণি: LIG (₹৩ – ₹৬ লক্ষ)",
      catMIG: "শ্রেণি: MIG (₹৬ – ₹৯ লক্ষ)",
      catOver: "₹৯ লক্ষের সীমা অতিক্রম করেছে",
      eligibleTitle: "✅ অভিনন্দন! আপনি PMAY আরবান ২.০ সুদ ভর্তুকির জন্য যোগ্য",
      eligibleDesc: function (sub, inst) {
        return "আপনি মোট " + sub + " সরকারি ভর্তুকি পাবেন, যা বার্ষিক " + inst + " করে ৫টি সমান কিস্তিতে সরাসরি আপনার লোন আসল থেকে কমানো হবে।";
      },
      ineligibleTitle: "❌ PMAY আরবান ২.০ নিয়ম অনুযায়ী যোগ্য নন",
      reasons: {
        invalid_input: "অনুগ্রহ করে আয়, বাড়ির দাম, লোনের পরিমাণ এবং মেয়াদ সঠিকভাবে লিখুন।",
        income_exceeded: "পরিবারের বার্ষিক আয় সরকারি সর্বোচ্চ সীমা ₹৯,০০,০০০-এর বেশি।",
        property_exceeded: "বাড়ির মোট মূল্য সরকারি সীমা ₹৩৫,০০,০০০-এর বেশি।",
        loan_exceeded: "হোম লোনের পরিমাণ সর্বোচ্চ সীমা ₹২৫,০০,০০০-এর বেশি।",
        loan_gt_property: "লোনের পরিমাণ বাড়ির মোট মূল্যের চেয়ে বেশি হতে পারে না।",
        tenure_short: "৫টি বার্ষিক ভর্তুকি কিস্তি পেতে লোনের মেয়াদ ৫ বছরের বেশি হতে হবে।",
        owns_pucca: "ভারতের কোথাও পরিবারের নামে পাকা বাড়ি থাকলে এই প্রকল্পে ভর্তুকি পাওয়া যায় না।",
        no_female_owner: "বাড়ির দলিলে পরিবারের মহিলা সদস্যের নাম (একক বা যৌথ মালিকানা) থাকা বাধ্যতামূলক।",
        carpet_exceeded: "বাড়ির কার্পেট এরিয়া ১২০ বর্গ মিটার (১,২৯১ বর্গ ফুট)-এর বেশি হওয়া চলবে না।"
      },
      tenureSaved: function (months) {
        if (months <= 0) return "মেয়াদে কোনো পরিবর্তন নেই";
        var yrs = Math.floor(months / 12);
        var rem = months % 12;
        var parts = [];
        if (yrs > 0) parts.push(yrs + " বছর");
        if (rem > 0) parts.push(rem + " মাস");
        return parts.join(" ") + " আগে লোন শেষ";
      },
      emiReduced: function (base, fin) {
        var diff = Math.max(0, base - fin);
        return diff > 0 ? ("৫ কিস্তির পর কমে " + formatMoney(fin) + "/মাস") : "কোনো পরিবর্তন নেই";
      },
      yearPrefix: "বছর ",
      monthPrefix: " (মাস ",
      statusCredited: "জমা হয়েছে (আসল ৫০%-এর বেশি বাকি)",
      statusBelow50: "স্থগিত (আসল ৫০%-এর কম বাকি)",
      statusClosed: "লোন ইতিমধ্যেই শেষ",
      copied: "হিসাবের লিঙ্ক কপি করা হয়েছে!",
      csvLoaded: "CSV তালিকা ডাউনলোড হয়েছে।",
      waTitle: "পিএম আবাস যোজনা (PMAY 2.0) ভর্তুকি হিসাব",
      waIncome: "পারিবারিক আয়",
      waProp: "বাড়ির মূল্য",
      waLoan: "হোম লোন",
      waSub: "সরকারি ভর্তুকি",
      waIntSaved: "ব্যাংক সুদে সাশ্রয়",
      waTotal: "মোট আর্থিক সাশ্রয়",
      waEmi: "মাসিক কিস্তি (EMI)",
      waTenure: "লোনের মেয়াদ"
    },
    ta: {
      catEWS: "பிரிவு: EWS (₹3 லட்சம் வரை)",
      catLIG: "பிரிவு: LIG (₹3 – ₹6 லட்சம்)",
      catMIG: "பிரிவு: MIG (₹6 – ₹9 லட்சம்)",
      catOver: "₹9 லட்சம் வரம்பை தாண்டியது",
      eligibleTitle: "✅ வாழ்த்துகள்! PMAY நகர்ப்புற 2.0 வட்டி மானியத்திற்கு நீங்கள் தகுதியானவர்",
      eligibleDesc: function (sub, inst) {
        return "உங்களுக்கு மொத்தம் " + sub + " அரசு மானியம் கிடைக்கும். இது ஆண்டுக்கு " + inst + " வீதம் 5 சம தவணைகளில் நேரடியாக உங்கள் கடன் அசலில் வரவு வைக்கப்படும்.";
      },
      ineligibleTitle: "❌ PMAY நகர்ப்புற 2.0 விதிகளின்படி தகுதியில்லை",
      reasons: {
        invalid_input: "வருமானம், வீட்டின் விலை, கடன் தொகை மற்றும் காலத்தை சரியாக உள்ளிடவும்.",
        income_exceeded: "குடும்பத்தின் ஆண்டு வருமானம் அரசின் ₹9,00,000 வரம்பை விட அதிகமாக உள்ளது.",
        property_exceeded: "வீட்டின் மொத்த மதிப்பு அரசின் ₹35,00,000 உச்சவரம்பை விட அதிகமாக உள்ளது.",
        loan_exceeded: "வீட்டுக் கடன் தொகை ₹25,00,000 வரம்பை விட அதிகமாக உள்ளது.",
        loan_gt_property: "கடன் தொகை வீட்டின் மொத்த மதிப்பை விட அதிகமாக இருக்க முடியாது.",
        tenure_short: "5 ஆண்டு மானியத் தவணைகளைப் பெற கடன் காலம் 5 ஆண்டுகளுக்கு மேல் இருக்க வேண்டும்.",
        owns_pucca: "இந்தியாவில் எங்கும் குடும்ப உறுப்பினர் பெயரில் சொந்த পक्का (கான்கிரீட்) வீடு இருந்தால் தகுதியில்லை.",
        no_female_owner: "வீட்டுப் பத்திரத்தில் பெண் உறுப்பினரின் பெயர் (தனி அல்லது கூட்டு உரிமை) கட்டாயம் இருக்க வேண்டும்.",
        carpet_exceeded: "வீட்டின் கார்பெட் பரப்பளவு 120 சதுர மீட்டருக்கு (1,291 சதுர அடி) மிகாமல் இருக்க வேண்டும்."
      },
      tenureSaved: function (months) {
        if (months <= 0) return "காலத்தில் மாற்றமில்லை";
        var yrs = Math.floor(months / 12);
        var rem = months % 12;
        var parts = [];
        if (yrs > 0) parts.push(yrs + " வருடம்");
        if (rem > 0) parts.push(rem + " மாதம்");
        return parts.join(" ") + " முன்னதாக கடன் முடியும்";
      },
      emiReduced: function (base, fin) {
        var diff = Math.max(0, base - fin);
        return diff > 0 ? ("5 தவணைகளுக்குப் பிறகு " + formatMoney(fin) + "/மாதம்") : "மாற்றமில்லை";
      },
      yearPrefix: "ஆண்டு ",
      monthPrefix: " (மாதம் ",
      statusCredited: "வரவு (அசல் 50%-க்கு மேல் நிலுவை)",
      statusBelow50: "நிறுத்தம் (அசல் 50%-க்கும் குறைவு)",
      statusClosed: "கடன் ஏற்கனவே முடிந்தது",
      copied: "கணக்கீட்டு இணைப்பு நகலெடுக்கப்பட்டது!",
      csvLoaded: "CSV அட்டவணை பதிவிறக்கம் செய்யப்பட்டது.",
      waTitle: "பிரதம மந்திரி ஆவாஸ் யோஜனா (PMAY 2.0) மானியக் கணக்கு",
      waIncome: "குடும்ப வருமானம்",
      waProp: "வீட்டின் மதிப்பு",
      waLoan: "வீட்டுக் கடன்",
      waSub: "அரசு மானியம்",
      waIntSaved: "வங்கி வட்டி சேமிப்பு",
      waTotal: "மொத்த நிதிச் சேமிப்பு",
      waEmi: "மாதத் தவணை (EMI)",
      waTenure: "கடன் காலம்"
    }
  };

  var t = L10N[locale] || L10N.en;

  function el(id) {
    return document.getElementById(id);
  }

  function formatMoney(val) {
    var n = Math.round(Number(val) || 0);
    return "₹" + n.toLocaleString("en-IN");
  }

  var currentMode = "tenure";
  var lastResult = null;

  function syncPair(rangeId, numId, onChange) {
    var r = el(rangeId);
    var n = el(numId);
    if (!r || !n) return;

    r.addEventListener("input", function () {
      n.value = r.value;
      onChange();
    });

    n.addEventListener("input", function () {
      var v = Number(n.value);
      if (Number.isFinite(v) && v >= Number(r.min) && v <= Number(r.max)) {
        r.value = String(v);
      }
      onChange();
    });

    n.addEventListener("blur", function () {
      var v = Number(n.value);
      if (!Number.isFinite(v) || v < Number(n.min || 0)) {
        v = Number(n.min || r.min || 0);
      }
      if (n.max && v > Number(n.max)) {
        v = Number(n.max);
      }
      n.value = String(v);
      r.value = String(Math.min(Number(r.max), Math.max(Number(r.min), v)));
      onChange();
    });
  }

  function getInputs() {
    return {
      annualIncome: Number(el("pmayIncome").value) || 0,
      propertyValue: Number(el("pmayProperty").value) || 0,
      loanAmount: Number(el("pmayLoan").value) || 0,
      annualRate: Number(el("pmayRate").value) || 8.5,
      tenureYears: Number(el("pmayTenure").value) || 20,
      ownsPuccaHouse: el("pmayOwnHouse").value === "yes",
      hasFemaleOwner: el("pmayFemaleOwner").value === "yes",
      carpetUnder120: el("pmayCarpetArea").value === "yes",
      benefitMode: currentMode
    };
  }

  function render() {
    var inp = getInputs();
    var res = window.EMIFORMULA_PMAY.calculate(inp);
    lastResult = { input: inp, output: res };

    // Update category badge
    var catBadge = el("pmayCatBadge");
    if (catBadge) {
      if (res.category === "EWS") {
        catBadge.textContent = t.catEWS;
        catBadge.className = "pmay-cat-badge";
      } else if (res.category === "LIG") {
        catBadge.textContent = t.catLIG;
        catBadge.className = "pmay-cat-badge";
      } else if (res.category === "MIG") {
        catBadge.textContent = t.catMIG;
        catBadge.className = "pmay-cat-badge";
      } else {
        catBadge.textContent = t.catOver;
        catBadge.className = "pmay-cat-badge is-warn";
      }
    }

    // Status Banner
    var banner = el("pmayStatusBanner");
    var bannerTitle = el("pmayStatusTitle");
    var bannerDesc = el("pmayStatusDesc");
    if (banner && bannerTitle && bannerDesc) {
      if (res.isEligible) {
        banner.className = "pmay-status-banner";
        bannerTitle.textContent = t.eligibleTitle;
        bannerDesc.textContent = t.eligibleDesc(
          formatMoney(res.actualSubsidyReleased),
          formatMoney(res.yearlyInstallment)
        );
      } else {
        banner.className = "pmay-status-banner is-ineligible";
        bannerTitle.textContent = t.ineligibleTitle;
        var firstReason = res.reasons[0] || "invalid_input";
        bannerDesc.textContent = t.reasons[firstReason] || t.reasons.invalid_input;
      }
    }

    // KPI Cards
    if (el("pmayKpiTotalBenefit")) el("pmayKpiTotalBenefit").textContent = formatMoney(res.totalFinancialBenefit);
    if (el("pmayKpiSubsidy")) el("pmayKpiSubsidy").textContent = formatMoney(res.actualSubsidyReleased);
    if (el("pmayKpiYearly")) el("pmayKpiYearly").textContent = formatMoney(res.yearlyInstallment) + " × 5";
    if (el("pmayKpiInterestSaved")) el("pmayKpiInterestSaved").textContent = formatMoney(res.interestSaved);
    if (el("pmayKpiNpv")) el("pmayKpiNpv").textContent = formatMoney(res.npvSubsidy);

    // Before vs After Comparison
    if (el("pmayCompBaseEmi")) el("pmayCompBaseEmi").textContent = formatMoney(res.baseEmi);
    if (el("pmayCompBaseInt")) el("pmayCompBaseInt").textContent = formatMoney(res.baseTotalInterest);
    if (el("pmayCompBaseTenure")) el("pmayCompBaseTenure").textContent = res.originalMonths + " mos (" + Math.round(res.originalMonths / 12) + " yrs)";

    if (el("pmayCompSubEmi")) el("pmayCompSubEmi").textContent = formatMoney(res.finalEmi);
    if (el("pmayCompSubInt")) el("pmayCompSubInt").textContent = formatMoney(res.subTotalInterest);
    if (el("pmayCompSubTenure")) {
      if (currentMode === "tenure") {
        el("pmayCompSubTenure").textContent = res.actualMonths + " mos (" + t.tenureSaved(res.monthsSaved) + ")";
      } else {
        el("pmayCompSubTenure").textContent = t.emiReduced(res.baseEmi, res.finalEmi);
      }
    }

    // 5-Year Schedule Table
    var tbody = el("pmayScheduleBody");
    if (tbody) {
      tbody.innerHTML = "";
      res.installments.forEach(function (row) {
        var tr = document.createElement("tr");

        var tdYear = document.createElement("td");
        tdYear.textContent = t.yearPrefix + row.year + t.monthPrefix + row.month + ")";
        tr.appendChild(tdYear);

        var tdBefore = document.createElement("td");
        tdBefore.textContent = formatMoney(row.balanceBefore);
        tr.appendChild(tdBefore);

        var tdCredit = document.createElement("td");
        var span = document.createElement("span");
        span.className = "pmay-credit-pill";
        span.textContent = row.subsidyCredited > 0 ? ("− " + formatMoney(row.subsidyCredited)) : "₹0";
        tdCredit.appendChild(span);
        tr.appendChild(tdCredit);

        var tdAfter = document.createElement("td");
        tdAfter.textContent = formatMoney(row.balanceAfter);
        tr.appendChild(tdAfter);

        var tdStatus = document.createElement("td");
        tdStatus.textContent = row.status === "credited"
          ? t.statusCredited
          : row.status === "ineligible_50pct"
          ? t.statusBelow50
          : t.statusClosed;
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
      });
    }
  }

  // Bind sliders & number inputs
  syncPair("pmayIncomeRange", "pmayIncome", render);
  syncPair("pmayPropertyRange", "pmayProperty", render);
  syncPair("pmayLoanRange", "pmayLoan", render);
  syncPair("pmayRateRange", "pmayRate", render);
  syncPair("pmayTenureRange", "pmayTenure", render);

  ["pmayOwnHouse", "pmayFemaleOwner", "pmayCarpetArea"].forEach(function (id) {
    var s = el(id);
    if (s) s.addEventListener("change", render);
  });

  // Benefit mode toggle
  var modeTenureBtn = el("pmayModeTenure");
  var modeEmiBtn = el("pmayModeEmi");
  if (modeTenureBtn && modeEmiBtn) {
    modeTenureBtn.addEventListener("click", function () {
      currentMode = "tenure";
      modeTenureBtn.setAttribute("aria-pressed", "true");
      modeEmiBtn.setAttribute("aria-pressed", "false");
      render();
    });
    modeEmiBtn.addEventListener("click", function () {
      currentMode = "emi";
      modeEmiBtn.setAttribute("aria-pressed", "true");
      modeTenureBtn.setAttribute("aria-pressed", "false");
      render();
    });
  }

  // Calculate & Reset buttons
  if (el("pmayCalcBtn")) {
    el("pmayCalcBtn").addEventListener("click", render);
  }
  if (el("pmayResetBtn")) {
    el("pmayResetBtn").addEventListener("click", function () {
      // Form reset
      if (el("pmayIncome")) el("pmayIncome").value = "500000";
      if (el("pmayIncomeRange")) el("pmayIncomeRange").value = "500000";
      if (el("pmayProperty")) el("pmayProperty").value = "2800000";
      if (el("pmayPropertyRange")) el("pmayPropertyRange").value = "2800000";
      if (el("pmayLoan")) el("pmayLoan").value = "2000000";
      if (el("pmayLoanRange")) el("pmayLoanRange").value = "2000000";
      if (el("pmayRate")) el("pmayRate").value = "8.5";
      if (el("pmayRateRange")) el("pmayRateRange").value = "8.5";
      if (el("pmayTenure")) el("pmayTenure").value = "20";
      if (el("pmayTenureRange")) el("pmayTenureRange").value = "20";
      if (el("pmayOwnHouse")) el("pmayOwnHouse").value = "no";
      if (el("pmayFemaleOwner")) el("pmayFemaleOwner").value = "yes";
      if (el("pmayCarpetArea")) el("pmayCarpetArea").value = "yes";
      currentMode = "tenure";
      if (modeTenureBtn && modeEmiBtn) {
        modeTenureBtn.setAttribute("aria-pressed", "true");
        modeEmiBtn.setAttribute("aria-pressed", "false");
      }
      try { if (history.replaceState) history.replaceState(null, "", location.pathname); } catch (e) {}
      if (el("pmayExportStatus")) el("pmayExportStatus").textContent = "";
      render();
    });
  }

  // Export: Print / PDF
  if (el("pmayBtnPrint")) {
    el("pmayBtnPrint").addEventListener("click", function () {
      window.print();
    });
  }

  // Export: CSV
  if (el("pmayBtnCsv")) {
    el("pmayBtnCsv").addEventListener("click", function () {
      if (!lastResult) return;
      var rows = [
        ["Year", "Month", "Principal Before Credit", "Government Subsidy Credited", "Principal After Credit", "Status"]
      ];
      lastResult.output.installments.forEach(function (r) {
        rows.push([
          r.year,
          r.month,
          r.balanceBefore,
          r.subsidyCredited,
          r.balanceAfter,
          r.status
        ]);
      });
      var csvContent = "\ufeff" + rows.map(function (row) {
        return row.map(function (cell) {
          return '"' + String(cell).replace(/"/g, '""') + '"';
        }).join(",");
      }).join("\r\n");

      var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "emiformula-pmay-urban-2-subsidy-schedule.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      if (el("pmayExportStatus")) el("pmayExportStatus").textContent = t.csvLoaded;
    });
  }

  // Export: WhatsApp
  if (el("pmayBtnWhatsApp")) {
    el("pmayBtnWhatsApp").addEventListener("click", function () {
      if (!lastResult) return;
      var inp = lastResult.input;
      var out = lastResult.output;
      var text =
        "*" + t.waTitle + "*\n" +
        t.waIncome + ": " + formatMoney(inp.annualIncome) + " (" + out.category + ")\n" +
        t.waProp + ": " + formatMoney(inp.propertyValue) + "\n" +
        t.waLoan + ": " + formatMoney(inp.loanAmount) + " @ " + inp.annualRate + "%\n" +
        "--------------------------\n" +
        t.waSub + ": " + formatMoney(out.actualSubsidyReleased) + " (" + formatMoney(out.yearlyInstallment) + " × 5)\n" +
        t.waIntSaved + ": " + formatMoney(out.interestSaved) + "\n" +
        "*" + t.waTotal + ": " + formatMoney(out.totalFinancialBenefit) + "*\n" +
        t.waEmi + ": " + formatMoney(out.finalEmi) + "\n" +
        t.waTenure + ": " + out.actualMonths + " months\n" +
        "Calculated via " + window.location.href.split("#")[0];
      window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  }

  // Export: Copy Link
  if (el("pmayBtnShare")) {
    el("pmayBtnShare").addEventListener("click", function () {
      var inp = getInputs();
      var u = new URL(window.location.href);
      u.searchParams.set("inc", inp.annualIncome);
      u.searchParams.set("prop", inp.propertyValue);
      u.searchParams.set("loan", inp.loanAmount);
      u.searchParams.set("rate", inp.annualRate);
      u.searchParams.set("yrs", inp.tenureYears);
      u.searchParams.set("mode", inp.benefitMode);
      var shareUrl = u.toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(function () {
          if (el("pmayExportStatus")) el("pmayExportStatus").textContent = t.copied;
        });
      }
    });
  }

  // Load URL parameters if present
  function loadFromUrl() {
    var u = new URL(window.location.href);
    var map = [
      ["inc", "pmayIncome", "pmayIncomeRange"],
      ["prop", "pmayProperty", "pmayPropertyRange"],
      ["loan", "pmayLoan", "pmayLoanRange"],
      ["rate", "pmayRate", "pmayRateRange"],
      ["yrs", "pmayTenure", "pmayTenureRange"]
    ];
    map.forEach(function (item) {
      var val = u.searchParams.get(item[0]);
      if (val !== null && Number.isFinite(Number(val))) {
        if (el(item[1])) el(item[1]).value = val;
        if (el(item[2])) el(item[2]).value = val;
      }
    });
    var modeParam = u.searchParams.get("mode");
    if (modeParam === "emi" && modeEmiBtn && modeTenureBtn) {
      currentMode = "emi";
      modeEmiBtn.setAttribute("aria-pressed", "true");
      modeTenureBtn.setAttribute("aria-pressed", "false");
    }
  }

  loadFromUrl();
  render();
})();
