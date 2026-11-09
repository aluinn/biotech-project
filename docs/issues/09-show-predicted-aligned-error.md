---
title: "Show AlphaFold's predicted aligned error (PAE) image"
labels: ["enhancement"]
---

## Context

pLDDT says how confident AlphaFold is about each residue, but not about how different parts are positioned relative to each other. AlphaFold DB provides a PAE plot for this. The prediction JSON Fold already fetches includes its URL as `paeImageUrl`. See [CONFIDENCE.md](../CONFIDENCE.md#what-the-score-does-not-tell-you).

## Task

Under the confidence legend, add a collapsed `<details>` section "Predicted aligned error" containing the `paeImageUrl` image, with a one or two sentence plain-English explanation and alt text. Load the image lazily, only when the section is opened.

## Acceptance

- [ ] For insulin and p53, opening the section shows the PAE plot.
- [ ] The section is hidden or empty-safe when `paeImageUrl` is missing.
- [ ] The explanation matches the app's tone and says it is a prediction.
- [ ] Works at 390 px width.

## Pointers

- `app.js:207-210`, where the prediction JSON is read
- `index.html:84-97`, the confidence block
- `docs/DATA_SOURCES.md`, update the list of unused fields
