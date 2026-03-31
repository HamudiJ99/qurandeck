"use client";

import Link from "next/link";
import { useCookieConsent } from "@/lib/CookieContext";
import { useLanguage } from "@/lib/LanguageContext";

export default function CookieBanner() {
  const { showBanner, acceptAll, acceptNecessaryOnly, setShowBanner } = useCookieConsent();
  const { t } = useLanguage();

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4">
      <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-4 shadow-lg sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Text */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {t("cookie.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("cookie.description")}{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                {t("footer.privacy")}
              </Link>{" "}
              {t("cookie.moreInfo")}{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                {t("cookie.settings")}
              </Link>
              .
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => {
                acceptNecessaryOnly();
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t("cookie.necessaryOnly")}
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Link href="/cookies">
                {t("cookie.customize")}
              </Link>
            </button>
            <button
              onClick={() => {
                acceptAll();
              }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("cookie.acceptAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
