"use client";

import Link from "next/link";
import { AVAILABLE_SURAHS } from "@/lib/quranApi";
import { useLanguage } from "@/lib/LanguageContext";

export default function SurahList() {
  const { t, lang } = useLanguage();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {AVAILABLE_SURAHS.map((surah) => {
        const translatedName = lang === "en" ? surah.name_english : surah.name_german;
        return (
          <Link
            key={surah.id}
            href={`/quran/${surah.id}`}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {surah.id}
              </div>
              <span className="arabic-text text-2xl text-muted-foreground group-hover:text-primary">
                {surah.name_arabic}
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-card-foreground">
                {surah.name_simple} – {translatedName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {surah.verses_count} {t("home.verses")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
