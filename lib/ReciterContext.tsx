"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type ReciterId = "alafasy" | "husary";

export interface ReciterConfig {
  id: ReciterId;
  nameKey: string;
  quranComId: number;
  qdcId: number;
  islamicNetworkSlug: string;
}

export const RECITERS: Record<ReciterId, ReciterConfig> = {
  alafasy: {
    id: "alafasy",
    nameKey: "Mishari Rashid al-Afasy",
    quranComId: 7,
    qdcId: 7,
    islamicNetworkSlug: "ar.alafasy",
  },
  husary: {
    id: "husary",
    nameKey: "Mahmoud Khalil Al-Husary",
    quranComId: 6,
    qdcId: 6,
    islamicNetworkSlug: "ar.husary",
  },
};

interface ReciterContextType {
  reciterId: ReciterId;
  reciter: ReciterConfig;
  setReciterId: (id: ReciterId) => void;
}

const ReciterContext = createContext<ReciterContextType>({
  reciterId: "alafasy",
  reciter: RECITERS.alafasy,
  setReciterId: () => {},
});

export function ReciterProvider({ children }: { children: ReactNode }) {
  const [reciterId, setReciterIdState] = useState<ReciterId>("alafasy");

  useEffect(() => {
    const saved = localStorage.getItem("reciter");
    if (saved === "alafasy" || saved === "husary") {
      setReciterIdState(saved);
    }
  }, []);

  const setReciterId = useCallback((id: ReciterId) => {
    setReciterIdState(id);
    localStorage.setItem("reciter", id);
  }, []);

  return (
    <ReciterContext.Provider value={{ reciterId, reciter: RECITERS[reciterId], setReciterId }}>
      {children}
    </ReciterContext.Provider>
  );
}

export function useReciter() {
  return useContext(ReciterContext);
}
