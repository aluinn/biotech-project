# Data sources

Fold stores no data of its own. Everything shown comes from the services below, requested live from the visitor's browser.

## UniProt (protein identity and description)

- **Endpoint:** `https://rest.uniprot.org/uniprotkb/search`
- **Fields requested:** `accession, protein_name, gene_primary, organism_name, length, cc_function`, with `size=5`.
- **Queries used** (in `findProteins`, `app.js`):
  1. `(gene:{text}) AND reviewed:true AND organism_id:9606`
  2. `({text}) AND reviewed:true AND organism_id:9606`
  3. Only if 1 and 2 are empty: `({text}) AND reviewed:true`
  4. Example buttons: `accession:{id}`
- **Used for:** the info card (name, gene, organism, length, function text, accession link) and the list of matches.
- **Cleaning:** function text has citation markers such as `(PubMed:123)` and `{ECO:…}` removed, and stray spaces before punctuation tidied (`getFunctionText`). The text is otherwise UniProt's own.
- Docs: <https://www.uniprot.org/help/api>

## AlphaFold Protein Structure Database (the structure)

- **Prediction endpoint:** `https://alphafold.ebi.ac.uk/api/prediction/{accession}` returns a JSON array. Fold reads `[0].pdbUrl`.
- **Structure file:** the PDB-format file at `pdbUrl`, for example `…/files/AF-P01308-F1-model_v6.pdb`.
- **Used for:** the 3D model. Each atom's B-factor column holds the residue's pLDDT confidence (0–100). See [CONFIDENCE.md](CONFIDENCE.md).
- **404:** means no model exists for that accession. Fold shows a specific message for this case.
- Other fields in the response (PAE image, MSA, mmCIF, per-residue confidence JSON) are not used today. They are the natural starting point for roadmap items such as PAE.
- Docs: <https://alphafold.ebi.ac.uk/api-docs>
- **User-Agent note:** AlphaFold DB's API returned HTTP 403 to Node's default `fetch` User-Agent when benchmarking. Browsers are not affected, but scripts calling the API should send a descriptive User-Agent.

## Libraries and fonts

| What | From | Version |
|---|---|---|
| [3Dmol.js](https://3dmol.org) | cdnjs | 2.5.5 (pinned in `index.html`, no SRI hash yet) |
| Fraunces (weight 600), DM Sans (weights 400, 500, 600) | Google Fonts | loaded with `display=swap` |

## Licensing and attribution

UniProt and AlphaFold DB both publish their data under open licences. Their terms are linked from their own sites: [UniProt](https://www.uniprot.org/help/license), [AlphaFold DB](https://alphafold.ebi.ac.uk/faq). This repository does not redistribute their data. It fetches it at view time, and the README credits both.

If you use AlphaFold structures in published work, cite:

- Jumper, J. et al. Highly accurate protein structure prediction with AlphaFold. *Nature* 596, 583–589 (2021).
- Varadi, M. et al. AlphaFold Protein Structure Database: massively expanding the structural coverage of protein-sequence space with high-accuracy models. *Nucleic Acids Research* 50, D439–D444 (2022).
