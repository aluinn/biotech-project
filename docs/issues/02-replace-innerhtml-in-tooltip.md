---
title: "Build the residue tooltip with DOM nodes instead of innerHTML"
labels: ["good first issue", "security", "refactor"]
---

## Context

When you hover or tap a residue, `inspectResidue` writes the tooltip with `tooltip.innerHTML`, interpolating `atom.resn` and `atom.resi` from the AlphaFold structure file. The data comes from a trusted source, but it is still external input, and every other place in the app uses `textContent`. Removing `innerHTML` closes the one remaining gap.

## Task

Rebuild the tooltip content with `document.createElement` and `textContent`: a `<strong>` with the residue name and position, and a `<span>` containing an `<i>` colour swatch plus the confidence text. The look must not change.

## Acceptance

- [ ] No `innerHTML` is left in `app.js`.
- [ ] The tooltip looks identical before and after (compare screenshots from `npm run screenshots`).
- [ ] Hover on desktop and tap on a phone-width emulation both still work.

## Pointers

- `app.js:142-155`, `inspectResidue`
- `style.css:206-221`, the `.tooltip` rules
