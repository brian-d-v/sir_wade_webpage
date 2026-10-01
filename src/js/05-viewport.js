/* ==========================================================================
   05 — VIEWPORT WIDTH

   Publishes the viewport width WITHOUT the scrollbar as --sw-vw.

   The full-bleed breakout in 01-base.css needs this. The obvious value,
   100vw, includes the scrollbar gutter on desktop, so a block sized to it
   ends up a scrollbar wider than the visible page and introduces horizontal
   scroll. documentElement.clientWidth excludes it.

   The CSS falls back to 100vw until this runs, so the page is never broken
   while the script loads — just potentially a few pixels wide.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;

  function sync() {
    root.style.setProperty("--sw-vw", root.clientWidth + "px");
  }

  sync();

  /* ResizeObserver catches viewport changes AND layout shifts that change
     the scrollbar's presence (a lazy image landing, a drawer opening) —
     a resize listener alone misses those. */
  if (window.ResizeObserver) {
    new ResizeObserver(sync).observe(root);
  } else {
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sync);
  }
  window.addEventListener("load", sync);
})();
