"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { QuranWord, QuranVerse } from "@/types";
import { useAuth } from "@/lib/hooks";
import { saveWord } from "@/lib/hooks";
import Verse from "@/components/Verse";
import { AVAILABLE_SURAHS } from "@/lib/quranApi";
import { useLanguage } from "@/lib/LanguageContext";

interface SurahClientProps {
  verses: QuranVerse[];
  surahId: number;
  surahName: string;
}

function getAbsoluteVerseNumber(surah: number, ayah: number): number {
  const verseCounts: Record<number, number> = { 1: 7, 2: 286 };
  let total = 0;
  for (let i = 1; i < surah; i++) {
    total += verseCounts[i] || 0;
  }
  return total + ayah;
}

function getAudioUrl(verseKey: string): string {
  const [surah, ayah] = verseKey.split(":");
  const absNum = getAbsoluteVerseNumber(Number(surah), Number(ayah));
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${absNum}.mp3`;
}

export default function SurahClient({ verses, surahId, surahName }: SurahClientProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Unified audio state: playingVerseIndex = which verse is playing (-1 = none)
  const [playingVerseIndex, setPlayingVerseIndex] = useState(-1);
  // continuousMode = true means auto-advance to next verse when current ends
  const [continuousMode, setContinuousMode] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);

  const surahInfo = AVAILABLE_SURAHS.find((s) => s.id === surahId);
  const isAnythingPlaying = playingVerseIndex >= 0;

  const handleWordClick = useCallback(
    (word: QuranWord, verseKey: string) => {
      if (!user) return;
      const [, ayah] = verseKey.split(":");
      saveWord({
        userId: user.uid,
        arabicWord: word.text_uthmani,
        translation: word.translation?.text || "",
        surah: surahId,
        ayah: parseInt(ayah, 10),
        status: "new",
        createdAt: Date.now(),
      });
    },
    [user, surahId]
  );

  // Stop all playback
  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    setPlayingVerseIndex(-1);
    setContinuousMode(false);
    setCurrentAudioTime(0);
  }, []);

  // Play a single verse (no auto-advance)
  const playVerse = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setCurrentAudioTime(0);
    setContinuousMode(false);
    setPlayingVerseIndex(index);
  }, []);

  // Play from a specific verse continuously (auto-advance)
  const playFromVerse = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setCurrentAudioTime(0);
    setContinuousMode(true);
    setPlayingVerseIndex(index);
  }, []);

  // Play all from beginning
  const playAll = useCallback(() => {
    if (isAnythingPlaying) {
      stopPlayback();
      return;
    }
    playFromVerse(0);
  }, [isAnythingPlaying, stopPlayback, playFromVerse]);

  // Load and play audio when playingVerseIndex changes
  useEffect(() => {
    if (playingVerseIndex < 0 || playingVerseIndex >= verses.length) {
      if (playingVerseIndex >= verses.length) {
        stopPlayback();
      }
      return;
    }

    const verse = verses[playingVerseIndex];
    const url = getAudioUrl(verse.verse_key);
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = url;
    audio.play().catch(() => stopPlayback());

    const onTimeUpdate = () => setCurrentAudioTime(audio.currentTime);
    const onEnded = () => {
      setCurrentAudioTime(0);
      if (continuousMode) {
        setPlayingVerseIndex((prev) => prev + 1);
      } else {
        setPlayingVerseIndex(-1);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    // Scroll the verse into view
    const el = document.getElementById(`verse-${verse.verse_key}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playingVerseIndex, verses, continuousMode, stopPlayback]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <audio ref={audioRef} preload="none" />

      {/* Surah header with German + Arabic */}
      <div className="mb-8 text-center">
        <h1 className="arabic-text text-4xl text-primary">{surahName}</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          {surahInfo?.name_simple} – {surahInfo?.name_german}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {verses.length} {t("surah.verses")}
        </p>

        {/* Play all / Stop button */}
        <button
          onClick={playAll}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {isAnythingPlaying ? (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              {t("surah.stop")}
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {t("surah.playAll")}
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {verses.map((verse, index) => (
          <div key={verse.verse_key || verse.id} id={`verse-${verse.verse_key}`}>
            <Verse
              verse={verse}
              onWordClick={handleWordClick}
              isPlaying={index === playingVerseIndex}
              audioTime={index === playingVerseIndex ? currentAudioTime : undefined}
              onPlay={() => playVerse(index)}
              onPlayFromHere={() => playFromVerse(index)}
              onStop={stopPlayback}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
