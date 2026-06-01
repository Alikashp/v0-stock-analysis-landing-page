import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReportContent } from "@/components/report-content";

interface ReportPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { ticker } = await params;

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
              Новый анализ
            </Link>
          </Button>
        </div>
      </header>

      {/* Report Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ReportContent ticker={ticker} />
        </div>
      </main>
    </div>
  );
}
