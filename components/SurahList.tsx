"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AVAILABLE_SURAHS } from "@/lib/quranApi";
import { useLanguage } from "@/lib/LanguageContext";

export default function SurahList() {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AVAILABLE_SURAHS;
    return AVAILABLE_SURAHS.filter((s) => {
      const num = String(s.id);
      const simple = s.name_simple.toLowerCase();
      const german = s.name_german.toLowerCase();
      const english = s.name_english.toLowerCase();
      const arabic = s.name_arabic;
      return (
        num.startsWith(q) ||
        simple.includes(q) ||
        german.includes(q) ||
        english.includes(q) ||
        arabic.includes(query.trim())
      );
    });
  }, [query]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7 7 0 1 0 4.5 4.5a7 7 0 0 0 9.15 9.15z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "de" ? "Sure suchen (Name, Nummer, Arabisch)…" : "Search surah (name, number, Arabic)…"}
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((surah) => {
          const translatedName = lang === "en" ? surah.name_english : surah.name_german;
          return (
            <Link
              key={surah.id}
              href={`/quran/${surah.id}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                {surah.id}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-card-foreground group-hover:text-primary">
                  {surah.name_simple}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {translatedName}
                </p>
              </div>
              <span className="ml-auto shrink-0 arabic-text text-base text-muted-foreground group-hover:text-primary">
                {surah.name_arabic}
              </span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {lang === "de" ? "Keine Sure gefunden." : "No surah found."}
        </p>
      )}
    </div>
  );
}
