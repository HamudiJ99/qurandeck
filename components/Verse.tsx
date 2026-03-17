"use client";

import { useState, useCallback, useMemo } from "react";
import type { QuranVerse, QuranWord } from "@/types";
import Word from "./Word";

interface VerseProps {
  verse: QuranVerse;
  onWordClick: (word: QuranWord, verseKey: string) => void;
  isPlaying?: boolean;
  audioTime?: number;
  onPlay: () => void;
  onPlayFromHere: () => void;
  onStop: () => void;
}

export default function Verse({ verse, onWordClick, isPlaying, audioTime, onPlay, onPlayFromHere, onStop }: VerseProps) {
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const germanTranslation = verse.translations?.[0]?.text || "";
  const words = useMemo(() => verse.words?.filter((w) => w.text_uthmani) || [], [verse.words]);

  // Calculate highlighted word index based on audio time (works for all playback modes)
  const highlightedWordIndex = useMemo(() => {
    if (isPlaying && audioTime !== undefined && words.length > 0) {
      const estimatedWordDuration = 0.5;
      const idx = Math.floor(audioTime / estimatedWordDuration);
      return Math.min(idx, words.length - 1);
    }
    return -1;
  }, [isPlaying, audioTime, words.length]);

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
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {verse.verse_number}
          </span>

          {/* Play single verse */}
          {isPlaying ? (
            <button
              onClick={onStop}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              title="Stoppen"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Stopp
            </button>
          ) : (
            <>
              <button
                onClick={onPlay}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                title="Diesen Vers abspielen"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button
                onClick={onPlayFromHere}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary/70 transition-colors hover:bg-primary/15 hover:text-primary"
                title="Ab hier abspielen"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
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
            ✓ &ldquo;{savedFeedback}&rdquo; gespeichert
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

      {/* German translation */}
      {germanTranslation && (
        <p
          className="border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: germanTranslation }}
        />
      )}
    </div>
  );
}
