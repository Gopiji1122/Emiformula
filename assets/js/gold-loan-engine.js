(function(){
  'use strict';
  window.GoldLoanEngine={
    ltvForLoan:function(amount){
      if(!isFinite(amount)||amount<=0)return 0;
      if(amount<=250000)return .85;
      if(amount<=500000)return .80;
      return .75;
    },
    maxLoanForValue:function(value){
      if(!isFinite(value)||value<=0)return {loan:0,ltv:0};
      if(value<=250000/0.85)return {loan:value*0.85,ltv:0.85};
      if(value<=250000/0.80)return {loan:250000,ltv:0.85};
      if(value<=500000/0.80)return {loan:value*0.80,ltv:0.80};
      /* A borrower can still qualify for the capped 80% tier up to ₹5 lakh
         when the gold value supports it. Do not drop the estimate just above
         the ₹6.25 lakh collateral threshold. */
      var cappedTierLoan=Math.min(500000,value*0.80);
      var higherTierLoan=value*0.75;
      if(cappedTierLoan>=higherTierLoan)return {loan:cappedTierLoan,ltv:0.80};
      return {loan:higherTierLoan,ltv:0.75};
    },
    calculate:function(data){
      var weight=Number(data.weight), priceGram=Number(data.priceGram), purity=Number(data.purity);
      if(!isFinite(weight)||weight<=0)throw Error('Enter a valid gold weight.');
      if(!isFinite(priceGram)||priceGram<=0)throw Error('Enter today’s gold price per gram.');
      if(!isFinite(purity)||purity<=0||purity>24)throw Error('Select a valid gold purity.');
      var grams=data.unit==='tola'?weight*11.6638125:weight;
      var pricePerGram=priceGram;
      var value=grams*pricePerGram;
      var max=this.maxLoanForValue(value);
      return {grams:grams,pricePerGram:pricePerGram,goldValue:value,loan:max.loan,ltv:max.ltv,priceGram:priceGram,purity:purity,unit:data.unit};
    },
    reverse:function(data){
      var loan=Number(data.loan),priceGram=Number(data.priceGram),purity=Number(data.purity);
      if(!isFinite(loan)||loan<=0)throw Error('Enter a valid desired loan amount.');
      if(!isFinite(priceGram)||priceGram<=0)throw Error('Enter today’s gold price per gram.');
      if(!isFinite(purity)||purity<=0||purity>24)throw Error('Select a valid gold purity.');
      var ltv=this.ltvForLoan(loan), value=loan/ltv, grams=value/priceGram, tola=grams/11.6638125;
      return {loan:loan,ltv:ltv,goldValue:value,grams:grams,tola:tola,priceGram:priceGram,purity:purity};
    }
  };
})();