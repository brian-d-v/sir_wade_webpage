# Sir Wade — Kajabi homepage

Source for the sirwade.com homepage. CSS and JS are built into two files in
`dist/` and served free over **jsDelivr** straight from this repo; the HTML
lives in **one Kajabi custom code block per section**.

Nothing here is a site generator. Kajabi renders the page — this repo just
supplies the stylesheet, the behaviour and the markup you paste in.

---

## How the pieces fit

```
Kajabi page
├── Head snippet ............... blocks/00-head.html
│     ├── Google Fonts
│     ├── window.SW_ASSETS  ← your Kajabi media URLs
│     ├── optional :root token overrides
│     └── <link>/<script> → cdn.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@TAG/dist/*
│
└── Section blocks (one Kajabi Custom Code block each)
      01-nav · 02-hero · 03-classes · 04-mentorship · 05-reviews
      06-bio · 07-tutorials · 08-newsletter · 09-footer
```

Each section block is **markup only**. Styling and behaviour come from the two
CDN files, so a design change is a commit here, not nine copy-pastes in Kajabi.

---

## Repo layout

| Path | What it is |
| --- | --- |
| `src/css/*.css` | Source stylesheets, concatenated in filename order |
| `src/js/*.js` | Source scripts, same ordering rule |
| `dist/sirwade.css`, `dist/sirwade.js` | **Generated.** What jsDelivr serves. Never edit by hand |
| `blocks/*.html` | The snippets you paste into Kajabi |
| `preview.html` | **Generated.** Whole page assembled locally — open it in a browser |
| `build.mjs` | Concatenates src → dist and regenerates the preview |
| `legacy/homepage-v1.html` | The previous single-block version, kept for reference |

### CSS file order

Prefixes control cascade order, so a later file can override an earlier one:

```
00-tokens  → colours, fonts, spacing, the hero-arc geometry
01-base    → scoping, container, buttons, waves, doodles
10-nav  20-hero  30-classes  40-mentorship  50-reviews
60-bio  70-tutorials  80-newsletter  90-footer
```

---

## Working on it

```bash
node build.mjs          # rebuild dist/ and preview.html
open preview.html       # see the whole page with local (uncommitted) files
```

`preview.html` rewrites the CDN `<link>`/`<script>` to local `dist/` paths, so
what you see is your working tree, not what's live.

No dependencies, no `node_modules`, no bundler — jsDelivr serves the committed
`dist/` files directly, so the build has to stay inspectable.

**Always run `node build.mjs` and commit `dist/` before pushing.** jsDelivr
serves what's in the repo; unbuilt source changes are invisible to the live
site.

---

## Assets: keeping Kajabi media swappable

No media URL is hardcoded in the markup. Elements carry a dotted key that
resolves through `src/js/00-assets.js`:

```html
<img  data-sw-src="classes.summerCamp">
<div  data-sw-bg="…">
<a    data-sw-href="links.signup">
<a    data-sw-yt="tutorials.t1"><img></a>
```

Resolution order: **`window.SW_ASSETS` → shipped defaults → leave as-is.**

So to point the hero at a GIF in your Kajabi library, you edit the Kajabi head
snippet — not this repo, and no CDN purge:

```js
window.SW_ASSETS = {
  hero: { media: "https://kajabi-cdn.../portal-loop.gif" },
};
```

Three conveniences worth knowing:

- **Format-agnostic.** If a key resolves to `.mp4`/`.webm`/`.mov`, an `<img>`
  is swapped for a muted autoplaying `<video>` in place. Point the same key at
  a `.jpg` later and it swaps back. One key, any format.
- **`data-sw-yt`** takes a bare YouTube id, any YouTube URL, or a plain image
  URL, and fills in both the thumbnail and the watch link from that one value.
- **Partial overrides.** `SW_ASSETS` deep-merges, so setting one key inside
  `classes` leaves the other three alone.

`window.SWAssets.apply()` re-resolves the page if you inject markup yourself.

### Theme tokens

Every colour, font and the hero-arc geometry are CSS custom properties on
`:root` (see `src/css/00-tokens.css`). They can be overridden from the same
Kajabi head snippet, which makes "try a different green" a 10-second edit with
no deploy:

```css
:root { --sw-green: #2f6a4c; }
```

---

## Hosting on jsDelivr

jsDelivr serves any public GitHub repo for free, no account or config:

```
https://cdn.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@TAG/dist/sirwade.css
```

**This repo must stay public.** jsDelivr cannot read private repos — flipping
it back to private takes the live site's CSS and JS down with it.

### Which `@TAG` to use

| Ref | Cache | Use for |
| --- | --- | --- |
| `@main` | up to 12h | Development. Convenient, but edits take hours to show |
| `@v1.2.3` | permanent | **Production.** A tag is immutable, so it's cached hard and can never change under you |

The head snippet is currently pinned to **`@v1.6.0`**.

Floating refs like `@main` and `@latest` are cached for 12 hours. During a
build-out that lag is maddening; pin a tag once the page is live.

### Releasing a new version

```bash
node build.mjs
git add -A && git commit -m "Tweak hero arc"
git tag v1.6.1
git push && git push --tags
```

Then bump the tag in the two CDN URLs in the Kajabi head snippet
(`@v1.6.0` → `@v1.6.1`). The old version keeps serving until you do, so the
live page never breaks mid-release.

If a release touches `assets/`, bump the tag in `src/js/00-assets.js` too —
the shipped hero plate is referenced by an absolute, tag-pinned URL.

### Forcing an update on `@main`

If you're on a floating ref and need the change now, purge it:

```
https://purge.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@main/dist/sirwade.css
```

Hit that URL in a browser. Purging is rate-limited, which is the other reason
to pin tags in production.

---

## Pasting into Kajabi

1. **Head snippet** — Site Settings (or Page Settings) → Custom Code → Head.
   Paste `blocks/00-head.html` as-is; its CDN URLs are already pinned to
   `brian-d-v/sir_wade_webpage@v1.6.0`.
2. **Sections** — add one Custom Code block per file, in numeric order, pasting
   the whole file each time.
3. Setting each section to **Full Width** with **0 padding** is still worth
   doing, but the stylesheet no longer depends on it — it strips the
   wrappers' side padding and max-width itself.
4. The nav and footer blocks are optional — skip them if you're keeping
   Kajabi's native header and footer. Nothing else depends on them.

### Gaps around the blocks

Kajabi wraps every custom code block in a centred, padded container, which
shows up as a margin around each full-width band. The two axes are handled
very differently, and the asymmetry is deliberate:

- **Sideways — remove the constraint, don't escape it.** The same `:has()`
  rule drops the wrappers' side padding and `max-width`, so the block fills
  them naturally at `width: 100%`.

  Two earlier versions tried to *escape* the container instead — first with
  `margin-inline: calc(50% - 50vw)`, then with JS measuring the real offset.
  Both shifted blocks off the left edge, because both had to work out where
  the container sat, and Kajabi's wrappers differ between the editor, the
  theme preview and the live page.

  Removing the constraint needs no such guess. It is also strictly safer:
  a negative margin can move a block off-screen, whereas dropping a padding
  can only ever make something wider. Worst case here is an element keeping
  an inset it didn't need.

  `legacy/homepage-v1.html` is the proof — it reaches the edges with no CSS
  tricks whatsoever. The constraint was always the thing to remove.

- **Vertically — a `:has()` rule** zeroes padding on the four wrapper levels
  above each block. It selects on *what the wrapper contains*, since those
  wrappers are Kajabi's and their class names vary by theme. Four levels
  because Kajabi nests roughly `section > container > content > block`, and
  the padding lives on the outermost one.

  This one stays in CSS because it only ever *removes* spacing. It can't
  mis-position anything, so the failure mode that killed the horizontal
  version doesn't apply.

So a freshly pasted block should sit flush without any editor work. If a gap
survives:

1. **Bands not reaching the edges** — the section isn't set to Full Width.
   Editor → section settings → Width → Full.
2. **A gap above the first band** — this is almost always the head snippet
   pasted into a page Custom Code block rather than Settings → Custom Code
   → Head. Its tags render nothing, but Kajabi still wraps them in a full
   section, which takes a full section's padding: ~230px of blank space
   with nothing in it.

   Move it to the Head setting. That also removes the flash of unstyled
   content you get when the CSS loads from inside the body. If it stays in
   a block, the stylesheet now collapses the empty wrappers around it via
   the `sw-head-marker` element at the top of the snippet — but that's a
   safety net, not the intended setup.
3. **Leftover space between bands** — zero the section's top/bottom padding
   in the editor. If a theme won't let you, set `--sw-bleed-y: -40px` in the
   head snippet's `:root` block as a last resort.

`sw-keep-wrapper` on a block root opts its ancestors out of the vertical
reset. `sw-contained` and `sw-bleed` still parse but do nothing — they're
kept so blocks pasted against older versions keep working.

### Before going live

- [ ] Upload a **green** `SirWade` wordmark and set `brand.logoGreen`, then
      drop the `sw-tint-green` class from `blocks/01-nav.html`. The default is
      the cream logo recoloured with a CSS filter — a stopgap, not the asset.
- [ ] Replace the hero plate. `assets/hero-rift.webp` was extracted from the
      flattened mockup — correct framing, but soft on retina and a still where
      the design implies motion. Point `hero.media` at the real render, or a
      looping `.mp4`/`.webm` (the `<img>` becomes a `<video>` on its own).
- [ ] Fill in `tutorials.t1`–`t5` with real YouTube ids. They ship empty on
      purpose: a wrong id renders YouTube's grey placeholder instead of
      failing visibly.
- [ ] Wire the newsletter form (see the comment in `blocks/08-newsletter.html`).
      As shipped it does nothing on submit, deliberately — so it can't swallow
      signups before it's connected.
- [ ] Optionally set `apps.maya` / `apps.unreal` / `apps.blender` for the
      Mentorship badges. Unset keys hide their slot rather than break.

---

## Notes on a few techniques

**Scoping.** Separate Kajabi blocks can't share one `#id` wrapper, so every
block root carries `.sw-scope` and all CSS is anchored to it. Kajabi's theme
can't bleed in; ours can't bleed out.

**The hero arc** is a `clip-path: ellipse()` whose geometry was *measured*,
not eyeballed: the cream/plate boundary is traced out of the mockup row by
row, then least-squares fitted to a circle — centre (99.5%, 157%), radius
79.7% of the hero width, max error 22px across 1,125 rows. Written in
percentages it holds the same composition at any viewport. Reshape it from the
`--sw-hero-arc-*` tokens; below 900px it drops to a full-bleed scrim.

Two things depend on those numbers staying in sync. The hero copy column is
sized against the measured clearance (the headline reaches 44.4% of the hero
width where the arc is at 50.6%), and `assets/hero-rift.webp` has the region
the arc hides edge-extended using the same ellipse. Change the tokens and both
want revisiting.

**Wave dividers** are inline SVG on the *upper* section, filled with the colour
of the section below. The colour is set inline in the block, so the fill and
the next band can never drift apart.

**The review marquee** clones its track in JS, not in the markup — write each
review once. Duration is derived from measured track width, so rows of
different lengths scroll at the same pixel speed.
