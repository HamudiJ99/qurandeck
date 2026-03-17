"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { QuranWord, QuranVerse } from "@/types";
import { useAuth } from "@/lib/hooks";
import { saveWord } from "@/lib/hooks";
import Verse from "@/components/Verse";
import { AVAILABLE_SURAHS } from "@/lib/quranApi";

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

export default function SurahClient({ verses, surahId, surahName }: SurahClientProps) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(-1);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);

  const surahInfo = AVAILABLE_SURAHS.find((s) => s.id === surahId);

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

  // Play all verses sequentially
  const playAll = useCallback(() => {
    if (playingAll) {
      // Stop
      audioRef.current?.pause();
      setPlayingAll(false);
      setCurrentVerseIndex(-1);
      setCurrentAudioTime(0);
      return;
    }
    setPlayingAll(true);
    setCurrentVerseIndex(0);
  }, [playingAll]);

  // Load and play audio for current verse
  useEffect(() => {
    if (!playingAll || currentVerseIndex < 0 || currentVerseIndex >= verses.length) {
      if (currentVerseIndex >= verses.length) {
        setPlayingAll(false);
        setCurrentVerseIndex(-1);
        setCurrentAudioTime(0);
      }
      return;
    }

    const verse = verses[currentVerseIndex];
    const [surah, ayah] = verse.verse_key.split(":");
    const absNum = getAbsoluteVerseNumber(Number(surah), Number(ayah));
    const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${absNum}.mp3`;

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = url;
    audio.play().catch(() => {
      setPlayingAll(false);
      setCurrentVerseIndex(-1);
    });

    const onTimeUpdate = () => setCurrentAudioTime(audio.currentTime);
    const onEnded = () => {
      setCurrentAudioTime(0);
      setCurrentVerseIndex((prev) => prev + 1);
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
  }, [playingAll, currentVerseIndex, verses]);

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
          {verses.length} Verse
        </p>

        {/* Play all / Stop button */}
        <button
          onClick={playAll}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {playingAll ? (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Stoppen
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Gesamte Sure abspielen
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
              isCurrentlyPlaying={playingAll && index === currentVerseIndex}
              globalAudioTime={playingAll && index === currentVerseIndex ? currentAudioTime : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
