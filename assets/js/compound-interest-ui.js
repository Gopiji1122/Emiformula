(function(){
"use strict";
var C=window.EMIFORMULA_COMPOUND_INTEREST_CONFIG||{}, E=window.EMIFORMULA_COMPOUND_INTEREST;
function $(id){return document.getElementById(id);}
function num(id){return Number($(id).value);}
function money(v){return Number(v||0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});}
function setText(id,v){if($(id))$(id).textContent=v;}
function bindPair(inputId,rangeId,transform){
 var input=$(inputId),range=$(rangeId); if(!input||!range)return;
 input.addEventListener("input",function(){var v=Number(input.value);if(!Number.isFinite(v))return;range.value=Math.min(Number(range.max),Math.max(Number(range.min),v));update();});
 range.addEventListener("input",function(){input.value=range.value;update();});
}
function svgChart(rows){
 var svg=$("compound-growth-chart"); if(!svg)return;
 var W=700,H=300,p=35,max=Math.max.apply(null,rows.map(function(r){return r.value;}))||1;
 var points=rows.map(function(r,i){var x=p+(W-2*p)*(i/Math.max(1,rows.length-1));var y=H-p-(H-2*p)*(r.value/max);return x+","+y;}).join(" ");
 svg.innerHTML='<polyline fill="none" stroke="currentColor" stroke-width="4" points="'+points+'"></polyline>'+rows.map(function(r,i){var x=p+(W-2*p)*(i/Math.max(1,rows.length-1));var y=H-p-(H-2*p)*(r.value/max);return '<circle cx="'+x+'" cy="'+y+'" r="4"></circle>';}).join("");
}
function bars(id,items,formatter){
 var root=$(id);if(!root)return;
 var max=Math.max.apply(null,items.map(function(x){return x.value;}))||1;
 root.innerHTML=items.map(function(x){return '<div class="compound-bar-row"><span>'+x.label+'</span><div><i style="width:'+Math.max(3,(x.value/max)*100)+'%"></i></div><b>'+formatter(x.value)+'</b></div>';}).join("");
}
function update(){
 var result=E.calculate({principal:num("compound-principal"),monthlyContribution:num("compound-monthly"),annualRate:num("compound-rate"),years:num("compound-years"),frequency:Number(document.querySelector(".compound-frequency .is-active")?.dataset.frequency||12),annualStepUp:num("compound-stepup"),inflation:num("compound-inflation")});
 setText("compound-principal-value",money(num("compound-principal")));setText("compound-monthly-value",money(num("compound-monthly")));
 setText("compound-rate-value",num("compound-rate")+"%");setText("compound-years-value",num("compound-years")+" years");setText("compound-stepup-value",num("compound-stepup")+"%");setText("compound-inflation-value",num("compound-inflation")+"%");
 setText("compound-future",money(result.futureValue));setText("compound-invested",money(result.totalContributed));setText("compound-interest",money(result.totalInterest));setText("compound-donut-total",money(result.futureValue));
 setText("compound-legend-invested",money(result.totalContributed));setText("compound-legend-interest",money(result.totalInterest));setText("compound-duration-label",result.years+" years");
 var total=result.futureValue||1,deg=result.totalInterest/total*360;$("compound-donut").style.setProperty("--interest-deg",deg+"deg");
 svgChart(result.schedule);bars("compound-frequency-bars",result.frequency,money);bars("compound-rate-bars",result.rates,function(v){return money(v);});
 $("compound-yearly").innerHTML=result.schedule.map(function(r){return "<tr><td>"+r.year+"</td><td>"+money(r.contributed)+"</td><td>"+money(r.interest)+"</td><td>"+money(r.value)+"</td></tr>";}).join("");
}
function init(){
 [["compound-principal","compound-principal-range"],["compound-monthly","compound-monthly-range"],["compound-rate","compound-rate-range"],["compound-years","compound-years-range"],["compound-stepup","compound-stepup-range"],["compound-inflation","compound-inflation-range"]].forEach(function(x){bindPair(x[0],x[1]);});
 document.querySelectorAll("[data-frequency]").forEach(function(b){b.addEventListener("click",function(){document.querySelectorAll("[data-frequency]").forEach(function(x){x.classList.remove("is-active");});b.classList.add("is-active");update();});});
 $("compound-calculate").addEventListener("click",update);
 $("compound-reset").addEventListener("click",function(){var d=C.defaults;Object.keys({principal:1,monthlyContribution:1,annualRate:1,years:1,annualStepUp:1,inflation:1}).forEach(function(k){$("compound-"+({"principal":"principal","monthlyContribution":"monthly","annualRate":"rate",years:"years",annualStepUp:"stepup",inflation:"inflation"}[k])).value=d[k];});document.querySelectorAll("[data-frequency]").forEach(function(x){x.classList.toggle("is-active",Number(x.dataset.frequency)===d.frequency);});update();});
 update();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();