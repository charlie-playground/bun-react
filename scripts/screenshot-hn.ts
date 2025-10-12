import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 2000 } });
  try {
    await page.goto("https://news.ycombinator.com/", { waitUntil: "load" });
    await page.waitForLoadState("networkidle");

    await mkdir("screenshots", { recursive: true });

    const now = new Date();
    const timestamp = now.toISOString().replace(/:/g, "-").replace(/\./g, "-");
    const filename = `hn-${timestamp}.png`;
    const filepath = join("screenshots", filename);

    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`HN screenshot saved to: ${filepath}`);
  } finally {
    await browser.close();
  }
}

takeScreenshot().catch(console.error);
