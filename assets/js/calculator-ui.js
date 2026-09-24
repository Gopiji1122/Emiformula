(function () {
  "use strict";

  window.EMIFORMULA_CALCULATOR_UI = {

    getNumber: function (selector) {

      var element =
        document.querySelector(selector);

      if (!element) {
        return null;
      }

      var value = Number(element.value);

      return Number.isFinite(value)
        ? value
        : null;
    },

    setText: function (
      selector,
      value
    ) {

      var element =
        document.querySelector(selector);

      if (!element) {
        return;
      }

      element.textContent = value;
    },

    show: function (selector) {

      var element =
        document.querySelector(selector);

      if (!element) {
        return;
      }

      element.hidden = false;
    },

    hide: function (selector) {

      var element =
        document.querySelector(selector);

      if (!element) {
        return;
      }

      element.hidden = true;
    }

  };

})();
