---
title: "Show a clear message if 3Dmol.js fails to load"
labels: ["good first issue", "bug"]
---

## Context

If the 3Dmol script can't be loaded (CDN outage, blocked by an extension, offline), `$3Dmol` is undefined. `loadStructure` calls `$3Dmol.createViewer` *before* its `try` block, so the promise rejects and nothing awaits it. The info card appears, but the viewer area stays blank with no explanation. This is listed as "not handled" in [ARCHITECTURE.md](../ARCHITECTURE.md#failure-modes).

## Task

Make the failure visible. For example, check `typeof $3Dmol === "undefined"` at the start of `loadStructure` and call `setViewerMessage(...)` with a helpful sentence, or move the `createViewer` call inside the existing `try`.

## Acceptance

- [ ] With the 3Dmol request blocked (browser dev tools, "Block request URL"), searching shows a readable message in the viewer area.
- [ ] Normal behaviour is unchanged.
- [ ] The failure-modes table in `docs/ARCHITECTURE.md` is updated.

## Pointers

- `app.js:185-229`, `loadStructure` (the `createViewer` call is at line 190, the `try` starts after it)
- `app.js:87`, `setViewerMessage`
