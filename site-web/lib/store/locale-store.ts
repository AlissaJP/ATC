// RG-14-001 — Langue par défaut FR, modification manuelle possible à tout moment (BF-01-004).
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Langue } from "@/lib/types/entities";

interface LocaleState {
  langue: Langue;
  definirLangue: (langue: Langue) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      langue: "fr",
      definirLangue: (langue) => set({ langue }),
    }),
    { name: "atc-langue" }
  )
);
