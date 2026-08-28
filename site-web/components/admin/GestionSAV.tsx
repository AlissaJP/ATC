"use client";

// BF-12-009 — Gestion des tickets SAV (back-office). Accessible aux deux rôles admin (onglet
// « Assistance/SAV » de RG-12-001). Progression de statut par analogie avec GestionCommandes.tsx — voir
// la note de portée dans lib/store/sav-store.ts (aucune machine à états n'est prescrite par le Cahier).
import { useMemo, useState } from "react";
import { ArrowRightCircle, CheckCircle2, XCircle } from "lucide-react";
import { useSavStore } from "@/lib/store/sav-store";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import { useComptesStore } from "@/lib/store/comptes-store";
import { StatutTicketBadge } from "@/components/sav/StatutTicketBadge";
import type { StatutTicketSAV, TicketSAV } from "@/lib/types/entities";

function nomClient(utilisateurId: string, utilisateursDynamiques: typeof utilisateursSeed): string {
  return (
    utilisateursSeed.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client"
  );
}

function LigneTicket({ ticket, utilisateursDynamiques }: { ticket: TicketSAV; utilisateursDynamiques: typeof utilisateursSeed }) {
  const changerStatutTicket = useSavStore((s) => s.changerStatutTicket);

  const suivant: Partial<Record<StatutTicketSAV, { label: string; statut: StatutTicketSAV; icone: typeof ArrowRightCircle }>> = {
    ouvert: { label: "Prendre en charge", statut: "en_cours", icone: ArrowRightCircle },
    en_cours: { label: "Marquer résolu", statut: "resolu", icone: CheckCircle2 },
    resolu: { label: "Fermer", statut: "ferme", icone: XCircle },
  };
  const action = suivant[ticket.statut];

  return (
    <div className="rounded-xl border border-bordure bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-texte-principal">{ticket.sujet}</p>
          <p className="text-xs text-texte-secondaire">
            {nomClient(ticket.utilisateur_id, utilisateursDynamiques)} —{" "}
            {new Date(ticket.date_creation).toLocaleDateString("fr-FR")}
            {ticket.commande_id && ` — Commande #${ticket.commande_id.slice(-8).toUpperCase()}`}
          </p>
        </div>
        <StatutTicketBadge statut={ticket.statut} />
      </div>
      <p className="mt-2 text-sm text-texte-secondaire">{ticket.description}</p>
      {action && (
        <button
          type="button"
          onClick={() => changerStatutTicket(ticket.id, action.statut)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
        >
          <action.icone size={14} /> {action.label}
        </button>
      )}
    </div>
  );
}

// filtreInitial : reçu de la page (Server Component, lit searchParams) pour les sous-liens de la
// navigation latérale (Section Administration, Raffinement Design).
export function GestionSAV({ filtreInitial = "ouvert" }: { filtreInitial?: StatutTicketSAV | "tous" }) {
  const tickets = useSavStore((s) => s.tickets);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const [filtre, setFiltre] = useState<StatutTicketSAV | "tous">(filtreInitial);

  // Un clic sur un sous-lien de la sidebar navigue vers la même route avec un `statut` différent : React
  // ne réinitialise pas l'état local de ce composant client pour autant, donc on resynchronise le filtre
  // pendant le rendu plutôt qu'un useEffect (même correction que TraitementDevis.tsx/GestionCatalogue.tsx).
  const [filtreInitialTraite, setFiltreInitialTraite] = useState(filtreInitial);
  if (filtreInitial !== filtreInitialTraite) {
    setFiltreInitialTraite(filtreInitial);
    setFiltre(filtreInitial);
  }

  const filtres: { valeur: StatutTicketSAV | "tous"; label: string }[] = [
    { valeur: "ouvert", label: "Ouverts" },
    { valeur: "en_cours", label: "En cours" },
    { valeur: "resolu", label: "Résolus" },
    { valeur: "ferme", label: "Fermés" },
    { valeur: "tous", label: "Tous" },
  ];

  const ticketsFiltres = useMemo(
    () =>
      [...tickets]
        .filter((t) => filtre === "tous" || t.statut === filtre)
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()),
    [tickets, filtre]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltre(f.valeur)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filtre === f.valeur ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {ticketsFiltres.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucun ticket dans ce filtre.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {ticketsFiltres.map((t) => (
            <LigneTicket key={t.id} ticket={t} utilisateursDynamiques={utilisateursDynamiques} />
          ))}
        </div>
      )}
    </div>
  );
}
