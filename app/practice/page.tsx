"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useVocabulary, resetAllKnownWords } from "@/lib/hooks";
import Flashcard from "@/components/Flashcard";
import { useLanguage } from "@/lib/LanguageContext";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  const { user, loading: authLoading } = useAuth();
  const { words, loading: vocabLoading } = useVocabulary(user?.uid);
  const { t } = useLanguage();
  const [resetting, setResetting] = useState(false);
  const [starFilter, setStarFilter] = useState<0 | 1 | 2 | "all">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<HTMLDivElement>(null);

  const loading = authLoading || vocabLoading;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (resetRef.current && !resetRef.current.contains(event.target as Node)) {
        setShowResetDialog(false);
      }
    };

    if (showFilterMenu || showResetDialog) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilterMenu, showResetDialog]);

  // Only practice words that are "new" or "learning"
  const basePracticeWords = words.filter((w) => w.status === "new" || w.status === "learning");
  
  // Apply star filter
  const practiceWords = starFilter === "all" 
    ? basePracticeWords
    : basePracticeWords.filter((w) => (w.stars || 0) === starFilter);
  
  const knownWordsCount = words.filter((w) => w.status === "known").length;

  const handleResetKnown = async () => {
    if (!user?.uid || resetting) return;
    setResetting(true);
    try {
      await resetAllKnownWords(user.uid);
      setShowResetDialog(false);
    } finally {
      setResetting(false);
    }
  };

  const getFilterLabel = () => {
    if (starFilter === "all") return t("vocab.all");
    return `${starFilter}★`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Filter and Reset buttons - top right corner */}
      {!loading && basePracticeWords.length > 0 && (
        <div className="mb-4 flex justify-end gap-2">
          {/* Filter button */}
          <div ref={filterRef} className="relative">
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

          {/* Reset button */}
          {knownWordsCount > 0 && (
            <div ref={resetRef} className="relative">
              <button
                onClick={() => setShowResetDialog(!showResetDialog)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
                title={t("practice.resetKnown")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Reset confirmation dialog */}
              {showResetDialog && (
                <div className="absolute right-0 top-12 z-10 w-64 rounded-lg border border-border bg-card p-4 shadow-lg">
                  <h3 className="mb-2 font-semibold text-foreground">{t("practice.confirmReset")}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {t("practice.resetWarning")} ({knownWordsCount})
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResetDialog(false)}
                      className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {t("practice.cancel")}
                    </button>
                    <button
                      onClick={handleResetKnown}
                      disabled={resetting}
                      className="flex-1 rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                    >
                      {resetting ? t("practice.resetting") : t("practice.confirm")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
        {t("practice.title")}
      </h1>
      <p className="mb-6 text-center text-muted-foreground">
        {t("practice.subtitle")}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <Flashcard words={practiceWords} />
      )}

      {!loading && practiceWords.length > 0 && (
        <div className="mt-8 text-center text-xs text-muted-foreground">
          {words.filter((w) => w.status === "known").length} {t("flash.learned")}
          &middot; {practiceWords.length} {t("nav.practice")}
        </div>
      )}
    </div>
  );
}
