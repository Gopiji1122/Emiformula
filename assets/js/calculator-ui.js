(function () {
  "use strict";

  function get(selector) {
    return document.querySelector(selector);
  }

  function getNumber(selector) {
    var element = get(selector);

    if (!element) {
      return null;
    }

    var value = Number(element.value);

    return Number.isFinite(value)
      ? value
      : null;
  }

  function setText(selector, value) {
    var element = get(selector);

    if (element) {
      element.textContent = value;
    }
  }

  function show(selector) {
    var element = get(selector);

    if (element) {
      element.hidden = false;
    }
  }

  function hide(selector) {
    var element = get(selector);

    if (element) {
      element.hidden = true;
    }
  }

  function animateNumber(
    element,
    target,
    formatter,
    duration
  ) {
    if (!element) {
      return;
    }

    if (
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      element.textContent =
        formatter(target);
      return;
    }

    var start = 0;
    var startTime = null;

    function frame(timestamp) {

      if (!startTime) {
        startTime = timestamp;
      }

      var progress =
        Math.min(
          1,
          (timestamp - startTime) /
          duration
        );

      var eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      var current =
        start +
        (target - start) *
        eased;

      element.textContent =
        formatter(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  window.EMIFORMULA_CALCULATOR_UI = {

    getNumber:
      getNumber,

    setText:
      setText,

    show:
      show,

    hide:
      hide,

    animateNumber:
      animateNumber

  };

})();
