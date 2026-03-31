"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface CookieConsent {
  necessary: boolean; // Always true - required for app to function
  functional: boolean; // Firebase Auth, user preferences
  analytics: boolean; // Future analytics (currently not used)
}

interface CookieContextType {
  consent: CookieConsent | null;
  hasConsented: boolean;
  updateConsent: (newConsent: CookieConsent) => void;
  acceptAll: () => void;
  acceptNecessaryOnly: () => void;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
}

const defaultConsent: CookieConsent = {
  necessary: true,
  functional: false,
  analytics: false,
};

const CookieContext = createContext<CookieContextType>({
  consent: null,
  hasConsented: false,
  updateConsent: () => {},
  acceptAll: () => {},
  acceptNecessaryOnly: () => {},
  showBanner: false,
  setShowBanner: () => {},
});

const CONSENT_KEY = "cookie_consent";

export function CookieProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CookieConsent;
        setConsent(parsed);
        setHasConsented(true);
        setShowBanner(false);
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const updateConsent = useCallback((newConsent: CookieConsent) => {
    // Necessary cookies are always enabled
    const finalConsent = { ...newConsent, necessary: true };
    setConsent(finalConsent);
    setHasConsented(true);
    setShowBanner(false);
    localStorage.setItem(CONSENT_KEY, JSON.stringify(finalConsent));
  }, []);

  const acceptAll = useCallback(() => {
    updateConsent({
      necessary: true,
      functional: true,
      analytics: true,
    });
  }, [updateConsent]);

  const acceptNecessaryOnly = useCallback(() => {
    updateConsent({
      necessary: true,
      functional: false,
      analytics: false,
    });
  }, [updateConsent]);

  return (
    <CookieContext.Provider
      value={{
        consent,
        hasConsented,
        updateConsent,
        acceptAll,
        acceptNecessaryOnly,
        showBanner,
        setShowBanner,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieContext);
}
