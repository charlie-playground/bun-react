import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./index.css";
import { Orbit } from "lucide-react";

export function App() {
  return (
    <main className="w-full max-w-sm mx-auto p-6 text-center relative z-10">
      <div className="flex justify-center mb-8">
        <div className="w-14 h-14 rounded-full grid place-items-center bg-card border border-input">
          <Orbit aria-hidden className="w-7 h-7 text-foreground/80" />
        </div>
      </div>

      <form
        className="space-y-4 text-left"
        onSubmit={e => {
          e.preventDefault();
          // no-op for now: wire up to real auth later
        }}
      >
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <Input id="email" type="email" placeholder="Email" autoComplete="email" />
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <Input id="password" type="password" placeholder="Password" autoComplete="current-password" />
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </main>
  );
}

export default App;
