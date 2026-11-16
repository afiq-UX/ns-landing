# CLAUDE.md

Context for Claude Code working in this repo.

## What this is

A static prototype of the Negeri Sembilan state government portal homepage
(ns.gov.my redesign, client: SUK Negeri Sembilan, agency: Pocketpixel).
Its one job is to demonstrate **scroll-reveal motion** that Figma cannot
prototype natively, for a client with no UX background.

It is a prototype, not the production build. Production is Drupal.

## Stack

Plain HTML, CSS and one vanilla JS file. No build step, no framework, no
package.json. Open `index.html` directly.

Do not introduce a bundler, a framework, Tailwind, or a dependency without
being asked. The point of this artefact is that a government IT team can
open it and read it.

## File map

```
index.html          markup + data-reveal hooks
css/tokens.css      design tokens — the only place a literal value belongs
css/base.css        reset, layout primitives, type primitives
css/components.css  named page blocks, in page order
css/motion.css      the reveal system, isolated
js/reveal.js        IntersectionObserver controller
```

The split is by **rate of change**, not by file type. Keep it that way.

## Conventions

- **No hardcoded values outside `tokens.css`.** No hex, no px font sizes, no
  durations. If you need a new one, add a token first. `--n9-red`,
  `--n9-yellow`, `--n9-black`, `--n9-light` mirror the Figma "N9 Main Colors"
  paint styles and must keep those exact values.
- **Zero border-radius.** The locked visual direction is brutalist-corpo:
  hairlines (`--rule`), square corners, Urbanist ExtraBold display over Inter
  body. Do not soften it.
- **Motion is spent in one place.** Only breaker wordmarks wipe. Everything
  else is a 10px rise. Do not add fade-up to every section or hover-lift to
  every card.
- Copy is Bahasa Malaysia. Keep it that way, sentence case, plain verbs.
- Typographic apostrophes (’) in prose, straight quotes in code.

## The reveal contract — do not break these

1. The hidden state is applied by **JavaScript**, never by CSS alone.
   `reveal.js` adds `.js-reveal` to `<html>`; every hidden rule in
   `motion.css` is scoped under it. If the script fails, the page must render
   fully visible. Never move a hidden state out from under `.js-reveal`.
2. Reveals fire **once**. Elements are unobserved after arriving. Do not add
   replay-on-scroll-up.
3. `prefers-reduced-motion` is honoured in **both** `reveal.js` (skips the
   observer) and `motion.css` (force-resets transforms). Both must stay.
   This is WCAG 2.2 SC 2.3.3 and MGDS will be audited against it.

`data-reveal` values: `rise` | `wipe` | `draw` | `stagger`.
Stagger indices are set by JS as `--i`; adding cards needs no code change.

## Accessibility floor

- Focus is visible and square; never remove the outline.
- N9 Red `#ff0000` on white measures **4.0:1** — it fails SC 1.4.3 for normal
  text. Use it for blocks, bars and fills only. If red text on white is
  needed, darken to ~`#d40000` (≈5.5:1).
- N9 Yellow `#fcee21` is surface-only, never text on white.

## Known gaps / likely next tasks

- Self-host the Urbanist + Inter woff2 files and drop the Google Fonts
  `<link>` (government deployment, no third-party font CDN).
- News section uses a grey placeholder block for the image.
- Nav is static. The mega menu (3 menus: Info & Perkhidmatan, Kerajaan,
  Kakitangan) exists in Figma as component sets but is not built here.
- Nothing is wired to real URLs.
- No mobile nav / hamburger yet; layout reflows but the nav does not collapse.

## Verifying changes

There are no tests. Check work by rendering it:

```bash
python3 -m http.server 8000
```

then open http://localhost:8000. For a headless check, Playwright against the
local URL, forcing reveals in before screenshotting:

```js
document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in'))
```

Check the page at 1280, 1000, 620 and 380 wide, and with reduced motion on.
