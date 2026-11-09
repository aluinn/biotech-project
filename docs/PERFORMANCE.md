# Performance

All numbers below come from `scripts/benchmark.mjs`, run on the machine described here. They measure Fold's main flow (pick a protein, fetch its data, draw it) and mostly reflect the speed of the remote APIs, not of Fold's own code.

## Results

**Machine:** Apple M1 Pro, 16 GB RAM, darwin 24.6.0, Node v24.20.0, Chrome 157.0.8103.39  
**Date:** 2026-11-09   Runs per measurement: 5 (median reported)

| Protein | Residues | PDB size | UniProt (ms) | AlphaFold API (ms) | PDB download (ms) | Fetch total (ms) | Click to drawn, in browser (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Insulin (P01308) | 110 | 71 KB | 17 | 130 | 77 | 244 | 561 |
| Haemoglobin alpha (P69905) | 142 | 90 KB | 18 | 125 | 77 | 272 | 495 |
| GFP (P42212) | 238 | 155 KB | 20 | 221 | 77 | 297 | 446 |
| p53 (P04637) | 393 | 248 KB | 17 | 137 | 77 | 219 | 471 |
| Spike (SARS-CoV-2) (P0DTC2) | 1273 | 1,567 KB | 29 | 149 | 132 | 382 | 689 |
Free-text search "insulin" (two sequential UniProt queries): median 272 ms  

Column guide:

- **UniProt, AlphaFold API, PDB download:** one HTTP request each, measured from Node. Their sum is **Fetch total**, run sequentially like the app does.
- **Click to drawn, in browser:** a fresh Chrome page loads the app, then the timer runs from clicking an example button until the average-confidence line appears, i.e. after the info card, all three requests and the first render. It includes the browser's CORS handling and 3Dmol's parsing and drawing.
- **Free-text search:** two sequential UniProt queries (gene match, then text match), as in `findProteins`.

## What the numbers say

- A typical protein appears in roughly **0.45–0.7 seconds** from click on this machine and connection.
- The **AlphaFold prediction lookup** (about 125–220 ms) is the slowest single request. The UniProt call is the fastest (under 30 ms).
- PDB size scales with the protein. The spike glycoprotein (1,273 residues, about 1.5 MB) is the largest of the five examples and the slowest to appear, but still under 0.7 s here.
- Fetching is dominated by three requests made one after another. The prediction lookup depends on the accession and the file download on the lookup's `pdbUrl`, so the second and third cannot start earlier. The UniProt request, however, could overlap with the AlphaFold lookup when the accession is already known (as with the example buttons).

## Caveats

- Medians of 5 runs, taken once, on one network. Expect different numbers elsewhere, and variation between runs.
- The browser measurement opens each page in a shared browser, so HTTP caches (for example the 3Dmol script and fonts) may be warm after the first run. It is not a cold-cache measurement.
- Remote API load changes over time. Treat these as order-of-magnitude figures.
- Rendering cost for very large structures (tens of thousands of residues) was not measured.

## How to reproduce

Requires Node.js 20+, Google Chrome, network access and `npm install`.

```bash
node scripts/benchmark.mjs        # 5 runs per measurement
node scripts/benchmark.mjs 10     # more runs
```

The script prints a Markdown report like the table above, including the machine description. It sends the User-Agent `fold-benchmark` because AlphaFold DB's API rejects Node's default one with HTTP 403.
