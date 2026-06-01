import { Brain, Activity, Scale } from "lucide-react";
import { TickerSearch } from "@/components/ticker-search";
import { FeatureCard } from "@/components/feature-card";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">StockAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              API
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance">
              AI-Powered Stock Analysis
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Get institutional-grade research reports in seconds
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center pt-4">
            <TickerSearch />
          </div>

          {/* Popular Tickers */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Popular:</span>
            <div className="flex gap-2">
              {["AAPL", "TSLA", "NVDA", "MSFT"].map((ticker) => (
                <a
                  key={ticker}
                  href={`/report/${ticker}`}
                  className="px-3 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-mono text-xs transition-colors"
                >
                  {ticker}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section id="features" className="w-full max-w-5xl mx-auto mt-24 px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Brain}
              title="AI Analysis"
              description="Advanced machine learning models analyze financial data, news sentiment, and market trends to generate comprehensive insights."
            />
            <FeatureCard
              icon={Activity}
              title="Real-time Data"
              description="Access live market data, price movements, and trading volumes with institutional-grade accuracy and speed."
            />
            <FeatureCard
              icon={Scale}
              title="Bull & Bear Case"
              description="Get balanced perspectives with detailed bull and bear cases, helping you make informed investment decisions."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">StockAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} StockAI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
