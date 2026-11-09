// End-to-end smoke tests. UniProt and AlphaFold are mocked so the tests are fast and deterministic;
// 3Dmol.js still loads from the CDN and really draws the (tiny) fixture structure in the browser.
import { test, expect } from "@playwright/test";

const CORS = { "access-control-allow-origin": "*" };
const ENTRY = {
  primaryAccession: "P01308",
  proteinDescription: { recommendedName: { fullName: { value: "Insulin" } } },
  genes: [{ geneName: { value: "INS" } }],
  organism: { scientificName: "Homo sapiens", commonName: "Human" },
  sequence: { length: 110 },
  comments: [{ commentType: "FUNCTION", texts: [{ value: "Hormone that lowers blood sugar (PubMed:1) ." }] }],
};

// A minimal PDB file: six residues, one C-alpha each, with pLDDT in the B-factor column.
const SCORES = [95, 92, 80, 75, 60, 30]; // mean 72.0 -> "confident"
const PDB = SCORES.map((b, i) => {
  const f = (v, w) => v.toFixed(3).padStart(w);
  return "ATOM  " + String(i + 1).padStart(5) + "  CA  ALA A" + String(i + 1).padStart(4) + "    " +
    f(i * 3.8, 8) + f(Math.sin(i) * 2, 8) + f(Math.cos(i) * 2, 8) + "  1.00" + b.toFixed(2).padStart(6) + "           C";
}).join("\n") + "\nEND\n";

async function mockApis(page, { alphafold = "ok" } = {}) {
  await page.route("https://rest.uniprot.org/**", (route) => {
    const q = new URL(route.request().url()).searchParams.get("query") || "";
    const results = q.includes("zzzz") ? [] : [ENTRY];
    return route.fulfill({ json: { results }, headers: CORS });
  });
  await page.route("https://alphafold.ebi.ac.uk/api/prediction/*", (route) =>
    alphafold === "404"
      ? route.fulfill({ status: 404, body: "{}", headers: CORS })
      : route.fulfill({ json: [{ pdbUrl: "https://alphafold.ebi.ac.uk/files/fixture.pdb" }], headers: CORS }));
  await page.route("https://alphafold.ebi.ac.uk/files/*", (route) =>
    route.fulfill({ body: PDB, contentType: "text/plain", headers: CORS }));
}

test("clicking an example shows the protein card and a coloured 3D structure", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await page.click('.quick-pick[data-accession="P01308"]');

  await expect(page.locator("#protein-name")).toHaveText("Insulin");
  await expect(page.locator("#protein-gene")).toHaveText("INS");
  await expect(page.locator("#protein-organism")).toHaveText("Homo sapiens (Human)");
  await expect(page.locator("#protein-length")).toHaveText("110 amino acids");
  await expect(page.locator("#protein-function")).toHaveText("Hormone that lowers blood sugar.");
  await expect(page.locator("#protein-accession a")).toHaveAttribute("href", "https://www.uniprot.org/uniprotkb/P01308");

  await expect(page.locator("#viewer canvas")).toBeVisible();
  await expect(page.locator("#avg-confidence")).toHaveText("Average confidence: 72.0 / 100 (confident)");
  await expect(page.locator("#viewer-message")).toBeHidden();
  await expect(page.locator("#alphafold-link")).toHaveAttribute("href", "https://alphafold.ebi.ac.uk/entry/P01308");
});

test("typing a search and pressing Enter works", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await page.fill("#search-input", "insulin");
  await page.press("#search-input", "Enter");
  await expect(page.locator("#protein-name")).toHaveText("Insulin");
  await expect(page.locator("#avg-confidence")).toBeVisible();
});

test("a search with no results shows an error message", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await page.fill("#search-input", "zzzz");
  await page.press("#search-input", "Enter");
  await expect(page.locator("#status")).toContainText('No protein found for "zzzz"');
  await expect(page.locator("#result")).toBeHidden();
});

test("a protein with no AlphaFold model explains why the viewer is empty", async ({ page }) => {
  await mockApis(page, { alphafold: "404" });
  await page.goto("/");
  await page.click('.quick-pick[data-accession="P01308"]');
  await expect(page.locator("#protein-name")).toHaveText("Insulin");
  await expect(page.locator("#viewer-message")).toContainText("no predicted structure");
});
