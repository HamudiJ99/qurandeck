"use client";

import Link from "next/link";
import { AVAILABLE_SURAHS } from "@/lib/quranApi";
import { useLanguage } from "@/lib/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      {/* Hero */}
      <h1 className="arabic-text mb-4 text-5xl text-primary">بِسْمِ ٱللَّهِ</h1>
      <h2 className="mb-2 text-3xl font-bold text-foreground">QuranDeck</h2>
      <p className="mb-10 text-lg text-muted-foreground">
        {t("home.subtitle")}
      </p>

      {/* Quick links */}
      <div className="mb-12 flex flex-wrap justify-center gap-4">
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

      {/* Surah cards */}
      <h3 className="mb-4 text-lg font-semibold text-foreground">{t("home.availableSurahs")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {AVAILABLE_SURAHS.map((surah) => (
          <Link
            key={surah.id}
            href={`/quran/${surah.id}`}
            className="group rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg"
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
              <h4 className="text-lg font-semibold text-card-foreground">
                {surah.name_simple} – {surah.name_german}
              </h4>
              <p className="text-sm text-muted-foreground">{surah.verses_count} {t("home.verses")}</p>
            </div>
          </Link>
        ))}
      </div>

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
