import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto("http://localhost:3000/");

    // Create screenshots directory if it doesn't exist
    await mkdir("screenshots", { recursive: true });

    // Generate filename with current date and time
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "-");
    const filename = `screenshot-${timestamp}.png`;
    const filepath = join("screenshots", filename);

    // Take screenshot
    await page.screenshot({ path: filepath, fullPage: true });

    console.log(`Screenshot saved to: ${filepath}`);
  } finally {
    await browser.close();
  }
}

takeScreenshot().catch(console.error);
