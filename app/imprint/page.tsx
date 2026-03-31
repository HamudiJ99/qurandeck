"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function ImprintPage() {
  const { lang } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground">
        {lang === "de" ? "Impressum" : "Imprint"}
      </h1>
      
      <div className="space-y-8 text-foreground">
        {lang === "de" ? (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
              <p className="text-muted-foreground">
                [Dein Name oder Firmenname]<br />
                [Straße und Hausnummer oder Postfach]<br />
                [PLZ und Ort]<br />
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Kontakt</h2>
              <p className="text-muted-foreground">
                E-Mail: [deine-email@beispiel.de]<br />
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p className="text-muted-foreground">
                [Dein Name]<br />
                [Adresse]
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Haftung für Inhalte</h2>
              <p className="text-muted-foreground">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
                verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen 
                zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Haftung für Links</h2>
              <p className="text-muted-foreground">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
                Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
                verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Urheberrecht</h2>
              <p className="mb-2 text-muted-foreground">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
                Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
                Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
              <p className="text-muted-foreground">
                Der arabische Quran-Text und die Rezitationen stammen von öffentlich zugänglichen Quellen (Quran.com). 
                Die Übersetzungen werden über die Quran.com API bereitgestellt.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-xl font-semibold">Information according to § 5 TMG</h2>
              <p className="text-muted-foreground">
                [Your Name or Company Name]<br />
                [Street and Number or P.O. Box]<br />
                [Postal Code and City]<br />
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Contact</h2>
              <p className="text-muted-foreground">
                Email: [your-email@example.com]<br />
                Phone: [Optional - only required for businesses]
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Responsible for content according to § 55 Abs. 2 RStV</h2>
              <p className="text-muted-foreground">
                [Your Name]<br />
                [Address]
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Liability for Content</h2>
              <p className="text-muted-foreground">
                As a service provider, we are responsible for our own content on these pages in accordance with 
                Section 7(1) TMG (German Telemedia Act) and general laws. However, according to Sections 8 to 10 TMG, 
                we are not obligated to monitor transmitted or stored third-party information or to investigate 
                circumstances that indicate illegal activity.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Liability for Links</h2>
              <p className="text-muted-foreground">
                Our website contains links to external third-party websites over whose content we have no control. 
                Therefore, we cannot assume any liability for this external content. The respective provider or 
                operator of the pages is always responsible for the content of the linked pages.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Copyright</h2>
              <p className="mb-2 text-muted-foreground">
                The content and works created by the site operators on these pages are subject to German copyright law. 
                Duplication, processing, distribution, and any kind of exploitation outside the limits of copyright law 
                require the written consent of the respective author or creator.
              </p>
              <p className="text-muted-foreground">
                The Arabic Quran text and recitations are from publicly available sources (Quran.com). 
                Translations are provided via the Quran.com API.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
