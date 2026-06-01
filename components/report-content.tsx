"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2, AlertCircle, DollarSign, BarChart3, Newspaper, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisData {
  ticker: string;
  key_indicators: {
    price: number;
    market_cap: number | string;
    pe_ratio: number | null;
    pe_forward: number | null;
    eps_actual: number | null;
    dividend_yield: number | null;
    week_52_high: number;
    week_52_low: number;
    currency_symbol: string;
  };
  report: {
    executive_summary: string;
    bull_case: string[];
    bear_case: string[];
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    financial_health: {
      score: number;
      growth_rating: string;
      profitability_rating: string;
    };
    fair_value: {
      estimate: number;
      upside_pct: number;
    };
  };
  news: Array<{
    title: string;
    date: string;
  }>;
}

interface ReportContentProps {
  ticker: string;
}

export function ReportContent({ ticker }: ReportContentProps) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticker: ticker.toUpperCase() }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analysis");
        }

        const result = await response.json();
        setData(result);
      } catch {
        setError("Ошибка загрузки. Попробуйте снова.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Анализируем {ticker.toUpperCase()}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error || "Ошибка загрузки. Попробуйте снова."}</p>
      </div>
    );
  }

  const formatNumber = (num: number | null | undefined, prefix = "", suffix = "") => {
    if (num === null || num === undefined) return "Н/Д";
    return `${prefix}${num.toLocaleString()}${suffix}`;
  };

  const formatMarketCap = (value: number | string | null | undefined, currencySymbol: string): string => {
    if (value === null || value === undefined) return "Н/Д";
    
    // If already formatted as a string (e.g., "$4.58T"), return as-is
    if (typeof value === "string") {
      if (value.includes("T") || value.includes("B") || value.includes("M") || value.includes("трлн") || value.includes("млрд") || value.includes("млн")) {
        return value;
      }
      // Try parsing as number
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
      if (isNaN(parsed)) return value;
      value = parsed;
    }
    
    // Format raw number with appropriate suffix based on currency
    const isRuble = currencySymbol === "₽";
    if (value >= 1e12) {
      return `${currencySymbol}${(value / 1e12).toFixed(2)} ${isRuble ? "трлн" : "T"}`;
    } else if (value >= 1e9) {
      return `${currencySymbol}${(value / 1e9).toFixed(2)} ${isRuble ? "млрд" : "B"}`;
    } else if (value >= 1e6) {
      return `${currencySymbol}${(value / 1e6).toFixed(2)} ${isRuble ? "млн" : "M"}`;
    } else {
      return `${currencySymbol}${value.toLocaleString()}`;
    }
  };

  const formatPercent = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "Н/Д";
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const currencySymbol = data.key_indicators.currency_symbol || "$";

  return (
    <div className="space-y-8">
      {/* Ticker Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold font-mono text-foreground">{data.ticker}</h1>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Анализ готов
          </span>
        </div>
        <p className="text-muted-foreground">
          ИИ-отчёт по акции {data.ticker}
        </p>
      </div>

      {/* Key Indicators */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            Ключевые показатели
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Цена</p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators.price, currencySymbol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Капитализация</p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatMarketCap(data.key_indicators.market_cap, currencySymbol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">P/E</p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators.pe_ratio)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Forward P/E</p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators.pe_forward)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">EPS (факт)</p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators.eps_actual, currencySymbol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Дивидендная доходность</p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators.dividend_yield, "", "%")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Макс. 52 нед.</p>
              <p className="text-xl font-mono font-semibold text-chart-1">{formatNumber(data.key_indicators.week_52_high, currencySymbol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Мин. 52 нед.</p>
              <p className="text-xl font-mono font-semibold text-chart-4">{formatNumber(data.key_indicators.week_52_low, currencySymbol)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Резюме</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {data.report.executive_summary}
          </p>
        </CardContent>
      </Card>

      {/* Bull & Bear Case */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-chart-1">
              <TrendingUp className="h-5 w-5" />
              Бычий сценарий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {data.report.bull_case.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-chart-1 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-chart-4">
              <TrendingDown className="h-5 w-5" />
              Медвежий сценарий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {data.report.bear_case.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-chart-4 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* SWOT Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">SWOT-анализ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-chart-1/10 border border-chart-1/20">
              <h4 className="font-semibold text-chart-1 mb-2">Сильные стороны</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.report.swot.strengths.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
              <h4 className="font-semibold text-chart-4 mb-2">Слабые стороны</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.report.swot.weaknesses.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Возможности</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.report.swot.opportunities.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h4 className="font-semibold text-orange-500 mb-2">Угрозы</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {data.report.swot.threats.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health & Fair Value */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-primary" />
              Финансовое здоровье
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Общий балл</span>
                <span className="text-2xl font-mono font-bold text-primary">{data.report.financial_health.score}/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Рейтинг роста</span>
                <span className="font-semibold text-foreground">{data.report.financial_health.growth_rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Рентабельность</span>
                <span className="font-semibold text-foreground">{data.report.financial_health.profitability_rating}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-primary" />
              Справедливая стоимость
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Оценка</span>
                <span className="text-2xl font-mono font-bold text-foreground">{currencySymbol}{data.report.fair_value.estimate.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Потенциал роста</span>
                <span className={`text-xl font-mono font-bold ${data.report.fair_value.upside_pct >= 0 ? "text-chart-1" : "text-chart-4"}`}>
                  {formatPercent(data.report.fair_value.upside_pct)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest News */}
      {data.news && data.news.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Newspaper className="h-5 w-5 text-primary" />
              Последние новости
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.news.map((item, index) => (
                <li key={index} className="flex items-start justify-between gap-4 pb-3 border-b border-border last:border-0 last:pb-0">
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        Данный анализ сгенерирован искусственным интеллектом и предназначен только для информационных целей. 
        Не является финансовой рекомендацией. Всегда проводите собственное исследование.
      </p>
    </div>
  );
}
