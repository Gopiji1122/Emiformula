/* EMIFORMULA — SHARED FOOTER LOADER | STEP 1.5 */

(function () {
  "use strict";

  var currentScript = document.currentScript;
  var basePath = "";

  if (currentScript && currentScript.src) {
    basePath = currentScript.src.replace(
      /\/assets\/js\/footer\.js(?:\?.*)?$/,
      ""
    );
  }

  function resolveSiteLinks(root) {
    if (!root) return;
    var siteRoot = basePath || window.location.origin;
    siteRoot = siteRoot.replace(/\/+$/, "");
    root.querySelectorAll("a[data-site-path]").forEach(function (link) {
      var path = link.getAttribute("href") || "/";
      if (/^\/Emiformula(?:\/|$)/i.test(path)) {
        path = path.replace(/^\/Emiformula/i, "") || "/";
      }
      if (!path.startsWith("/")) path = "/" + path;
      link.setAttribute("href", siteRoot + path);
      link.removeAttribute("data-site-path");
    });
  }

  function setupFooter() {
    var footer =
      document.querySelector("[data-site-footer]");

    if (!footer) {
      return;
    }

    var year =
      footer.querySelector("[data-footer-year]");

    if (year) {
      year.textContent =
        new Date().getFullYear();
    }
  }

  var FALLBACK_FOOTER = "<footer class=\"site-footer\" data-site-footer>\n  <div class=\"footer-container\">\n    <div class=\"footer-main\">\n      <div class=\"footer-brand\">\n        <a class=\"footer-logo\" href=\"/\" data-site-path aria-label=\"EMIFORMULA home\"><span class=\"footer-logo-mark\" aria-hidden=\"true\">E</span><span class=\"footer-logo-text\">EMIFORMULA</span></a>\n        <p class=\"footer-description\">Simple and useful EMI, loan and financial calculation tools for everyday planning.</p>\n      </div>\n      <div class=\"footer-column\"><h2 class=\"footer-heading\">Calculator Categories</h2><ul class=\"footer-links\">\n        <li><a href=\"/categories/emi.html\" data-site-path>EMI Calculators</a></li>\n        <li><a href=\"/categories/loan.html\" data-site-path>Loan Calculators</a></li>\n        <li><a href=\"/categories/financial.html\" data-site-path>Financial Calculators</a></li>\n      </ul></div>\n      <div class=\"footer-column\"><h2 class=\"footer-heading\">Guides</h2><ul class=\"footer-links\">\n        <li><a href=\"/guides/emi-guide.html\" data-site-path>EMI Guide</a></li>\n        <li><a href=\"/guides/personal-loan-guide.html\" data-site-path>Personal Loan Guide</a></li>\n        <li><a href=\"/guides/compound-interest-guide.html\" data-site-path>Compound Interest Guide</a></li>\n        <li><a href=\"/guides/balance-transfer-guide.html\" data-site-path>Balance Transfer Guide</a></li>\n      </ul></div>\n      <div class=\"footer-column\"><h2 class=\"footer-heading\">Information</h2><ul class=\"footer-links\">\n        <li><a href=\"/pages/about.html\" data-site-path>About</a></li><li><a href=\"/pages/contact.html\" data-site-path>Contact</a></li>\n        <li><a href=\"/pages/privacy-policy.html\" data-site-path>Privacy Policy</a></li><li><a href=\"/pages/terms.html\" data-site-path>Terms &amp; Disclaimer</a></li>\n      </ul></div>\n    </div>\n    <div class=\"footer-bottom\"><p class=\"footer-copyright\">&copy; <span data-footer-year></span> EMIFORMULA. All rights reserved.</p><p class=\"footer-note\">For informational and calculation purposes.</p></div>\n  </div>\n</footer>\n";

  function injectFooter(placeholder, html) {
    placeholder.innerHTML = html;
    resolveSiteLinks(placeholder);

    var homeUrl = basePath + "/";
    placeholder.querySelectorAll('a[href="./"]').forEach(function (link) {
      link.setAttribute("href", homeUrl);
    });

    setupFooter();
  }

  function loadFooter() {
    var placeholders = document.querySelectorAll('[data-component="footer"]');
    if (!placeholders.length) return;

    var footerUrl = basePath + "/components/footer.html";

    placeholders.forEach(function (placeholder) {
      fetch(footerUrl, { cache: "no-cache" })
        .then(function (response) {
          if (!response.ok) throw new Error("Footer component could not be loaded.");
          return response.text();
        })
        .then(function (html) {
          injectFooter(placeholder, html);
        })
        .catch(function (error) {
          console.error("EMIFORMULA footer error; using built-in footer fallback:", error);
          injectFooter(placeholder, FALLBACK_FOOTER);
        });
    });
  }

  document.addEventListener(
    "DOMContentLoaded",
    loadFooter
  );

})();
