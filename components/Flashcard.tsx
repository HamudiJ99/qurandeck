"use client";

import { useState, useCallback } from "react";
import type { VocabularyEntry } from "@/types";
import { updateWordStatus, updateWordStars } from "@/lib/hooks";
import { useLanguage } from "@/lib/LanguageContext";
import { translateToGerman } from "@/lib/wordDictionary";

interface FlashcardProps {
  words: VocabularyEntry[];
}

export default function Flashcard({ words }: FlashcardProps) {
  const { t, lang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  
  // Swipe states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const remaining = words.filter((w) => !completed.has(w.id || ""));
  const currentWord = remaining[currentIndex % remaining.length];

  const handleFlip = useCallback(() => setFlipped((prev) => !prev), []);

  const handleKnow = useCallback(() => {
    if (!currentWord?.id) return;
    // Award star (max 3)
    const currentStars = currentWord.stars || 0;
    const newStars = Math.min(currentStars + 1, 3) as 0 | 1 | 2 | 3;
    updateWordStars(currentWord.id, newStars);
    // Mark as known when reaching 3 stars
    if (newStars === 3) {
      updateWordStatus(currentWord.id, "known");
      setCompleted((prev) => new Set(prev).add(currentWord.id!));
    }
    setFlipped(false);
    if (newStars === 3 && currentIndex >= remaining.length - 1) setCurrentIndex(0);
    else setCurrentIndex((prev) => (prev + 1) % remaining.length);
  }, [currentWord, currentIndex, remaining.length]);

  const handleStillLearning = useCallback(() => {
    if (!currentWord?.id) return;
    updateWordStatus(currentWord.id, "learning");
    // Reset stars when marking as still learning
    if ((currentWord.stars || 0) > 0) {
      updateWordStars(currentWord.id, 0);
    }
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % remaining.length);
  }, [currentWord, remaining.length]);

  const handleSkip = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % remaining.length);
  }, [remaining.length]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;
    
    // Prevent page scroll when swiping horizontally
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
    
    setTouchEnd(currentTouch);
    setSwipeOffset(diff);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }

    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;

    if (isLeftSwipe) {
      // Left swipe = Still Learning (falsch)
      handleStillLearning();
    } else if (isRightSwipe) {
      // Right swipe = Know (richtig)
      handleKnow();
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  if (words.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-lg text-muted-foreground">
          {t("flash.empty")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("flash.emptyHint")}
        </p>
      </div>
    );
  }

  if (remaining.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <p className="text-lg font-semibold text-foreground">
          {t("flash.done")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("flash.learned")} — {completed.size}
        </p>
        <button
          onClick={() => {
            setCompleted(new Set());
            setCurrentIndex(0);
          }}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/80"
        >
          {t("flash.again")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress */}
      <div className="mb-6 text-sm text-muted-foreground">
        {t("flash.card")} {Math.min(currentIndex + 1, remaining.length)} {t("flash.of")} {remaining.length}
        {completed.size > 0 && (
          <span className="ml-2 text-green-600 dark:text-green-400">
            ({completed.size} {t("flash.learned")})
          </span>
        )}
      </div>

      {/* Flashcard */}
      <div
        className="flashcard w-full max-w-md cursor-pointer relative"
        onClick={!isSwiping ? handleFlip : undefined}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
          touchAction: 'pan-y', // Allow vertical scrolling, prevent horizontal
        }}
      >
        {/* Swipe indicators */}
        {isSwiping && Math.abs(swipeOffset) > 20 && (
          <>
            <div
              className="absolute -left-16 top-1/2 -translate-y-1/2 text-4xl transition-opacity z-10"
              style={{ opacity: swipeOffset < -20 ? Math.min(Math.abs(swipeOffset) / 100, 1) : 0 }}
            >
              ❌
            </div>
            <div
              className="absolute -right-16 top-1/2 -translate-y-1/2 text-4xl transition-opacity z-10"
              style={{ opacity: swipeOffset > 20 ? Math.min(swipeOffset / 100, 1) : 0 }}
            >
              ✅
            </div>
          </>
        )}
        
        <div className={`flashcard-inner relative h-64 ${flipped ? "flipped" : ""}`}>
          {/* Front - Arabic */}
          <div className="flashcard-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="absolute top-3 right-3 flex gap-0.5">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    (currentWord.stars || 0) >= star
                      ? "text-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="arabic-text text-4xl">{currentWord.arabicWord}</span>
            <p className="mt-4 text-xs text-muted-foreground">
              {t("flash.tapToSee")}
            </p>
          </div>

          {/* Back - Translation */}
          <div className="flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary bg-card p-6 shadow-lg">
            <div className="absolute top-3 right-3 flex gap-0.5">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    (currentWord.stars || 0) >= star
                      ? "text-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="arabic-text mb-3 text-2xl text-muted-foreground">
              {currentWord.arabicWord}
            </span>
            <p className="text-xl font-semibold text-foreground">
              {lang === "de" ? translateToGerman(currentWord.translation) : currentWord.translation}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("vocab.surah")} {currentWord.surah}, {t("vocab.ayah")} {currentWord.ayah}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleStillLearning}
          className="min-w-[100px] rounded-lg bg-amber-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-600 sm:px-5 sm:py-2.5"
        >
          {t("flash.stillLearning")}
        </button>
        <button
          onClick={handleSkip}
          className="min-w-[80px] rounded-lg bg-muted px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 sm:px-5 sm:py-2.5"
        >
          {t("flash.skip")}
        </button>
        <button
          onClick={handleKnow}
          className="min-w-[100px] rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 sm:px-5 sm:py-2.5"
        >
          {t("flash.know")}
        </button>
      </div>
    </div>
  );
}
