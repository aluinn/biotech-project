// Pure helper functions: no DOM, no network. Loaded by index.html before app.js,
// and by the unit tests in test/ (via the module.exports line at the bottom).

// UniProt spells it "hemoglobin"; many people type "haemoglobin".
function normaliseQuery(text) {
  return text.replace(/haemo/gi, "hemo");
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

// AlphaFold stores its confidence score (pLDDT, 0-100) for each residue in the
// "B-factor" column of the structure file. 3Dmol exposes that column as atom.b.
// Colours are AlphaFold's standard scheme.
function confidenceColor(score) {
  if (score > 90) return 0x0053d6; // very high - dark blue
  if (score > 70) return 0x65cbf3; // confident - light blue
  if (score > 50) return 0xffdb13; // low - yellow
  return 0xff7d45;                 // very low - orange
}

// Plain-English label for a pLDDT score, using the same boundaries as confidenceColor.
function confidenceLabel(score) {
  return score > 90 ? "very high" : score > 70 ? "confident" : score > 50 ? "low" : "very low";
}

// Mean of a list of pLDDT scores (one per residue).
function meanConfidence(scores) {
  return scores.reduce((sum, v) => sum + v, 0) / scores.length;
}

if (typeof module !== "undefined") {
  module.exports = { normaliseQuery, getName, getFunctionText, getOrganism, confidenceColor, confidenceLabel, meanConfidence };
}
