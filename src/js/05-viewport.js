/* ==========================================================================
   05 — FULL-BLEED FITTER

   Makes every block span the viewport edge to edge, whatever Kajabi wraps
   it in.

   WHY NOT THE USUAL CSS TRICK
   `margin-inline: calc(50% - 50vw)` only works if the block's container is
   perfectly centred in the viewport, because it infers the container's
   offset from its width. Kajabi's preview puts the page in a frame with an
   editor rail, and themes add asymmetric wrappers, so that inference is
   wrong — the block ends up shifted and clipped on one side.

   Instead: neutralise our own correction, measure where the block actually
   lands, and offset by exactly that. No assumption about the ancestors.

   The CSS keeps the calc() version as a pre-JS fallback, so a block is
   roughly right before this runs and exactly right after.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var SEL = ".sw-scope:not(.sw-contained)";

  function fit() {
    var vw = root.clientWidth; /* excludes the scrollbar; 100vw does not */
    root.style.setProperty("--sw-vw", vw + "px");

    var blocks = document.querySelectorAll(SEL);

    /* Two passes. Clearing every block first means each measurement happens
       against a settled layout — measuring and writing one block at a time
       lets an earlier correction skew the next block's reading. */
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i];
      el.style.marginLeft = "0px";
      el.style.marginRight = "0px";
      el.style.width = "auto";
      el.style.maxWidth = "none";
    }

    for (var j = 0; j < blocks.length; j++) {
      var b = blocks[j];
      /* Distance from the document's left edge, scroll-independent. */
      var left = b.getBoundingClientRect().left + window.pageXOffset;
      b.style.marginLeft = -left + "px";
      b.style.marginRight = "0px";
      b.style.width = vw + "px";
      b.style.maxWidth = vw + "px";
    }
  }

  /* Coalesce bursts of layout changes into one fit per frame. */
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      fit();
    });
  }

  schedule();

  if (window.ResizeObserver) {
    /* Catches viewport resizes and anything that changes the scrollbar's
       presence — a lazy image landing, a drawer opening — which a resize
       listener alone misses. */
    new ResizeObserver(schedule).observe(root);
  } else {
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  }
  /* Fonts and images settle after load and can shift the wrappers. */
  window.addEventListener("load", schedule);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule);
  }

  window.SWBleed = { fit: schedule };
})();
