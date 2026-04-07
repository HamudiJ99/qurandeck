"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SurahList from "@/components/SurahList";
import { useLanguage } from "@/lib/LanguageContext";
import { AVAILABLE_SURAHS } from "@/lib/quranApi";

export default function QuranPage() {
  const { t, lang } = useLanguage();
  const [bookmark, setBookmark] = useState<{ surahId: number; verseKey: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookmark");
      if (saved) setBookmark(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const bookmarkSurah = bookmark ? AVAILABLE_SURAHS.find(s => s.id === bookmark.surahId) : null;
  const bookmarkSurahName = bookmarkSurah
    ? lang === "en" ? bookmarkSurah.name_english : bookmarkSurah.name_german
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{t("quran.title")}</h1>
      <p className="mb-8 text-muted-foreground">
        {t("quran.subtitle")}
      </p>

      {/* Continue reading bookmark */}
      {bookmark && bookmarkSurah && (
        <Link
          href={`/quran/${bookmark.surahId}#verse-${bookmark.verseKey}`}
          className="mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary hover:bg-primary/10"
        >
          <svg className="h-5 w-5 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">{t("bookmark.continue")}</p>
            <p className="truncate text-xs text-muted-foreground">
              {bookmarkSurah.name_simple} – {bookmarkSurahName} · {t("notes.verse")} {bookmark.verseKey.split(":")[1]}
            </p>
          </div>
          <svg className="ml-auto h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      <SurahList />
    </div>
  );
}
