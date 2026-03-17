"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  verseKey: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export default function AudioPlayer({
  verseKey,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Build audio URL from verse key (format: "surah:ayah")
  useEffect(() => {
    const [surah, ayah] = verseKey.split(":");
    const paddedSurah = surah.padStart(3, "0");
    const paddedAyah = ayah.padStart(3, "0");
    // Using Mishari Rashid al-Afasy recitation
    setAudioUrl(
      `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${getAbsoluteVerseNumber(Number(surah), Number(ayah))}.mp3`
    );
  }, [verseKey]);

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      setLoading(true);
      try {
        await audio.play();
        setIsPlaying(true);
        onPlay?.();
      } catch {
        // autoplay blocked or audio not ready
      } finally {
        setLoading(false);
      }
    }
  }, [isPlaying, onPlay, onPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => onTimeUpdate?.(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate, onEnded]);

  return (
    <div className="inline-flex items-center">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="none" />}
      <button
        onClick={handlePlayPause}
        disabled={loading}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : isPlaying ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Helper to calculate absolute verse number for audio API
function getAbsoluteVerseNumber(surah: number, ayah: number): number {
  // Verse counts for surahs 1 and 2
  const verseCounts: Record<number, number> = { 1: 7, 2: 286 };
  let total = 0;
  for (let i = 1; i < surah; i++) {
    total += verseCounts[i] || 0;
  }
  return total + ayah;
}
