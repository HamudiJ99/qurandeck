import type { QuranVerse, SurahInfo } from "@/types";

const BASE_URL = "https://api.quran.com/api/v4";

// Translation IDs for different languages
const TRANSLATION_IDS: Record<string, string> = {
  de: "27",  // German: Frank Bubenheim & Nadeem
  en: "20",  // English: Sahih International
};

export async function fetchVersesByChapter(
  surah: number,
  page: number = 1,
  language: string = "de"
): Promise<{ verses: QuranVerse[]; pagination: { total_pages: number; current_page: number } }> {
  const translationId = TRANSLATION_IDS[language] || TRANSLATION_IDS.de;
  const params = new URLSearchParams({
    language: language,
    words: "true",
    translations: translationId,
    word_fields: "text_uthmani,translation",
    translation_fields: "text",
    fields: "text_uthmani",
    page: page.toString(),
    per_page: "10",
  });

  const res = await fetch(`${BASE_URL}/verses/by_chapter/${surah}?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error("Failed to fetch verses");
  return res.json();
}

export async function fetchAllVersesByChapter(surah: number, language: string = "de"): Promise<QuranVerse[]> {
  const allVerses: QuranVerse[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchVersesByChapter(surah, page, language);
    allVerses.push(...data.verses);
    totalPages = data.pagination.total_pages;
    page++;
  }

  return allVerses;
}

export async function fetchSurahInfo(surah: number, language: string = "de"): Promise<SurahInfo> {
  const res = await fetch(`${BASE_URL}/chapters/${surah}?language=${language}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error("Failed to fetch surah info");
  const data = await res.json();
  return data.chapter;
}

export async function fetchAudioForVerse(
  reciterIdOrSlug: string,
  verseKey: string
): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/recitations/${reciterIdOrSlug}/by_ayah/${verseKey}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) throw new Error("Failed to fetch audio");
  const data = await res.json();
  const audioFile = data.audio_files?.[0];
  if (!audioFile) throw new Error("No audio found");
  return `https://verses.quran.com/${audioFile.url}`;
}

// Cache for chapter audio data (segments)
const chapterAudioCache = new Map<number, ChapterAudioData>();

interface VerseTiming {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  segments: number[][]; // [word_position, start_ms, end_ms]
}

interface ChapterAudioData {
  audioUrl: string;
  verseTimings: VerseTiming[];
}

export async function fetchChapterAudioData(chapter: number): Promise<ChapterAudioData | null> {
  // Check cache first
  if (chapterAudioCache.has(chapter)) {
    return chapterAudioCache.get(chapter)!;
  }

  try {
    const res = await fetch(
      `https://api.qurancdn.com/api/qdc/audio/reciters/7/audio_files?chapter=${chapter}&segments=true`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return null;
    const data = await res.json();
    
    const audioFile = data.audio_files?.[0];
    if (!audioFile) return null;

    const chapterData: ChapterAudioData = {
      audioUrl: audioFile.audio_url,
      verseTimings: audioFile.verse_timings || [],
    };

    chapterAudioCache.set(chapter, chapterData);
    return chapterData;
  } catch {
    return null;
  }
}

export interface WordTiming {
  position: number;
  startTime: number; // in seconds (relative to verse start)
  endTime: number;   // in seconds
}

export interface VerseAudioInfo {
  audioUrl: string;
  wordTimings: WordTiming[];
  verseStartTime: number; // Start time in chapter audio (seconds)
  verseEndTime: number;   // End time in chapter audio (seconds)
}

export async function fetchVerseAudioWithTimings(
  chapter: number,
  verseKey: string
): Promise<VerseAudioInfo | null> {
  const chapterData = await fetchChapterAudioData(chapter);
  if (!chapterData) return null;

  const verseTiming = chapterData.verseTimings.find(
    (vt) => vt.verse_key === verseKey
  );
  if (!verseTiming) return null;

  // Parse segments and adjust times to be relative to verse start
  const verseStartMs = verseTiming.timestamp_from;
  const wordTimings: WordTiming[] = [];

  for (const seg of verseTiming.segments) {
    // Segments can be [position] (markers) or [position, start, end]
    if (seg.length >= 3) {
      wordTimings.push({
        position: seg[0],
        startTime: (seg[1] - verseStartMs) / 1000,
        endTime: (seg[2] - verseStartMs) / 1000,
      });
    }
  }

  // Calculate actual verse end time from the last word's end time
  // This is more accurate than timestamp_to which may include silence or overlap
  let actualVerseEndTime = verseTiming.timestamp_to / 1000;
  if (wordTimings.length > 0) {
    // Find the maximum end time from all word segments
    const lastWordEnd = Math.max(...wordTimings.map(wt => wt.endTime));
    // Add back the verse start time to get absolute time
    actualVerseEndTime = (verseStartMs / 1000) + lastWordEnd;
  }

  return {
    audioUrl: chapterData.audioUrl,
    wordTimings,
    verseStartTime: verseTiming.timestamp_from / 1000,
    verseEndTime: actualVerseEndTime,
  };
}

// Individual verse audio info (for mobile-friendly playback without seeking)
export interface IndividualVerseAudio {
  audioUrl: string;
  wordTimings: WordTiming[];
  duration: number; // Total duration in seconds
}

// Cache for individual verse audio URLs
const individualVerseAudioCache = new Map<string, string>();

export async function fetchIndividualVerseAudio(
  chapter: number,
  verseKey: string
): Promise<IndividualVerseAudio | null> {
  try {
    // Get individual verse audio URL
    let audioUrl = individualVerseAudioCache.get(verseKey);
    if (!audioUrl) {
      const res = await fetch(
        `https://api.quran.com/api/v4/recitations/7/by_ayah/${verseKey}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const audioFile = data.audio_files?.[0];
      if (!audioFile) return null;
      audioUrl = `https://verses.quran.com/${audioFile.url}`;
      individualVerseAudioCache.set(verseKey, audioUrl);
    }

    // IMPORTANT: Individual verse audio files do NOT have word-level timings
    // The timing data from chapter audio doesn't match individual verse files
    // Therefore we return empty word timings and estimate duration
    // Word-by-word highlighting is only available with the full chapter audio player
    
    return {
      audioUrl,
      wordTimings: [], // No word timings for individual verse audio
      duration: 0, // Will be determined by actual audio playback
    };
  } catch {
    return null;
  }
}

// Fetch individual verse audio WITH word timings from chapter data
// Uses individual verse files (mobile-friendly) but includes accurate word timings
export async function fetchIndividualVerseAudioWithTimings(
  chapter: number,
  verseKey: string
): Promise<IndividualVerseAudio | null> {
  try {
    // Get individual verse audio URL
    let audioUrl = individualVerseAudioCache.get(verseKey);
    if (!audioUrl) {
      const res = await fetch(
        `https://api.quran.com/api/v4/recitations/7/by_ayah/${verseKey}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const audioFile = data.audio_files?.[0];
      if (!audioFile) return null;
      audioUrl = `https://verses.quran.com/${audioFile.url}`;
      individualVerseAudioCache.set(verseKey, audioUrl);
    }

    // Get word timings from chapter audio data
    const chapterData = await fetchChapterAudioData(chapter);
    let wordTimings: WordTiming[] = [];
    
    if (chapterData) {
      const verseTiming = chapterData.verseTimings.find(
        (vt) => vt.verse_key === verseKey
      );
      if (verseTiming) {
        // Parse segments and adjust times to be relative to verse start (0-based)
        const verseStartMs = verseTiming.timestamp_from;
        for (const seg of verseTiming.segments) {
          if (seg.length >= 3) {
            wordTimings.push({
              position: seg[0],
              startTime: (seg[1] - verseStartMs) / 1000,
              endTime: (seg[2] - verseStartMs) / 1000,
            });
          }
        }
      }
    }

    return {
      audioUrl,
      wordTimings,
      duration: 0,
    };
  } catch {
    return null;
  }
}

// Preload individual verse audio (returns promise that resolves when ready)
export function preloadVerseAudio(audioUrl: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "auto";
    
    const onCanPlay = () => {
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      resolve(audio);
    };
    
    const onError = () => {
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      reject(new Error("Failed to preload audio"));
    };
    
    audio.addEventListener("canplaythrough", onCanPlay);
    audio.addEventListener("error", onError);
    audio.src = audioUrl;
    audio.load();
    
    // Timeout fallback
    setTimeout(() => {
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      resolve(audio); // Resolve anyway after timeout
    }, 5000);
  });
}

export const AVAILABLE_SURAHS = [
  { id: 1, name_simple: "Al-Fatiha", name_german: "Die Eröffnung", name_english: "The Opening", name_arabic: "الفاتحة", verses_count: 7 },
  { id: 2, name_simple: "Al-Baqarah", name_german: "Die Kuh", name_english: "The Cow", name_arabic: "البقرة", verses_count: 286 },
];
