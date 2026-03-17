"use client";

import type { QuranWord } from "@/types";

interface WordProps {
  word: QuranWord;
  isHighlighted: boolean;
  onClick: (word: QuranWord) => void;
}

export default function Word({ word, isHighlighted, onClick }: WordProps) {
  // Skip "end" type words (verse number markers)
  if (word.text_uthmani === undefined) return null;

  return (
    <span
      onClick={() => onClick(word)}
      className={`inline-block cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-primary/10 ${
        isHighlighted ? "highlight" : ""
      }`}
      title={word.translation?.text || ""}
    >
      {word.text_uthmani}
    </span>
  );
}
