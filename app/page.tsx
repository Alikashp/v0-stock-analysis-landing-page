import { Brain, Activity, Scale } from "lucide-react";
import { TickerSearch } from "@/components/ticker-search";
import { FeatureCard } from "@/components/feature-card";
import { AuthButton } from "@/components/auth-button";

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
              Функции
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Цены
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              API
            </a>
          </nav>
          <AuthButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance">
              ИИ-анализ акций
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Получайте профессиональные аналитические отчёты за секунды
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center pt-4">
            <TickerSearch />
          </div>

          {/* Popular Tickers */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Популярные:</span>
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
              title="ИИ-анализ"
              description="Продвинутые модели машинного обучения анализируют финансовые данные, новостной фон и рыночные тренды для формирования комплексных выводов."
            />
            <FeatureCard
              icon={Activity}
              title="Данные в реальном времени"
              description="Доступ к актуальным рыночным данным, динамике цен и объёмам торгов с профессиональной точностью и скоростью."
            />
            <FeatureCard
              icon={Scale}
              title="Бычий и медвежий сценарии"
              description="Получайте сбалансированные перспективы с детальными бычьим и медвежьим сценариями для принятия обоснованных инвестиционных решений."
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
              &copy; {new Date().getFullYear()} StockAI. Все права защищены.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Конфиденциальность
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Условия
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
