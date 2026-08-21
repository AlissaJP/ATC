// EPIC-09 — SAV & Assistance. BF-09-004 (Must have, décision actée n°5) : planification d'une
// installation interne. UC-09-001 : le client propose une date, l'agent SAV ou l'admin confirme ou
// ajuste. RG-09-002 gère l'éligibilité (lib/business-rules/installation-eligibilite.ts), pas ce store.
// État interactif de démonstration, comme sav-store.ts / commande-store.ts (décision actée n°41).
//
// Pas de seed : InstallationRdv.commande_id est obligatoire et commande-store.ts ne seed aucune commande
// (les commandes n'existent que créées live pendant la démo) — même situation que commande-store.ts.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InstallationRdv } from "@/lib/types/entities";

interface InstallationState {
  installations: InstallationRdv[];
  planifierInstallation: (commandeId: string, datePrevue: string) => InstallationRdv;
  ajusterDateInstallation: (id: string, nouvelleDate: string) => void;
  changerStatutInstallation: (id: string, statut: InstallationRdv["statut"]) => void;
}

let compteurId = 0;
function idUnique(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${Date.now()}-${compteurId}`;
}

export const useInstallationStore = create<InstallationState>()(
  persist(
    (set) => ({
      installations: [],

      planifierInstallation: (commandeId, datePrevue) => {
        const rdv: InstallationRdv = {
          id: idUnique("install"),
          commande_id: commandeId,
          date_prevue: datePrevue,
          statut: "planifie",
        };
        set((state) => ({ installations: [rdv, ...state.installations] }));
        return rdv;
      },

      ajusterDateInstallation: (id, nouvelleDate) =>
        set((state) => ({
          installations: state.installations.map((i) => (i.id === id ? { ...i, date_prevue: nouvelleDate } : i)),
        })),

      changerStatutInstallation: (id, statut) =>
        set((state) => ({
          installations: state.installations.map((i) => (i.id === id ? { ...i, statut } : i)),
        })),
    }),
    { name: "atc-installations" }
  )
);
