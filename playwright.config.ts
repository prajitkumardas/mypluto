import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLUTO_TEST_ORIGIN || "http://127.0.0.1:3012";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL,
    colorScheme: "dark",
    locale: "en-US",
    reducedMotion: "reduce",
    serviceWorkers: "allow",
    trace: "retain-on-failure"
  },
  webServer: process.env.PLUTO_TEST_ORIGIN
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3012",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } }
  ]
});
