const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  normaliseQuery, getName, getFunctionText, getOrganism,
  confidenceColor, confidenceLabel, meanConfidence,
} = require("../helpers.js");

test("normaliseQuery rewrites British haemo- to hemo- (any case)", () => {
  assert.equal(normaliseQuery("haemoglobin"), "hemoglobin");
  assert.equal(normaliseQuery("Haemoglobin subunit alpha"), "hemoglobin subunit alpha");
  assert.equal(normaliseQuery("insulin"), "insulin");
});

test("getName prefers recommended, then submission, then alternative, then accession", () => {
  const full = (v) => ({ fullName: { value: v } });
  assert.equal(getName({ proteinDescription: { recommendedName: full("A"), submissionNames: [full("B")] } }), "A");
  assert.equal(getName({ proteinDescription: { submissionNames: [full("B")], alternativeNames: [full("C")] } }), "B");
  assert.equal(getName({ proteinDescription: { alternativeNames: [full("C")] } }), "C");
  assert.equal(getName({ primaryAccession: "P12345" }), "P12345");
});

test("getFunctionText strips PubMed and ECO citations and tidies spacing", () => {
  const entry = {
    comments: [{
      commentType: "FUNCTION",
      texts: [{ value: "Binds DNA (PubMed:123, PubMed:456) . Acts as a tumor suppressor {ECO:0000269|PubMed:1}." }],
    }],
  };
  assert.equal(getFunctionText(entry), "Binds DNA. Acts as a tumor suppressor.");
});

test("getFunctionText joins several text blocks and ignores other comment types", () => {
  const entry = {
    comments: [
      { commentType: "SUBUNIT", texts: [{ value: "ignored" }] },
      { commentType: "FUNCTION", texts: [{ value: "One." }, { value: "Two." }] },
    ],
  };
  assert.equal(getFunctionText(entry), "One. Two.");
});

test("getFunctionText falls back when there is no FUNCTION comment", () => {
  assert.match(getFunctionText({}), /No function description is available/);
  assert.match(getFunctionText({ comments: [{ commentType: "SUBUNIT", texts: [] }] }), /No function description/);
});

test("getOrganism shows the common name when there is one", () => {
  assert.equal(getOrganism({ organism: { scientificName: "Homo sapiens", commonName: "Human" } }), "Homo sapiens (Human)");
  assert.equal(getOrganism({ organism: { scientificName: "Aequorea victoria" } }), "Aequorea victoria");
  assert.equal(getOrganism({}), "Unknown");
});

test("confidenceColor uses AlphaFold's four colours with exclusive lower bounds", () => {
  assert.equal(confidenceColor(95), 0x0053d6);
  assert.equal(confidenceColor(90.01), 0x0053d6);
  assert.equal(confidenceColor(90), 0x65cbf3);
  assert.equal(confidenceColor(70.01), 0x65cbf3);
  assert.equal(confidenceColor(70), 0xffdb13);
  assert.equal(confidenceColor(50.01), 0xffdb13);
  assert.equal(confidenceColor(50), 0xff7d45);
  assert.equal(confidenceColor(0), 0xff7d45);
});

test("confidenceLabel matches confidenceColor's boundaries", () => {
  assert.equal(confidenceLabel(97.2), "very high");
  assert.equal(confidenceLabel(75.1), "confident");
  assert.equal(confidenceLabel(52.9), "low");
  assert.equal(confidenceLabel(50), "very low");
  assert.equal(confidenceLabel(90), "confident");
});

test("meanConfidence averages per-residue scores", () => {
  assert.equal(meanConfidence([100, 50]), 75);
  assert.equal(meanConfidence([42]), 42);
});
