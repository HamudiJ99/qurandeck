"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useCookieConsent, type CookieConsent } from "@/lib/CookieContext";
import { useRouter } from "next/navigation";

export default function CookiesPage() {
  const { t } = useLanguage();
  const { consent, updateConsent, hasConsented } = useCookieConsent();
  const router = useRouter();
  const [localConsent, setLocalConsent] = useState<CookieConsent>({
    necessary: true,
    functional: false,
    analytics: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (consent) {
      setLocalConsent(consent);
    }
  }, [consent]);

  const handleSave = () => {
    updateConsent(localConsent);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/");
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-foreground">
        {t("cookie.pageTitle")}
      </h1>
      <p className="mb-8 text-muted-foreground">
        {t("cookie.pageSubtitle")}
      </p>

      <div className="space-y-6">
        {/* Necessary Cookies */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {t("cookie.necessary")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("cookie.necessaryDesc")}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>Cookies:</strong> lang, theme
              </div>
            </div>
            <div className="shrink-0">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {t("cookie.alwaysActive")}
              </span>
            </div>
          </div>
        </div>

        {/* Functional Cookies */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {t("cookie.functional")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("cookie.functionalDesc")}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>Cookies:</strong> Firebase Authentication, Firestore (cookie_consent)
              </div>
            </div>
            <div className="shrink-0">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={localConsent.functional}
                  onChange={(e) =>
                    setLocalConsent({ ...localConsent, functional: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-muted after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Analytics Cookies */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {t("cookie.analytics")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("cookie.analyticsDesc")}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>Cookies:</strong> Derzeit nicht verwendet
              </div>
            </div>
            <div className="shrink-0">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={localConsent.analytics}
                  onChange={(e) =>
                    setLocalConsent({ ...localConsent, analytics: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-muted after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {saved ? "✓" : t("cookie.save")}
        </button>
      </div>
    </div>
  );
}
