/* =========================================================
   EMIFORMULA — COMMON PAGE COMPONENT LOADER
   STEP 1.8 — FIXED
   ========================================================= */

(function () {
  "use strict";


  /* -------------------------------------------------------
     FIND WEBSITE BASE PATH
     ------------------------------------------------------- */

  var currentScript = document.currentScript;
  var basePath = "";


  if (currentScript && currentScript.src) {

    var scriptUrl = currentScript.src;

    var marker = "/assets/js/components.js";

    var markerPosition =
      scriptUrl.indexOf(marker);

    if (markerPosition !== -1) {

      basePath =
        scriptUrl.substring(
          0,
          markerPosition
        );

    }

  }


  /* -------------------------------------------------------
     LOAD A COMPONENT
     ------------------------------------------------------- */

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
            componentName +
            " (" +
            response.status +
            ")"
          );

        }

        return response.text();

      })


      .then(function (html) {

        placeholder.innerHTML =
          html;


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


  /* -------------------------------------------------------
     INITIALIZE COMPONENT
     ------------------------------------------------------- */

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


    if (
      componentName ===
      "page-title"
    ) {

      initializePageTitle(
        placeholder
      );

    }

  }


  /* -------------------------------------------------------
     BREADCRUMBS
     ------------------------------------------------------- */

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
      getPageName();


    if (pageName) {

      current.textContent =
        pageName;

    }

  }


  /* -------------------------------------------------------
     PAGE TITLE
     ------------------------------------------------------- */

  function initializePageTitle(
    placeholder
  ) {

    var titleElement =
      placeholder.querySelector(
        "[data-page-title]"
      );


    var descriptionElement =
      placeholder.querySelector(
        "[data-page-description]"
      );


    var pageName =
      getPageName();


    if (
      titleElement &&
      pageName
    ) {

      titleElement.textContent =
        pageName;

    }


    if (
      descriptionElement &&
      pageName
    ) {

      descriptionElement.textContent =
        "Information and tools from EMIFORMULA.";

    }

  }


  /* -------------------------------------------------------
     GET CURRENT PAGE NAME
     ------------------------------------------------------- */

  function getPageName() {

    var title =
      document.title || "";


    if (!title) {
      return "";
    }


    var separator =
      title.indexOf("|");


    if (separator !== -1) {

      title =
        title.substring(
          0,
          separator
        );

    }


    return title.trim();

  }


  /* -------------------------------------------------------
     LOAD ALL COMMON COMPONENTS
     ------------------------------------------------------- */

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


        if (!componentName) {
          return;
        }


        /*
          Header and footer have their own
          dedicated loaders.
        */

        if (
          componentName ===
          "header" ||
          componentName ===
          "footer"
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


  /* -------------------------------------------------------
     START
     ------------------------------------------------------- */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      loadComponents
    );

  } else {

    loadComponents();

  }


})();
