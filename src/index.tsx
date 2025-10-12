import { serve } from "bun";
import rawData from "./data.json";

interface SnapshotData { fullHTML?: string }
const data = rawData as SnapshotData;

const server = serve({
  routes: {
    // API routes first so they are not shadowed by the wildcard.
    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    // Serve the exact HTML snapshot (full document) for pixel-perfect match, only for HTML requests.
    "/*": async req => {
      const accept = req.headers.get("accept") || "";
      if (!accept.includes("text/html")) return new Response("Not Found", { status: 404 });
      const html = data.fullHTML ?? "";
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
