/* ==========================================================================
   20 — REVIEWS MARQUEE
   Duplicates each track's cards once so the -50% keyframe loops seamlessly,
   then sets a duration proportional to track width — wide rows and narrow
   rows end up scrolling at the same pixel speed.
   ========================================================================== */

(function () {
  "use strict";

  var PX_PER_SECOND = 45;

  function init() {
    var tracks = document.querySelectorAll(".sw-reviews .sw-marquee-track");
    if (!tracks.length) return;

    Array.prototype.forEach.call(tracks, function (track) {
      if (track.dataset.swBound) return;
      track.dataset.swBound = "1";

      /* Clone the original set once. aria-hidden on the copy keeps screen
         readers from reading every review twice. */
      var originals = Array.prototype.slice.call(track.children);
      originals.forEach(function (node) {
        var copy = node.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        track.appendChild(copy);
      });

      measure(track);
      if (window.ResizeObserver) {
        new ResizeObserver(function () {
          measure(track);
        }).observe(track);
      }
    });
  }

  function measure(track) {
    /* scrollWidth covers both copies; one loop travels half of it. */
    var distance = track.scrollWidth / 2;
    if (!distance) return;
    track.style.animationDuration = distance / PX_PER_SECOND + "s";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("load", init);
})();
