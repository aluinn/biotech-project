# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Use GitHub's private reporting instead:
[Report a vulnerability](https://github.com/aluinn/biotech-project/security/advisories/new)
(Security tab, then "Report a vulnerability"). Only the maintainers can see the
report. Include what you found, how to reproduce it, and the impact you expect.

This is a small, volunteer-run project. I aim to acknowledge a report within a
week and to publish a fix and advisory once it is resolved. Please give me a
reasonable chance to fix the problem before disclosing it.

## Supported versions

Only the latest commit on `main` (and the live deployment built from it) is
supported.

## Scope and design notes

Fold is a static website with no backend, no accounts, no cookies of its own and
no stored user data. What it does:

- **Sends** the text you type to the public [UniProt REST API](https://rest.uniprot.org)
  and a UniProt accession ID to the [AlphaFold DB API](https://alphafold.ebi.ac.uk),
  directly from your browser.
- **Loads** 3Dmol.js from cdnjs and fonts from Google Fonts. The 3Dmol script tag
  does not currently use Subresource Integrity (SRI), so a compromise of that CDN
  would run code on the page. Adding SRI is on the [roadmap](ROADMAP.md).
- **Renders** API data into the page. Protein names, genes and function text are
  inserted with `textContent`. The residue tooltip uses `innerHTML` with the
  residue name and number read from the AlphaFold structure file, which is served
  by a trusted third party but is still external input.

In scope: cross-site scripting, unsafe handling of API responses, supply-chain
risks in the page's dependencies, and anything in the repository's workflows.

Out of scope: vulnerabilities in UniProt, AlphaFold DB, 3Dmol.js, Vercel or
Google Fonts themselves (please report those to the respective projects),
denial of service through heavy use of third-party APIs, and issues that need a
modified browser or a compromised device.
