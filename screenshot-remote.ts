import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const TARGET_URL = process.env.TARGET_URL ?? "https://teenage.engineering/store/tx-6-black";

async function takeScreenshot() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    locale: "en-US",
  });
  const page = await context.newPage();

  try {
    await page.emulateMedia({ reducedMotion: "reduce" });

    // Best-effort cookie banner dismissal commonly used on many sites
    page.on("domcontentloaded", async () => {
      await page.addStyleTag({
        content:
          "#onetrust-banner-sdk, .cookie, [id*='cookie'], [class*='cookie'] { display: none !important; }",
      });
    });

    await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 60_000 });

    await mkdir("screenshots", { recursive: true });

    const now = new Date();
    const timestamp = now.toISOString().replace(/:/g, "-").replace(/\./g, "-");
    const filename = `target-${timestamp}.png`;
    const filepath = join("screenshots", filename);

    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`Target screenshot saved to: ${filepath}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

takeScreenshot().catch(err => {
  console.error(err);
  process.exit(1);
});
