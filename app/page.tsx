import { Brain, Activity, Scale, TrendingUp, TrendingDown } from "lucide-react";
import { TickerSearch } from "@/components/ticker-search";
import { FeatureCard } from "@/components/feature-card";
import { AuthButton } from "@/components/auth-button";

const POPULAR_TICKERS = ["AAPL", "TSLA", "NVDA", "MSFT", "SBER", "GAZP", "LKOH"];

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
            <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Цены
            </a>
            <a
              href="mailto:alikaspagina758@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Напишите по поводу API на почту alikaspagina758@gmail.com"
            >
              API
            </a>
            <a
              href="mailto:alikaspagina758@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Контакты
            </a>
          </nav>
          <AuthButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance">
              Не просто цифры — понятная история за каждой акцией
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              ИИ объясняет, что происходит с компанией, простым языком — как будто аналитик рассказывает лично тебе
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center pt-4">
            <TickerSearch />
          </div>

          {/* Popular Tickers */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Популярные:</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TICKERS.map((ticker) => (
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

        {/* Report Preview Section */}
        <section className="w-full max-w-5xl mx-auto mt-24 px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Вот что вы получите</h2>
            <p className="mt-3 text-muted-foreground text-lg">Пример реального ИИ-отчёта</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl">
            {/* Report header */}
            <div className="flex flex-wrap items-start gap-3 mb-6">
              <div>
                <span className="text-4xl font-bold text-primary font-mono">AAPL</span>
                <p className="text-muted-foreground text-sm mt-0.5">Apple Inc.</p>
              </div>
              <span className="mt-1 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-semibold">
                Интересна для изучения
              </span>
            </div>

            {/* What's happening */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Что происходит
              </h3>
              <p className="text-foreground leading-relaxed">
                Apple последние полгода делает ставку на интеграцию ИИ во все свои продукты — и это начинает
                окупаться. Запуск Apple Intelligence разгоняет суперцикл обновления iPhone: пользователи
                наконец получили реальную причину сменить трёхлетний смартфон. Сервисный сегмент продолжает
                расти быстрее железа и уже формирует более 25% выручки — это меняет всю модель оценки компании.
              </p>
            </div>

            {/* Bull / Bear */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-background border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-500">Бычий сценарий</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Суперцикл iPhone на базе ИИ — 15% рост продаж уже в следующем квартале",
                    "Сервисы (App Store, iCloud, Apple TV+) растут на 18% г/г с маржой 70%+",
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-green-500 shrink-0">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-background border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-500">Медвежий сценарий</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Давление регуляторов на App Store в ЕС угрожает 20% сервисной выручки",
                    "Замедление Китая — рынок, дающий 18% продаж, теряет покупательную силу",
                  ].map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-red-500 shrink-0">−</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What's included */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-5 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">Реальный отчёт содержит:</span>{" "}
                15+ показателей, графики цены и выручки, SWOT-анализ, сделки инсайдеров,
                консенсус аналитиков, финансовые рейтинги и скачиваемый PDF
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t-2 border-primary/30 bg-black/40">
        <div className="container mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Left: brand */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-foreground">StockAI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                ИИ-анализ акций простым языком
              </p>
            </div>

            {/* Center: links */}
            <div className="flex flex-col items-start md:items-center gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Навигация</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { label: "Функции", href: "#features" },
                  { label: "Цены", href: "/pricing" },
                  { label: "API", href: "mailto:alikaspagina758@gmail.com" },
                  { label: "Контакты", href: "mailto:alikaspagina758@gmail.com" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: disclaimer */}
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="text-xs mb-1">© 2026 StockAI</p>
              <p className="text-xs">
                Данный сервис предоставляет информацию в образовательных целях и не является
                индивидуальной инвестиционной рекомендацией.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
