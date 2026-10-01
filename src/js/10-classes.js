/* ==========================================================================
   10 — CLASS CARD DRAWERS
   The chevron under each class card expands a details panel. Height is
   animated from the measured content height so the transition works without
   hardcoding a max-height guess.
   ========================================================================== */

(function () {
  "use strict";

  function init() {
    var toggles = document.querySelectorAll(".sw-classes .sw-class-toggle");
    if (!toggles.length) return;

    Array.prototype.forEach.call(toggles, function (btn) {
      if (btn.dataset.swBound) return;
      btn.dataset.swBound = "1";

      var card = btn.closest(".sw-class-card");
      var drawer = card && card.querySelector(".sw-class-more");
      if (!drawer) return;

      var inner = drawer.firstElementChild;
      btn.setAttribute("aria-expanded", "false");

      btn.addEventListener("click", function () {
        var open = card.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        drawer.style.height = open ? inner.offsetHeight + "px" : "0px";
      });

      /* Keep an open drawer correctly sized when the card reflows. */
      if (window.ResizeObserver) {
        new ResizeObserver(function () {
          if (card.classList.contains("is-open")) {
            drawer.style.height = inner.offsetHeight + "px";
          }
        }).observe(inner);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("load", init);
})();
