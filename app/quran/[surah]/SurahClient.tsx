"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import type { QuranWord, QuranVerse } from "@/types";
import { useAuth } from "@/lib/hooks";
import { saveWord } from "@/lib/hooks";
import { useNotes, saveNote, deleteNote } from "@/lib/hooks";
import Verse from "@/components/Verse";
import NoteModal from "@/components/NoteModal";
import RangeAudioPlayer, { type RangeAudioPlayerRef } from "@/components/RangeAudioPlayer";
import { AVAILABLE_SURAHS, fetchAllVersesByChapter, fetchChapterAudioData, fetchIndividualVerseAudio, fetchIndividualVerseAudioWithTimings, fetchVerseAudioWithTimings, type WordTiming, type IndividualVerseAudio, type VerseAudioInfo } from "@/lib/quranApi";
import { useLanguage } from "@/lib/LanguageContext";
import { useReciter } from "@/lib/ReciterContext";

interface SurahClientProps {
  verses: QuranVerse[];
  surahId: number;
  surahName: string;
}

export default function SurahClient({ verses: initialVerses, surahId, surahName }: SurahClientProps) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { reciter } = useReciter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentVerseInfoRef = useRef<VerseAudioInfo | IndividualVerseAudio | null>(null);
  const rangePlayerRef = useRef<RangeAudioPlayerRef>(null);

  // Verses state - refetch when language changes
  const [verses, setVerses] = useState<QuranVerse[]>(initialVerses);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);

  // Audio state
  const [playingVerseIndex, setPlayingVerseIndex] = useState(-1);
  const [continuousMode, setContinuousMode] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0); // Time relative to verse start
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  
  // Range Audio Player state
  const [showRangePlayer, setShowRangePlayer] = useState(false);
  const [rangePlayingVerse, setRangePlayingVerse] = useState<number | null>(null);
  const [rangeAudioTime, setRangeAudioTime] = useState(0);
  const [rangeWordTimings, setRangeWordTimings] = useState<WordTiming[]>([]);
  const [rangeIsPaused, setRangeIsPaused] = useState(false);

  const surahInfo = AVAILABLE_SURAHS.find((s) => s.id === surahId);
  const isAnythingPlaying = playingVerseIndex >= 0;

  // Notes state
  const { notes } = useNotes(user?.uid);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteModalVerseKey, setNoteModalVerseKey] = useState("");
  const noteMap = new Map(notes.filter((n) => n.surah === surahId).map((n) => [n.verseKey, n]));
  
  // Bookmark state
  const [bookmarkedVerse, setBookmarkedVerse] = useState<string | null>(null);

  // Load bookmark from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookmark");
      if (saved) {
        const bm = JSON.parse(saved);
        if (bm.surahId === surahId) {
          setBookmarkedVerse(bm.verseKey);
        } else {
          setBookmarkedVerse(null);
        }
      }
    } catch {
      setBookmarkedVerse(null);
    }
  }, [surahId]);

  const handleBookmark = useCallback((verseKey: string) => {
    if (bookmarkedVerse === verseKey) {
      // Remove bookmark
      localStorage.removeItem("bookmark");
      setBookmarkedVerse(null);
    } else {
      // Set bookmark
      const bm = { surahId, verseKey };
      localStorage.setItem("bookmark", JSON.stringify(bm));
      setBookmarkedVerse(verseKey);
    }
  }, [bookmarkedVerse, surahId]);
  
  // Get translated surah name based on current language
  const translatedSurahName = lang === "en" ? surahInfo?.name_english : surahInfo?.name_german;

  // Refetch verses when language changes
  useEffect(() => {
    let cancelled = false;
    
    async function loadVerses() {
      setIsLoadingVerses(true);
      try {
        const newVerses = await fetchAllVersesByChapter(surahId, lang);
        if (!cancelled) {
          setVerses(newVerses);
        }
      } catch (error) {
        console.error("Failed to fetch verses:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingVerses(false);
        }
      }
    }
    
    loadVerses();
    
    return () => {
      cancelled = true;
    };
  }, [surahId, lang]);

  // Handle range player state changes
  const handleRangePlayingChange = useCallback((verseNumber: number | null, audioTime: number, timings: WordTiming[]) => {
    setRangePlayingVerse(verseNumber);
    setRangeAudioTime(audioTime);
    setRangeWordTimings(timings);
  }, []);

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

  const handleOpenNote = useCallback((verseKey: string) => {
    if (!user) return;
    setNoteModalVerseKey(verseKey);
    setNoteModalOpen(true);
  }, [user]);

  const handleSaveNote = useCallback(
    async (text: string) => {
      if (!user || !noteModalVerseKey) return;
      const [, ayah] = noteModalVerseKey.split(":");
      await saveNote({
        userId: user.uid,
        surah: surahId,
        ayah: parseInt(ayah, 10),
        verseKey: noteModalVerseKey,
        text,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },
    [user, surahId, noteModalVerseKey]
  );

  const handleDeleteNote = useCallback(async () => {
    const existing = noteMap.get(noteModalVerseKey);
    if (existing?.id) {
      await deleteNote(existing.id);
    }
  }, [noteModalVerseKey, noteMap]);

  // Stop all playback (both normal and range)
  const stopPlayback = useCallback(() => {
    // Stop normal playback
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setPlayingVerseIndex(-1);
    setContinuousMode(false);
    setCurrentAudioTime(0);
    setWordTimings([]);
    setIsPaused(false);
    currentVerseInfoRef.current = null;
    
    // Also stop range playback if active
    rangePlayerRef.current?.stopPlayback();
    setRangeIsPaused(false);
  }, []);

  // Stop only normal playback (used when range starts)
  const stopNormalPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setPlayingVerseIndex(-1);
    setContinuousMode(false);
    setCurrentAudioTime(0);
    setWordTimings([]);
    setIsPaused(false);
    currentVerseInfoRef.current = null;
  }, []);

  // Handle when range playback starts - stop normal playback
  const handleRangePlaybackStart = useCallback(() => {
    stopNormalPlayback();
    setRangeIsPaused(false);
  }, [stopNormalPlayback]);

  // Pause playback (works for both normal and range)
  const pausePlayback = useCallback(() => {
    // Check if range is playing
    if (rangePlayerRef.current?.isPlaying() && !rangePlayerRef.current?.isPaused()) {
      rangePlayerRef.current.pausePlayback(); // Will call onPauseChange internally
      return;
    }
    // Otherwise pause normal playback
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setIsPaused(true);
    }
  }, []);

  // Resume playback (works for both normal and range)
  const resumePlayback = useCallback(() => {
    // Check if range is paused
    if (rangePlayerRef.current?.isPaused()) {
      rangePlayerRef.current.resumePlayback(); // Will call onPauseChange internally
      return;
    }
    // Otherwise resume normal playback
    const audio = audioRef.current;
    if (audio && isPaused) {
      audio.play().catch(() => {});
      setIsPaused(false);
    }
  }, [isPaused]);

  // Play a single verse (no auto-advance)
  const playVerse = useCallback((index: number) => {
    // Stop range playback first
    rangePlayerRef.current?.stopPlayback();
    
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setCurrentAudioTime(0);
    setWordTimings([]);
    setIsPaused(false);
    currentVerseInfoRef.current = null;
    setContinuousMode(false);
    setPlayingVerseIndex(index);
  }, []);

  // Play from a specific verse continuously (auto-advance)
  const playFromVerse = useCallback((index: number) => {
    // Stop range playback first
    rangePlayerRef.current?.stopPlayback();
    
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setCurrentAudioTime(0);
    setWordTimings([]);
    setIsPaused(false);
    currentVerseInfoRef.current = null;
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
    fetchChapterAudioData(surahId, reciter.qdcId);
  }, [surahId, reciter]);

  // Load and play audio when playingVerseIndex changes
  // Single verse mode: Uses chapter audio with seeking (has word timings)
  // Continuous mode: Uses individual verse audio files (mobile-friendly, no word timings)
  useEffect(() => {
    if (playingVerseIndex < 0 || playingVerseIndex >= verses.length) {
      if (playingVerseIndex >= verses.length) {
        stopPlayback();
      }
      return;
    }

    const verse = verses[playingVerseIndex];
    let cancelled = false;
    let rafId: number | null = null;

    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.removeAttribute("src");
    }

    const loadAndPlayVerse = async () => {
      try {
        if (!continuousMode) {
          // ===== SINGLE VERSE MODE: Chapter audio with seeking (PC works fine) =====
          const verseInfo = await fetchVerseAudioWithTimings(surahId, verse.verse_key, reciter.qdcId);
          if (cancelled || !verseInfo) return;
          currentVerseInfoRef.current = verseInfo;
          setWordTimings(verseInfo.wordTimings || []);

          // Create or reuse audio element
          let audio = audioRef.current;
          if (!audio) {
            audio = new Audio();
            audioRef.current = audio;
          }
          audio.preload = "auto";

          // Wait for audio to be ready
          await new Promise<void>((resolve, reject) => {
            const onCanPlay = () => {
              cleanup();
              resolve();
            };
            const onError = (e: Event) => {
              cleanup();
              reject(e);
            };
            const cleanup = () => {
              audio!.removeEventListener("canplaythrough", onCanPlay);
              audio!.removeEventListener("error", onError);
            };
            
            audio!.addEventListener("canplaythrough", onCanPlay, { once: true });
            audio!.addEventListener("error", onError, { once: true });
            
            // Only load if URL changed
            if (audio!.src !== verseInfo.audioUrl) {
              audio!.src = verseInfo.audioUrl;
              audio!.load();
            } else {
              cleanup();
              resolve();
            }
            
            // Timeout fallback
            setTimeout(() => {
              cleanup();
              resolve();
            }, 5000);
          });

          if (cancelled || audioRef.current !== audio) return;

          // Seek to verse start
          audio.currentTime = verseInfo.verseStartTime;

          // Set up highlighting loop
          const updateHighlighting = () => {
            if (cancelled || !audioRef.current || audioRef.current.paused) return;
            const currentTime = audioRef.current.currentTime;
            // Calculate time relative to verse start
            const relativeTime = currentTime - verseInfo.verseStartTime;
            setCurrentAudioTime(relativeTime);

            // Check if we've reached the end of the verse
            if (currentTime >= verseInfo.verseEndTime) {
              if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
              }
              audioRef.current.pause();
              setCurrentAudioTime(0);
              setWordTimings([]);
              currentVerseInfoRef.current = null;
              setPlayingVerseIndex(-1);
              return;
            }

            rafId = requestAnimationFrame(updateHighlighting);
          };

          // Handle play/pause for highlighting
          const onPlay = () => {
            if (!cancelled) {
              rafId = requestAnimationFrame(updateHighlighting);
            }
          };

          const onPause = () => {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          };

          audio.addEventListener("play", onPlay);
          audio.addEventListener("pause", onPause);

          // Start playback
          await audio.play();

          // Scroll verse into view
          const el = document.getElementById(`verse-${verse.verse_key}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });

        } else {
          // ===== CONTINUOUS MODE: Individual verse files (mobile-friendly, no seeking) =====
          const verseInfo = await fetchIndividualVerseAudioWithTimings(surahId, verse.verse_key, reciter.quranComId, reciter.qdcId);
          if (cancelled || !verseInfo) return;

          currentVerseInfoRef.current = verseInfo;
          setWordTimings(verseInfo.wordTimings || []);
          setCurrentAudioTime(0);

          // Clean up previous audio completely
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.removeAttribute("src");
          }

          // Create fresh audio element for this verse
          const audio = new Audio();
          audio.preload = "auto";
          audioRef.current = audio;

          // Wait for audio to be ready
          await new Promise<void>((resolve, reject) => {
            const onCanPlay = () => {
              cleanup();
              resolve();
            };
            const onError = (e: Event) => {
              cleanup();
              reject(e);
            };
            const cleanup = () => {
              audio.removeEventListener("canplaythrough", onCanPlay);
              audio.removeEventListener("error", onError);
            };
            
            audio.addEventListener("canplaythrough", onCanPlay, { once: true });
            audio.addEventListener("error", onError, { once: true });
            audio.src = verseInfo.audioUrl;
            audio.load();
            
            // Timeout fallback
            setTimeout(() => {
              cleanup();
              resolve();
            }, 5000);
          });

          if (cancelled || audioRef.current !== audio) return;

          // Set up highlighting loop
          const updateHighlighting = () => {
            if (cancelled || !audioRef.current || audioRef.current.paused) return;
            const currentTime = audioRef.current.currentTime;
            setCurrentAudioTime(currentTime);
            rafId = requestAnimationFrame(updateHighlighting);
          };

          // Handle verse ended
          const onEnded = () => {
            if (cancelled) return;
            
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
            
            setCurrentAudioTime(0);
            
            if (continuousMode && playingVerseIndex < verses.length - 1) {
              // Move to next verse
              setPlayingVerseIndex((prev) => prev + 1);
            } else {
              // Stop playback
              setWordTimings([]);
              currentVerseInfoRef.current = null;
              setPlayingVerseIndex(-1);
            }
          };

          // Handle play/pause for highlighting
          const onPlay = () => {
            if (!cancelled) {
              rafId = requestAnimationFrame(updateHighlighting);
            }
          };

          const onPause = () => {
            if (rafId) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          };

          audio.addEventListener("ended", onEnded);
          audio.addEventListener("play", onPlay);
          audio.addEventListener("pause", onPause);

          // Start playback
          audio.currentTime = 0;
          await audio.play();

          // Scroll verse into view
          const el = document.getElementById(`verse-${verse.verse_key}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }

      } catch (error) {
        console.error("Error playing verse:", error);
        if (!cancelled) {
          setWordTimings([]);
          currentVerseInfoRef.current = null;
          setPlayingVerseIndex(-1);
        }
      }
    };

    loadAndPlayVerse();

    return () => {
      cancelled = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.removeAttribute("src");
      }
    };
  }, [playingVerseIndex, verses, continuousMode, stopPlayback, surahId]);

  return (
    <div className={`mx-auto max-w-4xl px-4 py-8 ${rangePlayingVerse !== null ? 'pb-24 sm:pb-8' : ''}`}>
      <audio ref={audioRef} preload="none" />

      {/* Surah header */}
      <div className="mb-8 text-center">
        <h1 className="arabic-text text-4xl text-primary">{surahName}</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          {surahInfo?.name_simple} – {translatedSurahName}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {verses.length} {t("surah.verses")}
        </p>

        {/* Play all button */}
        {!isAnythingPlaying && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={playAll}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {t("surah.playAll")}
            </button>
          </div>
        )}
      </div>

      <div className={`space-y-4 ${isLoadingVerses ? 'opacity-50 pointer-events-none' : ''}`}>
        {isLoadingVerses && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        )}
        {verses.map((verse, index) => {
          const verseNumber = verse.verse_number;
          const isPlayingNormal = index === playingVerseIndex;
          const isPlayingRange = rangePlayingVerse === verseNumber;
          const isPlaying = isPlayingNormal || isPlayingRange;
          
          return (
            <div key={verse.verse_key || verse.id} id={`verse-${verse.verse_key}`}>
              <Verse
                verse={verse}
                onWordClick={handleWordClick}
                isPlaying={isPlaying}
                isPaused={isPlayingNormal ? isPaused : isPlayingRange ? rangeIsPaused : false}
                audioTime={isPlayingNormal ? currentAudioTime : isPlayingRange ? rangeAudioTime : undefined}
                wordTimings={isPlayingNormal ? wordTimings : isPlayingRange ? rangeWordTimings : undefined}
                onPlay={() => playVerse(index)}
                onPlayFromHere={() => playFromVerse(index)}
                onStop={stopPlayback}
                onPause={pausePlayback}
                onResume={resumePlayback}
                onNote={() => handleOpenNote(verse.verse_key)}
                hasNote={noteMap.has(verse.verse_key)}
                isBookmarked={bookmarkedVerse === verse.verse_key}
                onBookmark={() => handleBookmark(verse.verse_key)}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Range Audio Player Button - hidden when mini player is shown */}
      {!showRangePlayer && rangePlayingVerse === null && (
        <button
          onClick={() => setShowRangePlayer(true)}
          className="fixed bottom-6 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 sm:right-6 sm:h-14 sm:w-14"
          title={t("range.title")}
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
          </svg>
        </button>
      )}

      {/* Range Audio Player Modal */}
      <RangeAudioPlayer
        ref={rangePlayerRef}
        surahId={surahId}
        totalVerses={verses.length}
        isOpen={showRangePlayer}
        onClose={() => setShowRangePlayer(false)}
        onOpen={() => setShowRangePlayer(true)}
        onPlayingChange={handleRangePlayingChange}
        onPlaybackStart={handleRangePlaybackStart}
        onPauseChange={setRangeIsPaused}
      />

      {/* Note Modal */}
      <NoteModal
        isOpen={noteModalOpen}
        verseKey={noteModalVerseKey}
        initialText={noteMap.get(noteModalVerseKey)?.text || ""}
        onSave={handleSaveNote}
        onDelete={noteMap.has(noteModalVerseKey) ? handleDeleteNote : undefined}
        onClose={() => setNoteModalOpen(false)}
      />
    </div>
  );
}
