"use client";

import { useAuth, useVocabulary } from "@/lib/hooks";
import VocabularyList from "@/components/VocabularyList";
import { useLanguage } from "@/lib/LanguageContext";

export const dynamic = "force-dynamic";

export default function VocabularyPage() {
  const { user, loading: authLoading } = useAuth();
  const { words, loading: vocabLoading } = useVocabulary(user?.uid);
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{t("vocab.title")}</h1>
      <p className="mb-8 text-muted-foreground">
        {t("vocab.subtitle")}
      </p>
      <VocabularyList words={words} loading={authLoading || vocabLoading} />
    </div>
  );
}
