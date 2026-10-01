/* ==========================================================================
   00 — ASSET RESOLVER

   WHY THIS EXISTS
   The markup never hardcodes a media URL. Instead every image, video, poster
   and link carries a dotted key:

     <img  data-sw-src="classes.summerCamp">
     <video data-sw-src="hero.media" data-sw-poster="hero.poster"></video>
     <div  data-sw-bg="bio.portrait"></div>
     <a    data-sw-href="links.signup">

   The key resolves against DEFAULTS below, overridden by anything you put in
   `window.SW_ASSETS` from a Kajabi head snippet. That means you can point any
   asset at a file in your Kajabi library without touching this repo — and a
   GIF, an MP4 and a JPEG are all swappable at the same key.

   Resolution order:  window.SW_ASSETS  →  DEFAULTS  →  leave element as-is

   Anything unresolved keeps whatever is already in the markup, so a plain
   `<img src="...">` with no data-attribute still works.
   ========================================================================== */

(function () {
  "use strict";

  /* Shipped defaults — the Kajabi CDN URLs currently in use.
     Override individual keys from Kajabi; you never need to fork this. */
  var DEFAULTS = {
    brand: {
      logoGreen:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/56088e3-c0ac-7e0-0247-3486f4022acd_Sir_Wade_-_Secondary_LogoArtboard_6_4.png",
      logoCream:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/56088e3-c0ac-7e0-0247-3486f4022acd_Sir_Wade_-_Secondary_LogoArtboard_6_4.png",
    },

    hero: {
      /* The portal plate, extracted from Revisions_BannerV2.png and served
         from this repo. It is a STILL LIFTED FROM A FLATTENED COMP, not the
         original render — good enough to ship, soft on retina.

         Replace it with the real plate (or better, a looping video) by
         pointing this key at your own upload; .mp4/.webm/.gif all work and
         the <img> is swapped for a <video> automatically. */
      media:
        "https://cdn.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@v1.6.0/assets/hero-rift.webp",
      poster: "",
    },

    classes: {
      summerCamp:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2166669474/settings_images/f6b1d8f-536d-ae7-5150-73ad053768_73f4cd17-0ddd-43ae-81ce-c5a401f84924.jpg",
      unreal:
        "https://media.fab.com/image_previews/gallery_images/de07d304-8f7f-4219-aa46-08287fa2baaa/919fb3a3-1552-483a-96b0-bcb821146580.jpg",
      maya: "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/8cd874-107-acb-a6fd-801d1fa8113_60f2c02c-5e2c-4c25-a9f2-f08033e10982.jpg",
      basics:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/830c26e-25a-6ceb-ca0e-b65ae7b311a_Fundamentals.png",
    },

    /* Software badges in the Mentorship pennant. Replace with your own
       uploads if you'd rather not hotlink. */
    apps: {
      maya: "",
      unreal: "",
      blender: "",
    },

    bio: {
      portrait:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/sites/2147638896/images/4a11cb-f6e-77ab-31d-85630f7caf5d_SW-ProfilePic2022.jpg",
    },

    avatars: {
      ariana:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/110d0c-dfae-0eb1-fc77-80b748e13c0a_2ff1a14b-0aac-42a1-a838-912000cbeccd.png",
      carlos:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/5421801-c783-0e66-4ee0-cfa0f72a468c_2ff1a14b-0aac-42a1-a838-912000cbeccd.png",
      charlotte:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/57a32c3-220-a5e3-6c08-5cf1b6b78a_2ff1a14b-0aac-42a1-a838-912000cbeccd.png",
      sarthak:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/43216d-6620-e345-2ddb-52ee210aba0b_3ec6c010-1f22-4850-a528-391f6a79da09.png",
      amanda:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/72b0f-f310-e42d-ebfb-2fe43c826b0_2ff1a14b-0aac-42a1-a838-912000cbeccd.png",
    },

    /* Tutorials coverflow. Each value may be a bare YouTube video id, any
       YouTube URL, or a plain image URL — see `data-sw-yt` below.

       Left empty on purpose: these are YOUR videos, and a wrong id renders
       YouTube's grey placeholder rather than failing loudly. Fill them in
       from blocks/00-head.html:
         tutorials: { t1: "dQw4w9WgXcQ", t2: "...", ... }                  */
    tutorials: {
      t1: "",
      t2: "",
      t3: "",
      t4: "",
      t5: "",
    },

    links: {
      signup: "https://courses.sirwade.com/store",
      login: "https://courses.sirwade.com/login",
      courses: "https://courses.sirwade.com/store",
      mentorship: "https://courses.sirwade.com/store",
      tutorials: "https://www.youtube.com/@SirWade",
      waitlist: "https://bit.ly/b3dworkshoplist",
      about: "https://courses.sirwade.com/about",
      summerCamp: "https://courses.sirwade.com/animation-summer-camp",
      unreal: "https://courses.sirwade.com/unrealsummer",
      maya: "https://courses.sirwade.com/maya-for-animators-2023",
      basics: "https://courses.sirwade.com/animation-basics",
    },
  };

  /* Deep-merge user overrides over the defaults. Objects merge key by key so
     `SW_ASSETS = { hero: { media: "..." } }` keeps every other hero key. */
  function merge(base, over) {
    var out = {},
      k;
    for (k in base) {
      if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    }
    for (k in over) {
      if (!Object.prototype.hasOwnProperty.call(over, k)) continue;
      var bv = out[k],
        ov = over[k];
      var bothPlain =
        bv &&
        ov &&
        typeof bv === "object" &&
        typeof ov === "object" &&
        !Array.isArray(bv) &&
        !Array.isArray(ov);
      out[k] = bothPlain ? merge(bv, ov) : ov;
    }
    return out;
  }

  var assets = merge(DEFAULTS, window.SW_ASSETS || {});

  /* "classes.summerCamp" → assets.classes.summerCamp */
  function get(path) {
    if (!path) return "";
    var parts = String(path).split("."),
      node = assets;
    for (var i = 0; i < parts.length; i++) {
      if (node == null || typeof node !== "object") return "";
      node = node[parts[i]];
    }
    return typeof node === "string" ? node : "";
  }

  var VIDEO_RE = /\.(mp4|webm|ogv|mov)(\?|#|$)/i;

  function applyTo(root) {
    var scope = root || document;

    /* src — handles <img>, <video>, <source>, <iframe>.
       A video URL landing on an <img> is upgraded to a muted autoplay
       <video> in place, so one key can hold either a GIF or an MP4. */
    each(scope, "[data-sw-src]", function (el) {
      var url = get(el.getAttribute("data-sw-src"));
      if (!url) return;

      if (el.tagName === "IMG" && VIDEO_RE.test(url)) {
        el.parentNode.replaceChild(buildVideo(el, url), el);
        return;
      }
      if (el.tagName === "VIDEO" && !VIDEO_RE.test(url)) {
        el.parentNode.replaceChild(buildImage(el, url), el);
        return;
      }
      el.setAttribute("src", url);
    });

    each(scope, "[data-sw-poster]", function (el) {
      var url = get(el.getAttribute("data-sw-poster"));
      if (url) el.setAttribute("poster", url);
    });

    each(scope, "[data-sw-bg]", function (el) {
      var url = get(el.getAttribute("data-sw-bg"));
      if (url) el.style.backgroundImage = 'url("' + url + '")';
    });

    each(scope, "[data-sw-href]", function (el) {
      var url = get(el.getAttribute("data-sw-href"));
      if (url) el.setAttribute("href", url);
    });

    /* YouTube shorthand. One key drives both the link and the thumbnail:
         <a data-sw-yt="tutorials.t1"><img alt=""></a>
       The value can be a bare id, a watch/youtu.be/embed URL, or a plain
       image URL (in which case only the <img> is filled and the href is
       left alone). */
    each(scope, "[data-sw-yt]", function (el) {
      var value = get(el.getAttribute("data-sw-yt"));
      if (!value) return;

      var img = el.tagName === "IMG" ? el : el.querySelector("img");
      var id = youtubeId(value);

      if (id) {
        if (el.tagName === "A") {
          el.setAttribute("href", "https://www.youtube.com/watch?v=" + id);
        }
        if (img) {
          img.onerror = function () {
            img.onerror = null;
            img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
          };
          img.setAttribute("src", ytThumb(id));
        }
      } else if (img) {
        img.setAttribute("src", value);
      }
      el.classList.add("has-media");
    });

    /* Any media that failed to resolve AND has no usable src shows the
       section's fallback panel instead of a broken-image icon. */
    each(scope, "[data-sw-fallback]", function (el) {
      var target = el.previousElementSibling;
      var live = target && (target.getAttribute("src") || "").length > 0;
      el.style.display = live ? "none" : "";
    });
  }

  /* Accepts "dQw4w9WgXcQ", "https://youtu.be/ID", "…/watch?v=ID",
     "…/embed/ID" and "…/shorts/ID". Returns null for anything else. */
  function youtubeId(value) {
    var v = String(value).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    var m = v.match(
      /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/,
    );
    return m ? m[1] : null;
  }

  /* maxresdefault doesn't exist for every upload; hqdefault always does.
     Fall back on error rather than leaving a broken thumbnail. */
  function ytThumb(id) {
    return "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
  }

  function each(scope, sel, fn) {
    var nodes = scope.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  function carryAttrs(from, to) {
    for (var i = 0; i < from.attributes.length; i++) {
      var a = from.attributes[i];
      if (a.name === "src" || a.name === "poster") continue;
      to.setAttribute(a.name, a.value);
    }
  }

  function buildVideo(from, url) {
    var v = document.createElement("video");
    carryAttrs(from, v);
    v.autoplay = v.muted = v.loop = v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    var poster = get(from.getAttribute("data-sw-poster"));
    if (poster) v.setAttribute("poster", poster);
    v.src = url;
    return v;
  }

  function buildImage(from, url) {
    var img = document.createElement("img");
    carryAttrs(from, img);
    img.src = url;
    return img;
  }

  /* Kajabi renders each custom code block separately and some sections can
     mount after this script runs, so re-apply on DOM additions as well. */
  function boot() {
    applyTo(document);
    if (!window.MutationObserver) return;
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        applyTo(document);
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* Exposed so you can re-resolve after injecting markup yourself:
       SWAssets.apply();            // re-scan the page
       SWAssets.get("links.login"); // read a resolved value */
  window.SWAssets = { apply: applyTo, get: get, all: assets };
})();
