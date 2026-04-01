"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useNotes, updateNote, deleteNote } from "@/lib/hooks";
import { useLanguage } from "@/lib/LanguageContext";
import { AVAILABLE_SURAHS } from "@/lib/quranApi";
import type { NoteEntry } from "@/types";

export const dynamic = "force-dynamic";

export default function NotesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { notes, loading: notesLoading } = useNotes(user?.uid);
  const { t, lang } = useLanguage();

  const [sortNewest, setSortNewest] = useState(true);
  const [filterSurah, setFilterSurah] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<NoteEntry | null>(null);
  const [editText, setEditText] = useState("");
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const filteredNotes = useMemo(() => {
    let result = [...notes];
    if (filterSurah !== null) {
      result = result.filter((n) => n.surah === filterSurah);
    }
    result.sort((a, b) =>
      sortNewest ? (b.updatedAt || 0) - (a.updatedAt || 0) : (a.updatedAt || 0) - (b.updatedAt || 0)
    );
    return result;
  }, [notes, filterSurah, sortNewest]);

  const surahsWithNotes = useMemo(() => {
    const ids = new Set(notes.map((n) => n.surah));
    return AVAILABLE_SURAHS.filter((s) => ids.has(s.id));
  }, [notes]);

  const getSurahName = (surahId: number) => {
    const s = AVAILABLE_SURAHS.find((x) => x.id === surahId);
    if (!s) return `${surahId}`;
    return s.name_simple;
  };

  const handleStartEdit = (note: NoteEntry) => {
    setEditingNote(note);
    setEditText(note.text);
  };

  const handleSaveEdit = async () => {
    if (!editingNote?.id || !editText.trim()) return;
    await updateNote(editingNote.id, editText.trim());
    setEditingNote(null);
    setEditText("");
    showToast(t("notes.saved"));
  };

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId);
    setDeleteConfirmId(null);
    setExpandedNote(null);
    showToast(t("notes.deleted"));
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(lang === "de" ? "de-DE" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("notes.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">{t("notes.subtitle")}</p>
      </div>

      {/* Filters & Sort */}
      {notes.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Surah filter */}
          {surahsWithNotes.length > 1 && (
            <select
              value={filterSurah ?? ""}
              onChange={(e) => setFilterSurah(e.target.value ? parseInt(e.target.value) : null)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">{t("notes.allSurahs")}</option>
              {surahsWithNotes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_simple}
                </option>
              ))}
            </select>
          )}

          {/* Sort toggle */}
          <button
            onClick={() => setSortNewest(!sortNewest)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            {sortNewest ? t("notes.sortNewest") : t("notes.sortOldest")}
          </button>

          <span className="ml-auto text-sm text-muted-foreground">
            {filteredNotes.length} {filteredNotes.length === 1 ? (lang === "de" ? "Notiz" : "note") : (lang === "de" ? "Notizen" : "notes")}
          </span>
        </div>
      )}

      {/* Loading */}
      {notesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : notes.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center sm:p-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <svg className="h-8 w-8 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="mt-4 font-medium text-foreground">{t("notes.empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "de" ? "Öffne eine Sure und tippe auf das Notiz-Symbol neben einem Vers." : "Open a surah and tap the note icon next to a verse."}
          </p>
          <Link
            href="/quran"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("home.startReading")}
          </Link>
        </div>
      ) : (
        /* Notes list */
        <div className="space-y-2 sm:space-y-3">
          {filteredNotes.map((note) => {
            const isExpanded = expandedNote === note.id;
            const isEditing = editingNote?.id === note.id;

            return (
              <div
                key={note.id}
                className={`rounded-xl border bg-card transition-colors ${
                  isExpanded ? "border-primary/40 shadow-sm" : "border-border hover:border-primary/30"
                }`}
              >
                {/* Note header - clickable to expand */}
                <button
                  onClick={() => setExpandedNote(isExpanded ? null : (note.id || null))}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4"
                >
                  {/* Ayah badge */}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {note.ayah}
                  </span>

                  {/* Text info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {getSurahName(note.surah)} · {t("notes.verse")} {note.ayah}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(note.updatedAt)}</span>
                    </div>
                    {!isExpanded && (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {note.text}
                      </p>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 sm:px-5">
                    {/* Link to verse */}
                    <Link
                      href={`/quran/${note.surah}`}
                      className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {getSurahName(note.surah)} {note.verseKey}
                    </Link>

                    {isEditing ? (
                      /* Edit mode */
                      <div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={!editText.trim()}
                            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                          >
                            {t("notes.save")}
                          </button>
                          <button
                            onClick={() => setEditingNote(null)}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                          >
                            {t("notes.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display mode */
                      <div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {note.text}
                        </p>

                        {/* Delete confirm banner */}
                        {deleteConfirmId === note.id && (
                          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-950/40">
                            <span className="flex-1 text-xs text-red-600 dark:text-red-400">{t("notes.deleteConfirm")}</span>
                            <button
                              onClick={() => handleDelete(note.id!)}
                              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
                            >
                              {t("notes.delete")}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                            >
                              {t("notes.cancel")}
                            </button>
                          </div>
                        )}

                        {deleteConfirmId !== note.id && (
                          <div className="mt-4 flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(note)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              {t("notes.edit")}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(note.id || null)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {t("notes.delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
