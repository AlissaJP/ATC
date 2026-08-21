"use client";

// ECR-09-001 — Ouverture / suivi d'un ticket SAV (espace client). BF-09-002, UC-09-002.
import { useState } from "react";
import { LifeBuoy, Plus } from "lucide-react";
import { useSavStore } from "@/lib/store/sav-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import type { SessionClient } from "@/lib/store/session-store";
import { StatutTicketBadge } from "./StatutTicketBadge";

export function MesTickets({
  session,
  commandeIdPreselectionnee,
}: {
  session: SessionClient;
  commandeIdPreselectionnee?: string;
}) {
  const tousLesTickets = useSavStore((s) => s.tickets);
  const creerTicket = useSavStore((s) => s.creerTicket);
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);

  const [formulaireOuvert, setFormulaireOuvert] = useState(Boolean(commandeIdPreselectionnee));
  const [sujet, setSujet] = useState("");
  const [description, setDescription] = useState("");
  const [commandeId, setCommandeId] = useState(commandeIdPreselectionnee ?? "");

  const mesTickets = tousLesTickets
    .filter((t) => t.utilisateur_id === session.utilisateur_id)
    .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());

  const mesCommandes = toutesLesCommandes.filter((c) => c.utilisateur_id === session.utilisateur_id);

  function soumettre() {
    if (!sujet.trim() || !description.trim()) return;
    creerTicket(session.utilisateur_id, sujet.trim(), description.trim(), commandeId || undefined);
    setSujet("");
    setDescription("");
    setCommandeId("");
    setFormulaireOuvert(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setFormulaireOuvert((v) => !v)}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primaire px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        <Plus size={16} /> Nouveau ticket
      </button>

      {formulaireOuvert && (
        <div className="rounded-xl border border-bordure bg-background p-5">
          <label className="block text-sm">
            <span className="text-texte-secondaire">Sujet</span>
            <input
              type="text"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Ex. : Panne, réclamation…"
              className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="text-texte-secondaire">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
            />
          </label>
          {mesCommandes.length > 0 && (
            <label className="mt-3 block text-sm">
              <span className="text-texte-secondaire">Commande concernée (facultatif)</span>
              <select
                value={commandeId}
                onChange={(e) => setCommandeId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              >
                <option value="">— Aucune —</option>
                {mesCommandes.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id.slice(-8).toUpperCase()} — {new Date(c.date_creation).toLocaleDateString("fr-FR")}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            disabled={!sujet.trim() || !description.trim()}
            onClick={soumettre}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Envoyer le ticket
          </button>
        </div>
      )}

      {mesTickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-16 text-center">
          <LifeBuoy size={28} className="text-texte-secondaire" />
          <p className="font-titres text-sm font-semibold text-texte-principal">Aucun ticket pour le moment</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {mesTickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-bordure bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-texte-principal">{t.sujet}</p>
                <StatutTicketBadge statut={t.statut} />
              </div>
              <p className="mt-1 text-sm text-texte-secondaire">{t.description}</p>
              <p className="mt-2 text-xs text-texte-secondaire">
                {new Date(t.date_creation).toLocaleDateString("fr-FR")}
                {t.commande_id && ` — Commande #${t.commande_id.slice(-8).toUpperCase()}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
