// Paramètres généraux — RG-06-003 : taux de change HTG/USD défini et mis à jour manuellement par
// l'administrateur, indépendant de toute source externe. BF-12-015 (Must have) : langues actives —
// sous-ensemble de {fr, en, es} (Cahier 9 §5), gap identifié lors de l'audit qualité (jusqu'ici le champ
// existait dans le type/le seed mais n'était géré nulle part). Comme les autres stores interactifs de la
// démo (devis-store, facture-store), persisté en localStorage.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parametresGeneraux } from "@/lib/mock-data/parametres-generaux";
import type { Langue, ParametresGeneraux } from "@/lib/types/entities";

interface ParametresState extends ParametresGeneraux {
  definirTauxChange: (nouveauTaux: number) => void;
  basculerLangueActive: (langue: Langue) => void;
}

export const useParametresStore = create<ParametresState>()(
  persist(
    (set, get) => ({
      ...parametresGeneraux,
      definirTauxChange: (nouveauTaux) =>
        set({ taux_change_htg_usd: nouveauTaux, date_derniere_maj_taux: new Date().toISOString() }),
      // Au moins une langue doit rester active (FR par défaut, RG-14-001) — le retrait de la dernière
      // langue active est silencieusement ignoré plutôt que de laisser le site sans langue affichable.
      basculerLangueActive: (langue) => {
        const actuelles = get().langues_actives;
        const active = actuelles.includes(langue);
        if (active && actuelles.length === 1) return;
        set({
          langues_actives: active ? actuelles.filter((l) => l !== langue) : [...actuelles, langue],
        });
      },
    }),
    { name: "atc-parametres" }
  )
);
