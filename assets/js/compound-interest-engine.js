(function(){
"use strict";
function n(v){var x=Number(v);return Number.isFinite(x)?x:0;}
function clamp(v,min,max){return Math.min(max,Math.max(min,n(v)));}
function calculate(o){
 o=o||{};
 var P=clamp(o.principal,0,100000000), M=clamp(o.monthlyContribution,0,1000000);
 var R=clamp(o.annualRate,0,50), Y=clamp(o.years,1,50);
 var F=[1,4,12].indexOf(Math.round(n(o.frequency)))>=0?Math.round(n(o.frequency)):12;
 var S=clamp(o.annualStepUp,0,50), I=clamp(o.inflation,0,20);
 var months=Math.max(1,Math.round(Y*12)), monthlyRate=R/100/12;
 var balance=P,totalContrib=P,totalInterest=0, schedule=[];
 for(var month=1;month<=months;month++){
   var contribution=M*Math.pow(1+S/100,Math.floor((month-1)/12));
   var interest=monthlyRate===0?0:balance*monthlyRate;
   balance+=contribution+interest;
   totalContrib+=contribution;
   totalInterest+=interest;
   if(month%12===0||month===months){
     schedule.push({year:Math.ceil(month/12),contributed:totalContrib,interest:totalInterest,value:balance});
   }
 }
 var realValue=I>0?balance/Math.pow(1+I/100,Y):balance;
 function frequencyValue(freq){
   var b=P,c=P,monthly=R/100/freq;
   for(var m=1;m<=months;m++){
     var add=M*Math.pow(1+S/100,Math.floor((m-1)/12));
     var periods=m*freq/12;
     if(freq===12){b+=add;b+=b*monthly;}
     else {
       b+=add;
       if(m%Math.max(1,Math.round(12/freq))===0){b*=Math.pow(1+R/100/freq,1);}
     }
     c+=add;
   }
   return b;
 }
 var freq=[{label:"Annual",value:frequencyValue(1)},{label:"Quarterly",value:frequencyValue(4)},{label:"Monthly",value:frequencyValue(12)}];
 var rates=[Math.max(0,R-2),R,R+2].map(function(rate){
   var b=P,c=P,mr=rate/100/12;
   for(var m=1;m<=months;m++){var add=M*Math.pow(1+S/100,Math.floor((m-1)/12));b+=add+(mr===0?0:b*mr);c+=add;}
   return {rate:rate,value:b};
 });
 return {futureValue:balance,totalContributed:totalContrib,totalInterest:totalInterest,realValue:realValue,schedule:schedule,frequency:freq,rates:rates,years:Y};
}
window.EMIFORMULA_COMPOUND_INTEREST={calculate:calculate};
})();