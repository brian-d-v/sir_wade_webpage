/* ==========================================================================
   30 — TUTORIALS COVERFLOW
   Computes four custom properties per slide from its offset to the active
   index; 70-tutorials.css composes them into the 3D transform.

     --sw-o   signed offset, clamped   → translateX + rotateY
     --sw-s   scale
     --sw-op  opacity
     --sw-z   stacking order
   ========================================================================== */

(function () {
  "use strict";

  var VISIBLE = 3; // slides either side of centre that stay rendered
  var SCALE_STEP = 0.14; // size lost per step away from centre
  var OPACITY_STEP = 0.26;

  function init() {
    var stages = document.querySelectorAll(".sw-tutorials .sw-flow-stage");
    if (!stages.length) return;

    Array.prototype.forEach.call(stages, function (stage) {
      if (stage.dataset.swBound) return;
      stage.dataset.swBound = "1";

      var flow = stage.closest(".sw-flow");
      var items = Array.prototype.slice.call(
        stage.querySelectorAll(".sw-flow-item"),
      );
      if (items.length < 2) return;

      var dotsWrap = flow.parentNode.querySelector(".sw-flow-dots");
      var current = Math.floor(items.length / 2);
      var dots = [];

      if (dotsWrap) {
        dotsWrap.innerHTML = "";
        items.forEach(function (_, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "sw-flow-dot";
          dot.setAttribute("aria-label", "Tutorial " + (i + 1));
          dot.addEventListener("click", function () {
            go(i);
          });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });
      }

      items.forEach(function (item, i) {
        item.addEventListener("click", function () {
          /* Clicking the centre slide follows its link; clicking a side
             slide brings it to the centre instead. */
          if (i === current) return;
          go(i);
        });
      });

      bindNav(flow, ".sw-flow-prev", function () {
        go(current - 1);
      });
      bindNav(flow, ".sw-flow-next", function () {
        go(current + 1);
      });

      /* Trackpad / touch swipe */
      var startX = null;
      stage.addEventListener(
        "touchstart",
        function (e) {
          startX = e.touches[0].clientX;
        },
        { passive: true },
      );
      stage.addEventListener(
        "touchend",
        function (e) {
          if (startX === null) return;
          var dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
          startX = null;
        },
        { passive: true },
      );

      function go(next) {
        current = (next + items.length) % items.length;
        render();
      }

      function render() {
        items.forEach(function (item, i) {
          /* Shortest signed distance around the ring, so wrapping from the
             last slide to the first slides sideways instead of rewinding. */
          var raw = i - current;
          var half = items.length / 2;
          if (raw > half) raw -= items.length;
          if (raw < -half) raw += items.length;

          var dist = Math.abs(raw);
          var hidden = dist > VISIBLE;

          item.style.setProperty("--sw-o", raw);
          item.style.setProperty(
            "--sw-s",
            Math.max(0.4, 1 - dist * SCALE_STEP),
          );
          item.style.setProperty(
            "--sw-op",
            hidden ? 0 : Math.max(0, 1 - dist * OPACITY_STEP),
          );
          item.style.setProperty("--sw-z", String(100 - dist));
          item.style.pointerEvents = hidden ? "none" : "";
          item.classList.toggle("is-active", raw === 0);
          item.setAttribute("aria-hidden", raw === 0 ? "false" : "true");
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      render();
    });
  }

  function bindNav(flow, sel, fn) {
    var btn = flow.parentNode.querySelector(sel) || flow.querySelector(sel);
    if (btn) btn.addEventListener("click", fn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("load", init);
})();
