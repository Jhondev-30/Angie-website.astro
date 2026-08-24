// Load Playwright from its absolute global install path (ESM NODE_PATH-unaware).
import { pathToFileURL } from "node:url";
import { mkdirSync } from "node:fs";
const pwUrl = pathToFileURL(
  "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
).href;
const { chromium } = await import(pwUrl);

const url = "http://localhost:4321/";
const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/navbar-mobile";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await context.newPage();
const log = (...args) => console.log("[verify]", ...args);

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const menuBtn = page.locator("#menu-btn");
const morphIcon = page.locator("#menu-btn morph-icon");
const mobileMenu = page.locator("#mobile-menu");
const servicesBtn = page.locator("#services-btn");
const servicesMenu = page.locator("#services-menu");

const btnBox = await menuBtn.boundingBox();
const morphBox = await morphIcon.boundingBox();
log("menu-btn box:", btnBox);
log("morph-icon box:", morphBox);
log(
  "morph-icon size:",
  morphBox ? `${morphBox.width}x${morphBox.height}` : "null",
);

const morphHTML = await morphIcon.evaluate((el) => el.outerHTML);
log("morph-icon outerHTML (first 500):", morphHTML.slice(0, 500));

await page.screenshot({ path: `${outDir}/01-initial.png`, fullPage: false });

// 2. Tap menu button
await menuBtn.tap();
await page.waitForTimeout(400);
const menuBox = await mobileMenu.boundingBox();
const viewport = page.viewportSize();
log("mobile-menu box after open:", menuBox);
log("viewport:", viewport);
const fullscreen =
  menuBox &&
  menuBox.x <= 0 &&
  menuBox.y <= 0 &&
  menuBox.width >= viewport.width &&
  menuBox.height >= viewport.height;
log("menu is fullscreen?", fullscreen);
await page.screenshot({ path: `${outDir}/02-menu-open.png`, fullPage: false });

// 3. Tap services button -> dropdown should open
const servicesBtnBox = await servicesBtn.boundingBox();
log("services-btn box (in open menu):", servicesBtnBox);
await servicesBtn.tap();
await page.waitForTimeout(400);
const servicesMenuBox = await servicesMenu.boundingBox();
const servicesMenuOpacity = await servicesMenu.evaluate(
  (el) => getComputedStyle(el).opacity,
);
const servicesMenuVisibility = await servicesMenu.evaluate(
  (el) => getComputedStyle(el).visibility,
);
const servicesDataOpen = await servicesMenu.getAttribute("data-services-open");
log("services-menu box after tap:", servicesMenuBox);
log("services-menu opacity:", servicesMenuOpacity);
log("services-menu visibility:", servicesMenuVisibility);
log("services-menu data-services-open:", servicesDataOpen);
await page.screenshot({
  path: `${outDir}/03-services-open.png`,
  fullPage: false,
});

// 4. Tap outside services area
await page
  .locator("#mobile-menu")
  .tap({ position: { x: 30, y: 30 } });
await page.waitForTimeout(400);
const servicesDataOpenAfter = await servicesMenu.getAttribute(
  "data-services-open",
);
const servicesOpacityAfter = await servicesMenu.evaluate(
  (el) => getComputedStyle(el).opacity,
);
log("after tap outside -> data-services-open:", servicesDataOpenAfter);
log("after tap outside -> opacity:", servicesOpacityAfter);
await page.screenshot({
  path: `${outDir}/04-services-closed.png`,
  fullPage: false,
});

await page.screenshot({ path: `${outDir}/05-final.png`, fullPage: false });

await browser.close();
log("done. screenshots in", outDir);
