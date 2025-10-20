import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./index.css";
import { Orbit } from "lucide-react";

export function App() {
  return (
    <main className="w-full max-w-sm mx-auto p-6 text-center relative z-10">
      <div className="flex justify-center mb-8">
        <div className="size-14 rounded-full grid place-items-center bg-card border border-input">
          <Orbit aria-hidden className="size-7 text-foreground/80" />
        </div>
      </div>

      <form className="space-y-4 text-left">
        <Input type="email" placeholder="Email" autoComplete="email" />
        <Input type="password" placeholder="Password" autoComplete="current-password" />
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
    </main>
  );
}

export default App;
