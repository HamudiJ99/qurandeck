"use client";

import { useState } from "react";
import { useAuth, useVocabulary, resetAllKnownWords } from "@/lib/hooks";
import Flashcard from "@/components/Flashcard";
import { useLanguage } from "@/lib/LanguageContext";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  const { user, loading: authLoading } = useAuth();
  const { words, loading: vocabLoading } = useVocabulary(user?.uid);
  const { t } = useLanguage();
  const [resetting, setResetting] = useState(false);

  const loading = authLoading || vocabLoading;

  // Only practice words that are "new" or "learning"
  const practiceWords = words.filter((w) => w.status === "new" || w.status === "learning");
  const knownWordsCount = words.filter((w) => w.status === "known").length;

  const handleResetKnown = async () => {
    if (!user?.uid || resetting) return;
    setResetting(true);
    try {
      await resetAllKnownWords(user.uid);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
        {t("practice.title")}
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
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

      {!loading && knownWordsCount > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleResetKnown}
            disabled={resetting}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
          >
            {resetting ? t("practice.resetting") : t("practice.resetKnown")} ({knownWordsCount})
          </button>
        </div>
      )}
    </div>
  );
}
