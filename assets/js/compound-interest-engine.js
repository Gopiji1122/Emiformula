(function(){
"use strict";
function n(v){var x=Number(v);return Number.isFinite(x)?x:0;}
function clamp(v,min,max){return Math.min(max,Math.max(min,n(v)));}

/* Monthly contributions are deposited at the END of each month.
   Convert the selected nominal annual rate and compounding frequency to
   an equivalent monthly rate, so a contribution never earns interest for
   the month in which it is deposited. */
function calculate(o){
 o=o||{};
 var P=clamp(o.principal,0,100000000);
 var M=clamp(o.monthlyContribution,0,1000000);
 var R=clamp(o.annualRate,0,50);
 var Y=clamp(o.years,1,50);
 var requestedFrequency=Math.round(n(o.frequency));
 var F=[1,4,12].indexOf(requestedFrequency)>=0?requestedFrequency:12;
 var S=clamp(o.annualStepUp,0,50);
 var I=clamp(o.inflation,0,20);
 var months=Math.max(1,Math.round(Y*12));
 var periodicRate=R/100/F;
 var monthlyRate=Math.pow(1+periodicRate,F/12)-1;
 var balance=P;
 var totalContrib=P;
 var totalInterest=0;
 var schedule=[];

 for(var month=1;month<=months;month++){
   var openingBalance=balance;
   var interest=openingBalance*monthlyRate;
   balance=openingBalance+interest;
   totalInterest+=interest;

   /* End-of-month contribution: it starts earning from the next month. */
   var contribution=M*Math.pow(1+S/100,Math.floor((month-1)/12));
   balance+=contribution;
   totalContrib+=contribution;

   if(month%12===0 || month===months){
     schedule.push({
       year:Math.ceil(month/12),
       contributed:totalContrib,
       interest:totalInterest,
       value:balance
     });
   }
 }

 var realValue=I>0?balance/Math.pow(1+I/100,Y):balance;

 function scenario(freq,rate){
   var b=P;
   var pr=Math.max(0,rate)/100/freq;
   var mr=Math.pow(1+pr,freq/12)-1;
   for(var month=1;month<=months;month++){
     b+=b*mr;
     b+=M*Math.pow(1+S/100,Math.floor((month-1)/12));
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