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
  "vocab.filterBySurah": { de: "Nach Sure filtern", en: "Filter by Surah" },
  "vocab.allSurahs": { de: "Alle Suren", en: "All Surahs" },
  "vocab.ayah": { de: "Ayah", en: "Ayah" },
  "vocab.remove": { de: "Entfernen", en: "Remove" },
  "vocab.resetStars": { de: "Auf 0 Sterne zurücksetzen", en: "Reset to 0 stars" },
  "vocab.filterByStars": { de: "Nach Sternen filtern", en: "Filter by stars" },
  "vocab.stars0": { de: "0★ (Keine Sterne)", en: "0★ (No Stars)" },
  "vocab.stars1": { de: "1★", en: "1★" },
  "vocab.stars2": { de: "2★", en: "2★" },
  "vocab.stars3": { de: "3★ (Gelernt)", en: "3★ (Learned)" },
  "vocab.selectMode": { de: "Auswählen", en: "Select" },
  "vocab.cancelSelection": { de: "Abbrechen", en: "Cancel" },
  "vocab.selectedCount": { de: "{count} ausgewählt", en: "{count} selected" },
  "vocab.deleteSelected": { de: "Löschen", en: "Delete" },
  "vocab.resetSelected": { de: "Auf 0★ zurücksetzen", en: "Reset to 0★" },
  "vocab.selectAll": { de: "Alle auswählen", en: "Select all" },
  "vocab.deselectAll": { de: "Alle abwählen", en: "Deselect all" },

  // Practice / Flashcard page
  "practice.title": { de: "Karteikarten-Übung", en: "Flashcard Practice" },
  "practice.subtitle": {
    de: "Wiederhole deine gespeicherten Vokabeln mit Karteikarten.",
    en: "Review your saved vocabulary with flashcards.",
  },
  "practice.resetKnown": { de: "Alle gelernten zurücksetzen", en: "Reset all learned" },
  "practice.resetting": { de: "Wird zurückgesetzt...", en: "Resetting..." },
  "practice.confirmReset": { de: "Zurücksetzen bestätigen", en: "Confirm Reset" },
  "practice.resetWarning": {
    de: "Alle Karten mit 3 Sternen werden zurückgesetzt. Sie erscheinen wieder zum Üben.",
    en: "All cards with 3 stars will be reset. They will appear again for practice.",
  },
  "practice.cancel": { de: "Abbrechen", en: "Cancel" },
  "practice.confirm": { de: "Bestätigen", en: "Confirm" },
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

  // Range Audio Player
  "range.title": { de: "Abschnitt abspielen", en: "Play Section" },
  "range.from": { de: "Von Vers", en: "From Verse" },
  "range.to": { de: "Bis Vers", en: "To Verse" },
  "range.sectionRepeat": { de: "Abschnitt wiederholen", en: "Repeat Section" },
  "range.verseRepeat": { de: "Vers wiederholen", en: "Repeat Verse" },
  "range.times": { de: "mal", en: "times" },
  "range.play": { de: "Abspielen", en: "Play" },
  "range.pause": { de: "Pause", en: "Pause" },
  "range.resume": { de: "Fortsetzen", en: "Resume" },
  "range.paused": { de: "Pausiert", en: "Paused" },
  "range.stop": { de: "Stoppen", en: "Stop" },
  "range.close": { de: "Schließen", en: "Close" },
  "range.currentVerse": { de: "Aktueller Vers", en: "Current Verse" },
  "range.sectionLoop": { de: "Durchlauf", en: "Loop" },
  "range.verseLoop": { de: "Wiederholung", en: "Repeat" },
  "range.loading": { de: "Laden...", en: "Loading..." },

  // Auth
  "auth.login": { de: "Anmelden", en: "Sign In" },
  "auth.register": { de: "Registrieren", en: "Sign Up" },
  "auth.logout": { de: "Ausloggen", en: "Sign Out" },
  "auth.email": { de: "E-Mail", en: "Email" },
  "auth.password": { de: "Passwort", en: "Password" },
  "auth.confirmPassword": { de: "Passwort bestätigen", en: "Confirm Password" },
  "auth.displayName": { de: "Anzeigename", en: "Display Name" },
  "auth.noAccount": { de: "Noch kein Konto?", en: "Don't have an account?" },
  "auth.hasAccount": { de: "Bereits ein Konto?", en: "Already have an account?" },
  "auth.registerHere": { de: "Registrieren", en: "Sign Up" },
  "auth.loginHere": { de: "Anmelden", en: "Sign In" },
  "auth.loginSubtitle": {
    de: "Melde dich an, um deine Vokabeln und Lernfortschritte zu speichern.",
    en: "Sign in to save your vocabulary and learning progress.",
  },
  "auth.registerSubtitle": {
    de: "Erstelle ein Konto, um mit dem Lernen zu beginnen.",
    en: "Create an account to start learning.",
  },
  "auth.passwordMismatch": { de: "Passwörter stimmen nicht überein.", en: "Passwords do not match." },
  "auth.errorWeakPassword": { de: "Das Passwort muss mindestens 6 Zeichen lang sein.", en: "Password must be at least 6 characters." },
  "auth.errorEmailInUse": { de: "Diese E-Mail-Adresse wird bereits verwendet.", en: "This email is already in use." },
  "auth.errorInvalidEmail": { de: "Ungültige E-Mail-Adresse.", en: "Invalid email address." },
  "auth.errorWrongPassword": { de: "Falsches Passwort.", en: "Incorrect password." },
  "auth.errorUserNotFound": { de: "Kein Konto mit dieser E-Mail gefunden.", en: "No account found with this email." },
  "auth.errorGeneric": { de: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.", en: "An error occurred. Please try again." },
  "auth.googleSignIn": { de: "Mit Google anmelden", en: "Sign in with Google" },
  "auth.orContinueWith": { de: "Oder fortfahren mit", en: "Or continue with" },

  // Forgot password
  "auth.forgotPassword": { de: "Passwort vergessen", en: "Forgot Password" },
  "auth.forgotPasswordSubtitle": {
    de: "Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen.",
    en: "Enter your email address. We'll send you a reset link.",
  },
  "auth.sendResetEmail": { de: "Reset-Link senden", en: "Send Reset Link" },
  "auth.resetEmailSent": { de: "E-Mail gesendet!", en: "Email sent!" },
  "auth.resetEmailSentDesc": {
    de: "Bitte prüfe dein Postfach und klicke auf den Link in der E-Mail.",
    en: "Please check your inbox and click the link in the email.",
  },
  "auth.backToLogin": { de: "Zurück zur Anmeldung", en: "Back to Sign In" },

  // Email verification
  "auth.checkYourEmail": { de: "E-Mail bestätigen", en: "Confirm Your Email" },
  "auth.verificationSentDesc": {
    de: "Wir haben eine Bestätigungs-E-Mail an folgende Adresse gesendet:",
    en: "We sent a verification email to:",
  },
  "auth.continueToApp": { de: "Zur App", en: "Continue to App" },
  "auth.verifyLater": {
    de: "Du kannst die App auch sofort nutzen und deine E-Mail später bestätigen.",
    en: "You can use the app right away and verify your email later.",
  },
  "auth.verifyEmailBanner": {
    de: "Bitte bestätige deine E-Mail-Adresse.",
    en: "Please verify your email address.",
  },
  "auth.resendEmail": { de: "E-Mail erneut senden", en: "Resend Email" },
  "auth.verificationResent": {
    de: "Bestätigungs-E-Mail wurde erneut gesendet!",
    en: "Verification email resent!",
  },

  // Profile
  "profile.title": { de: "Profil", en: "Profile" },
  "profile.changePhoto": { de: "Profilbild ändern", en: "Change Profile Photo" },
  "profile.displayName": { de: "Anzeigename", en: "Display Name" },
  "profile.name": { de: "Name", en: "Name" },
  "profile.saveProfile": { de: "Profil speichern", en: "Save Profile" },
  "profile.saved": { de: "Gespeichert!", en: "Saved!" },
  "profile.changePassword": { de: "Passwort ändern", en: "Change Password" },
  "profile.changePasswordDesc": {
    de: "Aus Sicherheitsgründen ist die Eingabe des aktuellen Passworts notwendig.",
    en: "For security reasons, your current password is required.",
  },
  "profile.currentPassword": { de: "Aktuelles Passwort", en: "Current Password" },
  "profile.newPassword": { de: "Neues Passwort", en: "New Password" },
  "profile.savePassword": { de: "Passwort speichern", en: "Save Password" },
  "profile.passwordChanged": { de: "Passwort geändert!", en: "Password changed!" },
  "profile.deleteAccount": { de: "Account löschen", en: "Delete Account" },
  "profile.deleteAccountDesc": {
    de: "Diese Aktion kann nicht rückgängig gemacht werden. Dein Konto wird dauerhaft entfernt.",
    en: "This action cannot be undone. Your account will be permanently deleted.",
  },
  "profile.deleteAccountBtn": { de: "Account endgültig löschen", en: "Delete Account Permanently" },
  "profile.deleteConfirm": {
    de: "Gib dein Passwort ein, um die Löschung zu bestätigen.",
    en: "Enter your password to confirm deletion.",
  },
  "profile.deleteConfirmNoPassword": {
    de: "Bist du sicher, dass du deinen Account unwiderruflich löschen möchtest?",
    en: "Are you sure you want to permanently delete your account?",
  },

  // Settings
  "settings.title": { de: "Einstellungen", en: "Settings" },
  "settings.language": { de: "Sprache", en: "Language" },
  "settings.languageDesc": {
    de: "Wähle die Anzeigesprache der App.",
    en: "Choose the display language of the app.",
  },
  "settings.german": { de: "Deutsch", en: "German" },
  "settings.english": { de: "Englisch", en: "English" },
  "settings.theme": { de: "Erscheinungsbild", en: "Appearance" },
  "settings.themeDesc": { de: "Wähle das Farbschema der App.", en: "Choose the color scheme of the app." },
  "settings.light": { de: "Hell", en: "Light" },
  "settings.dark": { de: "Dunkel", en: "Dark" },
  "settings.mocha": { de: "Mocha Mousse", en: "Mocha Mousse" },

  // User menu
  "menu.profile": { de: "Profil", en: "Profile" },
  "menu.settings": { de: "Einstellungen", en: "Settings" },
  "menu.notes": { de: "Notizen", en: "Notes" },
  "menu.darkMode": { de: "Dark Mode", en: "Dark Mode" },
  "menu.lightMode": { de: "Light Mode", en: "Light Mode" },

  // Footer
  "footer.rights": { de: "© 2026 QuranDeck. Alle Rechte vorbehalten.", en: "© 2026 QuranDeck. All rights reserved." },
  "footer.imprint": { de: "Impressum", en: "Imprint" },
  "footer.privacy": { de: "Datenschutz", en: "Privacy Policy" },
  "footer.terms": { de: "AGB", en: "Terms of Service" },
  "footer.cookies": { de: "Cookie-Einstellungen", en: "Cookie Settings" },

  // Cookie Banner
  "cookie.title": { de: "Cookie-Einstellungen", en: "Cookie Settings" },
  "cookie.description": {
    de: "Wir verwenden Cookies und ähnliche Technologien, um die Funktionalität unserer Website sicherzustellen und dein Nutzungserlebnis zu verbessern. Mehr dazu in unserer",
    en: "We use cookies and similar technologies to ensure the functionality of our website and improve your experience. Learn more in our",
  },
  "cookie.moreInfo": { de: "und in den", en: "and in the" },
  "cookie.settings": { de: "Cookie-Einstellungen", en: "Cookie Settings" },
  "cookie.acceptAll": { de: "Alle akzeptieren", en: "Accept All" },
  "cookie.necessaryOnly": { de: "Nur notwendige", en: "Necessary Only" },
  "cookie.customize": { de: "Anpassen", en: "Customize" },
  "cookie.save": { de: "Einstellungen speichern", en: "Save Settings" },
  "cookie.necessary": { de: "Notwendig", en: "Necessary" },
  "cookie.necessaryDesc": {
    de: "Diese Cookies sind für den Betrieb der Website unerlässlich und können nicht deaktiviert werden. Sie ermöglichen grundlegende Funktionen wie Seitennavigation und Spracheinstellungen.",
    en: "These cookies are essential for the website to function and cannot be disabled. They enable basic functions such as page navigation and language settings.",
  },
  "cookie.functional": { de: "Funktional", en: "Functional" },
  "cookie.functionalDesc": {
    de: "Diese Cookies ermöglichen erweiterte Funktionen wie Benutzeranmeldung, Speicherung deiner Vokabeln und Lernfortschritte. Ohne diese Cookies kannst du die App nur eingeschränkt nutzen.",
    en: "These cookies enable advanced features such as user login, saving your vocabulary and learning progress. Without these cookies, you can only use the app with limited functionality.",
  },
  "cookie.analytics": { de: "Analyse", en: "Analytics" },
  "cookie.analyticsDesc": {
    de: "Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren. Alle Daten werden anonymisiert erfasst.",
    en: "These cookies help us understand how visitors interact with the website. All data is collected anonymously.",
  },
  "cookie.pageTitle": { de: "Cookie-Einstellungen", en: "Cookie Settings" },
  "cookie.pageSubtitle": {
    de: "Hier kannst du deine Cookie-Präferenzen anpassen. Einige Cookies sind für den Betrieb der Website notwendig und können nicht deaktiviert werden.",
    en: "Here you can customize your cookie preferences. Some cookies are necessary for the website to function and cannot be disabled.",
  },
  "cookie.alwaysActive": { de: "Immer aktiv", en: "Always active" },

  // Notes
  "notes.title": { de: "Notizen", en: "Notes" },
  "notes.subtitle": {
    de: "Deine Notizen zu Quran-Versen.",
    en: "Your notes on Quran verses.",
  },
  "notes.add": { de: "Notiz hinzufügen", en: "Add Note" },
  "notes.edit": { de: "Notiz bearbeiten", en: "Edit Note" },
  "notes.save": { de: "Speichern", en: "Save" },
  "notes.saved": { de: "Notiz gespeichert!", en: "Note saved!" },
  "notes.cancel": { de: "Abbrechen", en: "Cancel" },
  "notes.delete": { de: "Löschen", en: "Delete" },
  "notes.deleteConfirm": {
    de: "Möchtest du diese Notiz wirklich löschen?",
    en: "Do you really want to delete this note?",
  },
  "notes.deleted": { de: "Notiz gelöscht.", en: "Note deleted." },
  "notes.empty": {
    de: "Noch keine Notizen vorhanden. Klicke beim Quran-Lesen auf das Notiz-Symbol, um eine Notiz zu einem Vers hinzuzufügen.",
    en: "No notes yet. Click the note icon while reading the Quran to add a note to a verse.",
  },
  "notes.placeholder": {
    de: "Schreibe deine Gedanken oder Reflexion zu diesem Vers...",
    en: "Write your thoughts or reflection on this verse...",
  },
  "notes.sortNewest": { de: "Neueste zuerst", en: "Newest first" },
  "notes.sortOldest": { de: "Älteste zuerst", en: "Oldest first" },
  "notes.verse": { de: "Vers", en: "Verse" },
  "notes.filterBySurah": { de: "Nach Sure filtern", en: "Filter by Surah" },
  "notes.allSurahs": { de: "Alle Suren", en: "All Surahs" },
} as const;

export type TranslationKey = keyof typeof translations;
