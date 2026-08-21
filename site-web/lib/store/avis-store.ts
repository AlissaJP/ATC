// EPIC-10 — Marketing (Avis clients). RG-12-002 : « Un avis est publié uniquement après validation
// manuelle par un administrateur. Statut par défaut à la soumission : « En attente de modération ». »
// BF-10-006 : le dépôt d'avis est réservé aux clients ayant acheté le produit (vérifié côté formulaire,
// components/product/AvisProduit.tsx, via l'historique de commandes — commande-store.ts).
//
// Note de portée (signalée, pas silencieuse) : le Cahier 9 ne détaille pas AVIS_CLIENT au niveau champ
// (pas de fiche dictionnaire comme pour PRODUIT/DEVIS/COMMANDE) et ne liste pas non plus de statut
// "rejete" en toutes lettres — seuls « publié » et « en attente de modération » apparaissent dans le
// texte de RG-12-002. L'échelle de note 1-5 et la valeur "rejete" (symétrique logique d'une modération
// qui accepte ou refuse) sont des inférences raisonnables, pas des citations du Cahier.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AvisClient, StatutAvis } from "@/lib/types/entities";

interface AvisState {
  avis: AvisClient[];
  soumettreAvis: (
    produitId: string,
    utilisateurId: string,
    note: number,
    titre?: string,
    commentaire?: string
  ) => AvisClient;
  approuverAvis: (avisId: string) => void;
  rejeterAvis: (avisId: string) => void;
}

let compteurId = 0;
function idUnique(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${Date.now()}-${compteurId}`;
}

export const useAvisStore = create<AvisState>()(
  persist(
    (set) => ({
      avis: seedAvis(),

      soumettreAvis: (produitId, utilisateurId, note, titre, commentaire) => {
        const avis: AvisClient = {
          id: idUnique("avis"),
          produit_id: produitId,
          utilisateur_id: utilisateurId,
          note,
          titre,
          commentaire,
          statut: "en_attente_moderation",
          date_creation: new Date().toISOString(),
        };
        set((state) => ({ avis: [avis, ...state.avis] }));
        return avis;
      },

      approuverAvis: (avisId) =>
        set((state) => ({
          avis: state.avis.map((a) => (a.id === avisId ? { ...a, statut: "publie" as StatutAvis } : a)),
        })),

      rejeterAvis: (avisId) =>
        set((state) => ({
          avis: state.avis.map((a) => (a.id === avisId ? { ...a, statut: "rejete" as StatutAvis } : a)),
        })),
    }),
    { name: "atc-avis" }
  )
);

// Avis pré-existants pour enrichir la démo (indépendants de l'historique d'achat live du panier/commande-
// store, comme les devis et commandes déjà seedés dans les autres stores).
function seedAvis(): AvisClient[] {
  const maintenant = Date.now();
  const jours = (n: number) => new Date(maintenant - n * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: "avis-seed-publie-1",
      produit_id: "prod-panneau-405w",
      utilisateur_id: "user-particulier-1",
      note: 5,
      titre: "Excellent rendement",
      commentaire: "Installation simple et bon rendement, très satisfait après plusieurs mois d'usage.",
      statut: "publie" as StatutAvis,
      date_creation: jours(20),
    },
    {
      id: "avis-seed-publie-2",
      produit_id: "prod-panneau-405w",
      utilisateur_id: "user-entreprise-verifiee",
      note: 4,
      titre: "Bon rapport qualité-prix",
      commentaire: "Bon rapport qualité-prix pour un projet résidentiel.",
      statut: "publie" as StatutAvis,
      date_creation: jours(12),
    },
    {
      id: "avis-seed-attente",
      produit_id: "prod-batterie-lithium-100ah",
      utilisateur_id: "user-particulier-1",
      note: 5,
      titre: "Très bonne autonomie",
      commentaire: "Très bonne autonomie, je recommande.",
      statut: "en_attente_moderation" as StatutAvis,
      date_creation: jours(1),
    },
  ];
}
