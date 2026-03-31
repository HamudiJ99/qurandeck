"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function ImprintPage() {
  const { lang } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">
        {lang === "de" ? "Impressum" : "Imprint"}
      </h1>
      
      <div className="prose prose-sm max-w-none text-foreground">
        {lang === "de" ? (
          <>
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              [Dein Name oder Firmenname]<br />
              [Straße und Hausnummer]<br />
              [PLZ und Ort]<br />
            </p>

            <h2>Kontakt</h2>
            <p>
              E-Mail: [deine-email@beispiel.de]<br />
              Telefon: [Deine Telefonnummer]
            </p>

            <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              [Dein Name]<br />
              [Adresse]
            </p>

            <h2>Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h2>Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
              verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h2>Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </>
        ) : (
          <>
            <h2>Information according to § 5 TMG</h2>
            <p>
              [Your Name or Company Name]<br />
              [Street and Number]<br />
              [Postal Code and City]<br />
            </p>

            <h2>Contact</h2>
            <p>
              Email: [your-email@example.com]<br />
              Phone: [Your Phone Number]
            </p>

            <h2>Responsible for content according to § 55 Abs. 2 RStV</h2>
            <p>
              [Your Name]<br />
              [Address]
            </p>

            <h2>Liability for Content</h2>
            <p>
              As a service provider, we are responsible for our own content on these pages in accordance with 
              Section 7(1) TMG (German Telemedia Act) and general laws. However, according to Sections 8 to 10 TMG, 
              we are not obligated to monitor transmitted or stored third-party information or to investigate 
              circumstances that indicate illegal activity.
            </p>

            <h2>Liability for Links</h2>
            <p>
              Our website contains links to external third-party websites over whose content we have no control. 
              Therefore, we cannot assume any liability for this external content. The respective provider or 
              operator of the pages is always responsible for the content of the linked pages.
            </p>

            <h2>Copyright</h2>
            <p>
              The content and works created by the site operators on these pages are subject to German copyright law. 
              Duplication, processing, distribution, and any kind of exploitation outside the limits of copyright law 
              require the written consent of the respective author or creator.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
