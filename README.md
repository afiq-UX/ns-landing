# N9 homepage — scroll-reveal prototype

Open `index.html` in a browser. No build step, no server needed.

```
n9-home/
├── index.html          markup + reveal hooks
├── css/
│   ├── tokens.css      ← edit this first, almost always
│   ├── base.css        reset, layout primitives, type primitives
│   ├── components.css  every named block, in page order
│   └── motion.css      the whole reveal system
└── js/
    └── reveal.js       IntersectionObserver controller
```

## Where to change what

| You want to change | File |
|---|---|
| A colour, a font size, spacing, how fast anything animates | `tokens.css` |
| How a section is spaced, the container width, focus rings | `base.css` |
| How the header / hero / breaker / cards / footer look | `components.css` |
| Which reveal a thing uses, or how it moves | `motion.css` + the `data-reveal` attribute in `index.html` |
| When a reveal fires (how far into view) | `reveal.js`, the `threshold` / `rootMargin` block |

`tokens.css` maps one-to-one onto the Figma styles. `--n9-red`, `--n9-yellow`,
`--n9-black`, `--n9-light` are the N9 Main Colors paint styles. Change a value
there and it propagates everywhere — nothing downstream hardcodes a hex.

## The reveal system

Four treatments, picked per element with `data-reveal="…"` in the HTML:

| Value | What it does | Used on |
|---|---|---|
| `rise` | 10px lift + fade | section heads, lead paragraphs, footer |
| `wipe` | text climbs out of a clipping mask, line by line | hero title, breaker wordmarks, footer wordmark |
| `draw` | scales from 0 → 1 left to right | the yellow rules under breaker wordmarks |
| `stagger` | children arrive in sequence | card grids, link grids, news list |

Stagger step is `--stagger` in `tokens.css` (70ms). Children get their index
from JS as `--i`, so adding or removing a card needs no code change.

## Three decisions baked in

1. **The hidden state is applied by JavaScript, not CSS.** `reveal.js` adds
   `.js-reveal` to `<html>`; every hidden rule in `motion.css` is scoped under
   it. If the script 404s or throws, the page renders fully visible. A reveal
   system that can permanently hide content is a bug, not an effect.

2. **Reveals fire once.** Elements are unobserved after they arrive. Replaying
   on every scroll-up reads as a glitch.

3. **`prefers-reduced-motion` is honoured twice** — `reveal.js` skips the
   observer entirely, and `motion.css` force-resets every transform. It is off,
   not faster. Required for MGDS / WCAG 2.2 SC 2.3.3.

## Known gaps

- Fonts load from Google Fonts. For a government deployment, self-host the
  woff2 files and drop the `<link>`.
- The news image is a grey placeholder block.
- Nav is static — the mega menu is not built here.
- Nothing is wired to real URLs.
