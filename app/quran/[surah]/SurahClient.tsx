"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { QuranWord, QuranVerse } from "@/types";
import { useAuth } from "@/lib/hooks";
import { saveWord } from "@/lib/hooks";
import Verse from "@/components/Verse";
import { AVAILABLE_SURAHS, fetchChapterAudioData, fetchVerseAudioWithTimings, type WordTiming, type VerseAudioInfo } from "@/lib/quranApi";
import { useLanguage } from "@/lib/LanguageContext";

interface SurahClientProps {
  verses: QuranVerse[];
  surahId: number;
  surahName: string;
}

export default function SurahClient({ verses, surahId, surahName }: SurahClientProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const verseInfoRef = useRef<VerseAudioInfo | null>(null);

  // Audio state
  const [playingVerseIndex, setPlayingVerseIndex] = useState(-1);
  const [continuousMode, setContinuousMode] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0); // Time relative to verse start
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);

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
    }
    setPlayingVerseIndex(-1);
    setContinuousMode(false);
    setCurrentAudioTime(0);
    setWordTimings([]);
    verseInfoRef.current = null;
  }, []);

  // Play a single verse (no auto-advance)
  const playVerse = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setCurrentAudioTime(0);
    setWordTimings([]);
    verseInfoRef.current = null;
    setContinuousMode(false);
    setPlayingVerseIndex(index);
  }, []);

  // Play from a specific verse continuously (auto-advance)
  const playFromVerse = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setCurrentAudioTime(0);
    setWordTimings([]);
    verseInfoRef.current = null;
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

  // Preload chapter audio data on mount
  useEffect(() => {
    fetchChapterAudioData(surahId);
  }, [surahId]);

  // Load and play audio when playingVerseIndex changes
  useEffect(() => {
    if (playingVerseIndex < 0 || playingVerseIndex >= verses.length) {
      if (playingVerseIndex >= verses.length) {
        stopPlayback();
      }
      return;
    }

    const verse = verses[playingVerseIndex];
    const audio = audioRef.current;
    if (!audio) return;

    // IMMEDIATELY pause audio to prevent hearing the next verse before seek
    audio.pause();

    let cancelled = false;

    // Fetch verse audio info with word timings
    fetchVerseAudioWithTimings(surahId, verse.verse_key)
      .then((info) => {
        if (cancelled || !info) return;
        
        verseInfoRef.current = info;
        setWordTimings(info.wordTimings);

        // Load chapter audio if not already loaded, then seek to verse start
        const currentSrc = audio.src;
        const targetSrc = info.audioUrl;
        
        const startPlayback = () => {
          if (cancelled || !verseInfoRef.current) return;
          // First seek, then wait for seeked event before playing
          audio.currentTime = verseInfoRef.current.verseStartTime;
          audio.addEventListener("seeked", function onSeeked() {
            audio.removeEventListener("seeked", onSeeked);
            if (!cancelled) {
              audio.play().catch(() => !cancelled && stopPlayback());
            }
          }, { once: true });
        };

        if (!currentSrc.includes(targetSrc.split('/').pop() || '')) {
          audio.src = targetSrc;
          audio.addEventListener("canplay", function onCanPlay() {
            audio.removeEventListener("canplay", onCanPlay);
            startPlayback();
          }, { once: true });
          audio.load();
        } else {
          // Audio already loaded, just seek
          startPlayback();
        }
      })
      .catch(() => {
        if (cancelled) return;
        setWordTimings([]);
        verseInfoRef.current = null;
      });

    // Use requestAnimationFrame for precise timing
    let rafId: number;
    let stoppingAudio = false;
    
    const checkAudioTime = () => {
      if (cancelled || !audio || audio.paused || stoppingAudio) return;
      
      const info = verseInfoRef.current;
      if (!info) return;
      
      const absoluteTime = audio.currentTime;
      const relativeTime = absoluteTime - info.verseStartTime;
      setCurrentAudioTime(Math.max(0, relativeTime));

      // Stop 100ms before verse end to ensure clean cut
      if (absoluteTime >= info.verseEndTime - 0.1) {
        stoppingAudio = true;
        audio.pause();
        
        // Small delay to ensure audio is fully stopped before state change
        setTimeout(() => {
          if (cancelled) return;
          
          if (continuousMode && playingVerseIndex < verses.length - 1) {
            // Move to next verse
            setPlayingVerseIndex((prev) => prev + 1);
          } else {
            // Stop or end of surah
            setCurrentAudioTime(0);
            setWordTimings([]);
            verseInfoRef.current = null;
            setPlayingVerseIndex(-1);
          }
        }, 50);
        return;
      }
      
      rafId = requestAnimationFrame(checkAudioTime);
    };

    const onPlay = () => {
      rafId = requestAnimationFrame(checkAudioTime);
    };

    const onPause = () => {
      if (rafId) cancelAnimationFrame(rafId);
    };

    const onEnded = () => {
      if (rafId) cancelAnimationFrame(rafId);
      setCurrentAudioTime(0);
      setWordTimings([]);
      verseInfoRef.current = null;
      setPlayingVerseIndex(-1);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    // Scroll the verse into view
    const el = document.getElementById(`verse-${verse.verse_key}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playingVerseIndex, verses, continuousMode, stopPlayback, surahId]);

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
              wordTimings={index === playingVerseIndex ? wordTimings : undefined}
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
