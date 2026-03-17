import SurahList from "@/components/SurahList";

export const metadata = {
  title: "Quran lesen - QuranDeck",
  description: "Den Quran lesen und lernen mit Wort-für-Wort Übersetzung",
};

export default function QuranPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Quran lesen</h1>
      <p className="mb-8 text-muted-foreground">
        Wähle eine Sure aus. Klicke auf ein arabisches Wort, um es in deinen Vokabeln zu speichern.
      </p>
      <SurahList />
    </div>
  );
}
