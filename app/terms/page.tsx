"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function TermsPage() {
  const { lang } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">
        {lang === "de" ? "Allgemeine Geschäftsbedingungen" : "Terms of Service"}
      </h1>
      
      <div className="space-y-8 text-foreground">
        {lang === "de" ? (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold">1. Geltungsbereich</h2>
              <p className="text-muted-foreground">
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Website QuranDeck und 
                aller angebotenen Dienste. Mit der Nutzung der Website erklären Sie sich mit diesen AGB einverstanden.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">2. Leistungsbeschreibung</h2>
              <p className="text-muted-foreground">
                QuranDeck ist eine kostenlose Lernplattform zum Studium des Qurans mit Wort-für-Wort-Übersetzung, 
                Vokabeltrainer und Karteikarten-Funktion. Wir behalten uns das Recht vor, die angebotenen Dienste 
                jederzeit zu ändern oder einzustellen.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">3. Nutzerkonto</h2>
              <p className="mb-2 text-muted-foreground">
                Für die Nutzung bestimmter Funktionen ist die Erstellung eines Nutzerkontos erforderlich. Sie 
                verpflichten sich, bei der Registrierung wahrheitsgemäße Angaben zu machen und Ihre Zugangsdaten 
                geheim zu halten.
              </p>
              <p className="text-muted-foreground">
                Sie sind für alle Aktivitäten verantwortlich, die unter Ihrem Nutzerkonto stattfinden. Bei Verdacht 
                auf unbefugten Zugriff informieren Sie uns bitte umgehend.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">4. Geistiges Eigentum</h2>
              <p className="mb-2 text-muted-foreground">
                Alle Inhalte dieser Website, einschließlich Texte, Grafiken, Logos und Software, sind urheberrechtlich 
                geschützt. Die Nutzung der Inhalte ist ausschließlich für private, nicht-kommerzielle Zwecke gestattet.
              </p>
              <p className="text-muted-foreground">
                Der arabische Quran-Text stammt aus öffentlich zugänglichen Quellen. Die Übersetzungen und didaktischen 
                Aufbereitungen unterliegen dem Urheberrecht des Plattformbetreibers.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">5. Haftungsausschluss</h2>
              <p className="mb-2 text-muted-foreground">
                Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Wir übernehmen jedoch keine 
                Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte.
              </p>
              <p className="text-muted-foreground">
                Die Nutzung der Website erfolgt auf eigene Gefahr. Wir haften nicht für Schäden, die durch die 
                Nutzung oder Nichtnutzung der angebotenen Informationen entstehen.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">6. Änderungen der AGB</h2>
              <p className="text-muted-foreground">
                Wir behalten uns vor, diese AGB jederzeit zu ändern. Die aktuelle Version ist stets auf dieser Seite 
                einsehbar. Bei wesentlichen Änderungen werden registrierte Nutzer per E-Mail informiert.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">7. Schlussbestimmungen</h2>
              <p className="text-muted-foreground">
                Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Sollten einzelne Bestimmungen dieser AGB 
                unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Stand: März 2026
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold">1. Scope of Application</h2>
              <p className="text-muted-foreground">
                These Terms of Service (ToS) apply to the use of the QuranDeck website and all services offered. 
                By using the website, you agree to these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">2. Description of Services</h2>
              <p className="text-muted-foreground">
                QuranDeck is a free learning platform for studying the Quran with word-by-word translation, 
                vocabulary trainer, and flashcard function. We reserve the right to change or discontinue the 
                services offered at any time.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">3. User Account</h2>
              <p className="mb-2 text-muted-foreground">
                Creating a user account is required to use certain features. You agree to provide truthful 
                information during registration and to keep your access credentials confidential.
              </p>
              <p className="text-muted-foreground">
                You are responsible for all activities that take place under your user account. If you suspect 
                unauthorized access, please inform us immediately.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">4. Intellectual Property</h2>
              <p className="mb-2 text-muted-foreground">
                All content on this website, including text, graphics, logos, and software, is protected by copyright. 
                Use of the content is permitted exclusively for private, non-commercial purposes.
              </p>
              <p className="text-muted-foreground">
                The Arabic Quran text comes from publicly available sources. The translations and didactic preparations 
                are subject to the platform operator's copyright.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">5. Disclaimer</h2>
              <p className="mb-2 text-muted-foreground">
                The content of this website has been created with the utmost care. However, we assume no liability 
                for the accuracy, completeness, and timeliness of the content.
              </p>
              <p className="text-muted-foreground">
                Use of the website is at your own risk. We are not liable for damages resulting from the use or 
                non-use of the information provided.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">6. Changes to the ToS</h2>
              <p className="text-muted-foreground">
                We reserve the right to change these Terms of Service at any time. The current version is always 
                available on this page. Registered users will be informed by email of significant changes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">7. Final Provisions</h2>
              <p className="text-muted-foreground">
                German law applies, excluding the UN Convention on Contracts for the International Sale of Goods. 
                If individual provisions of these ToS are invalid, the validity of the remaining provisions remains 
                unaffected.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Last updated: March 2026
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
