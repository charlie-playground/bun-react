/**
* Scrape the current Hacker News homepage and write:
* - src/data.json: snapshot with `cssHref` and `contentHTML` (rewritten to absolute asset URLs)
* - src/index.html: ensure <head> matches HN (title, icon, css) while keeping our module entry
*
* Run with: bun run scripts/scrape-hn.ts
*/
import { writeFile, readFile } from "node:fs/promises";

const ORIGIN = "https://news.ycombinator.com/" as const;

async function scrapeHN() {
  const res = await fetch(ORIGIN);
  if (!res.ok) throw new Error(`Failed to fetch HN: ${res.status} ${res.statusText}`);
  const html = await res.text();

  // Extract the CSS href (news.css?...)
  const cssMatch = html.match(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']*news\.css[^"']*)["'][^>]*>/i);
  if (!cssMatch) throw new Error("Could not find news.css link in HN HTML");
  const cssHrefAbs = new URL(cssMatch[1], ORIGIN).toString();

  // Extract the main content inside <center>...</center>
  const centerStart = html.indexOf("<center>");
  const centerEnd = html.lastIndexOf("</center>");
  if (centerStart === -1 || centerEnd === -1) throw new Error("Could not locate <center> block in HN HTML");
  const centerHTML = html.slice(centerStart, centerEnd + "</center>".length);

  // Rewrite relative asset URLs to absolute so they load from HN when served locally
  // We keep links (href) as-is, but fix <img src> that point to HN assets.
  const contentHTML = centerHTML
    .replace(/src=["'](y18\.svg)["']/g, (_m, p1) => `src="${new URL(p1, ORIGIN).toString()}"`)
    .replace(/src=["'](s\.gif)["']/g, (_m, p1) => `src="${new URL(p1, ORIGIN).toString()}"`);

  const snapshot = {
    source: ORIGIN,
    fetchedAt: new Date().toISOString(),
    cssHref: cssHrefAbs,
    title: "Hacker News",
    contentHTML,
  } satisfies {
    source: string;
    fetchedAt: string;
    cssHref: string;
    title: string;
    contentHTML: string;
  };

  await writeFile("src/data.json", JSON.stringify(snapshot, null, 2) + "\n");

  // Update src/index.html head to include HN title/icon/css (keep our module entry)
  const indexPath = "src/index.html";
  const indexHtml = await readFile(indexPath, "utf8");

  // Basic template for the head we want
  const newHead = [
    "  <head>",
    "    <meta charset=\"UTF-8\" />",
    "    <meta name=\"referrer\" content=\"origin\" />",
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
    `    <link rel=\"icon\" href=\"${new URL("y18.svg", ORIGIN).toString()}\">`,
    `    <link rel=\"stylesheet\" type=\"text/css\" href=\"${cssHrefAbs}\">`,
    "    <title>Hacker News</title>",
    "    <script type=\"module\" src=\"./frontend.tsx\"></script>",
    "  </head>",
  ].join("\n");

  // Replace anything between <head>...</head> with our new head
  const updated = indexHtml.replace(/<head>[\s\S]*?<\/head>/i, newHead);
  await writeFile(indexPath, updated, "utf8");

  console.log("Wrote src/data.json and updated src/index.html");
  console.log(`css: ${cssHrefAbs}`);
}

scrapeHN().catch(err => {
  console.error(err);
  process.exit(1);
});
