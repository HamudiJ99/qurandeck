import { notFound } from "next/navigation";
import { fetchAllVersesByChapter, fetchSurahInfo, AVAILABLE_SURAHS } from "@/lib/quranApi";
import SurahClient from "./SurahClient";

interface PageProps {
  params: Promise<{ surah: string }>;
}

export async function generateStaticParams() {
  return AVAILABLE_SURAHS.map((s) => ({ surah: s.id.toString() }));
}

export async function generateMetadata({ params }: PageProps) {
  const { surah } = await params;
  const surahId = parseInt(surah, 10);
  const available = AVAILABLE_SURAHS.find((s) => s.id === surahId);
  if (!available) return { title: "Nicht gefunden" };
  return {
    title: `${available.name_simple} (${available.name_german}) - QuranDeck`,
    description: `Sure ${available.name_simple} mit deutscher Übersetzung lesen`,
  };
}

export default async function SurahPage({ params }: PageProps) {
  const { surah } = await params;
  const surahId = parseInt(surah, 10);

  // Only allow surah 1 and 2
  if (!AVAILABLE_SURAHS.find((s) => s.id === surahId)) {
    notFound();
  }

  const [verses, surahInfo] = await Promise.all([
    fetchAllVersesByChapter(surahId),
    fetchSurahInfo(surahId),
  ]);

  return (
    <SurahClient
      verses={verses}
      surahId={surahId}
      surahName={surahInfo.name_arabic}
    />
  );
}
