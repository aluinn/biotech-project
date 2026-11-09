---
title: "Add a \"Download PDB\" link for the structure being shown"
labels: ["good first issue", "enhancement"]
---

## Context

The viewer fetches an AlphaFold PDB file, but visitors who want to open it in another tool (PyMOL, ChimeraX) have to find it on the AlphaFold DB site. The file's URL is already in hand: `info[0].pdbUrl`.

## Task

Add a "Download PDB ↓" link next to "View on AlphaFold DB ↗" in the viewer controls. Point it at `pdbUrl` once the prediction lookup succeeds, and hide it (or leave it inert) while loading and when there is no structure.

## Acceptance

- [ ] After a structure loads, the link downloads or opens the correct `.pdb` file.
- [ ] The link is hidden when AlphaFold has no model for the protein.
- [ ] It fits the existing control row on desktop and on a 390 px wide screen.

## Pointers

- `index.html:78-82`, `.viewer-controls`
- `app.js:207-210`, where `pdbUrl` is read
- `style.css:223-242`, control styles (`.viewer-controls a` is already styled)
