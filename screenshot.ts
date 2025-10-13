import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

// Reference screenshot dimensions (from media.cleanshot.cloud PNG): 3366 x 2068
const VIEWPORT = { width: 3366, height: 2068 } as const;

async function takeScreenshot() {
  // Use a dedicated browser context so we can control viewport and scale.
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    await page.goto("http://localhost:3000/");

    // Ensure network quiet and fonts are fully ready before capture
    await page.waitForLoadState("networkidle");
    await page.evaluate(async () => {
      // @ts-expect-error - fonts API is available in browsers
      if (document.fonts?.ready) await document.fonts.ready;
    });

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

    // Take screenshot of the fixed viewport (not fullPage)
    await page.screenshot({ path: filepath, fullPage: false });

    console.log(`Screenshot saved to: ${filepath}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

takeScreenshot().catch(console.error);
