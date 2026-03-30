"use client";

import { useState, useCallback, useMemo } from "react";
import type { QuranVerse, QuranWord } from "@/types";
import type { WordTiming } from "@/lib/quranApi";
import Word from "./Word";
import { useLanguage } from "@/lib/LanguageContext";

interface VerseProps {
  verse: QuranVerse;
  onWordClick: (word: QuranWord, verseKey: string) => void;
  isPlaying?: boolean;
  isPaused?: boolean;
  audioTime?: number;
  wordTimings?: WordTiming[];
  onPlay: () => void;
  onPlayFromHere: () => void;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export default function Verse({ verse, onWordClick, isPlaying, isPaused, audioTime, wordTimings, onPlay, onPlayFromHere, onStop, onPause, onResume }: VerseProps) {
  const { t } = useLanguage();
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Remove footnote numbers (superscript tags) from translation
  const rawTranslation = verse.translations?.[0]?.text || "";
  const translation = useMemo(() => {
    return rawTranslation.replace(/<sup[^>]*>.*?<\/sup>/gi, '').trim();
  }, [rawTranslation]);
  
  const words = useMemo(() => verse.words?.filter((w) => w.text_uthmani && w.char_type_name !== "end") || [], [verse.words]);

  // Calculate highlighted word index based on audio time and real timing data
  const highlightedWordIndex = useMemo(() => {
    if (!isPlaying || audioTime === undefined || words.length === 0) {
      return -1;
    }

    // Use real timing data if available
    if (wordTimings && wordTimings.length > 0) {
      for (let i = 0; i < wordTimings.length; i++) {
        const timing = wordTimings[i];
        if (audioTime >= timing.startTime && audioTime < timing.endTime) {
          // position is 1-indexed in API, convert to 0-indexed
          // Also filter out "end" markers which have higher positions
          const wordIndex = timing.position - 1;
          if (wordIndex >= 0 && wordIndex < words.length) {
            return wordIndex;
          }
        }
      }
      // If we're past all timings, highlight the last word
      const lastTiming = wordTimings[wordTimings.length - 1];
      if (audioTime >= lastTiming.endTime) {
        return Math.min(lastTiming.position - 1, words.length - 1);
      }
      return -1;
    }

    // Fallback: estimate based on total audio duration and word count
    // This is less accurate but better than fixed 0.5s per word
    const estimatedTotalDuration = words.length * 0.6; // Average ~0.6s per word
    const progress = audioTime / estimatedTotalDuration;
    const idx = Math.floor(progress * words.length);
    return Math.min(Math.max(idx, 0), words.length - 1);
  }, [isPlaying, audioTime, words.length, wordTimings]);

  const handleWordClick = useCallback(
    (word: QuranWord) => {
      onWordClick(word, verse.verse_key);
      setSavedFeedback(word.text_uthmani);
      setTimeout(() => setSavedFeedback(null), 1500);
    },
    [onWordClick, verse.verse_key]
  );

  return (
    <div className={`rounded-xl border bg-card p-5 transition-colors ${
      isPlaying ? "border-primary shadow-md" : "border-border hover:border-primary/30"
    }`}>
      {/* Verse header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {verse.verse_number}
          </span>

          {/* Play controls */}
          {isPlaying ? (
            <>
              {/* Pause/Resume Button */}
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="inline-flex items-center justify-center rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/80"
                  title="Fortsetzen"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="inline-flex items-center justify-center rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/80"
                  title="Pause"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
              )}
              
              {/* Stop Button */}
              <button
                onClick={onStop}
                className="inline-flex items-center justify-center rounded-lg bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                title="Stoppen"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onPlay}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                title="Diesen Vers abspielen"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button
                onClick={onPlayFromHere}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/5 px-3 py-2 text-xs font-medium text-primary/70 transition-colors hover:bg-primary/15 hover:text-primary"
                title="Ab hier abspielen"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <svg className="h-3 w-3 -ml-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </>
          )}
        </div>
        {savedFeedback && (
          <span className="text-xs text-primary animate-pulse">
            ✓ &ldquo;{savedFeedback}&rdquo; {t("surah.saved")}
          </span>
        )}
      </div>

      {/* Arabic text - word by word */}
      <div className="arabic-text mb-4 text-right text-2xl leading-loose sm:text-3xl">
        {words.map((word, index) => (
          <Word
            key={word.id || index}
            word={word}
            isHighlighted={index === highlightedWordIndex}
            onClick={handleWordClick}
          />
        ))}
      </div>

      {/* Translation */}
      {translation && (
        <p
          className="border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: translation }}
        />
      )}
    </div>
  );
}
