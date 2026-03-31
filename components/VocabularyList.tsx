"use client";

import { useState, useEffect, useRef } from "react";
import type { VocabularyEntry } from "@/types";
import { removeWord, updateWordStars } from "@/lib/hooks";
import { useLanguage } from "@/lib/LanguageContext";
import { translateToGerman } from "@/lib/wordDictionary";

interface VocabularyListProps {
  words: VocabularyEntry[];
  loading: boolean;
}

export default function VocabularyList({ words, loading }: VocabularyListProps) {
  const { t, lang } = useLanguage();
  const [starFilter, setStarFilter] = useState<0 | 1 | 2 | 3 | "all">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);
  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      // Check if click is outside any open menu
      if (openMenuId) {
        const menuElement = menuRefs.current.get(openMenuId);
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    if (showFilterMenu || openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilterMenu, openMenuId]);

  const filtered = starFilter === "all" 
    ? words 
    : words.filter((w) => (w.stars || 0) === starFilter);

  const handleResetStars = async (wordId: string) => {
    await updateWordStars(wordId, 0);
    setOpenMenuId(null);
  };

  const handleRemove = async (wordId: string) => {
    await removeWord(wordId);
    setOpenMenuId(null);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
    setOpenMenuId(null);
  };

  const toggleCardSelection = (wordId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(filtered.map(w => w.id).filter((id): id is string => !!id));
    setSelectedIds(allIds);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    const promises = Array.from(selectedIds).map(id => removeWord(id));
    await Promise.all(promises);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleResetSelected = async () => {
    const promises = Array.from(selectedIds).map(id => updateWordStars(id, 0));
    await Promise.all(promises);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const getFilterLabel = () => {
    if (starFilter === "all") return t("vocab.all");
    return `${starFilter}★`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Filter and selection mode button */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-muted"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{getFilterLabel()}</span>
            {starFilter !== "all" && (
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            )}
          </button>

          {/* Filter dropdown menu */}
          {showFilterMenu && (
            <div className="absolute right-0 top-12 z-10 w-40 rounded-lg border border-border bg-card shadow-lg">
              <div className="p-2">
                {[
                  { value: "all", label: t("vocab.all") },
                  { value: 0, label: "0★" },
                  { value: 1, label: "1★" },
                  { value: 2, label: "2★" },
                  { value: 3, label: "3★" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStarFilter(option.value as typeof starFilter);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      starFilter === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selection mode toggle button */}
        <button
          onClick={toggleSelectionMode}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
            isSelectionMode
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-primary hover:bg-muted"
          }`}
          title={isSelectionMode ? t("vocab.cancelSelection") : t("vocab.selectMode")}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </button>
      </div>

      {/* Action bar when in selection mode with selected items */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-foreground">
            {t("vocab.selectedCount").replace("{count}", String(selectedIds.size))}
          </span>
          <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-1 sm:justify-end">
            <button
              onClick={selectedIds.size === filtered.length ? deselectAll : selectAll}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              {selectedIds.size === filtered.length ? t("vocab.deselectAll") : t("vocab.selectAll")}
            </button>
            <button
              onClick={handleResetSelected}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              {t("vocab.resetSelected")}
            </button>
            <button
              onClick={handleDeleteSelected}
              className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              {t("vocab.deleteSelected")}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">
            {words.length === 0 ? t("vocab.empty") : t("vocab.noFilter")}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((word) => {
            const isSelected = word.id ? selectedIds.has(word.id) : false;
            return (
              <div
                key={word.id}
                onClick={() => {
                  if (isSelectionMode && word.id) {
                    toggleCardSelection(word.id);
                  }
                }}
                className={`rounded-xl border p-4 transition-all ${
                  isSelectionMode ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="arabic-text text-2xl">{word.arabicWord}</span>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          (word.stars || 0) >= star
                            ? "text-yellow-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {/* Selection checkbox or Three dots menu */}
                {isSelectionMode ? (
                  <div className="flex h-8 w-8 items-center justify-center">
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-gray-300 dark:border-gray-500"
                    }`}>
                      {isSelected && (
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                  ref={(el) => {
                    if (el && word.id) menuRefs.current.set(word.id, el);
                  }}
                  className="relative"
                >
                  <button
                    onClick={() => setOpenMenuId(openMenuId === word.id ? null : word.id || null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                  {openMenuId === word.id && (
                    <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border border-border bg-card shadow-lg">
                      <div className="p-1">
                        {(word.stars || 0) > 0 && (
                          <button
                            onClick={() => word.id && handleResetStars(word.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{t("vocab.resetStars")}</span>
                          </button>
                        )}
                        <button
                          onClick={() => word.id && handleRemove(word.id)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>{t("vocab.remove")}</span>
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                )}
              </div>
              <p className="mb-1 text-sm text-foreground">
                {lang === "de" ? translateToGerman(word.translation) : word.translation}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("vocab.surah")} {word.surah}, {t("vocab.ayah")} {word.ayah}
              </p>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
