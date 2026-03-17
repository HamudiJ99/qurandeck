"use client";

import { useAuth, useVocabulary } from "@/lib/hooks";
import Flashcard from "@/components/Flashcard";
import { useLanguage } from "@/lib/LanguageContext";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  const { user, loading: authLoading } = useAuth();
  const { words, loading: vocabLoading } = useVocabulary(user?.uid);
  const { t } = useLanguage();

  const loading = authLoading || vocabLoading;

  // Only practice words that are "new" or "learning"
  const practiceWords = words.filter((w) => w.status === "new" || w.status === "learning");

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
    </div>
  );
}
