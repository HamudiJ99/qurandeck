"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";

export default function EmailVerificationBanner() {
  const { user, sendVerificationEmail } = useAuth();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // Only show for email/password users who haven't verified their email
  if (!user || user.emailVerified || dismissed) return null;

  // Don't show for Google sign-in users (they are always verified)
  const isGoogle = user.providerData.some((p) => p.providerId === "google.com");
  if (isGoogle) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        <svg className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="flex-1 text-sm text-amber-800 dark:text-amber-300">
          {sent ? t("auth.verificationResent") : t("auth.verifyEmailBanner")}
        </p>
        {!sent && (
          <button
            onClick={handleResend}
            disabled={sending}
            className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-amber-700 underline underline-offset-2 transition-opacity hover:opacity-70 disabled:opacity-50 dark:text-amber-400"
          >
            {sending ? "..." : t("auth.resendEmail")}
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-amber-600 hover:opacity-70 dark:text-amber-400"
          aria-label="Schließen"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
