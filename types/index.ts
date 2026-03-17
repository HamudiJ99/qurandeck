export interface QuranWord {
  id: number;
  position: number;
  audio_url: string | null;
  text_uthmani: string;
  translation: {
    text: string;
    language_name: string;
  };
  transliteration: {
    text: string;
  };
  timing?: {
    timestamp_from: number;
    timestamp_to: number;
  };
}

export interface QuranVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  words: QuranWord[];
  translations?: {
    id: number;
    text: string;
    resource_name: string;
  }[];
  audio?: {
    url: string;
  };
}

export interface SurahInfo {
  id: number;
  name_arabic: string;
  name_simple: string;
  revelation_place: string;
  verses_count: number;
}

export interface VocabularyEntry {
  id?: string;
  userId: string;
  arabicWord: string;
  translation: string;
  surah: number;
  ayah: number;
  status: "new" | "learning" | "known";
  createdAt: number;
}

export interface AudioTimestamp {
  word_position: number;
  timestamp_from: number;
  timestamp_to: number;
}
