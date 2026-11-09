---
title: "Expose the selected match to screen readers with aria-pressed"
labels: ["good first issue", "accessibility"]
---

## Context

When a search returns several matches, the chosen one is shown only by toggling the `active` CSS class (a green background). Screen-reader users get no indication of which match is selected.

## Task

Set `aria-pressed="true"` on the selected match button and `"false"` on the others, in the same place the `active` class is toggled. Give the matches container an accessible name (for example `aria-label="Matching proteins"`).

## Acceptance

- [ ] Inspecting the DOM shows exactly one match with `aria-pressed="true"`, and it changes when you click another match.
- [ ] Visual appearance is unchanged.
- [ ] Tested with VoiceOver, NVDA, or the browser's accessibility tree.

## Pointers

- `app.js:263`, where `active` is toggled in `showProtein`
- `app.js:267-282`, `showMatches`, where the buttons are created
- `index.html`, the `#matches` div
