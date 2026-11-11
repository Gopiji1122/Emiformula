/* EMIFORMULA — premium interaction layer (progressive enhancement; safe to remove) */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("ef-js");

  function ready(fn) { doc.readyState === "loading" ? doc.addEventListener("DOMContentLoaded", fn) : fn(); }

  ready(function () {
    /* skip link (accessibility) */
    var main = doc.querySelector("main") || doc.querySelector("[role=main]");
    if (main && !doc.querySelector(".skip-link")) {
      if (!main.id) main.id = "main-content";
      var skip = doc.createElement("a");
      skip.className = "ef-skip"; skip.href = "#" + main.id; skip.textContent = "Skip to content";
      doc.body.insertBefore(skip, doc.body.firstChild);
    }

    /* progress bar + header state + back-to-top */
    var bar = doc.createElement("div"); bar.className = "ef-progress"; bar.setAttribute("aria-hidden", "true");
    var top = doc.createElement("button"); top.className = "ef-top"; top.type = "button";
    top.setAttribute("aria-label", "Back to top"); top.textContent = "\u2191";
    doc.body.appendChild(bar); doc.body.appendChild(top);
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

    var ticking = false;
    function onScroll() {
      var y = window.pageYOffset || root.scrollTop;
      var h = root.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
      var header = doc.querySelector(".site-header");
      if (header) header.classList.toggle("ef-scrolled", y > 8);
      top.classList.toggle("ef-show", y > 700);
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    /* scroll reveal */
    if (!reduce && "IntersectionObserver" in window) {
      var sel = "main section, main article > *, main .card, .gl-card, .gl-result, [class*='-card'], main details";
      var all = Array.prototype.slice.call(doc.querySelectorAll(sel));
      var targets = all.filter(function (el) {
        if (el.closest(".site-header,.site-footer,.header-panel,[data-no-reveal],form [class*='-card']")) return false;
        for (var p = el.parentElement; p; p = p.parentElement) if (all.indexOf(p) > -1) return false; // top-most only
        return true;
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("ef-in"); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
      var lastParent = null, idx = 0;
      targets.forEach(function (el) {
        idx = el.parentElement === lastParent ? idx + 1 : 0; lastParent = el.parentElement;
        el.style.setProperty("--ef-d", Math.min(idx, 5) * 70 + "ms");
        el.classList.add("ef-reveal"); io.observe(el);
      });
    }

    /* result pulse: highlight values when a calculator updates them */
    if ("MutationObserver" in window) {
      var timers = new WeakMap();
      var watch = doc.querySelectorAll("[aria-live], [id*='result'], [class*='result-value']");
      var mo = new MutationObserver(function (list) {
        list.forEach(function (m) {
          var el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
          if (!el || !el.closest) return;
          var box = el.closest("[class*='result-value'],[id*='result'],[aria-live]") || el;
          if (timers.has(box)) return;
          box.classList.remove("ef-pulse"); void box.offsetWidth; box.classList.add("ef-pulse");
          timers.set(box, setTimeout(function () { box.classList.remove("ef-pulse"); timers.delete(box); }, 900));
        });
      });
      watch.forEach(function (el) { mo.observe(el, { childList: true, characterData: true, subtree: true }); });
    }
  });
})();

/* guide table-of-contents scroll-spy */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var links = Array.prototype.slice.call(document.querySelectorAll(".gold-guide-toc a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { var t = document.getElementById(a.getAttribute("href").slice(1)); if (t) map[t.id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var a = map[e.target.id]; if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-20% 0px -65% 0px" });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  });
})();
