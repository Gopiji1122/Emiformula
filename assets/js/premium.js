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

/* Animated Retractable Currency (English-only) & Language Selectors */
(function () {
  "use strict";
  function initRetractSelectors() {
    var lang = (document.documentElement.lang || "en").toLowerCase();
    var isEn = lang === "en" || lang.indexOf("en-") === 0;

    // Enforce: currency selector is ONLY available for English language
    if (!isEn) {
      document.querySelectorAll("[data-ef-currency-retract], .ef-currency-only-en").forEach(function (el) {
        el.remove();
      });
    }

    var CURR_LIST = [
      { code: "INR", label: "₹ INR · Indian Rupee" },
      { code: "USD", label: "$ USD · US Dollar" },
      { code: "EUR", label: "€ EUR · Euro" },
      { code: "GBP", label: "£ GBP · British Pound" },
      { code: "CAD", label: "CA$ CAD · Canadian Dollar" },
      { code: "AUD", label: "A$ AUD · Australian Dollar" },
      { code: "JPY", label: "¥ JPY · Japanese Yen" }
    ];

    // Hydrate any [data-ef-currency-retract] container on English pages
    if (isEn) {
      document.querySelectorAll("[data-ef-currency-retract]").forEach(function (mount) {
        if (mount.dataset.efInit) return;
        mount.dataset.efInit = "1";
        var cur = (window.EMIFORMULA_CURRENCY && window.EMIFORMULA_CURRENCY.getCurrency()) || "INR";
        var activeItem = CURR_LIST.find(function (c) { return c.code === cur; }) || CURR_LIST[0];

        mount.classList.add("ef-retract");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ef-retract-btn";
        btn.setAttribute("aria-expanded", "false");
        btn.innerHTML = "<span aria-hidden=\"true\">💱</span><span class=\"ef-retract-label\">Currency: " + activeItem.code + "</span><span class=\"ef-retract-chev\" aria-hidden=\"true\">⌄</span>";

        var menu = document.createElement("div");
        menu.className = "ef-retract-menu";
        menu.setAttribute("role", "menu");

        CURR_LIST.forEach(function (item) {
          var opt = document.createElement("button");
          opt.type = "button";
          opt.className = "ef-retract-opt" + (item.code === cur ? " is-active" : "");
          opt.dataset.code = item.code;
          opt.textContent = item.label;
          opt.addEventListener("click", function () {
            window.__EF_CURRENCY = item.code;
            if (window.EMIFORMULA_CURRENCY) {
              window.EMIFORMULA_CURRENCY.setCurrency(item.code);
            }
            ["currencySelector", "sud-currency", "cf-currency-select", "ev-currency-select"].forEach(function (sid) {
              var sel = document.getElementById(sid);
              if (sel) {
                sel.value = item.code;
                sel.dispatchEvent(new Event("change", { bubbles: true }));
                sel.dispatchEvent(new Event("input", { bubbles: true }));
              }
            });
            window.dispatchEvent(new CustomEvent("ef:currency-change", { detail: { currency: item.code } }));
            btn.querySelector(".ef-retract-label").textContent = "Currency: " + item.code;
            menu.querySelectorAll(".ef-retract-opt").forEach(function (o) {
              o.classList.toggle("is-active", o.dataset.code === item.code);
            });
            mount.classList.remove("is-open");
            btn.setAttribute("aria-expanded", "false");
          });
          menu.appendChild(opt);
        });

        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var wasOpen = mount.classList.contains("is-open");
          document.querySelectorAll(".ef-retract.is-open").forEach(function (r) {
            r.classList.remove("is-open");
            var b = r.querySelector(".ef-retract-btn");
            if (b) b.setAttribute("aria-expanded", "false");
          });
          if (!wasOpen) {
            mount.classList.add("is-open");
            btn.setAttribute("aria-expanded", "true");
          }
        });

        mount.appendChild(btn);
        mount.appendChild(menu);
      });
    }

    // Hydrate any [data-ef-lang-retract] dropdowns
    document.querySelectorAll("[data-ef-lang-retract]").forEach(function (mount) {
      if (mount.dataset.efInit) return;
      mount.dataset.efInit = "1";
      var btn = mount.querySelector(".ef-retract-btn");
      var menu = mount.querySelector(".ef-retract-menu");
      if (!btn || !menu) return;
      mount.classList.add("ef-retract");
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var wasOpen = mount.classList.contains("is-open");
        document.querySelectorAll(".ef-retract.is-open").forEach(function (r) {
          r.classList.remove("is-open");
          var b = r.querySelector(".ef-retract-btn");
          if (b) b.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          mount.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".ef-retract")) {
        document.querySelectorAll(".ef-retract.is-open").forEach(function (r) {
          r.classList.remove("is-open");
          var b = r.querySelector(".ef-retract-btn");
          if (b) b.setAttribute("aria-expanded", "false");
        });
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".ef-retract.is-open").forEach(function (r) {
          r.classList.remove("is-open");
          var b = r.querySelector(".ef-retract-btn");
          if (b) b.setAttribute("aria-expanded", "false");
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRetractSelectors);
  } else {
    initRetractSelectors();
  }
})();
