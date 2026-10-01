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
│     └── <link>/<script> → cdn.jsdelivr.net/gh/USER/REPO@TAG/dist/*
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
https://cdn.jsdelivr.net/gh/USER/REPO@TAG/dist/sirwade.css
```

**The repo must be public.** jsDelivr cannot read private repos.

### Which `@TAG` to use

| Ref | Cache | Use for |
| --- | --- | --- |
| `@main` | up to 12h | Development. Convenient, but edits take hours to show |
| `@v1.0.0` | permanent | **Production.** A tag is immutable, so it's cached hard and can never change under you |

Floating refs like `@main` and `@latest` are cached for 12 hours. During a
build-out that lag is maddening; pin a tag once the page is live.

### Releasing a new version

```bash
node build.mjs
git add -A && git commit -m "Tweak hero arc"
git tag v1.0.1
git push && git push --tags
```

Then bump `@v1.0.0` → `@v1.0.1` in the Kajabi head snippet. Two URLs to change,
and the old version keeps working until you do.

### Forcing an update on `@main`

If you're on a floating ref and need the change now, purge it:

```
https://purge.jsdelivr.net/gh/USER/REPO@main/dist/sirwade.css
```

Hit that URL in a browser. Purging is rate-limited, which is the other reason
to pin tags in production.

---

## Pasting into Kajabi

1. **Head snippet** — Site Settings (or Page Settings) → Custom Code → Head.
   Paste `blocks/00-head.html`. Replace `USER/REPO` with your handle and repo.
2. **Sections** — add one Custom Code block per file, in numeric order, pasting
   the whole file each time.
3. For every section, set the Kajabi section to **full width** with **0
   padding**. The blocks manage their own spacing; Kajabi's padding fights the
   full-bleed bands and the wave dividers.
4. The nav and footer blocks are optional — skip them if you're keeping
   Kajabi's native header and footer. Nothing else depends on them.

### Before going live

- [ ] Upload a **green** `SirWade` wordmark and set `brand.logoGreen`, then
      drop the `sw-tint-green` class from `blocks/01-nav.html`. The default is
      the cream logo recoloured with a CSS filter — a stopgap, not the asset.
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

**The hero arc** is a `clip-path: ellipse()` fitted to the mockup — a circle
centred at (79%, 120%) of the hero box, radius 56% of its width. Written in
percentages it holds the same composition at any viewport. Reshape it from the
`--sw-hero-arc-*` tokens; below 900px it drops to a full-bleed scrim.

**Wave dividers** are inline SVG on the *upper* section, filled with the colour
of the section below. The colour is set inline in the block, so the fill and
the next band can never drift apart.

**The review marquee** clones its track in JS, not in the markup — write each
review once. Duration is derived from measured track width, so rows of
different lengths scroll at the same pixel speed.
