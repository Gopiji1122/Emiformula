(function () {
  "use strict";
  var cfg = window.EMIFORMULA_PERSONAL_LOAN_CONFIG;
  var engine = window.EMIFORMULA_PERSONAL_LOAN;
  if (!cfg || !engine) return;

  var $ = function (id) { return document.getElementById(id); };
  var money = function (v) { return Number(v || 0).toLocaleString("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }); };
  var num = function (v) { return Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits:0 }); };
  var pct = function (v) { return Number(v || 0).toFixed(2) + "%"; };
  var duration = function (m) { var y=Math.floor(m/12), r=m%12; return y ? y+"y"+(r?" "+r+"m":"") : r+"m"; };

  var ids = ["loan-amount","loan-rate","loan-years","loan-fee","loan-insurance","loan-extra","loan-prepayment","loan-prepayment-month"];
  var ranges = ["loan-amount-range","loan-rate-range","loan-years-range","loan-fee-range","loan-extra-range","loan-prepayment-range"];

  function setValue(id, value) { var el=$(id); if(el) el.value=value; }
  function get(id) { var el=$(id); return el ? Number(el.value) : 0; }
  function syncRange(rangeId, inputId) { var r=$(rangeId), i=$(inputId); if(r&&i) r.value=i.value; }
  function syncInput(inputId, rangeId) { var i=$(inputId), r=$(rangeId); if(i&&r) i.value=r.value; }

  function update() {
    var years = get("loan-years");
    var result = engine.calculate({
      amount:get("loan-amount"), annualRate:get("loan-rate"), months:years*12,
      processingFeePercent:get("loan-fee"), insurance:get("loan-insurance"),
      extraMonthly:get("loan-extra"), prepayment:get("loan-prepayment"), prepaymentMonth:get("loan-prepayment-month")
    });
    if (!result) return;

    $("loan-amount-value").textContent=money(result.amount);
    $("loan-rate-value").textContent=pct(result.annualRate);
    $("loan-years-value").textContent=years+" years";
    $("loan-fee-value").textContent=pct(result.processingFeePercent);
    $("loan-emi").textContent=money(result.emi);
    $("loan-net").textContent=money(result.netReceived);
    $("loan-interest").textContent=money(result.totalInterest);
    $("loan-repayment").textContent=money(result.totalRepayment);
    $("loan-fee-result").textContent=money(result.processingFee);
    $("loan-effective").textContent=pct(result.effectiveCostPercent);
    $("loan-cost").textContent=money(result.totalBorrowingCost);
    $("loan-months").textContent=duration(result.actualMonths);
    $("loan-saved").textContent=result.monthsSaved+" months / "+money(result.interestSaved);

    var interestShare=result.interestShare;
    var donut=$("loan-donut");
    if(donut) donut.style.background="conic-gradient(var(--loan-accent) 0 "+Math.max(0,Math.min(100,result.principalShare))+"%, var(--loan-gold) "+Math.max(0,Math.min(100,result.principalShare))+"% 100%)";
    $("loan-principal-bar").style.width=Math.max(0,Math.min(100,result.principalShare))+"%";
    $("loan-interest-bar").style.width=Math.max(0,Math.min(100,interestShare))+"%";

    var progress=Math.min(100,(result.actualMonths/result.plannedMonths)*100);
    $("loan-timeline-fill").style.width=progress+"%";
    $("loan-timeline-start").textContent="Month 1";
    $("loan-timeline-end").textContent="Payoff: "+duration(result.actualMonths);

    renderRates(result); renderTenures(result); renderYearly(result);
    document.querySelectorAll(".loan-kpi").forEach(function(el){el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");});
  }

  function renderRates(result){
    var rows=engine.compareRate({amount:result.amount,rate:result.annualRate,months:result.plannedMonths,feePercent:result.processingFeePercent});
    var max=Math.max.apply(null,rows.map(function(x){return x.interest;}))||1;
    $("rate-table-body").innerHTML=rows.map(function(x){return '<tr class="'+(Math.abs(x.rate-result.annualRate)<.001?'current':'')+'"><td>'+x.rate.toFixed(2)+'%</td><td>'+money(x.emi)+'</td><td>'+money(x.interest)+'</td><td>'+money(x.total)+'</td></tr>';}).join("");
    $("rate-bars").innerHTML=rows.map(function(x){return '<div class="loan-bar-row"><span>'+x.rate.toFixed(1)+'%</span><div class="loan-bar-track"><i style="width:'+((x.interest/max)*100).toFixed(1)+'%"></i></div><strong>'+money(x.interest)+'</strong></div>';}).join("");
  }

  function renderTenures(result){
    var rows=engine.tenureCompare({amount:result.amount,rate:result.annualRate,years:result.plannedMonths/12});
    var max=Math.max.apply(null,rows.map(function(x){return x.interest;}))||1;
    $("tenure-bars").innerHTML=rows.map(function(x){return '<div class="loan-bar-row"><span>'+x.years+'y</span><div class="loan-bar-track"><i style="width:'+((x.interest/max)*100).toFixed(1)+'%"></i></div><strong>'+money(x.emi)+'</strong></div>';}).join("");
  }

  function renderYearly(result){
    var tbody=$("yearly-body"); if(!tbody) return;
    tbody.innerHTML=result.yearlySummary.map(function(x){return '<tr><td>Year '+x.year+'</td><td>'+money(x.payment)+'</td><td>'+money(x.principal)+'</td><td>'+money(x.interest)+'</td><td>'+money(x.closingBalance)+'</td></tr>';}).join("");
  }

  function reset(){
    setValue("loan-amount",cfg.defaults.amount); setValue("loan-rate",cfg.defaults.annualRate); setValue("loan-years",cfg.defaults.years); setValue("loan-fee",cfg.defaults.processingFeePercent); setValue("loan-insurance",cfg.defaults.insurance); setValue("loan-extra",cfg.defaults.extraMonthly); setValue("loan-prepayment",cfg.defaults.prepayment); setValue("loan-prepayment-month",cfg.defaults.prepaymentMonth);
    syncRange("loan-amount-range","loan-amount"); syncRange("loan-rate-range","loan-rate"); syncRange("loan-years-range","loan-years"); syncRange("loan-fee-range","loan-fee"); syncRange("loan-extra-range","loan-extra"); syncRange("loan-prepayment-range","loan-prepayment"); update();
  }

  document.addEventListener("DOMContentLoaded",function(){
    ranges.forEach(function(rid){var r=$(rid); if(!r)return; var input=r.replace("-range",""); r.addEventListener("input",function(){syncInput(input,rid);update();});});
    ids.forEach(function(id){var el=$(id); if(!el)return; el.addEventListener("input",function(){
      var range=id+"-range"; if($(range)) syncRange(range,id); update();
    });});
    $("loan-calculate").addEventListener("click",update); $("loan-reset").addEventListener("click",reset);
    document.querySelectorAll("[data-loan-preset]").forEach(function(btn){btn.addEventListener("click",function(){setValue("loan-amount",btn.getAttribute("data-loan-preset"));syncRange("loan-amount-range","loan-amount");document.querySelectorAll("[data-loan-preset]").forEach(function(b){b.classList.remove("active")});btn.classList.add("active");update();});});
    update();
  });
})();
