"use client";

import { useState } from "react";
import type { VocabularyEntry } from "@/types";
import { updateWordStatus, removeWord } from "@/lib/hooks";

interface VocabularyListProps {
  words: VocabularyEntry[];
  loading: boolean;
}

export default function VocabularyList({ words, loading }: VocabularyListProps) {
  const [filter, setFilter] = useState<"all" | "new" | "learning" | "known">("all");

  const filtered = filter === "all" ? words : words.filter((w) => w.status === filter);

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    learning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    known: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  const statusLabels: Record<string, string> = {
    all: "Alle",
    new: "Neu",
    learning: "Lernend",
    known: "Gelernt",
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
      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {(["all", "new", "learning", "known"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {statusLabels[f]} {f === "all" ? `(${words.length})` : `(${words.filter((w) => w.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">
            {words.length === 0
              ? "Noch keine Vokabeln gespeichert. Klicke auf arabische Wörter beim Quran-Lesen, um sie zu speichern."
              : "Keine Wörter mit diesem Filter."}
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
                <span className="arabic-text text-2xl">{word.arabicWord}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[word.status]}`}>
                  {statusLabels[word.status]}
                </span>
              </div>
              <p className="mb-1 text-sm text-foreground">
                {word.translationDe ? (
                  <span dangerouslySetInnerHTML={{ __html: word.translationDe }} />
                ) : (
                  word.translation
                )}
              </p>
              {word.translationDe && word.translation && (
                <p className="mb-1 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium">EN</span>{" "}
                  {word.translation}
                </p>
              )}
              <p className="mb-3 text-xs text-muted-foreground">
                Sure {word.surah}, Ayah {word.ayah}
              </p>
              <div className="flex gap-2">
                {word.status !== "learning" && (
                  <button
                    onClick={() => word.id && updateWordStatus(word.id, "learning")}
                    className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800"
                  >
                    Lernend
                  </button>
                )}
                {word.status !== "known" && (
                  <button
                    onClick={() => word.id && updateWordStatus(word.id, "known")}
                    className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                  >
                    Gelernt
                  </button>
                )}
                <button
                  onClick={() => word.id && removeWord(word.id)}
                  className="ml-auto rounded-md bg-red-100 px-2 py-1 text-xs text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                >
                  Entfernen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
