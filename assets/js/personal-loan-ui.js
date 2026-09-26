(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var cfg = window.EMIFORMULA_PERSONAL_LOAN_CONFIG;
    var engine = window.EMIFORMULA_PERSONAL_LOAN;
    if (!cfg || !engine) {
      var err = document.getElementById("loan-error");
      if (err) err.textContent = "Calculator could not initialize. Please refresh the page.";
      return;
    }

    var $ = function (id) { return document.getElementById(id); };
    var money = function (v) { return Number(v || 0).toLocaleString("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }); };
    var pct = function (v) { return Number(v || 0).toFixed(2) + "%"; };
    var duration = function (m) { var y=Math.floor(m/12), r=m%12; return y ? y+"y"+(r?" "+r+"m":"") : r+"m"; };
    var clamp = function (v,min,max) { return Math.min(max,Math.max(min,Number(v)||0)); };

    function set(id, value) { var el=$(id); if(el) el.value=value; }
    function get(id) { var el=$(id); return el ? Number(el.value) : 0; }
    function syncRange(inputId, rangeId) { var i=$(inputId), r=$(rangeId); if(i&&r){ var v=Number(i.value)||0; r.value=clamp(v,Number(r.min),Number(r.max)); } }
    function syncInput(rangeId, inputId) { var r=$(rangeId), i=$(inputId); if(r&&i) i.value=r.value; }

    function showError(message) { var el=$("loan-error"); if(el) el.textContent=message||""; }

    function update() {
      var amount=clamp(get("loan-amount"),cfg.limits.amount.min,cfg.limits.amount.max);
      var rate=clamp(get("loan-rate"),cfg.limits.annualRate.min,cfg.limits.annualRate.max);
      var years=clamp(get("loan-years"),cfg.limits.years.min,cfg.limits.years.max);
      var fee=clamp(get("loan-fee"),cfg.limits.processingFeePercent.min,cfg.limits.processingFeePercent.max);
      var insurance=clamp(get("loan-insurance"),cfg.limits.insurance.min,cfg.limits.insurance.max);
      var extra=clamp(get("loan-extra"),cfg.limits.extraMonthly.min,cfg.limits.extraMonthly.max);
      var prepayment=clamp(get("loan-prepayment"),cfg.limits.prepayment.min,cfg.limits.prepayment.max);
      var prepayMonth=clamp(get("loan-prepayment-month"),cfg.limits.prepaymentMonth.min,cfg.limits.prepaymentMonth.max);
      set("loan-amount",amount); set("loan-rate",rate); set("loan-years",years); set("loan-fee",fee); set("loan-insurance",insurance); set("loan-extra",extra); set("loan-prepayment",prepayment); set("loan-prepayment-month",prepayMonth);
      syncRange("loan-amount","loan-amount-range"); syncRange("loan-rate","loan-rate-range"); syncRange("loan-years","loan-years-range"); syncRange("loan-fee","loan-fee-range"); syncRange("loan-extra","loan-extra-range"); syncRange("loan-prepayment","loan-prepayment-range");

      var result=engine.calculate({amount:amount,annualRate:rate,months:years*12,processingFeePercent:fee,insurance:insurance,extraMonthly:extra,prepayment:prepayment,prepaymentMonth:prepayMonth});
      if(!result){ showError("Enter valid loan values to calculate."); return; }
      showError("");

      $("loan-amount-value").textContent=money(result.amount); $("loan-rate-value").textContent=pct(result.annualRate); $("loan-years-value").textContent=years+" "+(years===1?"year":"years"); $("loan-fee-value").textContent=pct(result.processingFeePercent);
      $("loan-emi").textContent=money(result.emi); $("loan-net").textContent=money(result.netReceived); $("loan-interest-kpi").textContent=money(result.totalInterest); $("loan-repayment").textContent=money(result.amount); $("loan-interest-result").textContent=money(result.totalInterest); $("loan-fee-result").textContent=money(result.processingFee); $("loan-insurance-result").textContent=money(result.insurance); $("loan-effective").textContent=pct(result.effectiveCostPercent); $("loan-cost").textContent=money(result.totalBorrowingCost); $("loan-outflow").textContent=money(result.totalOutflow);
      $("loan-months").textContent=duration(result.actualMonths); $("loan-saved").textContent=result.monthsSaved+" months / "+money(result.interestSaved);

      var principalShare=Math.max(0,Math.min(100,result.principalShare)), interestShare=Math.max(0,Math.min(100,result.interestShare));
      $("loan-donut").style.background="conic-gradient(var(--loan-accent) 0 "+principalShare+"%,var(--loan-gold) "+principalShare+"% 100%)";
      $("loan-principal-bar").style.width=principalShare+"%"; $("loan-interest-bar").style.width=interestShare+"%";
      $("loan-timeline-fill").style.width=Math.min(100,(result.actualMonths/result.plannedMonths)*100)+"%"; $("loan-timeline-end").textContent="Payoff: "+duration(result.actualMonths);

      renderRates(result); renderTenures(result); renderYearly(result); renderBalance(result);
      document.querySelectorAll(".loan-kpi").forEach(function(el){el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");});
    }

    function renderRates(result){
      var rows=engine.compareRate({amount:result.amount,rate:result.annualRate,months:result.plannedMonths,feePercent:result.processingFeePercent}); var max=Math.max.apply(null,rows.map(function(x){return x.interest;}))||1;
      $("rate-table-body").innerHTML=rows.map(function(x){return '<tr class="'+(Math.abs(x.rate-result.annualRate)<.001?'current':'')+'"><td>'+x.rate.toFixed(2)+'%</td><td>'+money(x.emi)+'</td><td>'+money(x.interest)+'</td><td>'+money(x.total)+'</td></tr>';}).join("");
      $("rate-bars").innerHTML=rows.map(function(x){return '<div class="loan-bar-row"><span>'+x.rate.toFixed(1)+'%</span><div class="loan-bar-track"><i style="width:'+((x.interest/max)*100).toFixed(1)+'%"></i></div><strong>'+money(x.interest)+'</strong></div>';}).join("");
    }
    function renderTenures(result){
      var rows=engine.tenureCompare({amount:result.amount,rate:result.annualRate,years:result.plannedMonths/12}); var max=Math.max.apply(null,rows.map(function(x){return x.interest;}))||1;
      $("tenure-bars").innerHTML=rows.map(function(x){return '<div class="loan-bar-row"><span>'+x.years+'y</span><div class="loan-bar-track"><i style="width:'+((x.interest/max)*100).toFixed(1)+'%"></i></div><strong>'+money(x.emi)+'</strong></div>';}).join("");
    }
    function renderYearly(result){ $("yearly-body").innerHTML=result.yearlySummary.map(function(x){return '<tr><td>Year '+x.year+'</td><td>'+money(x.payment)+'</td><td>'+money(x.principal)+'</td><td>'+money(x.interest)+'</td><td>'+money(x.closingBalance)+'</td></tr>';}).join(""); }
    function renderBalance(result){
      var rows=result.schedule, svg=$("balance-chart"); if(!svg||!rows.length)return;
      var width=760,height=210,pad=30, max=rows[0].openingBalance||1, points=[];
      rows.forEach(function(row,i){var x=pad+(i/Math.max(1,rows.length-1))*(width-pad*2);var y=height-pad-(row.closingBalance/max)*(height-pad*2);points.push(x.toFixed(1)+","+y.toFixed(1));});
      var line=points.join(" "), area=pad+","+(height-pad)+" "+line+" "+(width-pad)+","+(height-pad);
      svg.innerHTML='<line class="loan-chart-grid" x1="30" y1="30" x2="730" y2="30"></line><line class="loan-chart-grid" x1="30" y1="105" x2="730" y2="105"></line><line class="loan-chart-grid" x1="30" y1="180" x2="730" y2="180"></line><polygon class="loan-chart-area" points="'+area+'"></polygon><polyline class="loan-chart-line" points="'+line+'"></polyline><text class="loan-chart-label" x="30" y="200">Month 1</text><text class="loan-chart-label" x="685" y="200">'+duration(result.actualMonths)+'</text><text class="loan-chart-label" x="35" y="24">'+money(max)+'</text><text class="loan-chart-label" x="35" y="176">₹0</text>';
    }
    function reset(){
      set("loan-amount",cfg.defaults.amount);set("loan-rate",cfg.defaults.annualRate);set("loan-years",cfg.defaults.years);set("loan-fee",cfg.defaults.processingFeePercent);set("loan-insurance",cfg.defaults.insurance);set("loan-extra",cfg.defaults.extraMonthly);set("loan-prepayment",cfg.defaults.prepayment);set("loan-prepayment-month",cfg.defaults.prepaymentMonth);document.querySelectorAll(".loan-preset").forEach(function(b){b.classList.remove("active")});update();
    }

    [
      ["loan-amount-range","loan-amount"],["loan-rate-range","loan-rate"],["loan-years-range","loan-years"],["loan-fee-range","loan-fee"],["loan-extra-range","loan-extra"],["loan-prepayment-range","loan-prepayment"]
    ].forEach(function(pair){var r=$(pair[0]);if(r)r.addEventListener("input",function(){syncInput(pair[0],pair[1]);update();});});
    ["loan-amount","loan-rate","loan-years","loan-fee","loan-insurance","loan-extra","loan-prepayment","loan-prepayment-month"].forEach(function(id){var el=$(id);if(el)el.addEventListener("input",update);});
    $("loan-calculate").addEventListener("click",update); $("loan-reset").addEventListener("click",reset);
    document.querySelectorAll("[data-loan-preset]").forEach(function(btn){btn.addEventListener("click",function(){set("loan-amount",btn.getAttribute("data-loan-preset"));document.querySelectorAll(".loan-preset").forEach(function(b){b.classList.remove("active")});btn.classList.add("active");update();});});
    update();
  });
})();
