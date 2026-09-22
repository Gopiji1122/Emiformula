/* =========================================================
   EMIFORMULA — SHARED SITE COMPONENT LOADER
   STEP 1.3 — RESTORED WORKING VERSION
   ========================================================= */

(function () {
  "use strict";

  var currentScript = document.currentScript;
  var basePath = "";

  if (currentScript && currentScript.src) {
    basePath = currentScript.src.replace(
      /\/assets\/js\/site\.js(?:\?.*)?$/,
      ""
    );
  }

  function closeAllPanels() {
    document
      .querySelectorAll("[data-header-panel]")
      .forEach(function (panel) {
        panel.hidden = true;
      });

    document
      .querySelectorAll("[data-header-menu]")
      .forEach(function (button) {
        button.setAttribute(
          "aria-expanded",
          "false"
        );
      });
  }

  function setupHeader() {
    var header =
      document.querySelector("[data-site-header]");

    if (!header) {
      return;
    }

    var menuToggle =
      header.querySelector("[data-menu-toggle]");

    var mobileNavigation =
      header.querySelector(
        "[data-mobile-navigation]"
      );

    header
      .querySelectorAll("[data-header-menu]")
      .forEach(function (button) {
        button.addEventListener(
          "click",
          function (event) {
            event.stopPropagation();

            var name =
              button.getAttribute(
                "data-header-menu"
              );

            var panel =
              header.querySelector(
                '[data-header-panel="' +
                name +
                '"]'
              );

            if (!panel) {
              return;
            }

            var wasHidden = panel.hidden;

            closeAllPanels();

            if (wasHidden) {
              panel.hidden = false;

              button.setAttribute(
                "aria-expanded",
                "true"
              );
            }
          }
        );
      });

    if (menuToggle && mobileNavigation) {
      menuToggle.addEventListener(
        "click",
        function (event) {
          event.stopPropagation();

          var opening =
            mobileNavigation.hidden;

          mobileNavigation.hidden = !opening;

          menuToggle.setAttribute(
            "aria-expanded",
            String(opening)
          );

          if (opening) {
            closeAllPanels();
          }
        }
      );
    }

    header
      .querySelectorAll(".mobile-nav-link")
      .forEach(function (link) {
        link.addEventListener(
          "click",
          function () {
            if (mobileNavigation) {
              mobileNavigation.hidden = true;
            }

            if (menuToggle) {
              menuToggle.setAttribute(
                "aria-expanded",
                "false"
              );
            }
          }
        );
      });

    header
      .querySelectorAll("[data-mobile-panel]")
      .forEach(function (button) {
        button.addEventListener(
          "click",
          function () {
            var current =
              button.getAttribute(
                "aria-expanded"
              ) === "true";

            button.setAttribute(
              "aria-expanded",
              String(!current)
            );
          }
        );
      });

    document.addEventListener(
      "click",
      function (event) {
        if (!header.contains(event.target)) {
          closeAllPanels();

          if (mobileNavigation) {
            mobileNavigation.hidden = true;
          }

          if (menuToggle) {
            menuToggle.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        }
      }
    );

    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Escape") {
          closeAllPanels();

          if (mobileNavigation) {
            mobileNavigation.hidden = true;
          }

          if (menuToggle) {
            menuToggle.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        }
      }
    );
  }

  function loadHeader() {
    var placeholders =
      document.querySelectorAll(
        '[data-component="header"]'
      );

    if (!placeholders.length) {
      return;
    }

    var headerUrl =
      basePath +
      "/components/header.html";

    placeholders.forEach(
      function (placeholder) {
        fetch(
          headerUrl,
          {
            cache: "no-cache"
          }
        )
          .then(
            function (response) {
              if (!response.ok) {
                throw new Error(
                  "Header component could not be loaded."
                );
              }

              return response.text();
            }
          )
          .then(
            function (html) {
              placeholder.innerHTML = html;
              setupHeader();
            }
          )
          .catch(
            function (error) {
              console.error(
                "EMIFORMULA header error:",
                error
              );

              placeholder.innerHTML =
                '<div class="component-error">' +
                "Website header could not be loaded." +
                "</div>";
            }
          );
      }
    );
  }

  document.addEventListener(
    "DOMContentLoaded",
    loadHeader
  );

})();
