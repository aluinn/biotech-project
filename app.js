// ---------- Grab the page elements we need ----------
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const button = document.getElementById("search-button");
const statusBox = document.getElementById("status");
const matchesBox = document.getElementById("matches");
const resultCard = document.getElementById("result");

// ---------- Small helpers to show / hide messages ----------
function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle("error", isError);
  statusBox.hidden = false;
}
function hideStatus() {
  statusBox.hidden = true;
}

// ---------- Talking to UniProt ----------
const UNIPROT_URL = "https://rest.uniprot.org/uniprotkb/search";
// Only ask for the fields we actually use, so the response stays small.
const FIELDS = "accession,protein_name,gene_primary,organism_name,length,cc_function";

async function searchUniprot(query) {
  const url = `${UNIPROT_URL}?query=${encodeURIComponent(query)}&fields=${FIELDS}&size=5`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("UniProt returned status " + response.status);
  const data = await response.json();
  return data.results;
}

// Finds the best matches:
//  1. human entries whose gene name matches (so "p53" finds TP53, not a random protein)
//  2. other human entries matching the text
//  3. if nothing human, any reviewed entry
// `accession` is used by the quick-pick buttons to fetch one exact protein.
async function findProteins(text, accession) {
  if (accession) return searchUniprot(`accession:${accession}`);

  // UniProt spells it "hemoglobin"; many people type "haemoglobin".
  text = text.replace(/haemo/gi, "hemo");

  const byGene = await searchUniprot(`(gene:${text}) AND reviewed:true AND organism_id:9606`);
  const human = await searchUniprot(`(${text}) AND reviewed:true AND organism_id:9606`);
  const combined = [...byGene, ...human.filter((h) => !byGene.some((g) => g.primaryAccession === h.primaryAccession))];
  if (combined.length > 0) return combined.slice(0, 5);

  return searchUniprot(`(${text}) AND reviewed:true`);
}

// ---------- Turning UniProt's data into readable text ----------
function getName(entry) {
  const d = entry.proteinDescription || {};
  const name =
    d.recommendedName?.fullName?.value ||
    d.submissionNames?.[0]?.fullName?.value ||
    d.alternativeNames?.[0]?.fullName?.value;
  return name || entry.primaryAccession;
}

function getFunctionText(entry) {
  const comment = (entry.comments || []).find((c) => c.commentType === "FUNCTION");
  const raw = comment?.texts?.map((t) => t.value).join(" ");
  if (!raw) return "No function description is available for this protein yet.";
  return raw
    .replace(/\s*\([^()]*(?:PubMed:|By similarity)[^()]*\)/g, "") // "(PubMed:123, PubMed:456)"
    .replace(/\s*\{ECO:[^}]*\}/g, "")                              // "{ECO:0000269|...}"
    .replace(/\s+([.,;])/g, "$1")                                  // tidy "word ." -> "word."
    .trim();
}

function getOrganism(entry) {
  const o = entry.organism || {};
  return o.commonName ? `${o.scientificName} (${o.commonName})` : o.scientificName || "Unknown";
}

// ---------- 3D viewer (3Dmol.js + AlphaFold) ----------
const viewerMessage = document.getElementById("viewer-message");
const rotateButton = document.getElementById("rotate-button");
const resetButton = document.getElementById("reset-button");
const alphafoldLink = document.getElementById("alphafold-link");

let viewer = null;       // created the first time we need it
let spinning = true;
let loadCounter = 0;     // lets us ignore old loads if the user clicks quickly

function setViewerMessage(text) {
  viewerMessage.textContent = text || "";
  viewerMessage.hidden = !text;
}

function setSpinning(on) {
  spinning = on;
  if (on) viewer.spin("y", 0.6); else viewer.spin(false);
  rotateButton.textContent = on ? "Pause rotation" : "Resume rotation";
}

// AlphaFold stores its confidence score (pLDDT, 0-100) for each residue in the
// "B-factor" column of the structure file. 3Dmol exposes that column as atom.b.
// Colours are AlphaFold's standard scheme.
function confidenceColor(score) {
  if (score > 90) return 0x0053d6; // very high - dark blue
  if (score > 70) return 0x65cbf3; // confident - light blue
  if (score > 50) return 0xffdb13; // low - yellow
  return 0xff7d45;                 // very low - orange
}

// Average over one atom per residue (the "CA" backbone atom), so each residue counts once.
function showAverageConfidence() {
  const avgBox = document.getElementById("avg-confidence");
  const atoms = viewer.selectedAtoms({ atom: "CA" });
  if (atoms.length === 0) { avgBox.hidden = true; return; }
  const avg = atoms.reduce((sum, a) => sum + a.b, 0) / atoms.length;
  const label = avg > 90 ? "very high" : avg > 70 ? "confident" : avg > 50 ? "low" : "very low";
  avgBox.textContent = `Average confidence: ${avg.toFixed(1)} / 100 (${label})`;
  avgBox.hidden = false;
}

// ---------- Hover / tap to inspect a residue ----------
// A "residue" is one building block (amino acid) of the protein chain.
const tooltip = document.getElementById("viewer-tooltip");
const viewerWrap = document.querySelector(".viewer-wrap");
const canHover = window.matchMedia("(hover: hover)").matches; // false on phones/tablets
let resumeTimer = null;   // restarts the spin shortly after the pointer leaves
let tapTimer = null;      // hides the tooltip a few seconds after a tap

function applyBaseStyle() {
  viewer.setStyle({}, { cartoon: { colorfunc: (atom) => confidenceColor(atom.b) } });
}

// Place the tooltip just below-right of the pointer, kept inside the viewer box.
function positionTooltip(event) {
  const box = viewerWrap.getBoundingClientRect();
  let x = typeof event?.clientX === "number" ? event.clientX - box.left + 14 : 12;
  let y = typeof event?.clientY === "number" ? event.clientY - box.top + 14 : 12;
  x = Math.max(8, Math.min(x, box.width - tooltip.offsetWidth - 8));
  y = Math.max(8, Math.min(y, box.height - tooltip.offsetHeight - 8));
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
}

function inspectResidue(atom, event) {
  clearTimeout(resumeTimer);
  viewer.spin(false);                       // hold still so the residue doesn't slide away
  applyBaseStyle();
  viewer.addStyle({ chain: atom.chain, resi: atom.resi }, { stick: { color: "#1c1f1d", radius: 0.25 } });
  viewer.render();

  const color = "#" + confidenceColor(atom.b).toString(16).padStart(6, "0");
  tooltip.innerHTML =
    `<strong>${atom.resn} · position ${atom.resi}</strong>` +
    `<span><i style="background:${color}"></i>confidence ${atom.b.toFixed(1)}</span>`;
  tooltip.hidden = false;
  positionTooltip(event);
}

function endInspect() {
  tooltip.hidden = true;
  applyBaseStyle();
  viewer.render();
  // Wait a moment: moving between neighbouring residues shouldn't restart the spin.
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => { if (spinning) viewer.spin("y", 0.6); }, 400);
}

function setupHover() {
  if (canHover) {
    // Mouse: show on hover, hide when the pointer moves off.
    viewer.setHoverable({}, true, (atom, v, event) => inspectResidue(atom, event), () => endInspect());
  } else {
    // Touch screens have no hover, so a tap inspects instead.
    viewer.setClickable({}, true, (atom, v, event) => {
      inspectResidue(atom, event);
      clearTimeout(tapTimer);
      tapTimer = setTimeout(endInspect, 3500);
    });
  }
}

// Keep the tooltip glued to the mouse while it's visible.
viewerWrap.addEventListener("mousemove", (event) => {
  if (!tooltip.hidden) positionTooltip(event);
});

async function loadStructure(accession) {
  const thisLoad = ++loadCounter;
  alphafoldLink.href = "https://alphafold.ebi.ac.uk/entry/" + accession;

  if (!viewer) {
    viewer = $3Dmol.createViewer("viewer", { backgroundColor: "#fbfaf7" });
  }
  viewer.clear();
  viewer.render();
  document.getElementById("avg-confidence").hidden = true;
  tooltip.hidden = true;
  setViewerMessage("Loading 3D structure…");

  try {
    // Step 1: ask AlphaFold which files exist for this protein.
    const infoResponse = await fetch("https://alphafold.ebi.ac.uk/api/prediction/" + accession);
    if (thisLoad !== loadCounter) return;
    if (infoResponse.status === 404) {
      setViewerMessage("AlphaFold has no predicted structure for this protein. Try another match from the list above, or pick one of the examples.");
      return;
    }
    if (!infoResponse.ok) throw new Error("AlphaFold returned status " + infoResponse.status);
    const info = await infoResponse.json();

    // Step 2: download the structure file (PDB format = plain text of atom positions).
    const fileResponse = await fetch(info[0].pdbUrl);
    if (!fileResponse.ok) throw new Error("Structure file returned status " + fileResponse.status);
    const pdbText = await fileResponse.text();
    if (thisLoad !== loadCounter) return;

    // Step 3: draw it as a cartoon.
    viewer.clear();
    viewer.addModel(pdbText, "pdb");
    applyBaseStyle();
    setupHover();
    showAverageConfidence();
    viewer.zoomTo();
    viewer.render();
    setSpinning(true);
    setViewerMessage("");
  } catch (error) {
    console.error(error);
    setViewerMessage("Couldn't load the 3D structure. Check your connection and try searching again.");
  }
}

rotateButton.addEventListener("click", () => viewer && setSpinning(!spinning));
resetButton.addEventListener("click", () => {
  if (!viewer) return;
  viewer.zoomTo();
  viewer.render();
  setSpinning(true);
});

// ---------- Drawing the results ----------
let currentMatches = [];

function showProtein(entry) {
  document.getElementById("protein-name").textContent = getName(entry);
  document.getElementById("protein-gene").textContent = entry.genes?.[0]?.geneName?.value || "—";
  document.getElementById("protein-organism").textContent = getOrganism(entry);
  document.getElementById("protein-length").textContent = entry.sequence.length + " amino acids";
  document.getElementById("protein-function").textContent = getFunctionText(entry);

  // The accession becomes a link to the protein's UniProt page.
  const acc = entry.primaryAccession;
  const link = document.createElement("a");
  link.href = "https://www.uniprot.org/uniprotkb/" + acc;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = acc;
  document.getElementById("protein-accession").replaceChildren(link);

  resultCard.hidden = false;
  loadStructure(acc);

  // Highlight the chosen option in the list of matches.
  matchesBox.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", b.dataset.accession === acc);
  });
}

function showMatches(entries) {
  matchesBox.replaceChildren();
  if (entries.length < 2) {
    matchesBox.hidden = true;
    return;
  }
  entries.forEach((entry) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.accession = entry.primaryAccession;
    b.textContent = `${getName(entry)} · ${entry.genes?.[0]?.geneName?.value || entry.primaryAccession}`;
    b.addEventListener("click", () => showProtein(entry));
    matchesBox.appendChild(b);
  });
  matchesBox.hidden = false;
}

// ---------- What happens when someone searches ----------
async function runSearch(text, accession) {
  text = text.trim();
  if (!text) return;

  button.disabled = true;
  resultCard.hidden = true;
  matchesBox.hidden = true;
  showStatus("Searching UniProt…");

  try {
    currentMatches = await findProteins(text, accession);
    if (currentMatches.length === 0) {
      showStatus(`No protein found for "${text}". Check the spelling or try a simpler name, like "insulin" or "p53".`, true);
      return;
    }
    hideStatus();
    showMatches(currentMatches);
    showProtein(currentMatches[0]); // best match first
  } catch (error) {
    console.error(error);
    showStatus("Couldn't reach the protein database. Check your internet connection and try again.", true);
  } finally {
    button.disabled = false;
  }
}

// Clicking "Search" or pressing Enter both submit the form.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch(input.value);
});

// ---------- Quick picks ----------
// Each button searches for one exact protein by its UniProt ID (all checked to have AlphaFold models).
document.querySelectorAll(".quick-pick").forEach((btn) => {
  btn.addEventListener("click", () => {
    input.value = btn.dataset.name;
    runSearch(btn.dataset.name, btn.dataset.accession);
  });
});
