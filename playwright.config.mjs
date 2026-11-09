import { defineConfig } from "@playwright/test";

// Locally this uses your installed Google Chrome. In CI the workflow installs Playwright's Chromium.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:4381",
    ...(process.env.CI ? {} : { channel: "chrome" }),
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve.mjs 4381",
    url: "http://localhost:4381",
    reuseExistingServer: false,
  },
});
