"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Loader2, AlertCircle, DollarSign, BarChart3, Newspaper, Target, Users, LineChart as LineChartIcon, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/lib/supabase";
import { InfoTooltip } from "@/components/info-tooltip";

type AccessBlock = "anonymous_limit" | "paid_limit" | null;

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}

async function checkAnonymousAccess(): Promise<boolean> {
  const sessionId = getOrCreateSessionId();

  const { data: session, error: selectError } = await supabase
    .from("anonymous_sessions")
    .select("analyses_count")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (selectError) {
    console.log("[v0] checkAnonymousAccess select error:", selectError.message);
    return false;
  }

  if (!session) {
    const { error: insertError } = await supabase
      .from("anonymous_sessions")
      .insert({ session_id: sessionId, analyses_count: 1 });
    if (insertError) {
      console.log("[v0] checkAnonymousAccess insert error:", insertError.message);
      return false;
    }
    return true;
  }

  if (session.analyses_count >= 1) {
    return false;
  }

  const { error: updateError } = await supabase
    .from("anonymous_sessions")
    .update({ analyses_count: session.analyses_count + 1 })
    .eq("session_id", sessionId);
  if (updateError) {
    console.log("[v0] checkAnonymousAccess update error:", updateError.message);
    return false;
  }
  return true;
}

async function checkRegisteredAccess(userId: string, email: string): Promise<boolean> {
  const { data: profile, error: selectError } = await supabase
    .from("users")
    .select("analyses_count, plan")
    .eq("id", userId)
    .maybeSingle();

  if (selectError) {
    console.log("[v0] checkRegisteredAccess select error:", selectError.message);
    return false;
  }

  if (profile?.plan === "pro") {
    return true;
  }

  const count = profile?.analyses_count ?? 0;
  if (count >= 7) {
    return false;
  }

  if (profile) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ analyses_count: count + 1 })
      .eq("id", userId);
    if (updateError) {
      console.log("[v0] checkRegisteredAccess update error:", updateError.message);
      return false;
    }
  } else {
    const { error: insertError } = await supabase
      .from("users")
      .insert({ id: userId, email, analyses_count: 1 });
    if (insertError) {
      console.log("[v0] checkRegisteredAccess insert error:", insertError.message);
      return false;
    }
  }
  return true;
}

function UpgradePrompt({ reason }: { reason: AccessBlock }) {
  const isAnonymous = reason === "anonymous_limit";

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="p-4 rounded-full bg-primary/10">
        <Lock className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-foreground">
          {isAnonymous ? "Вы использовали бесплатный анализ" : "Лимит бесплатных анализов исчерпан"}
        </h2>
        <p className="text-muted-foreground">
          {isAnonymous
            ? "Зарегистрируйтесь чтобы получить 7 анализов в месяц бесплатно"
            : "В этом месяце вы использовали все 7 бесплатных анализов. Перейдите на платный тариф, чтобы продолжить."}
        </p>
      </div>
      {isAnonymous ? (
        <div className="space-y-3">
          <Button onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}>
            Войти через Google
          </Button>
          <p className="text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <button
              className="text-primary hover:underline"
              onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
            >
              Войти
            </button>
          </p>
        </div>
      ) : (
        <Link href="/pricing">
          <Button>Перейти на платный тариф</Button>
        </Link>
      )}
    </div>
  );
}

interface AnalysisData {
  ticker: string;
  key_indicators?: {
    price?: number;
    market_cap?: number | string;
    pe_ratio?: number | null;
    pe_forward?: number | null;
    price_to_sales?: number | null;
    eps_actual?: number | null;
    dividend_yield?: number | null;
    week_52_high?: number;
    week_52_low?: number;
    currency_symbol?: string;
  };
  report?: {
    what_is_happening?: string;
    main_catalyst?: string;
    main_risk?: string;
    scenarios?: {
      optimistic?: string;
      pessimistic?: string;
    };
    bull_case?: string[];
    bear_case?: string[];
    swot?: {
      strengths?: string[];
      weaknesses?: string[];
      opportunities?: string[];
      threats?: string[];
    };
    financial_health?: {
      score?: number;
      growth_rating?: number;
      profitability_rating?: number;
      cashflow_rating?: number;
      comment?: string;
    };
    fair_value?: {
      estimate?: number;
      upside_pct?: number;
      methodology?: string;
    };
    interest_level?: string;
    interest_reason?: string;
  };
  news?: Array<{
    title: string;
    date: string;
    link?: string;
  }>;
  insider_trades?: Array<{
    name: string;
    title: string;
    transaction: string;
    shares: number | string;
    value: number | string;
    date: string;
  }>;
  politician_trades?: Array<{
    senator: string;
    party: string;
    transaction_date: string;
    owner: string;
    asset_description: string;
    type: string;
    amount: string;
  }>;
  annual_financials?: Array<{
    year: string;
    revenue: number | null;
    net_income: number | null;
  }>;
  recommendation_trend?: {
    strong_buy?: number;
    buy?: number;
    hold?: number;
    sell?: number;
    strong_sell?: number;
  };
  analyst_ratings?: Array<{
    firm: string;
    to_grade: string;
    action: string;
    date: string;
  }>;
  price_history?: Array<{
    date: string;
    price: number;
  }>;
  price_history_multi?: Record<string, {
    data: Array<{ date: string; price: number }>;
    change_pct: number | null;
  }>;
  revenue_history?: Array<{
    quarter: string;
    revenue: number;
  }>;
}

interface ReportContentProps {
  ticker: string;
}

function ratingBarColor(value: number): string {
  if (value <= 4) return "bg-red-500";
  if (value <= 6) return "bg-orange-500";
  if (value <= 8) return "bg-yellow-500";
  return "bg-green-500";
}

function RatingBar({ label, value, tooltip }: { label: string; value: number | undefined; tooltip?: string }) {
  const safeValue = typeof value === "number" && !Number.isNaN(value) ? Math.min(10, Math.max(0, value)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1">{label}{tooltip && <InfoTooltip text={tooltip} />}</span>
        <span className="font-mono font-semibold text-foreground">{value ?? "Н/Д"}/10</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-2 rounded-full ${ratingBarColor(safeValue)}`}
          style={{ width: `${(safeValue / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

const GRADE_TRANSLATIONS: Record<string, string> = {
  Buy: "Buy",
  Hold: "Hold",
  Sell: "Sell",
  Overweight: "Overweight",
  Underweight: "Underweight",
  "Strong Buy": "Strong Buy",
  Outperform: "Outperform",
  Underperform: "Underperform",
  Neutral: "Neutral",
};

function ratingColor(grade: string): string {
  const normalized = grade.toLowerCase();
  if (normalized.includes("buy") || normalized.includes("outperform") || normalized.includes("overweight")) {
    return "text-yellow-500";
  }
  if (normalized.includes("sell") || normalized.includes("underperform") || normalized.includes("underweight")) {
    return "text-red-500";
  }
  return "text-muted-foreground";
}

export function ReportContent({ ticker }: ReportContentProps) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessBlock, setAccessBlock] = useState<AccessBlock>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1y");

  useEffect(() => {
    async function fetchAnalysis(userId: string | null) {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        console.log("[v0] NEXT_PUBLIC_API_URL:", baseUrl);

        if (!baseUrl) {
          console.log("[v0] NEXT_PUBLIC_API_URL is not set!");
        }

        const url = `${baseUrl}/analyze`;
        const payload = { ticker: ticker.toUpperCase() };
        console.log("[v0] Fetching:", url, "with body:", payload);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log("[v0] Response status:", response.status, response.statusText);

        if (!response.ok) {
          const text = await response.text();
          console.log("[v0] Response not OK. Body:", text);
          throw new Error(`Failed to fetch analysis: ${response.status}`);
        }

        const result = await response.json();
        console.log("[v0] Analysis result received:", result);
        setData(result);
        console.log("insider_trades:", result.insider_trades);
        console.log("все ключи:", Object.keys(result));

        const { error: saveError } = await supabase
          .from("analyses")
          .insert({ user_id: userId, ticker: ticker.toUpperCase(), report: result });
        if (saveError) {
          console.log("[v0] save analysis history error:", saveError.message);
        }
      } catch (err) {
        console.log("[v0] Fetch error:", err instanceof Error ? err.message : err);
        setError("Ошибка загрузки. Попробуйте снова.");
      } finally {
        setLoading(false);
      }
    }

    async function checkAccessAndFetch() {
      setLoading(true);
      setAccessBlock(null);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const allowed = user
        ? await checkRegisteredAccess(user.id, user.email ?? "")
        : await checkAnonymousAccess();

      if (!allowed) {
        setAccessBlock(user ? "paid_limit" : "anonymous_limit");
        setLoading(false);
        return;
      }

      await fetchAnalysis(user?.id ?? null);
    }

    checkAccessAndFetch();
  }, [ticker]);

  if (accessBlock) {
    return <UpgradePrompt reason={accessBlock} />;
  }

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

  const formatTradeNumber = (value: number | string | null | undefined, prefix = "") => {
    if (value === null || value === undefined || value === "") return "Н/Д";
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
      if (isNaN(parsed)) return value;
      value = parsed;
    }
    return `${prefix}${value.toLocaleString()}`;
  };

  const currencySymbol = data.key_indicators?.currency_symbol || "$";

  const bullCase = data.report?.bull_case ?? [];
  const bearCase = data.report?.bear_case ?? [];
  const swotStrengths = data.report?.swot?.strengths ?? [];
  const swotWeaknesses = data.report?.swot?.weaknesses ?? [];
  const swotOpportunities = data.report?.swot?.opportunities ?? [];
  const swotThreats = data.report?.swot?.threats ?? [];
  const analystRatings = (data.analyst_ratings ?? []).slice(0, 10);

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
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators?.price, currencySymbol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Капитализация</p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatMarketCap(data.key_indicators?.market_cap, currencySymbol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">P/E <InfoTooltip text="Цена акции / прибыль на акцию. Показывает, за сколько лет компания окупит себя при текущей прибыли." /></p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators?.pe_ratio)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">Forward P/E <InfoTooltip text="Цена акции / прогнозируемая будущая прибыль на акцию (в отличие от P/E, который считает по текущей прибыли)." /></p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators?.pe_forward)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">P/S <InfoTooltip text="Цена акции / выручка на акцию. Полезен для оценки компаний, которые пока не вышли в прибыль." /></p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators?.price_to_sales)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">EPS (факт) <InfoTooltip text="Чистая прибыль компании, делённая на количество акций в обращении." /></p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators?.eps_actual, currencySymbol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Дивидендная доходность</p>
              <p className="text-xl font-mono font-semibold text-foreground">{formatNumber(data.key_indicators?.dividend_yield, "", "%")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Макс. 52 нед.</p>
              <p className="text-xl font-mono font-semibold text-chart-1">{formatNumber(data.key_indicators?.week_52_high, currencySymbol)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Мин. 52 нед.</p>
              <p className="text-xl font-mono font-semibold text-chart-4">{formatNumber(data.key_indicators?.week_52_low, currencySymbol)}</p>
            </div>
            {data.report?.fair_value?.estimate && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">Fair Value <InfoTooltip text="Ориентировочная справедливая цена, рассчитанная ИИ на основе мультипликаторов, темпов роста и прогнозов аналитиков. Не является финансовой рекомендацией." /></p>
                <p className="text-xl font-mono font-semibold text-foreground">{currencySymbol}{data.report.fair_value.estimate.toLocaleString()}</p>
              </div>
            )}
            {data.report?.fair_value?.upside_pct !== undefined && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Потенциал</p>
                <p className={`text-xl font-mono font-semibold ${(data.report.fair_value.upside_pct ?? 0) >= 0 ? "text-chart-1" : "text-chart-4"}`}>
                  {formatPercent(data.report.fair_value.upside_pct)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price History Chart */}
      {data.price_history_multi && Object.keys(data.price_history_multi).length > 0 && (() => {
        const tabs = [
          { key: "1d",  label: "1Д" },
          { key: "5d",  label: "5Д" },
          { key: "1m",  label: "1М" },
          { key: "6m",  label: "6М" },
          { key: "1y",  label: "1Г" },
          { key: "5y",  label: "5Л" },
          { key: "10y", label: "10Л" },
          { key: "all", label: "Всё" },
        ];
        const phm = data.price_history_multi!;
        const current = phm[selectedPeriod] ?? { data: [], change_pct: null };
        const chartData = current.data;
        const changePct = current.change_pct;
        return (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <LineChartIcon className="h-5 w-5 text-primary" />
                История цены
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tab buttons */}
              <div className="flex flex-wrap gap-1 mb-4">
                {tabs.map(({ key, label }) => {
                  const tab = phm[key];
                  const pct = tab?.change_pct;
                  const isActive = selectedPeriod === key;
                  const isPos = pct !== null && pct !== undefined && pct >= 0;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedPeriod(key)}
                      className={`flex flex-col items-center px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
                        isActive
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                          : "border-border text-muted-foreground hover:border-yellow-500/50 hover:text-foreground"
                      }`}
                    >
                      <span>{label}</span>
                      {pct !== null && pct !== undefined && (
                        <span className={`text-xs font-mono leading-tight ${isPos ? "text-green-400" : "text-red-400"}`}>
                          {isPos ? "+" : ""}{pct}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Chart */}
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        interval={selectedPeriod === "1d" ? Math.floor(chartData.length / 6) : selectedPeriod === "5d" ? Math.floor(chartData.length / 8) : "preserveStartEnd"}
                      />
                      <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                      <Tooltip
                        cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)",
                        }}
                        labelStyle={{ color: "var(--muted-foreground)" }}
                        itemStyle={{ color: "var(--chart-1)" }}
                        formatter={(value: number) => [`${currencySymbol}${value}`, "Цена"]}
                      />
                      <Line type="monotone" dataKey="price" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Нет данных</div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Revenue History Chart */}
      {Array.isArray(data.revenue_history) && data.revenue_history.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              Квартальная выручка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenue_history}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                    itemStyle={{ color: "var(--chart-1)" }}
                    formatter={(value: number) => [`$${value}B`, "Выручка"]}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Annual Financials Chart */}
      {Array.isArray(data.annual_financials) && data.annual_financials.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              Годовая динамика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.annual_financials}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: number) => [`$${value}B`, ""]}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  />
                  <Legend formatter={(v) => v === "revenue" ? "Выручка" : "Чистая прибыль"} />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net_income" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendation Trend */}
      {data.recommendation_trend && Object.keys(data.recommendation_trend).length > 0 && (() => {
        const rt = data.recommendation_trend!;
        const total = (rt.strong_buy ?? 0) + (rt.buy ?? 0) + (rt.hold ?? 0) + (rt.sell ?? 0) + (rt.strong_sell ?? 0);
        if (total === 0) return null;
        const chartData = [{ name: "Аналитики", strong_buy: rt.strong_buy ?? 0, buy: rt.buy ?? 0, hold: rt.hold ?? 0, sell: rt.sell ?? 0, strong_sell: rt.strong_sell ?? 0 }];
        return (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Консенсус аналитиков
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = { strong_buy: "Strong Buy", buy: "Buy", hold: "Hold", sell: "Sell", strong_sell: "Strong Sell" };
                        return [value, labels[name] ?? name];
                      }}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="strong_buy" stackId="a" fill="#22c55e" radius={[4, 0, 0, 4]} />
                    <Bar dataKey="buy" stackId="a" fill="#eab308" />
                    <Bar dataKey="hold" stackId="a" fill="#6b7280" />
                    <Bar dataKey="sell" stackId="a" fill="#f97316" />
                    <Bar dataKey="strong_sell" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                {rt.strong_buy ? <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-500" />Strong Buy: {rt.strong_buy}</span> : null}
                {rt.buy ? <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-yellow-500" />Buy: {rt.buy}</span> : null}
                {rt.hold ? <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-gray-500" />Hold: {rt.hold}</span> : null}
                {rt.sell ? <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-orange-500" />Sell: {rt.sell}</span> : null}
                {rt.strong_sell ? <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-500" />Strong Sell: {rt.strong_sell}</span> : null}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* What Is Happening */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Что происходит</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(data.report?.what_is_happening ?? "").split("\n").filter(Boolean).map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interest Level */}
      {data.report?.interest_level && (
        <Card className="bg-card border-border">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="self-start flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold whitespace-nowrap">
                {data.report.interest_level}
                <InfoTooltip text="Итоговый вывод ИИ на основе всех показателей — финансового здоровья, новостей и оценки аналитиков. Это ориентир для дальнейшего изучения, а не сигнал к покупке или продаже." />
              </span>
              <p className="text-sm text-muted-foreground sm:text-right">{data.report.interest_reason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Catalyst & Main Risk */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-chart-1">
              <TrendingUp className="h-5 w-5" />
              Главный катализатор
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{data.report?.main_catalyst}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-chart-4">
              <TrendingDown className="h-5 w-5" />
              Главный риск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{data.report?.main_risk}</p>
          </CardContent>
        </Card>
      </div>

      {/* Scenarios */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-chart-1">
              <TrendingUp className="h-5 w-5" />
              Оптимистичный сценарий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{data.report?.scenarios?.optimistic}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-chart-4">
              <TrendingDown className="h-5 w-5" />
              Пессимистичный сценарий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{data.report?.scenarios?.pessimistic}</p>
          </CardContent>
        </Card>
      </div>

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
              {bullCase.map((item, index) => (
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
              {bearCase.map((item, index) => (
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
                {swotStrengths.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
              <h4 className="font-semibold text-chart-4 mb-2">Слабые стороны</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {swotWeaknesses.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Возможности</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {swotOpportunities.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h4 className="font-semibold text-orange-500 mb-2">Угрозы</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {swotThreats.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insider Trades */}
      {Array.isArray(data.insider_trades) && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Сделки инсайдеров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Имя</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Должность</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Тип сделки</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Кол-во акций</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Сумма</th>
                    <th className="py-2 font-medium text-muted-foreground whitespace-nowrap">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {data.insider_trades.map((trade, index) => {
                    const isBuy = /buy|покуп/i.test(trade.transaction);
                    const isSell = /sell|прод/i.test(trade.transaction);
                    return (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 text-foreground">{trade.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{trade.title}</td>
                        <td className={`py-3 pr-4 font-medium ${isBuy ? "text-chart-1" : isSell ? "text-chart-4" : "text-foreground"}`}>
                          {trade.transaction}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-foreground">{formatTradeNumber(trade.shares)}</td>
                        <td className="py-3 pr-4 text-right font-mono text-foreground">{formatTradeNumber(trade.value, currencySymbol)}</td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap">{trade.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="space-y-5">
              <RatingBar label="Общий балл" value={data.report?.financial_health?.score} tooltip="Складывается из трёх составляющих: насколько быстро растёт бизнес, насколько он прибыльный и сколько свободных денег генерирует." />
              <RatingBar label="Рост" value={data.report?.financial_health?.growth_rating} tooltip="Оценка на основе роста выручки и прибыли год к году. Рост выше 25% даёт максимальный балл." />
              <RatingBar label="Рентабельность" value={data.report?.financial_health?.profitability_rating} tooltip="Оценка на основе маржи прибыли и доходности капитала (ROE) — насколько эффективно компания зарабатывает." />
              <RatingBar label="Денежный поток" value={data.report?.financial_health?.cashflow_rating} tooltip="Оценка на основе свободного денежного потока и уровня долга — насколько устойчива компания финансово." />
              {data.report?.financial_health?.comment && (
                <p className="text-sm text-muted-foreground pt-2 border-t border-border">{data.report.financial_health.comment}</p>
              )}
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
                <span className="text-2xl font-mono font-bold text-foreground">{currencySymbol}{data.report?.fair_value?.estimate?.toLocaleString() ?? "Н/Д"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Потенциал роста</span>
                <span className={`text-xl font-mono font-bold ${(data.report?.fair_value?.upside_pct ?? 0) >= 0 ? "text-chart-1" : "text-chart-4"}`}>
                  {formatPercent(data.report?.fair_value?.upside_pct)}
                </span>
              </div>
              {data.report?.fair_value?.methodology && (
                <p className="text-sm text-muted-foreground pt-2 border-t border-border">{data.report.fair_value.methodology}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyst Ratings */}
      {analystRatings.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-primary" />
              Рейтинги аналитиков
              <InfoTooltip text="Консенсус-рекомендации от инвестиционных банков и брокеров за последние месяцы." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap">Дата</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Банк</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Рейтинг</th>
                    <th className="py-2 font-medium text-muted-foreground">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {analystRatings.map((rating, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{rating.date}</td>
                      <td className="py-3 pr-4 text-foreground">{rating.firm}</td>
                      <td className={`py-3 pr-4 font-medium ${ratingColor(rating.to_grade)}`}>
                        {GRADE_TRANSLATIONS[rating.to_grade] ?? rating.to_grade}
                      </td>
                      <td className="py-3 text-muted-foreground">{rating.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {/* Politician Trades */}
      {Array.isArray(data.politician_trades) && data.politician_trades.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Сделки политиков
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Сенатор</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Партия</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Владелец</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Актив</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Тип сделки</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Сумма</th>
                    <th className="py-2 font-medium text-muted-foreground whitespace-nowrap">Дата сделки</th>
                  </tr>
                </thead>
                <tbody>
                  {data.politician_trades.map((trade, index) => {
                    const isBuy = /buy|покуп/i.test(trade.type);
                    const isSell = /sell|прод/i.test(trade.type);
                    return (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 text-foreground">{trade.senator}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{trade.party}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{trade.owner}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{trade.asset_description}</td>
                        <td className={`py-3 pr-4 font-medium ${isBuy ? "text-chart-1" : isSell ? "text-chart-4" : "text-foreground"}`}>
                          {trade.type}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-foreground">{trade.amount}</td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap">{trade.transaction_date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
