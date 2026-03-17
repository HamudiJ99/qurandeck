"use client";

import { useState, useCallback, useMemo } from "react";
import type { QuranVerse, QuranWord } from "@/types";
import Word from "./Word";
import AudioPlayer from "./AudioPlayer";

interface VerseProps {
  verse: QuranVerse;
  onWordClick: (word: QuranWord, verseKey: string) => void;
  isCurrentlyPlaying?: boolean;
  globalAudioTime?: number;
}

export default function Verse({ verse, onWordClick, isCurrentlyPlaying, globalAudioTime }: VerseProps) {
  const [localHighlightIndex, setLocalHighlightIndex] = useState<number>(-1);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const germanTranslation = verse.translations?.[0]?.text || "";
  const words = useMemo(() => verse.words?.filter((w) => w.text_uthmani) || [], [verse.words]);

  // Calculate highlighted word index based on audio time
  const highlightedWordIndex = useMemo(() => {
    // If being played from the global "play all" button
    if (isCurrentlyPlaying && globalAudioTime !== undefined && words.length > 0) {
      const estimatedWordDuration = 0.5;
      const idx = Math.floor(globalAudioTime / estimatedWordDuration);
      return Math.min(idx, words.length - 1);
    }
    // If played locally via per-verse button
    return localHighlightIndex;
  }, [isCurrentlyPlaying, globalAudioTime, localHighlightIndex, words.length]);

  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      if (words.length === 0) return;
      const estimatedWordDuration = 0.5;
      const wordIndex = Math.floor(currentTime / estimatedWordDuration);
      setLocalHighlightIndex(Math.min(wordIndex, words.length - 1));
    },
    [words.length]
  );

  const handleEnded = useCallback(() => setLocalHighlightIndex(-1), []);
  const handlePause = useCallback(() => setLocalHighlightIndex(-1), []);

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
      isCurrentlyPlaying ? "border-primary shadow-md" : "border-border hover:border-primary/30"
    }`}>
      {/* Verse header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {verse.verse_number}
          </span>
          {!isCurrentlyPlaying && (
            <AudioPlayer
              verseKey={verse.verse_key}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onPause={handlePause}
            />
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
