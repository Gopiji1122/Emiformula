/* EMIFORMULA home: live EMI panel, calculator filter, language switch */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  var rs = function (n) { return "\u20B9" + inr.format(Math.round(n)); };

  /* live EMI panel */
  var a = $("r-a"), r = $("r-r"), t = $("r-t"), emiEl = $("hx-emi"), shown = 49464, raf;
  if (a && r && t && emiEl) {
    var calc = function () {
      var P = +a.value, n = +t.value * 12, i = +r.value / 1200;
      var emi = i ? P * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1) : P / n;
      var tot = emi * n, intr = tot - P;
      $("o-a").textContent = rs(P); $("o-r").textContent = (+r.value).toFixed(1) + "%";
      $("o-t").textContent = t.value + (+t.value === 1 ? " year" : " years");
      $("hx-int").textContent = rs(intr); $("hx-tot").textContent = rs(tot);
      $("hx-split").textContent = "Interest is " + Math.round(intr / tot * 100) + "% of total repayment";
      $("hx-arc").style.strokeDasharray = (P / tot * 100).toFixed(1) + " 100";
      var from = shown, to = emi, t0 = performance.now();
      cancelAnimationFrame(raf);
      (function step(now) {
        var k = reduce ? 1 : Math.min(1, (now - t0) / 450), e = 1 - Math.pow(1 - k, 3);
        shown = from + (to - from) * e; emiEl.textContent = rs(shown);
        if (k < 1) raf = requestAnimationFrame(step);
      })(t0);
    };
    [a, r, t].forEach(function (el) { el.addEventListener("input", calc); });
    calc();
  }

  /* calculator filter */
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".hx-tile"));
  document.querySelectorAll(".hx-chips button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".hx-chips button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      var f = b.dataset.f, k = 0;
      tiles.forEach(function (el) {
        var on = f === "all" || el.dataset.tags.split(" ").indexOf(f) > -1;
        el.hidden = !on; el.classList.remove("hx-show");
        if (on) { void el.offsetWidth; el.style.setProperty("--i", k++); el.classList.add("hx-show"); }
      });
    });
  });

  /* language: rewrite links that have a translated version */
  var links = document.querySelectorAll("[data-i18n]");
  function setLang(l) {
    links.forEach(function (el) { el.setAttribute("href", (l ? l + "/" : "") + el.dataset.i18n); });
    document.querySelectorAll(".hx-lang button").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.l === l); });
    $("hx-ln").hidden = !l;
    try { localStorage.setItem("ef-lang", l); } catch (e) {}
  }
  document.querySelectorAll(".hx-lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.l); }); });
  try { var saved = localStorage.getItem("ef-lang"); if (saved) setLang(saved); } catch (e) {}
})();
