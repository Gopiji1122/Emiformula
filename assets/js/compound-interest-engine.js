(function(){
"use strict";
function n(v){var x=Number(v);return Number.isFinite(x)?x:0;}
function clamp(v,min,max){return Math.min(max,Math.max(min,n(v)));}

/* Contributions are deposited at the end of each month.
   The selected frequency controls how often interest is compounded. */
function calculate(o){
 o=o||{};
 var P=clamp(o.principal,0,100000000);
 var M=clamp(o.monthlyContribution,0,1000000);
 var R=clamp(o.annualRate,0,50);
 var Y=clamp(o.years,1,50);
 var F=[1,4,12].indexOf(Math.round(n(o.frequency)))>=0?Math.round(n(o.frequency)):12;
 var S=clamp(o.annualStepUp,0,50);
 var I=clamp(o.inflation,0,20);
 var months=Math.max(1,Math.round(Y*12));
 var monthsPerPeriod=12/F;
 var periodicRate=R/100/F;
 var balance=P;
 var totalContrib=P;
 var totalInterest=0;
 var schedule=[];
 var yearlyContrib=P;
 var yearlyInterest=0;

 for(var month=1;month<=months;month++){
   var contribution=M*Math.pow(1+S/100,Math.floor((month-1)/12));
   balance+=contribution;
   totalContrib+=contribution;
   yearlyContrib+=contribution;

   if(month % monthsPerPeriod === 0 || month===months){
     var interest=balance*(Math.pow(1+periodicRate,1)-1);
     balance+=interest;
     totalInterest+=interest;
     yearlyInterest+=interest;
   }

   if(month%12===0 || month===months){
     schedule.push({
       year:Math.ceil(month/12),
       contributed:totalContrib,
       interest:totalInterest,
       value:balance
     });
     yearlyContrib=0;
     yearlyInterest=0;
   }
 }

 var realValue=I>0?balance/Math.pow(1+I/100,Y):balance;

 function scenario(freq,rate){
   var b=P,c=P;
   var mpp=12/freq;
   var pr=rate/100/freq;
   for(var month=1;month<=months;month++){
     var add=M*Math.pow(1+S/100,Math.floor((month-1)/12));
     b+=add;c+=add;
     if(month%mpp===0 || month===months){
       b*=Math.pow(1+pr,1);
     }
   }
   return b;
 }

 var frequency=[
   {label:"Annual",value:scenario(1,R)},
   {label:"Quarterly",value:scenario(4,R)},
   {label:"Monthly",value:scenario(12,R)}
 ];

 var rates=[Math.max(0,R-2),R,R+2].map(function(rate){
   return {label:rate+"%",rate:rate,value:scenario(F,rate)};
 });

 return {
   futureValue:balance,
   totalContributed:totalContrib,
   totalInterest:totalInterest,
   realValue:realValue,
   schedule:schedule,
   frequency:frequency,
   rates:rates,
   years:Y,
   frequencyValue:F
 };
}
window.EMIFORMULA_COMPOUND_INTEREST={calculate:calculate};
})();