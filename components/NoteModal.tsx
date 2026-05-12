"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface NoteModalProps {
  isOpen: boolean;
  verseKey: string;
  initialText: string;
  onSave: (text: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function NoteModal({ isOpen, verseKey, initialText, onSave, onDelete, onClose }: NoteModalProps) {
  const { t, lang } = useLanguage();
  const [text, setText] = useState(initialText);
  const [showToast, setShowToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [size, setSize] = useState({ width: 512, height: 500 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(initialText);
    setShowDeleteConfirm(false);
  }, [initialText, isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isEditing = initialText.length > 0;

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim());
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1200);
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    onDelete?.();
    onClose();
  };

  const resizeModalBy = (widthDelta: number, heightDelta: number) => {
    setSize((current) => ({
      width: Math.max(320, current.width + widthDelta),
      height: Math.max(300, current.height + heightDelta),
    }));
  };

  const hasUnsavedChanges = text !== initialText;

  const handleRequestClose = () => {
    if (!hasUnsavedChanges) {
      onClose();
      return;
    }

    const shouldClose = window.confirm(
      lang === "de"
        ? "Du hast ungespeicherte Notizen. Willst du das Fenster wirklich schliessen?"
        : "You have unsaved notes. Do you really want to close this window?"
    );

    if (shouldClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
        onClick={handleRequestClose}
      >
        <div
          className="relative flex w-full flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
          style={{ width: size.width, height: size.height, maxWidth: "calc(100vw - 2rem)", maxHeight: "calc(100vh - 2rem)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground sm:text-lg">
                {isEditing ? t("notes.edit") : t("notes.add")}
              </h3>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {verseKey}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => resizeModalBy(-80, -60)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Notizfenster kleiner machen"
                title="Kleiner"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => resizeModalBy(80, 60)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Notizfenster groesser machen"
                title="Groesser"
              >
                A+
              </button>
              <button
                onClick={handleRequestClose}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body – fills remaining height */}
          <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("notes.placeholder")}
              className="min-h-[320px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border px-4 py-4 sm:px-5">
            {/* Delete confirm row */}
            {isEditing && onDelete && showDeleteConfirm && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
                <span className="flex-1 text-xs text-red-600 dark:text-red-400">{t("notes.deleteConfirm")}</span>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
                >
                  {t("notes.delete")}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  {t("notes.cancel")}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                {isEditing && onDelete && !showDeleteConfirm && (
                  <button
                    onClick={handleDelete}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {t("notes.delete")}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRequestClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  {t("notes.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {t("notes.save")}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg">
          ✓ {t("notes.saved")}
        </div>
      )}
    </>
  );
}
