// EPIC-09 — SAV & Assistance. BF-09-002 (le client peut ouvrir un ticket, Should have), BF-12-009
// (l'admin gère les tickets). État interactif de démonstration, comme devis-store.ts / commande-store.ts
// (décision actée n°41 — sandbox, pas de backend réel).
//
// Note de portée (signalée, pas silencieuse) : ni RG-09, ni ECR-09-001 (traitement allégé, Cahier 6),
// ni UC-09-002 (traitement allégé, Cahier 5) ne définissent de machine à états pour un ticket — seul
// « créer un ticket » (client) et « gérer les tickets » (admin) sont spécifiés en toutes lettres. Le cycle
// ouvert → en_cours → resolu → ferme ci-dessous est une extrapolation par analogie avec le cycle déjà
// utilisé pour StatutCommande (lib/store/commande-store.ts) — à confirmer avec le client si un flux
// différent est attendu. Le dictionnaire (Cahier 9) ne prévoit pas non plus de champ de réponse écrite de
// l'admin sur le ticket : seul le changement de statut est modélisé ici.
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StatutTicketSAV, TicketSAV } from "@/lib/types/entities";

interface SavState {
  tickets: TicketSAV[];
  creerTicket: (utilisateurId: string, sujet: string, description: string, commandeId?: string) => TicketSAV;
  changerStatutTicket: (ticketId: string, statut: StatutTicketSAV) => void;
}

let compteurId = 0;
function idUnique(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${Date.now()}-${compteurId}`;
}

export const useSavStore = create<SavState>()(
  persist(
    (set) => ({
      tickets: seedTickets(),

      creerTicket: (utilisateurId, sujet, description, commandeId) => {
        const ticket: TicketSAV = {
          id: idUnique("ticket"),
          utilisateur_id: utilisateurId,
          commande_id: commandeId,
          sujet,
          description,
          statut: "ouvert",
          date_creation: new Date().toISOString(),
        };
        set((state) => ({ tickets: [ticket, ...state.tickets] }));
        return ticket;
      },

      changerStatutTicket: (ticketId, statut) =>
        set((state) => ({
          tickets: state.tickets.map((t) => (t.id === ticketId ? { ...t, statut } : t)),
        })),
    }),
    { name: "atc-sav" }
  )
);

function seedTickets(): TicketSAV[] {
  const maintenant = Date.now();
  const jours = (n: number) => new Date(maintenant - n * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: "ticket-seed-ouvert",
      utilisateur_id: "user-particulier-1",
      sujet: "Panneau solaire ne charge plus",
      description:
        "Depuis hier soir, le panneau 405W ne semble plus alimenter le régulateur. Le voyant reste éteint.",
      statut: "ouvert" as StatutTicketSAV,
      date_creation: jours(0.5),
    },
    {
      id: "ticket-seed-en-cours",
      utilisateur_id: "user-entreprise-verifiee",
      sujet: "Question sur la garantie batterie",
      description: "Nous voudrions connaître la procédure de retour pour une batterie sous garantie 24 mois.",
      statut: "en_cours" as StatutTicketSAV,
      date_creation: jours(3),
    },
    {
      id: "ticket-seed-resolu",
      utilisateur_id: "user-particulier-1",
      sujet: "Caméra PTZ ne tourne plus",
      description: "Le moteur de rotation semble bloqué depuis une mise à jour.",
      statut: "resolu" as StatutTicketSAV,
      date_creation: jours(8),
    },
  ];
}
