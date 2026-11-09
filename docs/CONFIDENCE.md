# Reading the colours: pLDDT explained

Every AlphaFold structure comes with a score for each residue (amino acid) called **pLDDT**, the predicted local distance difference test, from 0 to 100. Higher means AlphaFold expects that part of its prediction to be close to the true structure.

Fold colours the cartoon with AlphaFold's standard scheme:

| pLDDT | Label in Fold | Colour | Hex | How to read it |
|---|---|---|---|---|
| > 90 | Very high | Dark blue | `#0053d6` | Backbone and usually side chains are expected to be accurate |
| 70–90 | Confident | Light blue | `#65cbf3` | Backbone is likely right, side chains less certain |
| 50–70 | Low | Yellow | `#ffdb13` | Treat with caution |
| < 50 | Very low | Orange | `#ff7d45` | Often disordered or unstructured. Don't read a shape into it |

The thresholds and colours live in `confidenceColor()` and the legend in `index.html`. The boundaries are exclusive at the top: a score of exactly 90 is "confident", exactly 70 is "low", exactly 50 is "very low".

## Where Fold gets the number

The PDB file AlphaFold DB serves stores pLDDT in the **B-factor** column (normally used for atomic vibration in experimental structures). 3Dmol.js exposes it as `atom.b`, and Fold uses it for the colours and for the tooltip.

The **average confidence** shown under the viewer is the mean of `atom.b` over the C-alpha atom of each residue. For insulin (P01308) this gives 52.9, matching the `globalMetricValue` of 52.91 in AlphaFold DB's own API response.

## Why low confidence is not always bad news

Many real proteins have regions that don't fold into one fixed shape. AlphaFold usually reports these as low or very low confidence, so an orange tail can be a true description of a floppy segment. Compare:

- **Haemoglobin beta (P68871):** nearly all dark blue, average 97.2 ("very high").
- **p53 (P04637):** a confident folded core with long orange and yellow tails, average 75.1.
- **Insulin (P01308):** mostly orange and yellow, average 52.9. The 110-residue model is the full precursor chain, which includes the signal peptide and C-peptide that are cut away to make the mature 51-residue hormone found in blood.

## What the score does not tell you

- It is a *per-residue* estimate, not a guarantee. It says nothing about how two domains sit relative to each other. AlphaFold's predicted aligned error (PAE) covers that, and Fold does not show it yet (see the [roadmap](../ROADMAP.md)).
- It does not say whether the protein folds like this in a cell, in a complex, or with a mutation.
- The structures are predictions, not experiments.

Further reading: the [AlphaFold DB confidence guide](https://alphafold.ebi.ac.uk/faq).
