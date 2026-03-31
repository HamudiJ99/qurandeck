"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useVocabulary } from "@/lib/hooks";
import VocabularyList from "@/components/VocabularyList";
import { useLanguage } from "@/lib/LanguageContext";

export const dynamic = "force-dynamic";

export default function VocabularyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { words, loading: vocabLoading } = useVocabulary(user?.uid);
  const { t } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{t("vocab.title")}</h1>
      <p className="text-muted-foreground">
        {t("vocab.subtitle")}
      </p>
      <VocabularyList words={words} loading={authLoading || vocabLoading} />
    </div>
  );
}
