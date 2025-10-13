import bunLogo from "./logo.svg";
import reactLogo from "./react.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APITester } from "./APITester";

export function App() {
  return (
    <main className="p-6 sm:p-10">
      {/* Header / Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <div className="flex items-center justify-center gap-6">
          <img src={bunLogo} alt="Bun" className="size-16" />
          <span className="text-3xl font-semibold text-muted-foreground">+</span>
          <img src={reactLogo} alt="React" className="size-16" />
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">
          Bun × React Starter
        </h1>
        <p className="mt-2 text-muted-foreground">
          Dev server with HMR, API routes, and Tailwind UI components.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="https://bun.sh/docs" target="_blank" rel="noreferrer">
            <Button>Docs</Button>
          </a>
          <a
            href="https://github.com/charlie-playground/bun-react"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline">GitHub</Button>
          </a>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl mt-10 w-full">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Try the built-in API</h2>
            <p className="text-sm text-muted-foreground">
              Your server in <code className="font-mono">src/index.tsx</code> exposes
              <code className="font-mono">/api/hello</code> and
              <code className="font-mono">/api/hello/:name</code>.
            </p>
            <APITester />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default App;
