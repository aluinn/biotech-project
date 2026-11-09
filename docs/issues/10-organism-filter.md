---
title: "Add an organism filter to search"
labels: ["enhancement"]
---

## Context

Searches are limited to human proteins first (taxonomy ID 9606) and only fall back to other organisms when no human match exists. Someone looking for, say, mouse or *E. coli* insulin-like proteins cannot ask for them.

## Task

Add a small `<select>` next to the search box with "Human (default)", "Any organism" and a few common model organisms (mouse 10090, *E. coli* K-12 83333, yeast 559292). Pass the choice into `findProteins` so the `organism_id:` clause changes (or is dropped for "Any").

## Acceptance

- [ ] Default behaviour is unchanged.
- [ ] Choosing "Mouse" and searching "insulin" returns mouse entries.
- [ ] Example buttons ignore the filter, since they search by accession.
- [ ] The control is labelled for screen readers and fits at 390 px width.

## Pointers

- `app.js:37-49`, `findProteins` and the hard-coded `organism_id:9606`
- `index.html:26-29`, the search form
- `docs/DATA_SOURCES.md`, update the query list
