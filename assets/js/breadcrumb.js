/* =========================================================
   EMIFORMULA — DYNAMIC BREADCRUMB ENGINE
   STEP 2.5
   ========================================================= */

(function () {

  "use strict";


  function getData() {

    return window.EMIFORMULA_BREADCRUMBS || [];

  }


  function createLink(item) {

    var li =
      document.createElement("li");

    li.className =
      "breadcrumb-item";


    var link =
      document.createElement("a");

    link.href =
      item.url || "#";

    link.textContent =
      item.title;


    li.appendChild(link);

    return li;

  }


  function createCurrent(item) {

    var li =
      document.createElement("li");

    li.className =
      "breadcrumb-item breadcrumb-current";

    li.setAttribute(
      "aria-current",
      "page"
    );

    li.textContent =
      item.title;


    return li;

  }


  function createSeparator() {

    var li =
      document.createElement("li");

    li.className =
      "breadcrumb-separator";

    li.setAttribute(
      "aria-hidden",
      "true"
    );

    li.textContent =
      "/";


    return li;

  }


  function initialize() {

    var container =
      document.querySelector(
        "[data-dynamic-breadcrumbs]"
      );


    if (!container) {
      return;
    }


    var list =
      container.querySelector(
        ".breadcrumb-list"
      );


    if (!list) {
      return;
    }


    var data =
      getData();


    if (!data.length) {
      return;
    }


    list.innerHTML = "";


    /*
      Home is always the first breadcrumb.
    */

    var home =
      document.createElement("li");

    home.className =
      "breadcrumb-item";


    var homeLink =
      document.createElement("a");

    homeLink.href =
      "/Emiformula/";

    homeLink.textContent =
      "Home";


    home.appendChild(homeLink);

    list.appendChild(home);


    /*
      Add supplied breadcrumb items.
    */

    data.forEach(
      function (item, index) {

        list.appendChild(
          createSeparator()
        );


        var isLast =
          index ===
          data.length - 1;


        if (
          isLast ||
          !item.url
        ) {

          list.appendChild(
            createCurrent(item)
          );

        } else {

          list.appendChild(
            createLink(item)
          );

        }

      }
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();

  }

})();
