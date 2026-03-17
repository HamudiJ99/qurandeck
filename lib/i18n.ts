export type Language = "de" | "en";

export const translations = {
  // Navbar
  "nav.quran": { de: "Quran", en: "Quran" },
  "nav.vocabulary": { de: "Vokabeln", en: "Vocabulary" },
  "nav.practice": { de: "Übung", en: "Practice" },

  // Homepage
  "home.title": { de: "QuranDeck", en: "QuranDeck" },
  "home.subtitle": {
    de: "Lies den Quran mit Wort-für-Wort Übersetzung, speichere Vokabeln und übe mit Karteikarten.",
    en: "Read the Quran with word-by-word translation, save vocabulary, and practice with flashcards.",
  },
  "home.startReading": { de: "Lesen starten", en: "Start Reading" },
  "home.practiceCards": { de: "Karteikarten üben", en: "Practice Flashcards" },
  "home.availableSurahs": { de: "Verfügbare Suren", en: "Available Surahs" },
  "home.verses": { de: "Verse", en: "Verses" },
  "home.wordByWord": { de: "Wort-für-Wort", en: "Word by Word" },
  "home.wordByWordDesc": {
    de: "Klicke auf jedes arabische Wort, um die Übersetzung zu sehen und es zu speichern.",
    en: "Click on each Arabic word to see its translation and save it.",
  },
  "home.audioPlayback": { de: "Audio-Wiedergabe", en: "Audio Playback" },
  "home.audioPlaybackDesc": {
    de: "Höre jeden Vers mit Wort-Hervorhebung an.",
    en: "Listen to each verse with word highlighting.",
  },
  "home.flashcards": { de: "Karteikarten", en: "Flashcards" },
  "home.flashcardsDesc": {
    de: "Übe deine gespeicherten Vokabeln mit Karteikarten.",
    en: "Practice your saved vocabulary with flashcards.",
  },

  // Quran page
  "quran.title": { de: "Quran lesen", en: "Read Quran" },
  "quran.subtitle": {
    de: "Wähle eine Sure aus. Klicke auf ein arabisches Wort, um es in deinen Vokabeln zu speichern.",
    en: "Choose a surah. Click an Arabic word to save it to your vocabulary.",
  },

  // Surah reader
  "surah.verses": { de: "Verse", en: "Verses" },
  "surah.stop": { de: "Stoppen", en: "Stop" },
  "surah.playAll": { de: "Gesamte Sure abspielen", en: "Play Entire Surah" },
  "surah.saved": { de: "gespeichert", en: "saved" },

  // Verse buttons
  "verse.stop": { de: "Stopp", en: "Stop" },

  // Vocabulary page
  "vocab.title": { de: "Meine Vokabeln", en: "My Vocabulary" },
  "vocab.subtitle": {
    de: "Wörter, die du beim Quran-Lesen gespeichert hast. Verfolge deinen Lernfortschritt.",
    en: "Words you saved while reading the Quran. Track your learning progress.",
  },
  "vocab.all": { de: "Alle", en: "All" },
  "vocab.new": { de: "Neu", en: "New" },
  "vocab.learning": { de: "Lernend", en: "Learning" },
  "vocab.known": { de: "Gelernt", en: "Known" },
  "vocab.empty": {
    de: "Noch keine Vokabeln gespeichert. Klicke auf arabische Wörter beim Quran-Lesen, um sie zu speichern.",
    en: "No vocabulary saved yet. Click on Arabic words while reading the Quran to save them.",
  },
  "vocab.noFilter": { de: "Keine Wörter mit diesem Filter.", en: "No words with this filter." },
  "vocab.surah": { de: "Sure", en: "Surah" },
  "vocab.ayah": { de: "Ayah", en: "Ayah" },
  "vocab.remove": { de: "Entfernen", en: "Remove" },

  // Practice / Flashcard page
  "practice.title": { de: "Karteikarten-Übung", en: "Flashcard Practice" },
  "practice.subtitle": {
    de: "Wiederhole deine gespeicherten Vokabeln mit Karteikarten.",
    en: "Review your saved vocabulary with flashcards.",
  },
  "flash.card": { de: "Karte", en: "Card" },
  "flash.of": { de: "von", en: "of" },
  "flash.learned": { de: "gelernt", en: "learned" },
  "flash.tapToSee": { de: "Tippe, um die Übersetzung zu sehen", en: "Tap to see the translation" },
  "flash.stillLearning": { de: "Noch lernen", en: "Still Learning" },
  "flash.skip": { de: "Überspringen", en: "Skip" },
  "flash.know": { de: "Kann ich", en: "I Know" },
  "flash.empty": {
    de: "Noch keine Vokabeln zum Üben vorhanden.",
    en: "No vocabulary to practice yet.",
  },
  "flash.emptyHint": {
    de: "Gehe zum Quran-Reader und klicke auf arabische Wörter, um sie zu speichern.",
    en: "Go to the Quran reader and click on Arabic words to save them.",
  },
  "flash.done": { de: "Alle Karten durchgearbeitet!", en: "All cards completed!" },
  "flash.again": { de: "Nochmal üben", en: "Practice Again" },

  // Theme toggle
  "theme.dark": { de: "Dunkelmodus", en: "Dark Mode" },
  "theme.light": { de: "Hellmodus", en: "Light Mode" },
  "theme.activateDark": { de: "Dunkelmodus aktivieren", en: "Activate Dark Mode" },
  "theme.activateLight": { de: "Hellmodus aktivieren", en: "Activate Light Mode" },

  // Language toggle
  "lang.switch": { de: "English", en: "Deutsch" },
} as const;

export type TranslationKey = keyof typeof translations;
