"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            {t("footer.rights")}
          </p>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              href="/imprint"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {t("footer.imprint")}
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
