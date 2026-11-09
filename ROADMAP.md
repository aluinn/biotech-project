# Roadmap

Ideas for where Fold could go, roughly in priority order. This is a direction,
not a promise. Items marked **good first issue** have a draft in
[docs/issues](docs/issues).

## Now: quality and trust

- [x] Unit tests for the pure logic (name parsing, function-text cleanup, confidence buckets)
- [x] End-to-end smoke test and CI on every pull request
- [ ] A scheduled check against the live UniProt and AlphaFold APIs, to catch upstream format changes
- [ ] Subresource Integrity (SRI) hash on the 3Dmol.js script tag
- [ ] Replace `innerHTML` in the residue tooltip with DOM nodes

## Next: usability

- [ ] Shareable links, for example `?q=insulin`, so a result can be bookmarked
- [ ] Keyboard and screen-reader improvements for the match buttons and viewer controls
- [ ] Download button for the PDB file being shown
- [ ] Remember the last search and avoid refetching proteins already loaded in the session
- [ ] A "no results" state that suggests the example proteins

## Later: exploring more

- [ ] Show other AlphaFold models for an accession when more than one exists
- [ ] Predicted aligned error (PAE) view alongside pLDDT
- [ ] Toggle between colouring by confidence and by secondary structure
- [ ] Search beyond human proteins with an organism filter

## Not planned

- A backend or user accounts. Keeping Fold static is a deliberate choice.
- Experimental-structure (PDB) browsing. Other tools already do this well.

Have an idea? Open a [feature request](https://github.com/aluinn/biotech-project/issues/new?template=feature_request.yml).
