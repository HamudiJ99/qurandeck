import type { QuranVerse, SurahInfo } from "@/types";

const BASE_URL = "https://api.quran.com/api/v4";

// Resolve audio URL: some reciters return absolute URLs (//mirrors.quranicaudio.com/...),
// others return relative paths (Alafasy/mp3/...)
function resolveAudioUrl(rawUrl: string): string {
  if (rawUrl.startsWith("//")) return `https:${rawUrl}`;
  if (rawUrl.startsWith("http")) return rawUrl;
  return `https://verses.quran.com/${rawUrl}`;
}

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
  return resolveAudioUrl(audioFile.url);
}

// Cache for chapter audio data (segments) - keyed by "reciterId:chapter"
const chapterAudioCache = new Map<string, ChapterAudioData>();

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

export async function fetchChapterAudioData(chapter: number, qdcReciterId: number = 7): Promise<ChapterAudioData | null> {
  const cacheKey = `${qdcReciterId}:${chapter}`;
  // Check cache first
  if (chapterAudioCache.has(cacheKey)) {
    return chapterAudioCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(
      `https://api.qurancdn.com/api/qdc/audio/reciters/${qdcReciterId}/audio_files?chapter=${chapter}&segments=true`,
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

    chapterAudioCache.set(cacheKey, chapterData);
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
  verseKey: string,
  qdcReciterId: number = 7
): Promise<VerseAudioInfo | null> {
  const chapterData = await fetchChapterAudioData(chapter, qdcReciterId);
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

// Cache for individual verse audio URLs - keyed by "reciterId:verseKey"
const individualVerseAudioCache = new Map<string, string>();

export async function fetchIndividualVerseAudio(
  chapter: number,
  verseKey: string,
  quranComReciterId: number = 7
): Promise<IndividualVerseAudio | null> {
  try {
    const cacheKey = `${quranComReciterId}:${verseKey}`;
    // Get individual verse audio URL
    let audioUrl = individualVerseAudioCache.get(cacheKey);
    if (!audioUrl) {
      const res = await fetch(
        `https://api.quran.com/api/v4/recitations/${quranComReciterId}/by_ayah/${verseKey}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const audioFile = data.audio_files?.[0];
      if (!audioFile) return null;
      audioUrl = resolveAudioUrl(audioFile.url);
      individualVerseAudioCache.set(cacheKey, audioUrl);
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
  verseKey: string,
  quranComReciterId: number = 7,
  qdcReciterId: number = 7
): Promise<IndividualVerseAudio | null> {
  try {
    const cacheKey = `${quranComReciterId}:${verseKey}`;
    // Get individual verse audio URL
    let audioUrl = individualVerseAudioCache.get(cacheKey);
    if (!audioUrl) {
      const res = await fetch(
        `https://api.quran.com/api/v4/recitations/${quranComReciterId}/by_ayah/${verseKey}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const audioFile = data.audio_files?.[0];
      if (!audioFile) return null;
      audioUrl = resolveAudioUrl(audioFile.url);
      individualVerseAudioCache.set(cacheKey, audioUrl);
    }

    // Get word timings from chapter audio data
    const chapterData = await fetchChapterAudioData(chapter, qdcReciterId);
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
  { id: 3, name_simple: "Ali 'Imran", name_german: "Die Familie Imrans", name_english: "The Family of Imran", name_arabic: "آل عمران", verses_count: 200 },
  { id: 4, name_simple: "An-Nisa", name_german: "Die Frauen", name_english: "The Women", name_arabic: "النساء", verses_count: 176 },
  { id: 5, name_simple: "Al-Ma'idah", name_german: "Der Tisch", name_english: "The Table Spread", name_arabic: "المائدة", verses_count: 120 },
  { id: 6, name_simple: "Al-An'am", name_german: "Das Vieh", name_english: "The Cattle", name_arabic: "الأنعام", verses_count: 165 },
  { id: 7, name_simple: "Al-A'raf", name_german: "Die Höhen", name_english: "The Heights", name_arabic: "الأعراف", verses_count: 206 },
  { id: 8, name_simple: "Al-Anfal", name_german: "Die Beute", name_english: "The Spoils of War", name_arabic: "الأنفال", verses_count: 75 },
  { id: 9, name_simple: "At-Tawbah", name_german: "Die Reue", name_english: "The Repentance", name_arabic: "التوبة", verses_count: 129 },
  { id: 10, name_simple: "Yunus", name_german: "Jona", name_english: "Jonah", name_arabic: "يونس", verses_count: 109 },
  { id: 11, name_simple: "Hud", name_german: "Hud", name_english: "Hud", name_arabic: "هود", verses_count: 123 },
  { id: 12, name_simple: "Yusuf", name_german: "Josef", name_english: "Joseph", name_arabic: "يوسف", verses_count: 111 },
  { id: 13, name_simple: "Ar-Ra'd", name_german: "Der Donner", name_english: "The Thunder", name_arabic: "الرعد", verses_count: 43 },
  { id: 14, name_simple: "Ibrahim", name_german: "Abraham", name_english: "Abraham", name_arabic: "إبراهيم", verses_count: 52 },
  { id: 15, name_simple: "Al-Hijr", name_german: "Das Felsental", name_english: "The Rocky Tract", name_arabic: "الحجر", verses_count: 99 },
  { id: 16, name_simple: "An-Nahl", name_german: "Die Biene", name_english: "The Bee", name_arabic: "النحل", verses_count: 128 },
  { id: 17, name_simple: "Al-Isra", name_german: "Die Nachtreise", name_english: "The Night Journey", name_arabic: "الإسراء", verses_count: 111 },
  { id: 18, name_simple: "Al-Kahf", name_german: "Die Höhle", name_english: "The Cave", name_arabic: "الكهف", verses_count: 110 },
  { id: 19, name_simple: "Maryam", name_german: "Maria", name_english: "Mary", name_arabic: "مريم", verses_count: 98 },
  { id: 20, name_simple: "Ta-Ha", name_german: "Ta-Ha", name_english: "Ta-Ha", name_arabic: "طه", verses_count: 135 },
  { id: 21, name_simple: "Al-Anbiya", name_german: "Die Propheten", name_english: "The Prophets", name_arabic: "الأنبياء", verses_count: 112 },
  { id: 22, name_simple: "Al-Hajj", name_german: "Die Pilgerfahrt", name_english: "The Pilgrimage", name_arabic: "الحج", verses_count: 78 },
  { id: 23, name_simple: "Al-Mu'minun", name_german: "Die Gläubigen", name_english: "The Believers", name_arabic: "المؤمنون", verses_count: 118 },
  { id: 24, name_simple: "An-Nur", name_german: "Das Licht", name_english: "The Light", name_arabic: "النور", verses_count: 64 },
  { id: 25, name_simple: "Al-Furqan", name_german: "Die Unterscheidung", name_english: "The Criterion", name_arabic: "الفرقان", verses_count: 77 },
  { id: 26, name_simple: "Ash-Shu'ara", name_german: "Die Dichter", name_english: "The Poets", name_arabic: "الشعراء", verses_count: 227 },
  { id: 27, name_simple: "An-Naml", name_german: "Die Ameise", name_english: "The Ant", name_arabic: "النمل", verses_count: 93 },
  { id: 28, name_simple: "Al-Qasas", name_german: "Die Erzählungen", name_english: "The Stories", name_arabic: "القصص", verses_count: 88 },
  { id: 29, name_simple: "Al-Ankabut", name_german: "Die Spinne", name_english: "The Spider", name_arabic: "العنكبوت", verses_count: 69 },
  { id: 30, name_simple: "Ar-Rum", name_german: "Die Römer", name_english: "The Romans", name_arabic: "الروم", verses_count: 60 },
  { id: 31, name_simple: "Luqman", name_german: "Luqman", name_english: "Luqman", name_arabic: "لقمان", verses_count: 34 },
  { id: 32, name_simple: "As-Sajdah", name_german: "Die Niederwerfung", name_english: "The Prostration", name_arabic: "السجدة", verses_count: 30 },
  { id: 33, name_simple: "Al-Ahzab", name_german: "Die Verbündeten", name_english: "The Combined Forces", name_arabic: "الأحزاب", verses_count: 73 },
  { id: 34, name_simple: "Saba", name_german: "Saba", name_english: "Sheba", name_arabic: "سبأ", verses_count: 54 },
  { id: 35, name_simple: "Fatir", name_german: "Der Schöpfer", name_english: "Originator", name_arabic: "فاطر", verses_count: 45 },
  { id: 36, name_simple: "Ya-Sin", name_german: "Ya-Sin", name_english: "Ya-Sin", name_arabic: "يس", verses_count: 83 },
  { id: 37, name_simple: "As-Saffat", name_german: "Die Aufgereihten", name_english: "Those Who Set The Ranks", name_arabic: "الصافات", verses_count: 182 },
  { id: 38, name_simple: "Sad", name_german: "Sad", name_english: "Sad", name_arabic: "ص", verses_count: 88 },
  { id: 39, name_simple: "Az-Zumar", name_german: "Die Scharen", name_english: "The Troops", name_arabic: "الزمر", verses_count: 75 },
  { id: 40, name_simple: "Ghafir", name_german: "Der Vergebende", name_english: "The Forgiver", name_arabic: "غافر", verses_count: 85 },
  { id: 41, name_simple: "Fussilat", name_german: "Klar dargelegt", name_english: "Explained in Detail", name_arabic: "فصلت", verses_count: 54 },
  { id: 42, name_simple: "Ash-Shura", name_german: "Die Beratung", name_english: "The Consultation", name_arabic: "الشورى", verses_count: 53 },
  { id: 43, name_simple: "Az-Zukhruf", name_german: "Der Goldschmuck", name_english: "The Ornaments of Gold", name_arabic: "الزخرف", verses_count: 89 },
  { id: 44, name_simple: "Ad-Dukhan", name_german: "Der Rauch", name_english: "The Smoke", name_arabic: "الدخان", verses_count: 59 },
  { id: 45, name_simple: "Al-Jathiyah", name_german: "Die Kniende", name_english: "The Crouching", name_arabic: "الجاثية", verses_count: 37 },
  { id: 46, name_simple: "Al-Ahqaf", name_german: "Die Sanddünen", name_english: "The Wind-Curved Sandhills", name_arabic: "الأحقاف", verses_count: 35 },
  { id: 47, name_simple: "Muhammad", name_german: "Muhammad", name_english: "Muhammad", name_arabic: "محمد", verses_count: 38 },
  { id: 48, name_simple: "Al-Fath", name_german: "Der Sieg", name_english: "The Victory", name_arabic: "الفتح", verses_count: 29 },
  { id: 49, name_simple: "Al-Hujurat", name_german: "Die Gemächer", name_english: "The Rooms", name_arabic: "الحجرات", verses_count: 18 },
  { id: 50, name_simple: "Qaf", name_german: "Qaf", name_english: "Qaf", name_arabic: "ق", verses_count: 45 },
  { id: 51, name_simple: "Adh-Dhariyat", name_german: "Die Zerstreuenden", name_english: "The Winnowing Winds", name_arabic: "الذاريات", verses_count: 60 },
  { id: 52, name_simple: "At-Tur", name_german: "Der Berg", name_english: "The Mount", name_arabic: "الطور", verses_count: 49 },
  { id: 53, name_simple: "An-Najm", name_german: "Der Stern", name_english: "The Star", name_arabic: "النجم", verses_count: 62 },
  { id: 54, name_simple: "Al-Qamar", name_german: "Der Mond", name_english: "The Moon", name_arabic: "القمر", verses_count: 55 },
  { id: 55, name_simple: "Ar-Rahman", name_german: "Der Erbarmer", name_english: "The Beneficent", name_arabic: "الرحمن", verses_count: 78 },
  { id: 56, name_simple: "Al-Waqi'ah", name_german: "Das Ereignis", name_english: "The Inevitable", name_arabic: "الواقعة", verses_count: 96 },
  { id: 57, name_simple: "Al-Hadid", name_german: "Das Eisen", name_english: "The Iron", name_arabic: "الحديد", verses_count: 29 },
  { id: 58, name_simple: "Al-Mujadila", name_german: "Die Streitende", name_english: "The Pleading Woman", name_arabic: "المجادلة", verses_count: 22 },
  { id: 59, name_simple: "Al-Hashr", name_german: "Die Versammlung", name_english: "The Exile", name_arabic: "الحشر", verses_count: 24 },
  { id: 60, name_simple: "Al-Mumtahanah", name_german: "Die Geprüfte", name_english: "She That Is To Be Examined", name_arabic: "الممتحنة", verses_count: 13 },
  { id: 61, name_simple: "As-Saf", name_german: "Die Reihe", name_english: "The Ranks", name_arabic: "الصف", verses_count: 14 },
  { id: 62, name_simple: "Al-Jumu'ah", name_german: "Der Freitag", name_english: "The Congregation, Friday", name_arabic: "الجمعة", verses_count: 11 },
  { id: 63, name_simple: "Al-Munafiqun", name_german: "Die Heuchler", name_english: "The Hypocrites", name_arabic: "المنافقون", verses_count: 11 },
  { id: 64, name_simple: "At-Taghabun", name_german: "Die gegenseitige Täuschung", name_english: "The Mutual Disillusion", name_arabic: "التغابن", verses_count: 18 },
  { id: 65, name_simple: "At-Talaq", name_german: "Die Scheidung", name_english: "The Divorce", name_arabic: "الطلاق", verses_count: 12 },
  { id: 66, name_simple: "At-Tahrim", name_german: "Das Verbot", name_english: "The Prohibition", name_arabic: "التحريم", verses_count: 12 },
  { id: 67, name_simple: "Al-Mulk", name_german: "Die Herrschaft", name_english: "The Sovereignty", name_arabic: "الملك", verses_count: 30 },
  { id: 68, name_simple: "Al-Qalam", name_german: "Die Schreibfeder", name_english: "The Pen", name_arabic: "القلم", verses_count: 52 },
  { id: 69, name_simple: "Al-Haqqah", name_german: "Die Unausweichliche", name_english: "The Reality", name_arabic: "الحاقة", verses_count: 52 },
  { id: 70, name_simple: "Al-Ma'arij", name_german: "Die Aufstiegswege", name_english: "The Ascending Stairways", name_arabic: "المعارج", verses_count: 44 },
  { id: 71, name_simple: "Nuh", name_german: "Noah", name_english: "Noah", name_arabic: "نوح", verses_count: 28 },
  { id: 72, name_simple: "Al-Jinn", name_german: "Die Dschinnen", name_english: "The Jinn", name_arabic: "الجن", verses_count: 28 },
  { id: 73, name_simple: "Al-Muzzammil", name_german: "Der Eingehüllte", name_english: "The Enshrouded One", name_arabic: "المزمل", verses_count: 20 },
  { id: 74, name_simple: "Al-Muddaththir", name_german: "Der Zugedeckte", name_english: "The Cloaked One", name_arabic: "المدثر", verses_count: 56 },
  { id: 75, name_simple: "Al-Qiyamah", name_german: "Die Auferstehung", name_english: "The Resurrection", name_arabic: "القيامة", verses_count: 40 },
  { id: 76, name_simple: "Al-Insan", name_german: "Der Mensch", name_english: "The Man", name_arabic: "الإنسان", verses_count: 31 },
  { id: 77, name_simple: "Al-Mursalat", name_german: "Die Gesandten", name_english: "The Emissaries", name_arabic: "المرسلات", verses_count: 50 },
  { id: 78, name_simple: "An-Naba", name_german: "Die Nachricht", name_english: "The Tidings", name_arabic: "النبأ", verses_count: 40 },
  { id: 79, name_simple: "An-Nazi'at", name_german: "Die Ausreißenden", name_english: "Those Who Drag Forth", name_arabic: "النازعات", verses_count: 46 },
  { id: 80, name_simple: "Abasa", name_german: "Er runzelte die Stirn", name_english: "He Frowned", name_arabic: "عبس", verses_count: 42 },
  { id: 81, name_simple: "At-Takwir", name_german: "Das Einrollen", name_english: "The Overthrowing", name_arabic: "التكوير", verses_count: 29 },
  { id: 82, name_simple: "Al-Infitar", name_german: "Das Zerreißen", name_english: "The Cleaving", name_arabic: "الانفطار", verses_count: 19 },
  { id: 83, name_simple: "Al-Mutaffifin", name_german: "Die Betrüger", name_english: "The Defrauding", name_arabic: "المطففين", verses_count: 36 },
  { id: 84, name_simple: "Al-Inshiqaq", name_german: "Das Aufspalten", name_english: "The Sundering", name_arabic: "الانشقاق", verses_count: 25 },
  { id: 85, name_simple: "Al-Buruj", name_german: "Die Sternbilder", name_english: "The Mansions of the Stars", name_arabic: "البروج", verses_count: 22 },
  { id: 86, name_simple: "At-Tariq", name_german: "Der Morgenstern", name_english: "The Nightcommer", name_arabic: "الطارق", verses_count: 17 },
  { id: 87, name_simple: "Al-Ala", name_german: "Der Erhabenste", name_english: "The Most High", name_arabic: "الأعلى", verses_count: 19 },
  { id: 88, name_simple: "Al-Ghashiyah", name_german: "Die Überwältigende", name_english: "The Overwhelming", name_arabic: "الغاشية", verses_count: 26 },
  { id: 89, name_simple: "Al-Fajr", name_german: "Die Morgendämmerung", name_english: "The Dawn", name_arabic: "الفجر", verses_count: 30 },
  { id: 90, name_simple: "Al-Balad", name_german: "Die Stadt", name_english: "The City", name_arabic: "البلد", verses_count: 20 },
  { id: 91, name_simple: "Ash-Shams", name_german: "Die Sonne", name_english: "The Sun", name_arabic: "الشمس", verses_count: 15 },
  { id: 92, name_simple: "Al-Layl", name_german: "Die Nacht", name_english: "The Night", name_arabic: "الليل", verses_count: 21 },
  { id: 93, name_simple: "Ad-Duha", name_german: "Der Vormittag", name_english: "The Morning Hours", name_arabic: "الضحى", verses_count: 11 },
  { id: 94, name_simple: "Ash-Sharh", name_german: "Die Öffnung", name_english: "The Relief", name_arabic: "الشرح", verses_count: 8 },
  { id: 95, name_simple: "At-Tin", name_german: "Die Feige", name_english: "The Fig", name_arabic: "التين", verses_count: 8 },
  { id: 96, name_simple: "Al-Alaq", name_german: "Der Blutklumpen", name_english: "The Clot", name_arabic: "العلق", verses_count: 19 },
  { id: 97, name_simple: "Al-Qadr", name_german: "Die Bestimmung", name_english: "The Power", name_arabic: "القدر", verses_count: 5 },
  { id: 98, name_simple: "Al-Bayyinah", name_german: "Der klare Beweis", name_english: "The Clear Proof", name_arabic: "البينة", verses_count: 8 },
  { id: 99, name_simple: "Az-Zalzalah", name_german: "Das Erdbeben", name_english: "The Earthquake", name_arabic: "الزلزلة", verses_count: 8 },
  { id: 100, name_simple: "Al-Adiyat", name_german: "Die Rennenden", name_english: "The Courser", name_arabic: "العاديات", verses_count: 11 },
  { id: 101, name_simple: "Al-Qari'ah", name_german: "Der Aufprall", name_english: "The Calamity", name_arabic: "القارعة", verses_count: 11 },
  { id: 102, name_simple: "At-Takathur", name_german: "Das Anhäufen", name_english: "The Rivalry in World Increase", name_arabic: "التكاثر", verses_count: 8 },
  { id: 103, name_simple: "Al-Asr", name_german: "Die Zeit", name_english: "The Declining Day", name_arabic: "العصر", verses_count: 3 },
  { id: 104, name_simple: "Al-Humazah", name_german: "Der Verleumder", name_english: "The Traducer", name_arabic: "الهمزة", verses_count: 9 },
  { id: 105, name_simple: "Al-Fil", name_german: "Der Elefant", name_english: "The Elephant", name_arabic: "الفيل", verses_count: 5 },
  { id: 106, name_simple: "Quraysh", name_german: "Quraysh", name_english: "Quraysh", name_arabic: "قريش", verses_count: 4 },
  { id: 107, name_simple: "Al-Ma'un", name_german: "Die Hilfsleistung", name_english: "The Small Kindnesses", name_arabic: "الماعون", verses_count: 7 },
  { id: 108, name_simple: "Al-Kawthar", name_german: "Der Überfluss", name_english: "The Abundance", name_arabic: "الكوثر", verses_count: 3 },
  { id: 109, name_simple: "Al-Kafirun", name_german: "Die Ungläubigen", name_english: "The Disbelievers", name_arabic: "الكافرون", verses_count: 6 },
  { id: 110, name_simple: "An-Nasr", name_german: "Der Beistand", name_english: "The Divine Support", name_arabic: "النصر", verses_count: 3 },
  { id: 111, name_simple: "Al-Masad", name_german: "Die Palmfaser", name_english: "The Palm Fibre", name_arabic: "المسد", verses_count: 5 },
  { id: 112, name_simple: "Al-Ikhlas", name_german: "Die Aufrichtigkeit", name_english: "Sincerity", name_arabic: "الإخلاص", verses_count: 4 },
  { id: 113, name_simple: "Al-Falaq", name_german: "Der Morgengrauen", name_english: "The Daybreak", name_arabic: "الفلق", verses_count: 5 },
  { id: 114, name_simple: "An-Nas", name_german: "Die Menschen", name_english: "Mankind", name_arabic: "الناس", verses_count: 6 },
];
