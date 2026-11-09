---
title: "Cache protein data and structures for the session"
labels: ["enhancement", "performance"]
---

## Context

Clicking back to a protein you've already viewed repeats every request (UniProt, AlphaFold lookup, PDB download). The spike glycoprotein's PDB file is about 1.5 MB. Switching between the match buttons of a search also re-downloads each structure.

## Task

Add an in-memory `Map` keyed by accession for the prediction JSON and PDB text (and optionally the UniProt entry). Check the cache before fetching. Don't persist anything to `localStorage`, and keep the existing `loadCounter` logic so stale loads are still ignored.

## Acceptance

- [ ] Viewing the same protein a second time makes no network requests (check the Network tab).
- [ ] A 404 from AlphaFold is *not* cached as a success.
- [ ] Rapidly switching between proteins still shows the latest one.

## Pointers

- `app.js:185-229`, `loadStructure`
- `app.js:37-49`, `findProteins`
