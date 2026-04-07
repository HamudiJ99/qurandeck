"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type FontSize = "small" | "medium" | "large";

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
  fontSize: "medium",
  setFontSize: () => {},
});

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");

  useEffect(() => {
    const saved = localStorage.getItem("fontSize");
    if (saved === "small" || saved === "medium" || saved === "large") {
      setFontSizeState(saved);
    }
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("fontSize", size);
  }, []);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}
