"use client";

import { useState, useCallback } from "react";
import type { VocabularyEntry } from "@/types";
import { updateWordStatus } from "@/lib/hooks";

interface FlashcardProps {
  words: VocabularyEntry[];
}

export default function Flashcard({ words }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const remaining = words.filter((w) => !completed.has(w.id || ""));
  const currentWord = remaining[currentIndex % remaining.length];

  const handleFlip = useCallback(() => setFlipped((prev) => !prev), []);

  const handleKnow = useCallback(() => {
    if (!currentWord?.id) return;
    updateWordStatus(currentWord.id, "known");
    setCompleted((prev) => new Set(prev).add(currentWord.id!));
    setFlipped(false);
    if (currentIndex >= remaining.length - 1) setCurrentIndex(0);
  }, [currentWord, currentIndex, remaining.length]);

  const handleStillLearning = useCallback(() => {
    if (!currentWord?.id) return;
    updateWordStatus(currentWord.id, "learning");
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % remaining.length);
  }, [currentWord, remaining.length]);

  const handleSkip = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % remaining.length);
  }, [remaining.length]);

  if (words.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-lg text-muted-foreground">
          Noch keine Vokabeln zum Üben vorhanden.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Gehe zum Quran-Reader und klicke auf arabische Wörter, um sie zu speichern.
        </p>
      </div>
    );
  }

  if (remaining.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <p className="text-lg font-semibold text-foreground">
          Alle Karten durchgearbeitet!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Du hast alle {completed.size} Wörter als gelernt markiert.
        </p>
        <button
          onClick={() => {
            setCompleted(new Set());
            setCurrentIndex(0);
          }}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/80"
        >
          Nochmal üben
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress */}
      <div className="mb-6 text-sm text-muted-foreground">
        Karte {Math.min(currentIndex + 1, remaining.length)} von {remaining.length}
        {completed.size > 0 && (
          <span className="ml-2 text-green-600 dark:text-green-400">
            ({completed.size} gelernt)
          </span>
        )}
      </div>

      {/* Flashcard */}
      <div
        className="flashcard w-full max-w-md cursor-pointer"
        onClick={handleFlip}
      >
        <div className={`flashcard-inner relative h-64 ${flipped ? "flipped" : ""}`}>
          {/* Front - Arabic */}
          <div className="flashcard-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-lg">
            <span className="arabic-text text-4xl">{currentWord.arabicWord}</span>
            <p className="mt-4 text-xs text-muted-foreground">
              Tippe, um die Übersetzung zu sehen
            </p>
          </div>

          {/* Back - Translation */}
          <div className="flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary bg-card p-6 shadow-lg">
            <span className="arabic-text mb-3 text-2xl text-muted-foreground">
              {currentWord.arabicWord}
            </span>
            {currentWord.translationDe ? (
              <>
                <p
                  className="text-center text-lg font-semibold text-foreground"
                  dangerouslySetInnerHTML={{ __html: currentWord.translationDe }}
                />
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium">EN</span>{" "}
                  {currentWord.translation}
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold text-foreground">
                {currentWord.translation}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Sure {currentWord.surah}, Ayah {currentWord.ayah}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleStillLearning}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
        >
          Noch lernen
        </button>
        <button
          onClick={handleSkip}
          className="rounded-lg bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
        >
          Überspringen
        </button>
        <button
          onClick={handleKnow}
          className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          Kann ich
        </button>
      </div>
    </div>
  );
}
