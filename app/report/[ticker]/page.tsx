import { Activity, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">StockAI</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>
      </header>

      {/* Report Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Ticker Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-mono text-foreground">{upperTicker}</h1>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Analysis Ready
              </span>
            </div>
            <p className="text-muted-foreground">
              AI-generated research report for {upperTicker}
            </p>
          </div>

          {/* Analysis Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bull Case */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-chart-1">
                  <TrendingUp className="h-5 w-5" />
                  Bull Case
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-chart-1 mt-1">•</span>
                    Strong revenue growth trajectory with expanding market share
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-chart-1 mt-1">•</span>
                    Innovative product pipeline and R&D investments
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-chart-1 mt-1">•</span>
                    Solid balance sheet with healthy cash reserves
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-chart-1 mt-1">•</span>
                    Positive analyst sentiment and institutional buying
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Bear Case */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-chart-4">
                  <TrendingDown className="h-5 w-5" />
                  Bear Case
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-chart-4 mt-1">•</span>
                    Valuation concerns relative to historical averages
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-chart-4 mt-1">•</span>
                    Competitive pressure from emerging market players
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-chart-4 mt-1">•</span>
                    Regulatory headwinds and compliance costs
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-chart-4 mt-1">•</span>
                    Macroeconomic uncertainty affecting consumer demand
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Based on our AI analysis of {upperTicker}, we&apos;ve identified key factors 
                that could influence the stock&apos;s performance. The analysis considers 
                financial metrics, market sentiment, competitive positioning, and 
                macroeconomic factors. This report is generated for informational 
                purposes and should not be considered financial advice.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            This analysis is AI-generated and for informational purposes only. 
            Not financial advice. Always do your own research.
          </p>
        </div>
      </main>
    </div>
  );
}
