---
title: "Support shareable links (?q= and ?acc=)"
labels: ["enhancement"]
---

## Context

Every search starts from a blank page, so there is no way to link a colleague to "p53" or bookmark a result.

## Task

- On load, read `?q=<text>` or `?acc=<accession>` and run the matching search.
- After a search or example click, update the address bar with `history.replaceState` so the URL can be copied.
- Treat the values as untrusted: they go through the same `runSearch` path as typed input, and must never be written to the page as HTML.

## Acceptance

- [ ] Opening `/?q=insulin` shows insulin without any clicking.
- [ ] Opening `/?acc=P04637` shows p53.
- [ ] Searching updates the URL, and reloading that URL reproduces the result.
- [ ] A missing or empty parameter does nothing.

## Pointers

- `app.js:285-309`, `runSearch`
- `app.js:312-324`, the form submit and example-button handlers
- `docs/ARCHITECTURE.md`, update the sequence if behaviour changes
