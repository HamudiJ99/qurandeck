"use client";

import { useState, useEffect, useRef } from "react";
import type { VocabularyEntry } from "@/types";
import { updateWordStatus, removeWord } from "@/lib/hooks";
import { useLanguage } from "@/lib/LanguageContext";
import { translateToGerman } from "@/lib/wordDictionary";

interface VocabularyListProps {
  words: VocabularyEntry[];
  loading: boolean;
}

export default function VocabularyList({ words, loading }: VocabularyListProps) {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState<"all" | "new" | "learning" | "known">("all");
  const [starFilter, setStarFilter] = useState<0 | 1 | 2 | 3 | "all">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    if (showFilterMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilterMenu]);

  const filteredByStatus = filter === "all" ? words : words.filter((w) => w.status === filter);
  const filtered = starFilter === "all" 
    ? filteredByStatus 
    : filteredByStatus.filter((w) => (w.stars || 0) === starFilter);

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    learning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    known: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  const statusLabels: Record<string, string> = {
    all: t("vocab.all"),
    new: t("vocab.new"),
    learning: t("vocab.learning"),
    known: t("vocab.known"),
  };

  const getFilterLabel = () => {
    if (starFilter === "all") return t("vocab.all");
    return `${starFilter}★`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs and star filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Status filter buttons */}
        {(["all", "new", "learning", "known"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {statusLabels[f]} {f === "all" ? `(${words.length})` : `(${words.filter((w) => w.status === f).length})`}
          </button>
        ))}

        {/* Star filter dropdown */}
        <div ref={filterRef} className="relative ml-auto">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-muted"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{getFilterLabel()}</span>
            {starFilter !== "all" && (
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            )}
          </button>

          {/* Filter dropdown menu */}
          {showFilterMenu && (
            <div className="absolute right-0 top-12 z-10 w-40 rounded-lg border border-border bg-card shadow-lg">
              <div className="p-2">
                {[
                  { value: "all", label: t("vocab.all") },
                  { value: 0, label: "0★" },
                  { value: 1, label: "1★" },
                  { value: 2, label: "2★" },
                  { value: 3, label: "3★" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStarFilter(option.value as typeof starFilter);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      starFilter === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">
            {words.length === 0 ? t("vocab.empty") : t("vocab.noFilter")}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((word) => (
            <div
              key={word.id}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="arabic-text text-2xl">{word.arabicWord}</span>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          (word.stars || 0) >= star
                            ? "text-yellow-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[word.status]}`}>
                  {statusLabels[word.status]}
                </span>
              </div>
              <p className="mb-1 text-sm text-foreground">
                {lang === "de" ? translateToGerman(word.translation) : word.translation}
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                {t("vocab.surah")} {word.surah}, {t("vocab.ayah")} {word.ayah}
              </p>
              <div className="flex gap-2">
                {word.status !== "learning" && (
                  <button
                    onClick={() => word.id && updateWordStatus(word.id, "learning")}
                    className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800"
                  >
                    {t("vocab.learning")}
                  </button>
                )}
                {word.status !== "known" && (
                  <button
                    onClick={() => word.id && updateWordStatus(word.id, "known")}
                    className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                  >
                    {t("vocab.known")}
                  </button>
                )}
                <button
                  onClick={() => word.id && removeWord(word.id)}
                  className="ml-auto rounded-md bg-red-100 px-2 py-1 text-xs text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                >
                  {t("vocab.remove")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
