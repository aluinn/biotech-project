---
title: "Add a Subresource Integrity hash to the 3Dmol.js script tag"
labels: ["good first issue", "security"]
---

## Context

`index.html` loads 3Dmol.js from cdnjs with a pinned version (2.5.5) but no `integrity` attribute. If the CDN served a modified file, it would run with full access to the page. Subresource Integrity (SRI) makes the browser refuse a file whose hash doesn't match. This is also noted in [SECURITY.md](../../SECURITY.md) and the [roadmap](../../ROADMAP.md).

## Task

Add `integrity="sha384-…"` and `crossorigin="anonymous"` to the 3Dmol script tag. Generate the hash from the exact file the tag points at, for example:

```bash
curl -s https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.5/3Dmol-min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

## Acceptance

- [ ] The script tag has `integrity` and `crossorigin="anonymous"`.
- [ ] The app still loads, searches and draws a structure in the browser (check the console for integrity errors).
- [ ] The PR description says how the hash was generated.

## Pointers

- `index.html:117`, the `<script src="…3Dmol-min.js">` tag
