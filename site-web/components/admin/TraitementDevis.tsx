"use client";

import { useMemo, useState } from "react";
import { ArrowRightCircle, Send } from "lucide-react";
import { StatutDevisBadge } from "@/components/devis/StatutDevisBadge";
import { useDevisStore, prixApplicablePourUtilisateur } from "@/lib/store/devis-store";
import { useSessionStore } from "@/lib/store/session-store";
import { produits } from "@/lib/mock-data/produits";
import { utilisateurs } from "@/lib/mock-data/utilisateurs";
import type { Devis } from "@/lib/types/entities";

function nomClient(utilisateurId: string): string {
  return utilisateurs.find((u) => u.id === utilisateurId)?.nom ?? "Client";
}

// ECR-04-004 — Traitement des devis (back-office). RG-04-002, RG-04-003, RG-04-005, RG-09-002.
function LigneReponseDevis({ devis }: { devis: Devis }) {
  // Sélecteur sur le tableau brut + filtre en mémo (voir app/devis/page.tsx pour l'explication complète).
  const toutesLesLignes = useDevisStore((s) => s.lignesDevis);
  const lignes = useMemo(() => toutesLesLignes.filter((l) => l.devis_id === devis.id), [toutesLesLignes, devis.id]);
  const repondreDevis = useDevisStore((s) => s.repondreDevis);
  const convertirEnCommande = useDevisStore((s) => s.convertirEnCommande);
  const session = useSessionStore((s) => s.session);
  const [ouvert, setOuvert] = useState(false);
  const [coutInstallation, setCoutInstallation] = useState(0);
  const [messageConversion, setMessageConversion] = useState<string | null>(null);

  function gererConversion() {
    const succes = convertirEnCommande(devis.id);
    setMessageConversion(succes ? null : "Ce devis n'a pas encore été réglé par le client.");
  }

  const prixComposants = lignes.reduce(
    (total, l) => total + prixApplicablePourUtilisateur(l.produit_id, l.quantite, devis.utilisateur_id) * l.quantite,
    0
  );

  function envoyerReponse() {
    if (session?.type !== "admin") return;
    repondreDevis(devis.id, coutInstallation, session.administrateur.id);
    setOuvert(false);
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={() => setOuvert((v) => !v)}
      >
        <div>
          <p className="font-medium text-texte-principal">{nomClient(devis.utilisateur_id)}</p>
          <p className="text-xs text-texte-secondaire">
            {new Date(devis.date_creation).toLocaleString("fr-FR")} — {lignes.length} composant(s)
          </p>
        </div>
        <StatutDevisBadge statut={devis.statut} />
      </button>

      {ouvert && (
        <div className="mt-4 border-t border-bordure pt-4">
          <ul className="flex flex-col gap-1 text-sm text-texte-principal">
            {lignes.map((l) => {
              const produit = produits.find((p) => p.id === l.produit_id);
              const prixUnitaire = prixApplicablePourUtilisateur(l.produit_id, l.quantite, devis.utilisateur_id);
              return (
                <li key={l.id} className="flex justify-between">
                  <span>
                    {produit?.nom ?? "Produit"} × {l.quantite}
                  </span>
                  <span className="text-texte-secondaire">${(prixUnitaire * l.quantite).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-fond px-3 py-2 text-sm">
            <span className="text-texte-secondaire">Prix des composants (calculé, lecture seule)</span>
            <span className="font-semibold text-texte-principal">${prixComposants.toFixed(2)}</span>
          </div>

          <label className="mt-3 block text-sm">
            <span className="text-texte-secondaire">Coût d&apos;installation (RG-09-002)</span>
            <input
              type="number"
              min={0}
              value={coutInstallation}
              onChange={(e) => setCoutInstallation(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
            />
          </label>

          <p className="mt-3 font-titres text-lg font-bold text-texte-principal">
            Total : ${(prixComposants + coutInstallation).toFixed(2)}
          </p>

          <button
            type="button"
            onClick={envoyerReponse}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Send size={16} /> Envoyer la réponse au client
          </button>
        </div>
      )}

      {devis.statut === "accepte" && (
        <div className="mt-3">
          <button
            type="button"
            onClick={gererConversion}
            className="inline-flex items-center gap-2 rounded-lg border border-primaire px-4 py-2 text-sm font-semibold text-primaire hover:bg-primaire/5"
          >
            <ArrowRightCircle size={16} /> Convertir en commande
          </button>
          {messageConversion && <p className="mt-2 text-xs font-medium text-danger">{messageConversion}</p>}
        </div>
      )}
    </div>
  );
}

export function TraitementDevis() {
  const devis = useDevisStore((s) => s.devis);
  const enAttente = [...devis]
    .filter((d) => d.statut === "en_attente")
    .sort((a, b) => new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime());
  const traites = [...devis]
    .filter((d) => d.statut !== "en_attente")
    .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-4 font-titres text-lg font-semibold text-texte-principal">
          Devis en attente ({enAttente.length})
        </h2>
        {enAttente.length === 0 ? (
          <p className="text-sm text-texte-secondaire">Aucun devis en attente de traitement.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {enAttente.map((d) => (
              <LigneReponseDevis key={d.id} devis={d} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-titres text-lg font-semibold text-texte-principal">Devis traités</h2>
        <div className="flex flex-col gap-3">
          {traites.map((d) => (
            <LigneReponseDevis key={d.id} devis={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
