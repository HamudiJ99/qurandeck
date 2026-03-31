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
  const { t } = useLanguage();
  const [text, setText] = useState(initialText);
  const [showToast, setShowToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
          className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-lg font-semibold text-foreground">
              {isEditing ? t("notes.edit") : t("notes.add")}
            </h3>
            <span className="text-sm text-muted-foreground">{verseKey}</span>
          </div>

          {/* Body */}
          <div className="p-5">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("notes.placeholder")}
              rows={5}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <div>
              {isEditing && onDelete && (
                showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-500">{t("notes.deleteConfirm")}</span>
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
                ) : (
                  <button
                    onClick={handleDelete}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {t("notes.delete")}
                  </button>
                )
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                {t("notes.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={!text.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {t("notes.save")}
              </button>
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
