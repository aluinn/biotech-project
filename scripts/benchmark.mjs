// Measures the network and render cost of Fold's main user flows.
// Usage: node scripts/benchmark.mjs [runs]   (default 5; needs network and Google Chrome)
// Prints a Markdown report. Results depend on your network and the remote APIs' load.
import { chromium } from "@playwright/test";
import os from "node:os";
import { startServer } from "./serve.mjs";

const RUNS = Number(process.argv[2]) || 5;
const FIELDS = "accession,protein_name,gene_primary,organism_name,length,cc_function";
const UNIPROT = "https://rest.uniprot.org/uniprotkb/search";
const PROTEINS = [
  ["Insulin", "P01308"], ["Haemoglobin alpha", "P69905"], ["GFP", "P42212"],
  ["p53", "P04637"], ["Spike (SARS-CoV-2)", "P0DTC2"],
];

// AlphaFold DB answers 403 to Node's default User-Agent, so identify the script instead.
const get = (url) => fetch(url, { headers: { "user-agent": "fold-benchmark" } });
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
async function timed(fn) { const t = performance.now(); const v = await fn(); return [performance.now() - t, v]; }
const uni = (q) => get(`${UNIPROT}?query=${encodeURIComponent(q)}&fields=${FIELDS}&size=5`).then((r) => r.json());

const rows = [];
for (const [name, acc] of PROTEINS) {
  const t = { uniprot: [], afApi: [], pdb: [], total: [] };
  let bytes = 0, residues = 0;
  for (let i = 0; i < RUNS; i++) {
    const start = performance.now();
    const [u] = await timed(() => uni(`accession:${acc}`));
    const [a, info] = await timed(() => get(`https://alphafold.ebi.ac.uk/api/prediction/${acc}`).then((r) => r.json()));
    const [p, text] = await timed(() => get(info[0].pdbUrl).then((r) => r.text()));
    t.uniprot.push(u); t.afApi.push(a); t.pdb.push(p); t.total.push(performance.now() - start);
    bytes = Buffer.byteLength(text);
    residues = text.split("\n").filter((l) => l.startsWith("ATOM") && l.slice(12, 16).trim() === "CA").length;
  }
  rows.push({ name, acc, residues, kb: bytes / 1024, ...Object.fromEntries(Object.entries(t).map(([k, v]) => [k, median(v)])) });
}

// Free-text search runs two UniProt queries one after the other (gene match, then text match).
const search = [];
for (let i = 0; i < RUNS; i++) {
  const [ms] = await timed(async () => { await uni("(gene:insulin) AND reviewed:true AND organism_id:9606"); await uni("(insulin) AND reviewed:true AND organism_id:9606"); });
  search.push(ms);
}

// End to end in a real browser: click a quick-pick, wait until the structure is drawn.
const server = await startServer();
const browser = await chromium.launch({ channel: "chrome" });
const version = browser.version();
const e2e = {};
for (const [name, acc] of PROTEINS) {
  e2e[name] = [];
  for (let i = 0; i < RUNS; i++) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    await page.goto(`http://localhost:${server.address().port}/`, { waitUntil: "load" });
    const t = performance.now();
    await page.click(`.quick-pick[data-accession="${acc}"]`);
    await page.waitForFunction(() => !document.getElementById("avg-confidence").hidden, null, { timeout: 30000 });
    e2e[name].push(performance.now() - t);
    await page.close();
  }
}
await browser.close(); server.close();

const f = (n) => Math.round(n).toLocaleString("en");
const cpu = os.cpus()[0].model;
console.log(`Machine: ${cpu}, ${Math.round(os.totalmem() / 2 ** 30)} GB RAM, ${os.platform()} ${os.release()}, Node ${process.version}, Chrome ${version}`);
console.log(`Date: ${new Date().toISOString().slice(0, 10)}   Runs per measurement: ${RUNS} (median reported)\n`);
console.log("| Protein | Residues | PDB size | UniProt (ms) | AlphaFold API (ms) | PDB download (ms) | Fetch total (ms) | Click to drawn, in browser (ms) |");
console.log("|---|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) console.log(`| ${r.name} (${r.acc}) | ${r.residues} | ${f(r.kb)} KB | ${f(r.uniprot)} | ${f(r.afApi)} | ${f(r.pdb)} | ${f(r.total)} | ${f(median(e2e[r.name]))} |`);
console.log(`\nFree-text search "insulin" (two sequential UniProt queries): median ${f(median(search))} ms`);
