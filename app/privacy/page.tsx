"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function PrivacyPage() {
  const { lang } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">
        {lang === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
      </h1>
      
      <div className="prose prose-sm max-w-none text-foreground">
        {lang === "de" ? (
          <>
            <h2>1. Datenschutz auf einen Blick</h2>
            <h3>Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
              passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
              persönlich identifiziert werden können.
            </p>

            <h2>2. Datenerfassung auf dieser Website</h2>
            <h3>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
            <p>
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
              können Sie dem Impressum dieser Website entnehmen.
            </p>

            <h3>Wie erfassen wir Ihre Daten?</h3>
            <p>
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. 
              um Daten handeln, die Sie in ein Kontaktformular oder bei der Registrierung eingeben.
            </p>
            <p>
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere 
              IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder 
              Uhrzeit des Seitenaufrufs).
            </p>

            <h3>Wofür nutzen wir Ihre Daten?</h3>
            <p>
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. 
              Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>

            <h3>Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
            <p>
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer 
              gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung 
              oder Löschung dieser Daten zu verlangen.
            </p>

            <h2>3. Firebase und Google-Dienste</h2>
            <p>
              Diese Website nutzt Firebase, einen Service von Google LLC. Firebase verarbeitet personenbezogene 
              Daten wie E-Mail-Adressen und Nutzerdaten zur Authentifizierung und Speicherung von Lerninhalten.
            </p>
            <p>
              Mehr Informationen zu Firebase und Datenschutz finden Sie unter: 
              <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> 
                firebase.google.com/support/privacy
              </a>
            </p>

            <h2>4. Ihre Rechte</h2>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, 
              Datenübertragbarkeit und Widerspruch. Wenden Sie sich hierzu bitte an die im Impressum 
              angegebenen Kontaktdaten.
            </p>
          </>
        ) : (
          <>
            <h2>1. Privacy at a Glance</h2>
            <h3>General Information</h3>
            <p>
              The following notes provide a simple overview of what happens to your personal data when you visit 
              this website. Personal data is any data that can be used to identify you personally.
            </p>

            <h2>2. Data Collection on This Website</h2>
            <h3>Who is responsible for data collection on this website?</h3>
            <p>
              Data processing on this website is carried out by the website operator. You can find their contact 
              details in the imprint of this website.
            </p>

            <h3>How do we collect your data?</h3>
            <p>
              Your data is collected on the one hand by you providing it to us. This could be data that you enter 
              in a contact form or during registration, for example.
            </p>
            <p>
              Other data is collected automatically or with your consent when you visit the website by our IT systems. 
              This is primarily technical data (e.g., internet browser, operating system, or time of page access).
            </p>

            <h3>What do we use your data for?</h3>
            <p>
              Some of the data is collected to ensure error-free provision of the website. Other data may be used 
              to analyze your user behavior.
            </p>

            <h3>What rights do you have regarding your data?</h3>
            <p>
              You have the right at any time to receive information free of charge about the origin, recipient, 
              and purpose of your stored personal data. You also have the right to request the correction or 
              deletion of this data.
            </p>

            <h2>3. Firebase and Google Services</h2>
            <p>
              This website uses Firebase, a service provided by Google LLC. Firebase processes personal data 
              such as email addresses and user data for authentication and storage of learning content.
            </p>
            <p>
              More information about Firebase and privacy can be found at: 
              <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {" "}firebase.google.com/support/privacy
              </a>
            </p>

            <h2>4. Your Rights</h2>
            <p>
              You have the right to information, correction, deletion, restriction of processing, data portability, 
              and objection. Please contact us using the contact details provided in the imprint.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
