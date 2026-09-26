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

  function loadFooter() {
    var placeholders =
      document.querySelectorAll(
        '[data-component="footer"]'
      );

    if (!placeholders.length) {
      return;
    }

    var footerUrl =
      basePath +
      "/components/footer.html";

    placeholders.forEach(function (placeholder) {

      fetch(
        footerUrl,
        {
          cache: "no-cache"
        }
      )

        .then(function (response) {

          if (!response.ok) {
            throw new Error(
              "Footer component could not be loaded."
            );
          }

          return response.text();

        })

        .then(function (html) {

  placeholder.innerHTML =
    html;

  resolveSiteLinks(placeholder);

  var homeUrl =
    basePath + "/";

  placeholder
    .querySelectorAll('a[href="./"]')
    .forEach(function (link) {

      link.setAttribute(
        "href",
        homeUrl
      );

    });

  setupFooter();

})

        .catch(function (error) {

          console.error(
            "EMIFORMULA footer error:",
            error
          );

          placeholder.innerHTML =
            '<div class="component-error">' +
            "Website footer could not be loaded." +
            "</div>";

        });

    });
  }

  document.addEventListener(
    "DOMContentLoaded",
    loadFooter
  );

})();
