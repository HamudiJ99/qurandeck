"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { AVAILABLE_SURAHS } from "@/lib/quranApi";

export default function HomePage() {
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
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      {/* Hero */}
      <h1 className="arabic-text mb-4 text-5xl text-primary">بِسْمِ ٱللَّهِ</h1>
      <h2 className="mb-2 text-3xl font-bold text-foreground">QuranDeck</h2>
      <p className="mb-10 text-lg text-muted-foreground">
        {t("home.subtitle")}
      </p>

      {/* Quick links */}
      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/quran"
          className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {t("home.startReading")}
        </Link>
        <Link
          href="/practice"
          className="rounded-xl border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:border-primary"
        >
          {t("home.practiceCards")}
        </Link>
      </div>

      {/* Bookmark */}
      {bookmark && bookmarkSurah && (
        <div className="mb-12 flex justify-center">
          <Link
            href={`/quran/${bookmark.surahId}#verse-${bookmark.verseKey}`}
            className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 transition-colors hover:border-primary hover:bg-primary/10"
          >
            <svg className="h-5 w-5 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-primary">{t("bookmark.continue")}</p>
              <p className="truncate text-xs text-muted-foreground">
                {bookmarkSurah.name_simple} – {bookmarkSurahName} · {t("notes.verse")} {bookmark.verseKey.split(":")[1]}
              </p>
            </div>
            <svg className="ml-auto h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Features */}
      <div className="mt-16 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="mb-1 font-semibold text-foreground">{t("home.wordByWord")}</h4>
          <p className="text-sm text-muted-foreground">
            {t("home.wordByWordDesc")}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="mb-1 font-semibold text-foreground">{t("home.audioPlayback")}</h4>
          <p className="text-sm text-muted-foreground">
            {t("home.audioPlaybackDesc")}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2 lg:col-span-1">
          <h4 className="mb-1 font-semibold text-foreground">{t("home.flashcards")}</h4>
          <p className="text-sm text-muted-foreground">
            {t("home.flashcardsDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
