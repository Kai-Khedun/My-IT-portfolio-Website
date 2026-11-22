import { defineConfig } from "@playwright/test";

// Smoke test (brief §12, Phase 5) against a production build on port 3100.
// Uses the installed Microsoft Edge, so there's no browser download. Elsewhere, set PW_CHANNEL=chrome,
// or run `npx playwright install chromium` and set PW_CHANNEL=chromium.
export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    channel: process.env.PW_CHANNEL || "msedge",
    // Headless browsers draw WebGL in software; allow it so the 3D world still runs.
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
  },
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
