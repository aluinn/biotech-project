# Fold

Search any protein by name and explore its 3D structure as predicted by **Google DeepMind's AlphaFold**, coloured by how confident AlphaFold is.

**Live demo:** https://biotech-project-six.vercel.app

https://github.com/user-attachments/assets/b71fb34d-34e9-43d4-a540-8ec37160ea19

## What it does

Type a protein name (for example "insulin"). Fold finds the protein, shows a plain-English summary of what it does, and displays its predicted 3D structure in a viewer you can rotate and zoom. The structure is coloured by AlphaFold's confidence in each part, and hovering (or tapping on a phone) shows the details for a single residue. Five quick-pick buttons let you jump straight to famous proteins such as insulin, haemoglobin, GFP, p53 and the SARS-CoV-2 spike.

## How it works

Everything runs in the browser. There is no backend, no build step and no API key.

1. **Finding the protein:** the app searches the [UniProt REST API](https://rest.uniprot.org) for reviewed (Swiss-Prot) entries, preferring human proteins. It reads the name, gene, organism, sequence length, function text and accession ID.
2. **Getting the structure:** with the accession ID, it asks the [AlphaFold Protein Structure Database API](https://alphafold.ebi.ac.uk/api-docs) for the predicted structure file (PDB format).
3. **Drawing it:** [3Dmol.js](https://3dmol.org) renders the structure as a slowly rotating cartoon.
4. **Confidence colouring:** AlphaFold stores its per-residue confidence score (pLDDT, 0–100) in the "B-factor" column of the structure file. Fold colours each residue with AlphaFold's standard scheme:

   | pLDDT | Meaning | Colour |
   |---|---|---|
   | > 90 | Very high | Dark blue |
   | 70–90 | Confident | Light blue |
   | 50–70 | Low | Yellow |
   | < 50 | Very low | Orange |

   Low confidence often means a flexible or disordered region, not necessarily a mistake. The average shown is the mean score across all residues.

AlphaFold structures are **predictions**, not experimentally determined structures.

## Run it locally

1. Download or clone this repository.
2. Open the folder in VS Code and install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

Opening `index.html` by double-clicking may also work, but Live Server is more reliable.

## Files

- `index.html`: page structure
- `style.css`: dark theme and responsive layout
- `app.js`: search, data fetching, 3D viewer and confidence colouring

## Credits

- [UniProt](https://www.uniprot.org): protein names, functions and accession IDs
- [AlphaFold Protein Structure Database](https://alphafold.ebi.ac.uk): predicted structures, by Google DeepMind and EMBL-EBI
- [3Dmol.js](https://3dmol.org): in-browser 3D molecular viewer
