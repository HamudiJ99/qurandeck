import type { QuranVerse, SurahInfo } from "@/types";

const BASE_URL = "https://api.quran.com/api/v4";

export async function fetchVersesByChapter(
  surah: number,
  page: number = 1
): Promise<{ verses: QuranVerse[]; pagination: { total_pages: number; current_page: number } }> {
  const params = new URLSearchParams({
    language: "de",
    words: "true",
    translations: "27", // German translation: Frank Bubenheim & Nadeem
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

export async function fetchAllVersesByChapter(surah: number): Promise<QuranVerse[]> {
  const allVerses: QuranVerse[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchVersesByChapter(surah, page);
    allVerses.push(...data.verses);
    totalPages = data.pagination.total_pages;
    page++;
  }

  return allVerses;
}

export async function fetchSurahInfo(surah: number): Promise<SurahInfo> {
  const res = await fetch(`${BASE_URL}/chapters/${surah}?language=de`, {
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

export async function fetchWordTimestamps(
  verseKey: string
): Promise<{ segments: number[][] }> {
  // Word timestamps from the recitation timing API
  const res = await fetch(
    `${BASE_URL}/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) throw new Error("Failed to fetch word timestamps");
  return res.json();
}

export const AVAILABLE_SURAHS = [
  { id: 1, name_simple: "Al-Fatiha", name_german: "Die Eröffnung", name_arabic: "الفاتحة", verses_count: 7 },
  { id: 2, name_simple: "Al-Baqarah", name_german: "Die Kuh", name_arabic: "البقرة", verses_count: 286 },
];
