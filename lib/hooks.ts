"use client";

import { useState, useEffect } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/firebase/firebaseClient";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import type { VocabularyEntry } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        signInAnonymously(auth)
          .then((cred) => setUser(cred.user))
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}

export function useVocabulary(userId: string | undefined) {
  const [words, setWords] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const db = getFirebaseDb();
    const q = query(collection(db, "vocabulary"), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: VocabularyEntry[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as VocabularyEntry[];
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setWords(items);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  return { words, loading };
}

export async function saveWord(entry: Omit<VocabularyEntry, "id">) {
  const db = getFirebaseDb();
  // Check if word already exists for this user
  const q = query(
    collection(db, "vocabulary"),
    where("userId", "==", entry.userId),
    where("arabicWord", "==", entry.arabicWord),
    where("surah", "==", entry.surah),
    where("ayah", "==", entry.ayah)
  );
  const existing = await getDocs(q);
  if (!existing.empty) return; // Already saved

  await addDoc(collection(db, "vocabulary"), {
    ...entry,
    createdAt: Date.now(),
  });
}

export async function updateWordStatus(
  docId: string,
  status: VocabularyEntry["status"]
) {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "vocabulary", docId), { status });
}

export async function removeWord(docId: string) {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "vocabulary", docId));
}
