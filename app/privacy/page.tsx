"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export default function PrivacyPage() {
  const { lang } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">
        {lang === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
      </h1>
      
      <div className="space-y-8 text-foreground">
        {lang === "de" ? (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold">1. Datenschutz auf einen Blick</h2>
              <h3 className="mb-2 font-medium">Allgemeine Hinweise</h3>
              <p className="text-muted-foreground">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
                persönlich identifiziert werden können.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">2. Verantwortliche Stelle</h2>
              <p className="text-muted-foreground">
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
                können Sie dem <Link href="/imprint" className="text-primary hover:underline">Impressum</Link> dieser Website entnehmen.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">3. Welche Daten wir erfassen</h2>
              
              <h3 className="mb-2 mt-4 font-medium">3.1 Bei der Registrierung</h3>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>E-Mail-Adresse:</strong> Für die Anmeldung und Kontowiederherstellung</li>
                <li><strong>Anzeigename (optional):</strong> Zur Personalisierung Ihres Profils</li>
                <li><strong>Passwort:</strong> Verschlüsselt gespeichert (bei E-Mail-Registrierung)</li>
              </ul>

              <h3 className="mb-2 mt-4 font-medium">3.2 Bei der Nutzung der App</h3>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Gespeicherte Vokabeln:</strong> Arabische Wörter und deren Übersetzungen</li>
                <li><strong>Lernfortschritt:</strong> Sternebewertungen für Vokabeln</li>
                <li><strong>Einstellungen:</strong> Sprachpräferenz, Theme-Auswahl</li>
              </ul>

              <h3 className="mb-2 mt-4 font-medium">3.3 Automatisch erfasste Daten</h3>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>IP-Adresse (anonymisiert)</li>
                <li>Browsertyp und -version</li>
                <li>Betriebssystem</li>
                <li>Datum und Uhrzeit des Zugriffs</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">4. Zweck der Datenverarbeitung</h2>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>Bereitstellung der Benutzeranmeldung und -authentifizierung</li>
                <li>Speicherung Ihrer persönlichen Vokabeln und Lernfortschritte</li>
                <li>Synchronisierung Ihrer Daten über verschiedene Geräte</li>
                <li>Verbesserung und Weiterentwicklung der App</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">5. Dienste von Drittanbietern</h2>
              
              <h3 className="mb-2 mt-4 font-medium">5.1 Firebase (Google LLC)</h3>
              <p className="mb-2 text-muted-foreground">
                Wir nutzen Firebase für Authentifizierung und Datenspeicherung. Firebase ist ein Dienst von 
                Google LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA).
              </p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Firebase Authentication:</strong> Verwaltet Benutzerkonten und Anmeldungen</li>
                <li><strong>Cloud Firestore:</strong> Speichert Ihre Vokabeln und Lernfortschritte</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Daten können in Rechenzentren außerhalb der EU (USA) verarbeitet werden. Google ist unter dem 
                EU-US Data Privacy Framework zertifiziert. Mehr Informationen:{" "}
                <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  firebase.google.com/support/privacy
                </a>
              </p>

              <h3 className="mb-2 mt-4 font-medium">5.2 Google OAuth (bei Google-Anmeldung)</h3>
              <p className="text-muted-foreground">
                Wenn Sie sich mit Google anmelden, erhalten wir: Name, E-Mail-Adresse und Profilbild-URL von Google. 
                Wir speichern nur E-Mail und Anzeigenamen. Die Anmeldung erfolgt direkt bei Google; wir erhalten 
                niemals Ihr Google-Passwort.
              </p>

              <h3 className="mb-2 mt-4 font-medium">5.3 Quran.com API</h3>
              <p className="text-muted-foreground">
                Quran-Texte und Übersetzungen werden von der öffentlichen API von quran.com geladen. Bei der Nutzung 
                wird Ihre IP-Adresse an quran.com übermittelt. Weitere Informationen:{" "}
                <a href="https://quran.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  quran.com/privacy
                </a>
              </p>

              <h3 className="mb-2 mt-4 font-medium">5.4 Vercel (Hosting)</h3>
              <p className="text-muted-foreground">
                Diese Website wird bei Vercel Inc. gehostet. Dabei werden Server-Logs (IP-Adresse, Zugriffsdaten) 
                erhoben. Weitere Informationen:{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  vercel.com/legal/privacy-policy
                </a>
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">6. Cookies und lokale Speicherung</h2>
              <p className="mb-2 text-muted-foreground">
                Wir verwenden die folgenden Speichermechanismen:
              </p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>LocalStorage (theme, lang):</strong> Speichert Ihre Theme- und Spracheinstellungen</li>
                <li><strong>LocalStorage (cookie_consent):</strong> Speichert Ihre Cookie-Präferenzen</li>
                <li><strong>Firebase Cookies:</strong> Für Authentifizierung (Session-Token)</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Sie können Ihre Cookie-Einstellungen jederzeit in den{" "}
                <Link href="/cookies" className="text-primary hover:underline">Cookie-Einstellungen</Link> ändern.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">7. Speicherdauer</h2>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Account-Daten:</strong> Bis zur Löschung Ihres Kontos</li>
                <li><strong>Vokabeln & Lernfortschritt:</strong> Bis zur Löschung Ihres Kontos</li>
                <li><strong>Server-Logs:</strong> 30 Tage</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">8. Ihre Rechte (DSGVO)</h2>
              <p className="mb-2 text-muted-foreground">Sie haben folgende Rechte:</p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Auskunft (Art. 15 DSGVO):</strong> Welche Daten wir über Sie speichern</li>
                <li><strong>Berichtigung (Art. 16 DSGVO):</strong> Korrektur falscher Daten</li>
                <li><strong>Löschung (Art. 17 DSGVO):</strong> Löschung Ihrer Daten (über Profil → Account löschen)</li>
                <li><strong>Einschränkung (Art. 18 DSGVO):</strong> Einschränkung der Verarbeitung</li>
                <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Export Ihrer Daten</li>
                <li><strong>Widerspruch (Art. 21 DSGVO):</strong> Widerspruch gegen die Verarbeitung</li>
                <li><strong>Beschwerde:</strong> Bei einer Datenschutz-Aufsichtsbehörde</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte über die im Impressum angegebenen Kontaktdaten.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">9. Datensicherheit</h2>
              <p className="text-muted-foreground">
                Wir nutzen SSL/TLS-Verschlüsselung für alle Datenübertragungen. Passwörter werden verschlüsselt 
                gespeichert und sind auch für uns nicht einsehbar. Der Zugriff auf Firebase ist durch 
                Sicherheitsregeln geschützt.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">10. Änderungen dieser Datenschutzerklärung</h2>
              <p className="text-muted-foreground">
                Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version 
                ist stets auf dieser Seite verfügbar.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Stand: März 2026
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold">1. Privacy at a Glance</h2>
              <h3 className="mb-2 font-medium">General Information</h3>
              <p className="text-muted-foreground">
                The following information provides a simple overview of what happens to your personal data 
                when you visit this website. Personal data is any data that can be used to identify you personally.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">2. Responsible Party</h2>
              <p className="text-muted-foreground">
                Data processing on this website is carried out by the website operator. You can find their contact 
                details in the <Link href="/imprint" className="text-primary hover:underline">Imprint</Link> of this website.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">3. What Data We Collect</h2>
              
              <h3 className="mb-2 mt-4 font-medium">3.1 During Registration</h3>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Email address:</strong> For login and account recovery</li>
                <li><strong>Display name (optional):</strong> To personalize your profile</li>
                <li><strong>Password:</strong> Stored encrypted (for email registration)</li>
              </ul>

              <h3 className="mb-2 mt-4 font-medium">3.2 When Using the App</h3>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Saved vocabulary:</strong> Arabic words and their translations</li>
                <li><strong>Learning progress:</strong> Star ratings for vocabulary</li>
                <li><strong>Settings:</strong> Language preference, theme selection</li>
              </ul>

              <h3 className="mb-2 mt-4 font-medium">3.3 Automatically Collected Data</h3>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>IP address (anonymized)</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Date and time of access</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">4. Purpose of Data Processing</h2>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>Providing user login and authentication</li>
                <li>Storing your personal vocabulary and learning progress</li>
                <li>Synchronizing your data across different devices</li>
                <li>Improving and developing the app</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">5. Third-Party Services</h2>
              
              <h3 className="mb-2 mt-4 font-medium">5.1 Firebase (Google LLC)</h3>
              <p className="mb-2 text-muted-foreground">
                We use Firebase for authentication and data storage. Firebase is a service by 
                Google LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, USA).
              </p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Firebase Authentication:</strong> Manages user accounts and logins</li>
                <li><strong>Cloud Firestore:</strong> Stores your vocabulary and learning progress</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                Data may be processed in data centers outside the EU (USA). Google is certified under the 
                EU-US Data Privacy Framework. More information:{" "}
                <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  firebase.google.com/support/privacy
                </a>
              </p>

              <h3 className="mb-2 mt-4 font-medium">5.2 Google OAuth (for Google Sign-In)</h3>
              <p className="text-muted-foreground">
                When signing in with Google, we receive: name, email address, and profile picture URL from Google. 
                We only store email and display name. Login is directly with Google; we never receive your Google password.
              </p>

              <h3 className="mb-2 mt-4 font-medium">5.3 Quran.com API</h3>
              <p className="text-muted-foreground">
                Quran texts and translations are loaded from the public API of quran.com. When using it, 
                your IP address is transmitted to quran.com. More information:{" "}
                <a href="https://quran.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  quran.com/privacy
                </a>
              </p>

              <h3 className="mb-2 mt-4 font-medium">5.4 Vercel (Hosting)</h3>
              <p className="text-muted-foreground">
                This website is hosted by Vercel Inc. Server logs (IP address, access data) are collected. 
                More information:{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  vercel.com/legal/privacy-policy
                </a>
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">6. Cookies and Local Storage</h2>
              <p className="mb-2 text-muted-foreground">
                We use the following storage mechanisms:
              </p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>LocalStorage (theme, lang):</strong> Stores your theme and language settings</li>
                <li><strong>LocalStorage (cookie_consent):</strong> Stores your cookie preferences</li>
                <li><strong>Firebase Cookies:</strong> For authentication (session tokens)</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                You can change your cookie settings at any time in the{" "}
                <Link href="/cookies" className="text-primary hover:underline">Cookie Settings</Link>.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">7. Storage Duration</h2>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Account data:</strong> Until deletion of your account</li>
                <li><strong>Vocabulary & learning progress:</strong> Until deletion of your account</li>
                <li><strong>Server logs:</strong> 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">8. Your Rights (GDPR)</h2>
              <p className="mb-2 text-muted-foreground">You have the following rights:</p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li><strong>Information (Art. 15 GDPR):</strong> What data we store about you</li>
                <li><strong>Rectification (Art. 16 GDPR):</strong> Correction of incorrect data</li>
                <li><strong>Erasure (Art. 17 GDPR):</strong> Deletion of your data (via Profile → Delete Account)</li>
                <li><strong>Restriction (Art. 18 GDPR):</strong> Restriction of processing</li>
                <li><strong>Data Portability (Art. 20 GDPR):</strong> Export of your data</li>
                <li><strong>Objection (Art. 21 GDPR):</strong> Objection to processing</li>
                <li><strong>Complaint:</strong> To a data protection supervisory authority</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                To exercise your rights, please contact us using the contact details provided in the Imprint.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">9. Data Security</h2>
              <p className="text-muted-foreground">
                We use SSL/TLS encryption for all data transfers. Passwords are stored encrypted 
                and are not visible even to us. Access to Firebase is protected by security rules.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">10. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We reserve the right to update this privacy policy as needed. The current version 
                is always available on this page.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Last updated: March 2026
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
