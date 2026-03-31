"use client";

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { fetchIndividualVerseAudioWithTimings, fetchChapterAudioData, type IndividualVerseAudio, type WordTiming } from "@/lib/quranApi";

export interface RangeAudioPlayerRef {
  stopPlayback: () => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  isPlaying: () => boolean;
  isPaused: () => boolean;
}

interface RangeAudioPlayerProps {
  surahId: number;
  totalVerses: number;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onPlayingChange?: (verseNumber: number | null, audioTime: number, wordTimings: WordTiming[]) => void;
  onPlaybackStart?: () => void;
  onPauseChange?: (isPaused: boolean) => void;
}

const RangeAudioPlayer = forwardRef<RangeAudioPlayerRef, RangeAudioPlayerProps>(function RangeAudioPlayer({
  surahId,
  totalVerses,
  isOpen,
  onClose,
  onOpen,
  onPlayingChange,
  onPlaybackStart,
  onPauseChange,
}, ref) {
  const { t } = useLanguage();
  
  // Use refs for audio state to avoid async state update issues
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentVerseRef = useRef<number>(1);
  const currentWordTimingsRef = useRef<WordTiming[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const playbackAbortedRef = useRef<boolean>(false);
  
  // Playback settings (refs for use in callbacks)
  const fromVerseRef = useRef<number>(1);
  const toVerseRef = useRef<number>(Math.min(10, totalVerses));
  const verseRepeatRef = useRef<number>(0);
  const sectionRepeatRef = useRef<number>(0);
  const currentVerseLoopRef = useRef<number>(0);
  const currentSectionLoopRef = useRef<number>(0);

  // UI state (for rendering)
  const [fromVerse, setFromVerse] = useState(1);
  const [toVerse, setToVerse] = useState(Math.min(10, totalVerses));
  const [sectionRepeat, setSectionRepeat] = useState(0);
  const [verseRepeat, setVerseRepeat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [currentVerseLoop, setCurrentVerseLoop] = useState(0);
  const [currentSectionLoop, setCurrentSectionLoop] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sync refs with state
  useEffect(() => { fromVerseRef.current = fromVerse; }, [fromVerse]);
  useEffect(() => { toVerseRef.current = toVerse; }, [toVerse]);
  useEffect(() => { verseRepeatRef.current = verseRepeat; }, [verseRepeat]);
  useEffect(() => { sectionRepeatRef.current = sectionRepeat; }, [sectionRepeat]);

  // Only reset settings when modal opens AND not playing/paused
  useEffect(() => {
    if (isOpen && !isPlaying && !isPaused) {
      const defaultFrom = 1;
      const defaultTo = Math.min(10, totalVerses);
      setFromVerse(defaultFrom);
      setToVerse(defaultTo);
      setSectionRepeat(0);
      setVerseRepeat(0);
      fromVerseRef.current = defaultFrom;
      toVerseRef.current = defaultTo;
      sectionRepeatRef.current = 0;
      verseRepeatRef.current = 0;
    }
  }, [isOpen, totalVerses, isPlaying, isPaused]);

  // Preload chapter audio data for word timings
  useEffect(() => {
    fetchChapterAudioData(surahId);
  }, [surahId]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const stopHighlighting = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    onPlayingChange?.(null, 0, []);
  }, [onPlayingChange]);

  const stopPlayback = useCallback(() => {
    playbackAbortedRef.current = true;
    isPlayingRef.current = false;
    isPausedRef.current = false;
    
    stopHighlighting();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load(); // Reset the audio element
    }
    
    currentVerseRef.current = fromVerseRef.current;
    currentVerseLoopRef.current = 0;
    currentSectionLoopRef.current = 0;
    currentWordTimingsRef.current = [];
    
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerse(fromVerseRef.current);
    setCurrentVerseLoop(0);
    setCurrentSectionLoop(0);
    onPauseChange?.(false);
  }, [stopHighlighting, onPauseChange]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      isPausedRef.current = true;
      setIsPaused(true);
      onPauseChange?.(true);
    }
  }, [onPauseChange]);

  const resumePlayback = useCallback(() => {
    if (audioRef.current && isPausedRef.current) {
      isPausedRef.current = false;
      setIsPaused(false);
      onPauseChange?.(false);
      audioRef.current.play().catch(() => {});
      // The highlighting loop checks isPausedRef on each frame and resumes automatically
    }
  }, [onPauseChange]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    stopPlayback,
    pausePlayback,
    resumePlayback,
    isPlaying: () => isPlayingRef.current,
    isPaused: () => isPausedRef.current,
  }), [stopPlayback, pausePlayback, resumePlayback]);

  // Start word highlighting loop - only call this AFTER audio is playing
  const startHighlightingLoop = useCallback((verseNum: number, wordTimings: WordTiming[]) => {
    // Cancel any existing loop
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    const audio = audioRef.current;
    if (!audio) return;

    let lastReportedTime = -1;

    const updateLoop = () => {
      // If paused, pause the loop but keep it alive so it can be restarted
      if (!isPlayingRef.current || !audioRef.current) {
        return;
      }
      if (isPausedRef.current) {
        rafIdRef.current = requestAnimationFrame(updateLoop);
        return;
      }
      
      const currentTime = audioRef.current.currentTime;
      
      // Only update if time changed significantly
      if (Math.abs(currentTime - lastReportedTime) > 0.05) {
        lastReportedTime = currentTime;
        // Use the wordTimings passed to this function, not a ref or state
        onPlayingChange?.(verseNum, currentTime, wordTimings);
      }
      
      rafIdRef.current = requestAnimationFrame(updateLoop);
    };

    rafIdRef.current = requestAnimationFrame(updateLoop);
  }, [onPlayingChange]);

  // Play a specific verse
  const playVerse = useCallback(async (verseNum: number): Promise<void> => {
    // Check if playback was aborted
    if (playbackAbortedRef.current) return;
    
    setLoading(true);
    
    // Stop any current highlighting immediately
    stopHighlighting();
    
    // Create a fresh audio element for each verse to avoid any buffer issues
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
    }
    
    const verseKey = `${surahId}:${verseNum}`;
    
    try {
      const verseInfo = await fetchIndividualVerseAudioWithTimings(surahId, verseKey);
      if (!verseInfo || playbackAbortedRef.current) {
        setLoading(false);
        return;
      }

      // Update refs immediately (synchronous)
      currentVerseRef.current = verseNum;
      currentWordTimingsRef.current = verseInfo.wordTimings;
      
      // Update UI state
      setCurrentVerse(verseNum);

      // Create new audio element
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;

      // Wait for audio to be fully ready
      await new Promise<void>((resolve, reject) => {
        const onCanPlayThrough = () => {
          cleanup();
          resolve();
        };
        
        const onError = (e: Event) => {
          cleanup();
          reject(e);
        };
        
        const cleanup = () => {
          audio.removeEventListener("canplaythrough", onCanPlayThrough);
          audio.removeEventListener("error", onError);
        };
        
        audio.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
        audio.addEventListener("error", onError, { once: true });
        
        audio.src = verseInfo.audioUrl;
        audio.load();
        
        // Timeout fallback
        setTimeout(() => {
          cleanup();
          resolve();
        }, 5000);
      });

      // Check again if playback was aborted during loading
      if (playbackAbortedRef.current || audioRef.current !== audio) {
        audio.src = "";
        return;
      }

      setLoading(false);

      // Set up ended handler for this audio
      const handleEnded = () => {
        if (playbackAbortedRef.current) return;
        
        // Stop highlighting for this verse
        stopHighlighting();
        
        // Check if we need to repeat this verse
        if (currentVerseLoopRef.current < verseRepeatRef.current) {
          currentVerseLoopRef.current++;
          setCurrentVerseLoop(currentVerseLoopRef.current);
          playVerse(verseNum);
          return;
        }

        // Move to next verse
        currentVerseLoopRef.current = 0;
        setCurrentVerseLoop(0);
        
        const nextVerse = verseNum + 1;

        if (nextVerse <= toVerseRef.current) {
          playVerse(nextVerse);
        } else {
          // Section ended
          if (currentSectionLoopRef.current < sectionRepeatRef.current) {
            currentSectionLoopRef.current++;
            setCurrentSectionLoop(currentSectionLoopRef.current);
            playVerse(fromVerseRef.current);
          } else {
            // All done
            stopPlayback();
          }
        }
      };

      audio.addEventListener("ended", handleEnded, { once: true });

      // Ensure we start from the beginning
      audio.currentTime = 0;
      
      // Play the audio
      await audio.play();
      
      // Only start highlighting AFTER play() succeeds
      // Pass the word timings directly to avoid stale state/ref issues
      startHighlightingLoop(verseNum, verseInfo.wordTimings);
      
    } catch (error) {
      console.error("Error playing verse:", error);
      setLoading(false);
    }
  }, [surahId, stopHighlighting, stopPlayback, startHighlightingLoop]);

  const handlePlay = useCallback(() => {
    if (isPausedRef.current) {
      resumePlayback();
    } else {
      playbackAbortedRef.current = false;
      isPlayingRef.current = true;
      isPausedRef.current = false;
      currentVerseLoopRef.current = 0;
      currentSectionLoopRef.current = 0;
      
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentVerseLoop(0);
      setCurrentSectionLoop(0);
      
      onPlaybackStart?.();
      playVerse(fromVerseRef.current);
    }
  }, [resumePlayback, playVerse, onPlaybackStart]);

  // Handle pause/resume for highlighting
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPause = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const onPlay = () => {
      if (isPlayingRef.current && !isPausedRef.current && currentWordTimingsRef.current.length > 0) {
        startHighlightingLoop(currentVerseRef.current, currentWordTimingsRef.current);
      }
    };

    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [startHighlightingLoop]);

  // Handle fromVerse/toVerse validation
  useEffect(() => {
    if (fromVerse > toVerse) {
      setToVerse(fromVerse);
      toVerseRef.current = fromVerse;
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
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFromVerse(val);
                    fromVerseRef.current = val;
                  }}
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
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setToVerse(val);
                    toVerseRef.current = val;
                  }}
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
                    onClick={() => {
                      const val = Math.max(0, sectionRepeat - 1);
                      setSectionRepeat(val);
                      sectionRepeatRef.current = val;
                    }}
                    disabled={isActive || sectionRepeat === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 sm:h-8 sm:w-8"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-foreground sm:w-8">{sectionRepeat}</span>
                  <button
                    onClick={() => {
                      const val = sectionRepeat + 1;
                      setSectionRepeat(val);
                      sectionRepeatRef.current = val;
                    }}
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
                    onClick={() => {
                      const val = Math.max(0, verseRepeat - 1);
                      setVerseRepeat(val);
                      verseRepeatRef.current = val;
                    }}
                    disabled={isActive || verseRepeat === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50 sm:h-8 sm:w-8"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-foreground sm:w-8">{verseRepeat}</span>
                  <button
                    onClick={() => {
                      const val = verseRepeat + 1;
                      setVerseRepeat(val);
                      verseRepeatRef.current = val;
                    }}
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
});

export default RangeAudioPlayer;
