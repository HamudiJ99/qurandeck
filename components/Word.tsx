"use client";

import type { QuranWord } from "@/types";
import { translateToGerman } from "@/lib/wordDictionary";
import { useLanguage } from "@/lib/LanguageContext";

interface WordProps {
  word: QuranWord;
  isHighlighted: boolean;
  onClick: (word: QuranWord) => void;
}

export default function Word({ word, isHighlighted, onClick }: WordProps) {
  const { lang } = useLanguage();
  // Skip "end" type words (verse number markers)
  if (word.text_uthmani === undefined) return null;

  const englishText = word.translation?.text || "";
  const tooltipText = lang === "de" ? translateToGerman(englishText) : englishText;

  return (
    <span
      onClick={() => onClick(word)}
      className={`inline-block cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-primary/10 ${
        isHighlighted ? "highlight" : ""
      }`}
      title={tooltipText}
    >
      {word.text_uthmani}
    </span>
  );
}
