import { chromium } from "@playwright/test";
import { writeFile, readFile } from "node:fs/promises";

async function freeze() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 2000 } });
  try {
    await page.goto("https://news.ycombinator.com/", { waitUntil: "load" });
    await page.waitForLoadState("networkidle");

    const nowISO = new Date().toISOString();

    // Normalize relative asset URLs to absolute and extract parts inside the page context
    const snapshot = await page.evaluate(() => {
      const ORIGIN = location.origin + "/";
      // Rewrite a few known relative asset URLs to absolute so they load from HN when hosted locally
      const rewrites: Array<[selector: string, attr: string]> = [
        ["link[rel=stylesheet][href*='news.css']", "href"],
        ["script[src*='hn.js']", "src"],
        ["img[src='y18.svg']", "src"],
        ["img[src='s.gif']", "src"],
      ];
      for (const [sel, attr] of rewrites) {
        document.querySelectorAll(sel).forEach((el) => {
          const v = el.getAttribute(attr);
          if (v) el.setAttribute(attr, new URL(v, ORIGIN).toString());
        });
      }
      const css = (document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="news.css"]')?.href ?? "");
      const fullHTML = document.documentElement.outerHTML;
      const center = document.querySelector("center");
      const contentHTML = center ? center.outerHTML : document.body.innerHTML;
      return { cssHref: css, contentHTML, fullHTML };
    });

    const data = {
      source: "https://news.ycombinator.com/",
      fetchedAt: nowISO,
      cssHref: snapshot.cssHref,
      title: "Hacker News",
      contentHTML: snapshot.contentHTML,
      fullHTML: snapshot.fullHTML,
    };

    await writeFile("src/data.json", JSON.stringify(data, null, 2) + "\n");

    // Also ensure our index.html has the correct head
    const indexPath = "src/index.html";
    const indexHtml = await readFile(indexPath, "utf8");
    const newHead = [
      "  <head>",
      "    <meta charset=\"UTF-8\" />",
      "    <meta name=\"referrer\" content=\"origin\" />",
      "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
      `    <link rel=\"icon\" href=\"https://news.ycombinator.com/y18.svg\">`,
      `    <link rel=\"stylesheet\" type=\"text/css\" href=\"${data.cssHref}\">`,
      "    <title>Hacker News</title>",
      "  </head>",
    ].join("\n");
    const updated = indexHtml.replace(/<head>[\s\S]*?<\/head>/i, newHead);
    await writeFile(indexPath, updated, "utf8");

    // Save the HN screenshot from the same page load
    const ts = nowISO.replace(/:/g, "-").replace(/\./g, "-");
    await page.screenshot({ path: `screenshots/hn-${ts}.png`, fullPage: true });
    console.log(`Freeze complete at ${nowISO}`);
  } finally {
    await browser.close();
  }
}

freeze().catch((err) => {
  console.error(err);
  process.exit(1);
});
