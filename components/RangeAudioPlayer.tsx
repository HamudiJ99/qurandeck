"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { fetchChapterAudioData, fetchVerseAudioWithTimings, type VerseAudioInfo, type WordTiming } from "@/lib/quranApi";

interface RangeAudioPlayerProps {
  surahId: number;
  totalVerses: number;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onPlayingChange?: (verseNumber: number | null, audioTime: number, wordTimings: WordTiming[]) => void;
}

export default function RangeAudioPlayer({
  surahId,
  totalVerses,
  isOpen,
  onClose,
  onOpen,
  onPlayingChange,
}: RangeAudioPlayerProps) {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const verseInfoRef = useRef<VerseAudioInfo | null>(null);

  // Range selection
  const [fromVerse, setFromVerse] = useState(1);
  const [toVerse, setToVerse] = useState(Math.min(10, totalVerses));

  // Repeat settings
  const [sectionRepeat, setSectionRepeat] = useState(0);
  const [verseRepeat, setVerseRepeat] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [currentVerseLoop, setCurrentVerseLoop] = useState(0);
  const [currentSectionLoop, setCurrentSectionLoop] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentWordTimings, setCurrentWordTimings] = useState<WordTiming[]>([]);

  // Only reset settings when modal opens AND not playing/paused
  useEffect(() => {
    if (isOpen && !isPlaying && !isPaused) {
      setFromVerse(1);
      setToVerse(Math.min(10, totalVerses));
      setSectionRepeat(0);
      setVerseRepeat(0);
    }
  }, [isOpen, totalVerses, isPlaying, isPaused]);

  // Preload audio data
  useEffect(() => {
    fetchChapterAudioData(surahId);
  }, [surahId]);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerse(fromVerse);
    setCurrentVerseLoop(0);
    setCurrentSectionLoop(0);
    setCurrentWordTimings([]);
    verseInfoRef.current = null;
    onPlayingChange?.(null, 0, []);
  }, [fromVerse, onPlayingChange]);

  const pausePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setIsPaused(true);
    }
  }, []);

  const resumePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio && isPaused) {
      audio.play().catch(() => {});
      setIsPaused(false);
    }
  }, [isPaused]);

  const playVerse = useCallback(async (verseNum: number, seekTime?: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setLoading(true);
    const verseKey = `${surahId}:${verseNum}`;
    
    try {
      const info = await fetchVerseAudioWithTimings(surahId, verseKey);
      if (!info) {
        setLoading(false);
        return;
      }

      verseInfoRef.current = info;
      setCurrentWordTimings(info.wordTimings);

      const currentSrc = audio.src;
      const targetSrc = info.audioUrl;

      const startPlayback = () => {
        if (!verseInfoRef.current) return;
        const startTime = seekTime !== undefined ? seekTime : verseInfoRef.current.verseStartTime;
        audio.currentTime = startTime;
        audio.addEventListener("seeked", function onSeeked() {
          audio.removeEventListener("seeked", onSeeked);
          setLoading(false);
          audio.play().catch(() => {
            setIsPlaying(false);
          });
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
        startPlayback();
      }
    } catch {
      setLoading(false);
    }
  }, [surahId]);

  const handlePlay = useCallback(() => {
    if (isPaused) {
      resumePlayback();
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentVerse(fromVerse);
      setCurrentVerseLoop(0);
      setCurrentSectionLoop(0);
      playVerse(fromVerse);
    }
  }, [isPaused, resumePlayback, fromVerse, playVerse]);

  // Monitor audio time and handle transitions + word highlighting
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const audio = audioRef.current;
    if (!audio) return;

    let rafId: number;
    let transitioning = false;

    const checkAudioTime = () => {
      if (!audio || audio.paused || transitioning) return;

      const info = verseInfoRef.current;
      if (!info) return;

      const absoluteTime = audio.currentTime;
      const relativeTime = absoluteTime - info.verseStartTime;

      // Update word highlighting
      onPlayingChange?.(currentVerse, Math.max(0, relativeTime), currentWordTimings);

      // Check if verse ended
      if (absoluteTime >= info.verseEndTime - 0.1) {
        transitioning = true;
        audio.pause();

        setTimeout(() => {
          if (!isPlaying) return;

          // Check if we need to repeat this verse
          if (currentVerseLoop < verseRepeat) {
            setCurrentVerseLoop(prev => prev + 1);
            playVerse(currentVerse);
            transitioning = false;
            return;
          }

          // Move to next verse
          setCurrentVerseLoop(0);
          const nextVerse = currentVerse + 1;

          if (nextVerse <= toVerse) {
            setCurrentVerse(nextVerse);
            playVerse(nextVerse);
            transitioning = false;
          } else {
            if (currentSectionLoop < sectionRepeat) {
              setCurrentSectionLoop(prev => prev + 1);
              setCurrentVerse(fromVerse);
              playVerse(fromVerse);
              transitioning = false;
            } else {
              stopPlayback();
            }
          }
        }, 100);
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

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    if (!audio.paused) {
      rafId = requestAnimationFrame(checkAudioTime);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [isPlaying, isPaused, currentVerse, currentVerseLoop, verseRepeat, currentSectionLoop, sectionRepeat, toVerse, fromVerse, playVerse, stopPlayback, onPlayingChange, currentWordTimings]);

  // Handle fromVerse/toVerse validation
  useEffect(() => {
    if (fromVerse > toVerse) {
      setToVerse(fromVerse);
    }
  }, [fromVerse, toVerse]);

  // Scroll to current verse when playing
  useEffect(() => {
    if (isPlaying && currentVerse && !isPaused) {
      const el = document.getElementById(`verse-${surahId}:${currentVerse}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isPlaying, currentVerse, surahId, isPaused]);

  const isActive = isPlaying || isPaused;

  return (
    <>
      {/* Audio element - always rendered */}
      <audio ref={audioRef} preload="none" />

      {/* Mini Player - shown when modal is closed but audio is playing/paused */}
      {!isOpen && isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:rounded-full sm:border sm:px-4 sm:py-2">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 sm:gap-4">
            {/* Info */}
            <div 
              onClick={onOpen}
              className="flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-8 sm:w-8">
                {isPaused ? (
                  <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 animate-pulse sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">{surahId}:{currentVerse}</p>
                <p className="text-xs text-muted-foreground">
                  {t("range.from")} {fromVerse} {t("range.to").toLowerCase()} {toVerse}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={isPaused ? resumePlayback : pausePlayback}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/80"
              >
                {isPaused ? (
                  <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                )}
              </button>

              {/* Stop */}
              <button
                onClick={stopPlayback}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card px-4 pb-6 pt-4 shadow-2xl animate-in slide-in-from-bottom duration-300 sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-h-[90vh] sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:px-6 sm:pb-8 sm:pt-6">
            {/* Drag handle for mobile */}
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-muted sm:hidden" />
            
            {/* Header */}
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">{t("range.title")}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:p-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Verse Range Selection */}
            <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground sm:mb-2 sm:text-sm">
                  {t("range.from")}
                </label>
                <select
                  value={fromVerse}
                  onChange={(e) => setFromVerse(Number(e.target.value))}
                  disabled={isActive}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 sm:py-2.5"
                >
                  {Array.from({ length: totalVerses }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground sm:mb-2 sm:text-sm">
                  {t("range.to")}
                </label>
                <select
                  value={toVerse}
                  onChange={(e) => setToVerse(Number(e.target.value))}
                  disabled={isActive}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 sm:py-2.5"
                >
                  {Array.from({ length: totalVerses }, (_, i) => i + 1)
                    .filter((v) => v >= fromVerse)
                    .map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Repeat Settings */}
            <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
              {/* Section Repeat */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground sm:text-sm">
                  {t("range.sectionRepeat")}
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setSectionRepeat(Math.max(0, sectionRepeat - 1))}
                    disabled={isActive || sectionRepeat === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 sm:h-8 sm:w-8"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-foreground sm:w-8">{sectionRepeat}</span>
                  <button
                    onClick={() => setSectionRepeat(sectionRepeat + 1)}
                    disabled={isActive}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 sm:h-8 sm:w-8"
                  >
                    +
                  </button>
                  <span className="text-xs text-muted-foreground sm:text-sm">{t("range.times")}</span>
                </div>
              </div>

              {/* Verse Repeat */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground sm:text-sm">
                  {t("range.verseRepeat")}
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setVerseRepeat(Math.max(0, verseRepeat - 1))}
                    disabled={isActive || verseRepeat === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 sm:h-8 sm:w-8"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-foreground sm:w-8">{verseRepeat}</span>
                  <button
                    onClick={() => setVerseRepeat(verseRepeat + 1)}
                    disabled={isActive}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 sm:h-8 sm:w-8"
                  >
                    +
                  </button>
                  <span className="text-xs text-muted-foreground sm:text-sm">{t("range.times")}</span>
                </div>
              </div>
            </div>

            {/* Current Status (when playing/paused) */}
            {isActive && (
              <div className="mb-4 rounded-lg bg-primary/10 p-3 text-center sm:mb-6 sm:p-4">
                <p className="text-xs text-muted-foreground sm:text-sm">{t("range.currentVerse")}</p>
                <p className="text-xl font-bold text-primary sm:text-2xl">{surahId}:{currentVerse}</p>
                {isPaused && <p className="mt-1 text-xs text-amber-600">{t("range.paused")}</p>}
                <div className="mt-1.5 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground sm:mt-2 sm:gap-4">
                  {sectionRepeat > 0 && (
                    <span>{t("range.sectionLoop")}: {currentSectionLoop + 1}/{sectionRepeat + 1}</span>
                  )}
                  {verseRepeat > 0 && (
                    <span>{t("range.verseLoop")}: {currentVerseLoop + 1}/{verseRepeat + 1}</span>
                  )}
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-2 sm:gap-3">
              {isActive ? (
                <>
                  {/* Play/Pause Button */}
                  <button
                    onClick={isPaused ? resumePlayback : pausePlayback}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50 sm:text-base"
                  >
                    {isPaused ? (
                      <>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>{t("range.resume")}</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                        <span>{t("range.pause")}</span>
                      </>
                    )}
                  </button>

                  {/* Stop Button */}
                  <button
                    onClick={stopPlayback}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 sm:text-base"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z" />
                    </svg>
                    <span>{t("range.stop")}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handlePlay}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50 sm:py-3.5 sm:text-base"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>{t("range.loading")}</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>{t("range.play")}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
