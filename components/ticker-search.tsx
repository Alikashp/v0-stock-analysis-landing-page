"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TickerSearch() {
  const [ticker, setTicker] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      router.push(`/report/${ticker.toUpperCase().trim()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter stock ticker (e.g. AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="h-14 pl-12 pr-4 text-lg bg-secondary border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Analyze
      </Button>
    </form>
  );
}
