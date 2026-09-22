/* =========================================================
   EMIFORMULA — COMMON PAGE COMPONENT LOADER
   STEP 1.8
   ========================================================= */

(function () {
  "use strict";

  var currentScript = document.currentScript;
  var basePath = "";

  if (currentScript && currentScript.src) {
    basePath = currentScript.src.replace(
      /\/assets\/js\/components\.js(?:\?.*)?$/,
      ""
    );
  }


  function loadComponent(
    placeholder,
    componentName
  ) {

    var componentUrl =
      basePath +
      "/components/" +
      componentName +
      ".html";


    fetch(
      componentUrl,
      {
        cache: "no-cache"
      }
    )

      .then(function (response) {

        if (!response.ok) {
          throw new Error(
            "Component could not be loaded: " +
            componentName
          );
        }

        return response.text();

      })

      .then(function (html) {

        placeholder.innerHTML = html;

        initializeComponent(
          placeholder,
          componentName
        );

      })

      .catch(function (error) {

        console.error(
          "EMIFORMULA component error:",
          error
        );

        placeholder.innerHTML =
          '<div class="component-error">' +
          "Component could not be loaded." +
          "</div>";

      });

  }


  function initializeComponent(
    placeholder,
    componentName
  ) {

    if (
      componentName ===
      "breadcrumbs"
    ) {

      initializeBreadcrumbs(
        placeholder
      );

    }

  }


  function initializeBreadcrumbs(
    placeholder
  ) {

    var current =
      placeholder.querySelector(
        "[data-breadcrumb-current]"
      );

    if (!current) {
      return;
    }

    var pageName =
      document.title
        .split("|")[0]
        .trim();

    if (pageName) {
      current.textContent =
        pageName;
    }

  }


  function loadComponents() {

    var placeholders =
      document.querySelectorAll(
        "[data-component]"
      );


    placeholders.forEach(
      function (placeholder) {

        var componentName =
          placeholder.getAttribute(
            "data-component"
          );


        if (
          !componentName ||
          componentName === "header" ||
          componentName === "footer"
        ) {
          return;
        }


        loadComponent(
          placeholder,
          componentName
        );

      }
    );

  }


  document.addEventListener(
    "DOMContentLoaded",
    loadComponents
  );

})();
