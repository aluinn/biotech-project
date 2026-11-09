// Captures README screenshots from the running app using the installed Chrome.
// Usage: node scripts/capture-screenshots.mjs   (needs network: UniProt + AlphaFold)
import { chromium } from "@playwright/test";
import { startServer } from "./serve.mjs";

const server = await startServer();
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({ channel: "chrome" });
const out = "docs/assets/";

async function settle(page) {
  await page.waitForSelector("#viewer canvas", { timeout: 30000 });
  await page.waitForFunction(() => document.getElementById("viewer-message").hidden, null, { timeout: 30000 });
  await page.click("#rotate-button"); // freeze rotation for a stable frame
  await page.waitForTimeout(800);
}

const top = (page) => page.evaluate(() => window.scrollTo(0, 0));
// Scroll so the given element sits near the top of the viewport.
const focus = (page, sel, pad = 24) =>
  page.evaluate(([s, p]) => window.scrollTo(0, document.querySelector(s).getBoundingClientRect().top + window.scrollY - p), [sel, pad]);

const desktop = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await desktop.goto(base);
await desktop.screenshot({ path: out + "fold-home-desktop.png" });

await desktop.click('.quick-pick[data-accession="P01308"]');
await settle(desktop);
await focus(desktop, "#result");
await desktop.screenshot({ path: out + "fold-insulin-desktop.png" });

// hover a real residue: find a confident (blue) backbone atom and project it to the screen
await focus(desktop, "#result");
await desktop.waitForTimeout(300);
const pt = await desktop.evaluate(() => {
  const atoms = viewer.selectedAtoms({ atom: "CA" });
  const a = atoms.find((x) => x.b > 70) || atoms[Math.floor(atoms.length / 2)];
  const s = viewer.modelToScreen({ x: a.x, y: a.y, z: a.z });
  // modelToScreen reports page coordinates, so subtract the scroll offset to get viewport coordinates
  return { x: s.x - window.scrollX, y: s.y - window.scrollY };
});
await desktop.mouse.move(pt.x - 20, pt.y - 20);
await desktop.mouse.move(pt.x, pt.y, { steps: 6 });
await desktop.waitForTimeout(800); // 3Dmol fires hover after a short delay
await desktop.waitForSelector("#viewer-tooltip:not([hidden])", { timeout: 5000 });
await desktop.screenshot({ path: out + "fold-hover-desktop.png" });

await desktop.click('.quick-pick[data-accession="P04637"]');
await desktop.waitForTimeout(500);
await settle(desktop);
await focus(desktop, "#result");
await desktop.screenshot({ path: out + "fold-p53-desktop.png" });

await desktop.fill("#search-input", "hemoglobin");
await desktop.click("#search-button");
await settle(desktop);
await focus(desktop, "#matches");
await desktop.screenshot({ path: out + "fold-search-matches-desktop.png" });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await phone.goto(base);
await phone.click('.quick-pick[data-accession="P01308"]');
await settle(phone);
await focus(phone, ".viewer-card", 12);
await phone.screenshot({ path: out + "fold-insulin-phone.png" });

await browser.close();
server.close();
