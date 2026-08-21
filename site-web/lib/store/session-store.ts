// Section 6 du prompt de mission — aucun compte connecté par défaut, y compris en développement :
// un navigateur neuf (ou après vidage du stockage local) atterrit toujours sur l'accueil non connecté,
// la connexion étant systématiquement une action explicite de l'utilisateur.
// Section 5 — la session doit néanmoins « sembler persistante » pendant la démo : elle est donc conservée
// en localStorage (comme le panier, lib/store/cart-store.ts) pour survivre à une navigation par URL ou un
// rafraîchissement de page au cours d'une même session de démonstration.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Administrateur, StatutValidationEntreprise, TypeCompte } from "@/lib/types/entities";

export interface SessionClient {
  type: "client";
  utilisateur_id: string;
  nom: string;
  type_compte: TypeCompte;
  statut_validation_entreprise?: StatutValidationEntreprise; // pilote l'accès au barème B2B (RG-03-001)
}

export interface SessionAdmin {
  type: "admin";
  administrateur: Administrateur;
}

type Session = SessionClient | SessionAdmin | null;

interface SessionState {
  session: Session;
  connecterClient: (session: SessionClient) => void;
  connecterAdmin: (session: SessionAdmin) => void;
  deconnecter: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      connecterClient: (session) => set({ session }),
      connecterAdmin: (session) => set({ session }),
      deconnecter: () => set({ session: null }),
    }),
    { name: "atc-session" }
  )
);

export function estClientB2BVerifie(session: Session): boolean {
  return (
    session?.type === "client" &&
    session.type_compte === "entreprise" &&
    session.statut_validation_entreprise === "valide"
  );
}
