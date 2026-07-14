"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export function TickerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const resp = await fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}`);
        const data = await resp.json();
        setResults(data.results || []);
        setOpen((data.results || []).length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(symbol: string) {
    setQuery(symbol);
    setOpen(false);
    router.push(`/report/${symbol}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (ticker) {
      setOpen(false);
      router.push(`/report/${ticker}`);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex w-full gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Тикер или название компании (напр. Apple)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            className="h-14 pl-12 pr-4 text-lg bg-secondary border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            autoComplete="off"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Анализировать
        </Button>
      </form>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-border bg-secondary shadow-xl overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Поиск...</div>
          )}
          {!loading && results.map((r) => (
            <button
              key={r.symbol}
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition-colors"
              onMouseDown={() => select(r.symbol)}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-primary text-sm w-16 shrink-0">
                  {r.symbol}
                </span>
                <span className="text-sm text-foreground truncate">{r.name}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">{r.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
