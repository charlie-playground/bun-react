import { useEffect, useMemo } from "react";
import data from "./data.json";

export function App() {
  // Ensure CSS <link> exists (scrape script also writes it to index.html for first paint)
  useEffect(() => {
    document.title = data.title ?? "Hacker News";
    const cssHref = data.cssHref;
    if (cssHref && !document.querySelector(`link[rel="stylesheet"][href="${cssHref}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = cssHref;
      document.head.appendChild(link);
    }
  }, []);

  const __html = useMemo(() => data.contentHTML, []);

  return <div dangerouslySetInnerHTML={{ __html }} />;
}

export default App;
