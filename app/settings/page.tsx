"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";

type Theme = "light" | "dark" | "mocha";

export default function SettingsPage() {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved === "dark" || saved === "light" || saved === "mocha") {
      setThemeState(saved);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove("light", "dark", "mocha");
    document.documentElement.classList.add(newTheme);
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-foreground">{t("settings.title")}</h1>

      {/* Theme setting */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t("settings.theme")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.themeDesc")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              theme === "light"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="hidden sm:inline">{t("settings.light")}</span>
            <span className="sm:hidden">Hell</span>
          </button>
          <button
            onClick={() => setTheme("mocha")}
            className={`flex flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              theme === "mocha"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="hidden sm:inline">{t("settings.mocha")}</span>
            <span className="sm:hidden">Mocha</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span className="hidden sm:inline">{t("settings.dark")}</span>
            <span className="sm:hidden">Dunkel</span>
          </button>
        </div>
      </div>

      {/* Language setting */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t("settings.language")}</h2>
            <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setLang("de")}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              lang === "de"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
             {t("settings.german")}
          </button>
          <button
            onClick={() => setLang("en")}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              lang === "en"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
             {t("settings.english")}
          </button>
        </div>
      </div>
    </div>
  );
}
