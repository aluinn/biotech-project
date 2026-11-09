---
title: "Run the two UniProt searches in parallel"
labels: ["enhancement", "performance"]
---

## Context

`findProteins` awaits the gene-name query and then the text query, one after the other. They are independent, so the user waits for both round trips in sequence (about 270 ms together in [PERFORMANCE.md](../PERFORMANCE.md)). Gene matches must still be listed first.

## Task

Start both requests together with `Promise.all`, then merge them exactly as today (gene matches first, de-duplicated, first five). Keep the third fallback query (any reviewed entry) only for the case where both return nothing.

## Acceptance

- [ ] Results and their order are identical to before for "p53", "insulin" and "hemoglobin".
- [ ] `node scripts/benchmark.mjs` shows a lower free-text search time. Include before and after numbers in the PR.
- [ ] If either request fails, the user still sees the existing error message.

## Pointers

- `app.js:37-49`, `findProteins`
- `scripts/benchmark.mjs`, the "Free-text search" measurement
