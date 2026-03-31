"use client";

import SurahList from "@/components/SurahList";
import { useLanguage } from "@/lib/LanguageContext";

export default function QuranPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{t("quran.title")}</h1>
      <p className="mb-8 text-muted-foreground">
        {t("quran.subtitle")}
      </p>
      <SurahList />
    </div>
  );
}
