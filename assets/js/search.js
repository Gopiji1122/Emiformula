/* =========================================================
   EMIFORMULA — SEARCH SYSTEM
   STEP 1.4 — COMPLETE
   ========================================================= */

(function () {

  "use strict";


  var initialized = false;

  var overlay = null;

  var input = null;

  var results = null;


  /* =======================================================
     GET SEARCH INDEX
     ======================================================= */

  function getSearchIndex() {

    if (
      Array.isArray(
        window.EMIFORMULA_SEARCH_INDEX
      )
    ) {

      return window.EMIFORMULA_SEARCH_INDEX;

    }

    return [];

  }


  /* =======================================================
     CREATE SEARCH UI
     ======================================================= */

  function createSearchUI() {

    var existing =
      document.querySelector(
        "[data-search-overlay]"
      );


    if (existing) {

      return existing;

    }


    var wrapper =
      document.createElement("div");


    wrapper.innerHTML = `

      <div
        class="search-overlay"
        data-search-overlay
        hidden
        role="presentation"
      >

        <section
          class="search-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-dialog-title"
        >

          <div class="search-dialog-header">

            <div class="search-input-wrap">

              <span
                class="search-input-icon"
                aria-hidden="true"
              >⌕</span>

              <input
                class="search-input"
                type="search"
                autocomplete="off"
                placeholder="Search EMI calculators, loans and guides..."
                aria-label="Search website"
                data-search-input
              >

            </div>


            <button
              class="search-close"
              type="button"
              aria-label="Close search"
              data-search-close
            >×</button>

          </div>


          <div
            id="search-dialog-title"
            class="search-results"
            data-search-results
            aria-live="polite"
          ></div>


          <div class="search-hint">

            Press
            <kbd>Esc</kbd>
            to close

          </div>

        </section>

      </div>

    `;


    document.body.appendChild(
      wrapper.firstElementChild
    );


    return document.querySelector(
      "[data-search-overlay]"
    );

  }


  /* =======================================================
     NORMALIZE SEARCH TEXT
     ======================================================= */

  function normalize(value) {

    return String(value || "")
      .toLowerCase()
      .trim();

  }


  /* =======================================================
     ESCAPE HTML
     ======================================================= */

  function escapeHtml(value) {

    return String(value || "")

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );

  }


  /* =======================================================
     ESCAPE ATTRIBUTE
     ======================================================= */

  function escapeAttribute(value) {

    return escapeHtml(value);

  }


  /* =======================================================
     RENDER SEARCH RESULTS
     ======================================================= */

  function renderResults(query) {

    if (!results) {

      return;

    }


    var cleanQuery =
      normalize(query);


    var index =
      getSearchIndex();


    if (!cleanQuery) {

      results.innerHTML =
        '<div class="search-empty">' +
        "Start typing to search EMIFORMULA." +
        "</div>";

      return;

    }


    var words =
      cleanQuery
        .split(/\s+/)
        .filter(Boolean);


    var matches =
      index.filter(
        function (item) {

          var searchable =
            normalize(
              [
                item.title,
                item.description,
                item.category
              ].join(" ")
            );


          return words.every(
            function (word) {

              return (
                searchable.indexOf(word) !== -1
              );

            }
          );

        }
      );


    if (!matches.length) {

      results.innerHTML =
        '<div class="search-empty">' +
        "No matching results found." +
        "</div>";

      return;

    }


    results.innerHTML =
      matches
        .map(
          function (item) {

            var safeTitle =
              escapeHtml(item.title);


            var safeDescription =
              escapeHtml(
                item.description
              );


            var safeCategory =
              escapeHtml(
                item.category
              );


            return (

              '<a ' +

              'class="search-result" ' +

              'href="' +
              escapeAttribute(item.url) +
              '">' +

              '<span ' +
              'class="search-result-title">' +

              safeTitle +

              "</span>" +

              '<span ' +
              'class="search-result-description">' +

              safeDescription +

              "</span>" +

              '<span ' +
              'class="search-result-category">' +

              safeCategory +

              "</span>" +

              "</a>"

            );

          }
        )
        .join("");

  }


  /* =======================================================
     OPEN SEARCH
     ======================================================= */

  function openSearch() {

    if (!overlay) {

      overlay =
        createSearchUI();

      bindSearchUI();

    }


    overlay.hidden = false;


    if (input) {

      input.value = "";

      renderResults("");

      input.focus();

    }


    document.body.style.overflow =
      "hidden";

  }


  /* =======================================================
     CLOSE SEARCH
     ======================================================= */

  function closeSearch() {

    if (!overlay) {

      return;

    }


    overlay.hidden = true;


    document.body.style.overflow =
      "";

  }


  /* =======================================================
     BIND SEARCH UI
     ======================================================= */

  function bindSearchUI() {

    if (
      !overlay ||
      overlay.dataset.bound === "true"
    ) {

      return;

    }


    overlay.dataset.bound = "true";


    input =
      overlay.querySelector(
        "[data-search-input]"
      );


    results =
      overlay.querySelector(
        "[data-search-results]"
      );


    var closeButton =
      overlay.querySelector(
        "[data-search-close]"
      );


    if (input) {

      input.addEventListener(
        "input",
        function () {

          renderResults(
            input.value
          );

        }
      );

    }


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        closeSearch
      );

    }


    overlay.addEventListener(
      "click",
      function (event) {

        if (
          event.target === overlay
        ) {

          closeSearch();

        }

      }
    );

  }


  /* =======================================================
     BIND HEADER SEARCH BUTTON
     ======================================================= */

  function bindSearchButton() {

    var buttons =
      document.querySelectorAll(
        "[data-header-search]"
      );


    buttons.forEach(
      function (button) {

        if (
          button.dataset.searchBound ===
          "true"
        ) {

          return;

        }


        button.dataset.searchBound =
          "true";


        button.addEventListener(
          "click",
          function (event) {

            event.preventDefault();

            openSearch();

          }
        );

      }
    );

  }


  /* =======================================================
     INITIALIZE
     ======================================================= */

  function initialize() {

    if (initialized) {

      bindSearchButton();

      return;

    }


    initialized = true;


    overlay =
      createSearchUI();


    bindSearchUI();

    bindSearchButton();


    /* -----------------------------------------------------
       "/" keyboard shortcut
       ----------------------------------------------------- */

    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "/" &&
          document.activeElement &&
          ![
            "INPUT",
            "TEXTAREA"
          ].includes(
            document.activeElement.tagName
          )
        ) {

          event.preventDefault();

          openSearch();

        }


        if (
          event.key === "Escape"
        ) {

          closeSearch();

        }

      }
    );


    /*
     * Header is loaded dynamically by site.js.
     * MutationObserver waits for the header and then
     * connects its search button.
     */

    var observer =
      new MutationObserver(
        function () {

          bindSearchButton();

        }
      );


    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

  }


  /* =======================================================
     START
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );


})();
