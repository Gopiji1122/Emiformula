/* ==========================================================================
   EMIFORMULA — PMAY-URBAN 2.0 INTEREST SUBSIDY (ISS) CALCULATION ENGINE
   Verified against Ministry of Housing and Urban Affairs (MoHUA) PMAY-U 2.0
   Guidelines (effective 01 September 2024).
   ========================================================================== */

(function () {
  "use strict";

  var MAX_INCOME = 900000;
  var MAX_PROPERTY_VALUE = 3500000;
  var MAX_LOAN_ELIGIBLE = 2500000;
  var SUBSIDY_LOAN_CAP = 800000;
  var SUBSIDY_RATE = 4.0;
  var DISCOUNT_RATE = 8.5;
  var MAX_SUBSIDY_TENURE_YEARS = 12;
  var MAX_NPV_SUBSIDY = 150000;
  var MAX_GROSS_SUBSIDY = 180000;
  var INSTALLMENTS_COUNT = 5;

  function calcMonthlyEmi(principal, annualRate, months) {
    if (principal <= 0 || months <= 0) return 0;
    var r = annualRate / 1200;
    if (r <= 0) return principal / months;
    var factor = Math.pow(1 + r, months);
    return (principal * r * factor) / (factor - 1);
  }

  function getIncomeCategory(annualIncome) {
    if (annualIncome <= 300000) return "EWS";
    if (annualIncome <= 600000) return "LIG";
    if (annualIncome <= 900000) return "MIG";
    return "ABOVE_LIMIT";
  }

  function computeSubsidyNpv(loanAmount, tenureYears) {
    var eligiblePrincipal = Math.min(Math.max(0, loanAmount), SUBSIDY_LOAN_CAP);
    var subMonths = Math.min(Math.max(0, Math.round(tenureYears * 12)), MAX_SUBSIDY_TENURE_YEARS * 12);
    if (eligiblePrincipal <= 0 || subMonths <= 0) {
      return { npv: 0, grossSubsidy: 0, yearlyInstallment: 0 };
    }

    var rSub = SUBSIDY_RATE / 1200;
    var rDisc = DISCOUNT_RATE / 1200;
    var subEmi = calcMonthlyEmi(eligiblePrincipal, SUBSIDY_RATE, subMonths);
    var balance = eligiblePrincipal;
    var npvSum = 0;

    for (var m = 1; m <= subMonths; m++) {
      var interestPart = balance * rSub;
      var principalPart = Math.min(balance, subEmi - interestPart);
      npvSum += interestPart / Math.pow(1 + rDisc, m);
      balance = Math.max(0, balance - principalPart);
    }

    var cappedNpv = Math.min(MAX_NPV_SUBSIDY, Math.round(npvSum));
    var scaleRatio = cappedNpv / MAX_NPV_SUBSIDY;
    var grossSubsidy = Math.min(MAX_GROSS_SUBSIDY, Math.round((MAX_GROSS_SUBSIDY * scaleRatio) / 10) * 10);
    if (eligiblePrincipal >= SUBSIDY_LOAN_CAP && tenureYears >= MAX_SUBSIDY_TENURE_YEARS) {
      cappedNpv = MAX_NPV_SUBSIDY;
      grossSubsidy = MAX_GROSS_SUBSIDY;
    }

    var yearlyInstallment = Math.round(grossSubsidy / INSTALLMENTS_COUNT);
    return {
      npv: cappedNpv,
      grossSubsidy: grossSubsidy,
      yearlyInstallment: yearlyInstallment
    };
  }

  function simulateAmortization(principal, annualRate, totalMonths, yearlyInstallment, mode, isEligible) {
    var r = annualRate / 1200;
    var baseEmi = calcMonthlyEmi(principal, annualRate, totalMonths);

    // Baseline without subsidy
    var baseTotalPayment = baseEmi * totalMonths;
    var baseTotalInterest = Math.max(0, baseTotalPayment - principal);

    if (!isEligible || yearlyInstallment <= 0) {
      return {
        baseEmi: baseEmi,
        finalEmi: baseEmi,
        baseTotalInterest: baseTotalInterest,
        subTotalInterest: baseTotalInterest,
        interestSaved: 0,
        totalSubsidyCredited: 0,
        totalBenefit: 0,
        originalMonths: totalMonths,
        actualMonths: totalMonths,
        monthsSaved: 0,
        installments: []
      };
    }

    var creditMonths = { 12: 1, 24: 2, 36: 3, 48: 4, 60: 5 };
    var balance = principal;
    var currentEmi = baseEmi;
    var subTotalInterest = 0;
    var totalSubsidyCredited = 0;
    var actualMonths = 0;
    var installments = [];

    for (var m = 1; m <= totalMonths; m++) {
      if (balance <= 0.01) break;
      actualMonths = m;

      var interest = balance * r;
      subTotalInterest += interest;
      var payment = Math.min(balance + interest, currentEmi);
      var principalPaid = payment - interest;
      balance = Math.max(0, balance - principalPaid);

      var instIndex = creditMonths[m];
      if (instIndex) {
        var beforeCredit = balance;
        var overHalfOutstanding = beforeCredit > (principal * 0.50);
        var activeLoan = beforeCredit > 0;
        var credited = 0;
        var statusKey = "ineligible_50pct";

        if (activeLoan && overHalfOutstanding) {
          credited = Math.min(beforeCredit, yearlyInstallment);
          balance = Math.max(0, beforeCredit - credited);
          totalSubsidyCredited += credited;
          statusKey = "credited";

          if (mode === "emi" && balance > 0 && m < totalMonths) {
            currentEmi = calcMonthlyEmi(balance, annualRate, totalMonths - m);
          }
        } else if (!activeLoan) {
          statusKey = "closed";
        }

        installments.push({
          year: instIndex,
          month: m,
          balanceBefore: Math.round(beforeCredit),
          subsidyCredited: Math.round(credited),
          balanceAfter: Math.round(balance),
          outstandingPct: Number(((beforeCredit / principal) * 100).toFixed(1)),
          emiAfter: Math.round(currentEmi),
          status: statusKey
        });
      }
    }

    // Fill any remaining installments up to 5 if loan closed earlier
    for (var y = installments.length + 1; y <= INSTALLMENTS_COUNT; y++) {
      installments.push({
        year: y,
        month: y * 12,
        balanceBefore: 0,
        subsidyCredited: 0,
        balanceAfter: 0,
        outstandingPct: 0,
        emiAfter: 0,
        status: "closed"
      });
    }

    var interestSaved = Math.max(0, baseTotalInterest - subTotalInterest);
    var totalBenefit = totalSubsidyCredited + interestSaved;

    return {
      baseEmi: Math.round(baseEmi),
      finalEmi: Math.round(currentEmi),
      baseTotalInterest: Math.round(baseTotalInterest),
      subTotalInterest: Math.round(subTotalInterest),
      interestSaved: Math.round(interestSaved),
      totalSubsidyCredited: Math.round(totalSubsidyCredited),
      totalBenefit: Math.round(totalBenefit),
      originalMonths: totalMonths,
      actualMonths: actualMonths,
      monthsSaved: Math.max(0, totalMonths - actualMonths),
      installments: installments
    };
  }

  function calculate(input) {
    var annualIncome = Number(input.annualIncome) || 0;
    var propertyValue = Number(input.propertyValue) || 0;
    var loanAmount = Number(input.loanAmount) || 0;
    var annualRate = Number(input.annualRate) || 8.5;
    var tenureYears = Number(input.tenureYears) || 20;
    var ownsPuccaHouse = Boolean(input.ownsPuccaHouse);
    var hasFemaleOwner = input.hasFemaleOwner !== false;
    var carpetUnder120 = input.carpetUnder120 !== false;
    var benefitMode = input.benefitMode === "emi" ? "emi" : "tenure";

    var reasons = [];
    if (annualIncome <= 0 || propertyValue <= 0 || loanAmount <= 0 || annualRate <= 0 || tenureYears <= 0) {
      reasons.push("invalid_input");
    }
    if (annualIncome > MAX_INCOME) {
      reasons.push("income_exceeded");
    }
    if (propertyValue > MAX_PROPERTY_VALUE) {
      reasons.push("property_exceeded");
    }
    if (loanAmount > MAX_LOAN_ELIGIBLE) {
      reasons.push("loan_exceeded");
    }
    if (loanAmount > propertyValue) {
      reasons.push("loan_gt_property");
    }
    if (tenureYears <= 5) {
      reasons.push("tenure_short");
    }
    if (ownsPuccaHouse) {
      reasons.push("owns_pucca");
    }
    if (!hasFemaleOwner) {
      reasons.push("no_female_owner");
    }
    if (!carpetUnder120) {
      reasons.push("carpet_exceeded");
    }

    var isEligible = reasons.length === 0;
    var category = getIncomeCategory(annualIncome);
    var subCalc = isEligible ? computeSubsidyNpv(loanAmount, tenureYears) : { npv: 0, grossSubsidy: 0, yearlyInstallment: 0 };
    var sim = simulateAmortization(
      loanAmount,
      annualRate,
      Math.round(tenureYears * 12),
      subCalc.yearlyInstallment,
      benefitMode,
      isEligible
    );

    return {
      isEligible: isEligible,
      reasons: reasons,
      category: category,
      eligibleLoanPortion: isEligible ? Math.min(loanAmount, SUBSIDY_LOAN_CAP) : 0,
      npvSubsidy: subCalc.npv,
      maxGrossSubsidy: subCalc.grossSubsidy,
      yearlyInstallment: subCalc.yearlyInstallment,
      actualSubsidyReleased: sim.totalSubsidyCredited,
      interestSaved: sim.interestSaved,
      totalFinancialBenefit: sim.totalBenefit,
      baseEmi: sim.baseEmi,
      finalEmi: sim.finalEmi,
      baseTotalInterest: sim.baseTotalInterest,
      subTotalInterest: sim.subTotalInterest,
      originalMonths: sim.originalMonths,
      actualMonths: sim.actualMonths,
      monthsSaved: sim.monthsSaved,
      installments: sim.installments,
      benefitMode: benefitMode
    };
  }

  window.EMIFORMULA_PMAY = Object.freeze({
    calculate: calculate,
    computeSubsidyNpv: computeSubsidyNpv,
    getIncomeCategory: getIncomeCategory
  });
})();
