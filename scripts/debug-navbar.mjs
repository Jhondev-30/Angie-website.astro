import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const page = await context.newPage();

page.on("console", (msg) => console.log("[browser console]", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("[browser pageerror]", err.message));
page.on("requestfailed", (req) =>
  console.log("[browser reqfail]", req.url(), req.failure()?.errorText),
);

const log = (...a) => console.log("[debug]", ...a);

await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

log("URL after goto:", page.url());
log("Title:", await page.title());

// Check if the mobile-menu exists at all
const html = await page.content();
log("HTML length:", html.length);
log("has #mobile-menu:", html.includes("id=\"mobile-menu\""));
log("has #menu-btn:", html.includes("id=\"menu-btn\""));

// Try a different selector approach
const ulCount = await page.locator("ul#mobile-menu").count();
log("ul#mobile-menu count:", ulCount);

const anyUl = await page.locator("ul").count();
log("any ul count:", anyUl);

// If found, read its computed style
if (ulCount > 0) {
  const before = await page.locator("ul#mobile-menu").evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      position: cs.position,
      top: cs.top,
      right: cs.right,
      bottom: cs.bottom,
      left: cs.left,
      width: cs.width,
      height: cs.height,
      zIndex: cs.zIndex,
      background: cs.backgroundColor,
      dataOpen: el.dataset.open,
      classList: el.className,
    };
  });
  log("BEFORE tap:", before);

  await page.locator("#menu-btn").tap();
  await page.waitForTimeout(500);

  const after = await page.locator("ul#mobile-menu").evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      position: cs.position,
      top: cs.top,
      right: cs.right,
      bottom: cs.bottom,
      left: cs.left,
      width: cs.width,
      height: cs.height,
      zIndex: cs.zIndex,
      background: cs.backgroundColor,
      dataOpen: el.dataset.open,
    };
  });
  log("AFTER tap:", after);

  const morphStyle = await page.locator("#menu-btn morph-icon").evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      background: cs.backgroundColor,
      width: cs.width,
      height: cs.height,
      color: cs.color,
    };
  });
  log("morph-icon style:", morphStyle);
}

await page.screenshot({
  path: "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/navbar-mobile/debug.png",
  fullPage: false,
});

await browser.close();
