// Check all 3 Learn more links
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const links = await page.locator("a").evaluateAll((els) =>
  els
    .filter((el) => el.textContent?.trim().startsWith("Learn more"))
    .map((el) => ({ href: el.getAttribute("href"), text: el.textContent.trim() })),
);
console.log(JSON.stringify(links, null, 2));
await browser.close();
