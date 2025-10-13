import { serve } from "bun";

// Target we are cloning (Teenage Engineering TX-6 black)
const TARGET_ORIGIN = "https://teenage.engineering" as const;
const TARGET_PATH = "/store/tx-6-black" as const;
const TARGET_URL = `${TARGET_ORIGIN}${TARGET_PATH}` as const;

/**
* Very small HTML rewriter to:
* - strip all <script> tags (avoid client-side JS and cookie banners)
* - convert relative URLs (href/src starting with "/") to absolute ones on TARGET_ORIGIN
* - convert CSS url(/...) references to absolute
*/
function rewriteHtml(html: string): string {
  // Remove all <script>...</script> and stray <script .../> tags
  let out = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<script\b[^>]*\/>/gi, "");

  // Absolutize href/src that start with "/" (but not protocol-relative like //)
  out = out.replace(/(href|src)=("|')\/(?!\/)/gi, (_m, attr, quote) => `${attr}=${quote}${TARGET_ORIGIN}/`);
  // Absolutize any attribute value starting with "/" (covers srcset, imagesets, poster, data-*, etc.)
  out = out.replace(/=("|')\/(?!\/)/gi, (_m, quote) => `=${quote}${TARGET_ORIGIN}/`);

  // Absolutize CSS url(/...) including quoted url("/...)
  out = out.replace(/url\(\s*(["'])?\/(?!\/)\s*/gi, (_m, quote) => `url(${quote ?? ""}${TARGET_ORIGIN}/`);

  // Absolutize subsequent entries in srcset lists: ", /path 320w" -> ", https://origin/path 320w"
  out = out.replace(/,\s+\/(?!\/)/g, `, ${TARGET_ORIGIN}/`);

  // Ensure a stable background to avoid dark-mode diffs
  out = out.replace(
    /<head(\b[^>]*)>/i,
    match =>
      `${match}\n<style>html{color-scheme: light !important}</style>\n<meta name="viewport" content="width=device-width, initial-scale=1" />`
  );

  return out;
}

const server = serve({
  async fetch(req) {
    const url = new URL(req.url);

    // Keep a tiny dev API for sanity checks if desired
    if (url.pathname.startsWith("/api/hello")) {
      const name = url.pathname.split("/").pop() || "world";
      return Response.json({ message: `Hello, ${decodeURIComponent(name)}!` });
    }

    // Root path: fetch and proxy the Teenage Engineering page (rewritten)
    if (url.pathname === "/" || url.pathname === "") {
      try {
        const upstream = await fetch(TARGET_URL, {
          headers: {
            // A realistic UA helps some CDNs deliver correct HTML/CSS
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        const html = await upstream.text();
        const body = rewriteHtml(html);
        return new Response(body, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            // Cache a little in prod to speed up subsequent loads
            "cache-control": process.env.NODE_ENV === "production" ? "public, max-age=300" : "no-store",
          },
        });
      } catch (err) {
        console.error("Proxy error:", err);
        return new Response("Upstream fetch failed", {
          status: 502,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
    }

    // Fallback: no local static file serving to avoid path traversal issues.
    return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },

  development: process.env.NODE_ENV !== "production" && {
    // Keep server console mirroring in dev; HMR is not applicable to proxied HTML.
    console: true,
  },
});

console.log(`🚀 Dev server ready at ${server.url} (proxying ${TARGET_URL})`);
