/* ==========================================================================
   20 — REVIEWS MARQUEE

   Two rows of cards drifting in opposite directions, grabbable with the
   mouse, coasting back into the drift on release. Pauses on hover.

   WHY THIS IS SCROLL-DRIVEN, NOT A CSS ANIMATION
   A @keyframes animation owns its element's position outright — there is no
   way to grab one mid-flight and scrub it. So each row is a real horizontal
   scroll container and this file advances `scrollLeft` a little each frame.
   Dragging just hands that same property to the pointer. As a bonus the row
   also responds to trackpad swipe, shift+wheel and native touch momentum,
   none of which the animated version supported.

   THE SEAMLESS LOOP
   The cards are repeated until the strip is comfortably wider than the
   viewport, then the scroll position is kept wrapped inside one repeat
   (`unit`). Scrolling past `unit` lands on a pixel-identical arrangement, so
   the wrap is invisible — there is no jump to hide.

   `unit` is measured as the distance between the first original card and its
   first clone, not computed from widths. That way flex `gap` and the track's
   padding are already accounted for; deriving it arithmetically leaves a
   one-gap error that accumulates into a visible stutter.
   ========================================================================== */

(function () {
  "use strict";

  var SPEED = 45; /* px per second — matches the old animation's pace */
  var FRICTION = 0.94; /* per-frame decay of a release fling */
  var MIN_FLING = 0.4; /* px/frame below which drift takes back over */

  var instances = [];
  var ticking = false;
  var lastTime = 0;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init() {
    var rows = document.querySelectorAll(".sw-reviews .sw-marquee");
    for (var i = 0; i < rows.length; i++) setup(rows[i]);

    if (instances.length && !ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }

  function setup(row) {
    if (row.dataset.swBound) return;
    row.dataset.swBound = "1";

    var track = row.querySelector(".sw-marquee-track");
    if (!track) return;

    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

    var dir = row.classList.contains("is-reverse") ? -1 : 1;
    var unit = 0;
    /* The drift is sub-pixel per frame (45px/s is 0.75px at 60fps). Reading
       scrollLeft back each frame truncates that fraction, so the position
       never accumulates and the row sits still. Keep our own float and
       treat scrollLeft as write-only, syncing back only when something
       else (a drag, the wheel, a trackpad swipe) moves it. */
    var pos = 0;
    var fling = 0;
    var dragging = false;
    var startX = 0;
    var startScroll = 0;
    var lastX = 0;
    var lastMoveTime = 0;
    var velocity = 0;

    /* Repeat the cards until there is a full repeat of runway on BOTH
       sides of the resting position. scrollLeft can never go below 0, so if
       we rested inside the first repeat a trackpad swipe leftwards would hit
       the clamp and stop dead. Resting in the middle repeat and keeping the
       position wrapped into [unit, 2*unit) leaves `unit` px of travel either
       way before the browser clamps — which is what makes native horizontal
       scrolling loop as seamlessly as the drift does.

       Needs maxScroll >= 2*unit, i.e. (copies - 2) * unit >= viewport. */
    function build() {
      while (track.children.length > originals.length) {
        track.removeChild(track.lastChild);
      }

      var oneSet = track.scrollWidth;
      var viewport = row.clientWidth;
      var copies = Math.max(3, Math.ceil(viewport / Math.max(oneSet, 1)) + 2);

      for (var c = 1; c < copies; c++) {
        for (var i = 0; i < originals.length; i++) {
          var clone = originals[i].cloneNode(true);
          /* The copies are decorative duplicates — don't read them out. */
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        }
      }

      unit =
        track.children[originals.length].offsetLeft -
        track.children[0].offsetLeft;

      pos = wrap(pos);
      row.scrollLeft = pos;
    }

    /* Normalise into the middle repeat: [unit, 2*unit). */
    function wrap(x) {
      if (!unit) return x;
      return (((x - unit) % unit) + unit) % unit + unit;
    }

    /* ── Drag ────────────────────────────────────────────────
       Mouse only. Touch is left to the browser, whose native momentum
       scrolling feels better than anything reimplemented here. */
    row.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      fling = 0;
      velocity = 0;
      startX = lastX = e.clientX;
      startScroll = pos;
      lastMoveTime = e.timeStamp;
      row.classList.add("is-dragging");
      if (row.setPointerCapture) row.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    row.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      /* Recompute from the original anchor each move, then wrap. Wrapping
         shifts by exactly one repeat, which is pixel-identical content, so
         the drag stays continuous even past the ends. */
      pos = wrap(startScroll - (e.clientX - startX));
      row.scrollLeft = pos;

      var dt = e.timeStamp - lastMoveTime;
      if (dt > 0) {
        /* px per 60fps frame, lightly smoothed so one jittery sample
           doesn't dominate the release velocity. */
        var v = ((lastX - e.clientX) / dt) * 16.67;
        velocity = velocity * 0.7 + v * 0.3;
        lastX = e.clientX;
        lastMoveTime = e.timeStamp;
      }
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      row.classList.remove("is-dragging");
      if (row.releasePointerCapture && e.pointerId != null) {
        try {
          row.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      fling = velocity; /* coast, then hand back to the drift */
      velocity = 0;
    }

    row.addEventListener("pointerup", endDrag);
    row.addEventListener("pointercancel", endDrag);
    row.addEventListener("lostpointercapture", endDrag);

    function step(dt) {
      if (!unit) return;
      if (dragging) return; /* the pointer owns the position */

      var delta;
      if (Math.abs(fling) > MIN_FLING) {
        delta = fling;
        fling *= FRICTION;
      } else {
        fling = 0;
        if (reduceMotion) return;
        /* Pause under the cursor. Queried rather than tracked with
           enter/leave events, because pointer capture during a drag
           suppresses those and the row would get stuck paused. A release
           fling is allowed to finish first (handled above), so letting go
           still coasts even with the cursor resting on the row. */
        if (row.matches(":hover")) return;
        delta = dir * SPEED * dt;
      }

      pos = wrap(pos + delta);
      row.scrollLeft = pos;
    }

    /* Wheel, shift+wheel, trackpad swipe and native touch scrolling all
       move scrollLeft behind our back. Adopt the new position when it
       diverges from ours by more than a rounding error. */
    row.addEventListener(
      "scroll",
      function () {
        if (dragging) return;
        var sl = row.scrollLeft;
        if (sl < unit || sl >= unit * 2) {
          /* Drifted out of the middle repeat — usually a trackpad fling.
             Re-centre onto the identical position one repeat over; the
             browser's momentum carries on against the new offset. */
          pos = wrap(sl);
          row.scrollLeft = pos;
        } else if (Math.abs(sl - pos) > 2) {
          pos = sl;
        }
      },
      { passive: true }
    );

    build();
    if (window.ResizeObserver) {
      new ResizeObserver(build).observe(row);
    } else {
      window.addEventListener("resize", build);
    }

    instances.push({ step: step, rebuild: build });
  }

  function tick(now) {
    /* Clamp dt so a backgrounded tab doesn't resume with one huge jump. */
    var dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    lastTime = now;
    for (var i = 0; i < instances.length; i++) instances[i].step(dt);
    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  /* Card widths settle once fonts and avatars land — remeasure then. */
  window.addEventListener("load", function () {
    init();
    for (var i = 0; i < instances.length; i++) instances[i].rebuild();
  });
})();
