"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubscribe() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      await supabase.auth.signInWithOAuth({ provider: "google" });
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ plan: "pro", analyses_count: 0 })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      console.log("[v0] subscribe error:", error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">StockAI</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-md">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold text-foreground">Платный тариф</h1>
          <p className="text-muted-foreground">
            Безлимитные ИИ-анализы акций. Платёжная система пока в разработке — после
            нажатия кнопки доступ открывается сразу, без реального платежа.
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">PRO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {[
                "Безлимитные анализы акций",
                "Приоритетная обработка запросов",
                "Доступ ко всем будущим функциям",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>

            {success ? (
              <div className="text-center space-y-3">
                <p className="text-primary font-semibold">Тариф подключён! Можете возвращаться к анализу.</p>
                <Link href="/" className="text-sm text-primary hover:underline">
                  На главную
                </Link>
              </div>
            ) : (
              <Button className="w-full" onClick={handleSubscribe} disabled={loading}>
                {loading ? "Подключаем..." : "Оплатить"}
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              По вопросам API пишите на{" "}
              <a href="mailto:alikaspagina758@gmail.com" className="text-primary hover:underline">
                alikaspagina758@gmail.com
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
