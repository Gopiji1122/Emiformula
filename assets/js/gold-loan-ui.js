(function(){
'use strict';
var root=document.getElementById('goldLoanCalculator');
if(!root||!window.GoldLoanEngine)return;
var $=function(id){return document.getElementById(id)};
var mode='have';
var rate=$('goldPriceGram');
var lang=(document.documentElement.lang||'en').toLowerCase();

var TX={
en:{hintGrams:'For a more accurate estimate, enter gold weight without stones, diamonds or other non-gold materials.',hintTola:'1 tola ≈ 11.6638 grams. Enter the jewellery weight as accurately as possible.',purity:'Select the gold purity.',price:'Enter today’s gold price per gram.',weight:'Enter the gold weight.',loan:'Enter the desired loan amount.',loanLabel:'Estimated maximum loan',goldRequired:'Estimated gold required',goldValue:'Estimated gold value',eligible:'Eligible weight',ltv:'Estimated LTV',tola:'Approx. tola',foot:'Estimate only. The lender will determine the final eligible gold weight, purity, valuation price, applicable LTV and sanctioned amount under its policy and applicable rules.'},
hi:{hintGrams:'बेहतर अनुमान के लिए पत्थर, हीरे और अन्य गैर-सोने की सामग्री का वजन छोड़कर सोने का वजन भरें।',hintTola:'1 तोला ≈ 11.6638 ग्राम। गहनों का वजन यथासंभव सही भरें।',purity:'सोने की शुद्धता चुनें।',price:'आज का gold price per gram भरें।',weight:'सोने का वजन भरें।',loan:'आपको जितना loan चाहिए, वह amount भरें।',loanLabel:'अनुमानित अधिकतम लोन',goldRequired:'अनुमानित सोने की जरूरत',goldValue:'अनुमानित सोने की कीमत',eligible:'मान्य सोने का वजन',ltv:'अनुमानित LTV',tola:'लगभग तोला',foot:'यह केवल अनुमान है। अंतिम वजन, purity, valuation price, LTV और sanctioned amount lender की policy और लागू नियमों के अनुसार तय होंगे।'},
mr:{hintGrams:'अधिक अचूक अंदाजासाठी खडे, हिरे आणि इतर गैर-सोन्याचे वजन वगळून सोन्याचे वजन भरा.',hintTola:'1 तोळा ≈ 11.6638 ग्रॅम. दागिन्यांचे वजन शक्य तितके अचूक भरा.',purity:'सोन्याची शुद्धता निवडा.',price:'आजचा gold price per gram भरा.',weight:'सोन्याचे वजन भरा.',loan:'तुम्हाला हवे असलेले loan amount भरा.',loanLabel:'अंदाजे कमाल कर्ज',goldRequired:'अंदाजे लागणारे सोने',goldValue:'अंदाजे सोन्याची किंमत',eligible:'पात्र सोन्याचे वजन',ltv:'अंदाजे LTV',tola:'अंदाजे तोळे',foot:'हा फक्त अंदाज आहे. अंतिम वजन, purity, valuation price, LTV आणि मंजूर कर्जाची रक्कम lender च्या policy आणि लागू नियमांनुसार ठरेल.'},
gu:{hintGrams:'વધુ સચોટ અંદાજ માટે પથ્થર, હીરા અને અન્ય બિન-સોનાની સામગ્રીનું વજન છોડીને સોનાનું વજન દાખલ કરો.',hintTola:'1 તોલા ≈ 11.6638 ગ્રામ. દાગીનાનું વજન શક્ય તેટલું ચોક્કસ દાખલ કરો.',purity:'સોનાની શુદ્ધતા પસંદ કરો.',price:'આજનો gold price per gram દાખલ કરો.',weight:'સોનાનું વજન દાખલ કરો.',loan:'તમને જેટલી loan જોઈએ તે amount દાખલ કરો.',loanLabel:'અંદાજિત મહત્તમ લોન',goldRequired:'અંદાજિત જરૂરી સોનું',goldValue:'અંદાજિત સોનાની કિંમત',eligible:'પાત્ર સોનાનું વજન',ltv:'અંદાજિત LTV',tola:'લગભગ તોલા',foot:'આ માત્ર અંદાજ છે. અંતિમ વજન, purity, valuation price, LTV અને મંજૂર લોનની રકમ lender ની policy અને લાગુ નિયમો પ્રમાણે નક્કી થશે.'},
bn:{hintGrams:'আরও নির্ভুল হিসাবের জন্য পাথর, হীরা ও অন্যান্য অ-সোনার অংশের ওজন বাদ দিয়ে সোনার ওজন লিখুন।',hintTola:'১ তোলা ≈ ১১.৬৬৩৮ গ্রাম। গয়নার ওজন যতটা সম্ভব সঠিকভাবে লিখুন।',purity:'সোনার বিশুদ্ধতা বেছে নিন।',price:'আজকের gold price per gram লিখুন।',weight:'সোনার ওজন লিখুন।',loan:'আপনার প্রয়োজনীয় loan amount লিখুন।',loanLabel:'আনুমানিক সর্বোচ্চ ঋণ',goldRequired:'আনুমানিক প্রয়োজনীয় সোনা',goldValue:'আনুমানিক সোনার মূল্য',eligible:'যোগ্য সোনার ওজন',ltv:'আনুমানিক LTV',tola:'প্রায় তোলা',foot:'এটি শুধু একটি আনুমানিক হিসাব। চূড়ান্ত ওজন, purity, valuation price, LTV এবং sanctioned amount lender-এর policy ও প্রযোজ্য নিয়ম অনুযায়ী নির্ধারিত হবে।'},
ta:{hintGrams:'மேலும் துல்லியமான மதிப்பீட்டிற்கு கற்கள், வைரங்கள் மற்றும் தங்கமல்லாத பொருட்களின் எடையை நீக்கி தங்க எடையை உள்ளிடுங்கள்.',hintTola:'1 தோலா ≈ 11.6638 கிராம். நகையின் எடையை முடிந்தவரை துல்லியமாக உள்ளிடுங்கள்.',purity:'தங்கத்தின் தூய்மையைத் தேர்வு செய்யுங்கள்.',price:'இன்றைய gold price per gram-ஐ உள்ளிடுங்கள்.',weight:'தங்கத்தின் எடையை உள்ளிடுங்கள்.',loan:'உங்களுக்கு தேவையான loan amount-ஐ உள்ளிடுங்கள்.',loanLabel:'மதிப்பிடப்பட்ட அதிகபட்ச கடன்',goldRequired:'தேவையான தங்கத்தின் மதிப்பீடு',goldValue:'மதிப்பிடப்பட்ட தங்க மதிப்பு',eligible:'தகுதியான தங்க எடை',ltv:'மதிப்பிடப்பட்ட LTV',tola:'சுமார் தோலா',foot:'இது ஒரு மதிப்பீடு மட்டுமே. இறுதி எடை, purity, valuation price, LTV மற்றும் sanctioned amount ஆகியவை lender-ன் policy மற்றும் பொருந்தும் விதிகளின்படி தீர்மானிக்கப்படும்.'}
}[lang]||null;

function fmt(n){return new Intl.NumberFormat(lang==='en'?'en-IN':lang,{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}
function money(n){return '₹'+fmt(n)}
function setMode(next){
 mode=next;
 $('modeHave').setAttribute('aria-pressed',next==='have');
 $('modeNeed').setAttribute('aria-pressed',next==='need');
 $('haveFields').classList.toggle('gl-hidden',next!=='have');
 $('needFields').classList.toggle('gl-hidden',next!=='need');
 $('result').classList.add('gl-hidden');
 $('error').classList.add('gl-hidden');
}
$('modeHave').addEventListener('click',function(){setMode('have')});
$('modeNeed').addEventListener('click',function(){setMode('need')});

$('calculatorForm').addEventListener('submit',function(e){
 e.preventDefault();
 $('error').classList.add('gl-hidden');
 try{
  var purity=Number($('purity').value),price=Number(rate.value);
  if(!purity)throw Error(TX.purity);
  if(!price||price<=0)throw Error(TX.price);
  var r;
  if(mode==='have'){
   var w=Number($('weight').value);
   if(!w||w<=0)throw Error(TX.weight);
   r=GoldLoanEngine.calculate({weight:w,unit:$('weightUnit').value,purity:purity,priceGram:price});
   $('resultLabel').textContent=TX.loanLabel;
   $('resultValue').textContent=money(r.loan);
   $('r1').innerHTML='<span>'+TX.goldValue+'</span><strong>'+money(r.goldValue)+'</strong>';
   $('r2').innerHTML='<span>'+TX.eligible+'</span><strong>'+fmt(r.grams)+' g</strong>';
   $('r3').innerHTML='<span>'+TX.ltv+'</span><strong>'+fmt(r.ltv*100)+'%</strong>';
  }else{
   var loan=Number($('desiredLoan').value);
   if(!loan||loan<=0)throw Error(TX.loan);
   r=GoldLoanEngine.reverse({loan:loan,purity:purity,priceGram:price});
   $('resultLabel').textContent=TX.goldRequired;
   $('resultValue').textContent=fmt(r.grams)+' g';
   $('r1').innerHTML='<span>'+TX.goldValue+'</span><strong>'+money(r.goldValue)+'</strong>';
   $('r2').innerHTML='<span>'+TX.tola+'</span><strong>'+fmt(r.tola)+'</strong>';
   $('r3').innerHTML='<span>'+TX.ltv+'</span><strong>'+fmt(r.ltv*100)+'%</strong>';
  }
  $('resultFoot').textContent=TX.foot;
  $('result').classList.remove('gl-hidden');
  $('result').scrollIntoView({behavior:'smooth',block:'nearest'});
 }catch(err){
  $('error').textContent=err.message||'Please check the entered values.';
  $('error').classList.remove('gl-hidden');
 }
});
function updateWeightHint(){
 if(!TX)return;
 $('weightHint').textContent=$('weightUnit').value==='tola'?TX.hintTola:TX.hintGrams;
}
$('weightUnit').addEventListener('change',updateWeightHint);
updateWeightHint();
})();
