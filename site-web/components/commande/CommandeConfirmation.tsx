"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, FileText, MapPin, MessageCircle, Wallet } from "lucide-react";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useFactureStore } from "@/lib/store/facture-store";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { produits } from "@/lib/mock-data/produits";
import { calculerFacture } from "@/lib/business-rules/taxe";
import { nomAffichageVariante, resoudreProduitEtVariante } from "@/lib/services/variantes";
import { MAGASIN_ADRESSE, MAGASIN_HORAIRES } from "@/lib/constants/magasin";
import { StatutCommandeBadge } from "./StatutCommandeBadge";
import { PlanificationInstallation } from "./PlanificationInstallation";

const LIBELLES_PAIEMENT: Record<string, string> = {
  moncash: "MonCash",
  carte: "Carte Visa/Mastercard",
  paypal: "PayPal",
};

const SOUS_TITRES_STATUT = {
  en_preparation: "est confirmée et en cours de préparation. Vous serez averti dès qu'elle sera prête pour le retrait.",
  prete_retrait: "est prête pour le retrait !",
  retiree: "a été retirée. Merci pour votre confiance !",
} as const;

// ECR-05-002 — Confirmation de commande & statut de retrait (structure : Raffinement Design, validé).
// RG-05-001 : aucune livraison, retrait uniquement, modalités mises en évidence (Cahier 7 §7). Le
// sous-titre et le badge reflètent le vrai statut du cycle de vie (En préparation → Prête → Retirée),
// pas un message statique.
export function CommandeConfirmation({ commandeId }: { commandeId: string }) {
  const session = useSessionStore((s) => s.session);
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);
  const commande = useMemo(() => toutesLesCommandes.find((c) => c.id === commandeId), [toutesLesCommandes, commandeId]);
  const toutesLesLignes = useCommandeStore((s) => s.lignesCommande);
  const lignes = useMemo(() => toutesLesLignes.filter((l) => l.commande_id === commandeId), [toutesLesLignes, commandeId]);
  const toutesLesFactures = useFactureStore((s) => s.facturesProForma);
  const facture = useMemo(() => toutesLesFactures.find((f) => f.commande_id === commandeId), [toutesLesFactures, commandeId]);
  const tousLesPaiements = useFactureStore((s) => s.paiements);
  const paiement = useMemo(() => tousLesPaiements.find((p) => p.commande_id === commandeId), [tousLesPaiements, commandeId]);

  if (!commande || (session?.type !== "admin" && (!session || session.type !== "client" || session.utilisateur_id !== commande.utilisateur_id))) {
    return <p className="text-center text-sm text-texte-secondaire">Commande introuvable.</p>;
  }

  const numero = `#${commande.id.slice(-8).toUpperCase()}`;
  const detail = calculerFacture(commande.montant_total);
  const estEntreprise = session?.type === "client" && estClientB2BVerifie(session);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-bordure bg-background p-6 sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-succes/10">
            <Check size={28} className="text-succes" />
          </div>
          <p className="mt-2 font-titres text-xl font-bold text-texte-principal">
            Nous avons bien reçu votre commande !
          </p>
          <p className="max-w-md text-sm text-texte-secondaire">
            Votre commande <span className="font-semibold text-texte-principal">{numero}</span>{" "}
            {SOUS_TITRES_STATUT[commande.statut]}
          </p>
          <StatutCommandeBadge statut={commande.statut} />
        </div>

        <div className="mt-6 flex justify-end border-t border-bordure pt-4">
          {estEntreprise && facture ? (
            <Link
              href={`/facture/${facture.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primaire hover:underline"
            >
              <FileText size={16} /> Télécharger la facture pro forma
            </Link>
          ) : (
            <Link
              href={`/commande/${commande.id}/recu`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primaire hover:underline"
            >
              <FileText size={16} /> Télécharger le reçu
            </Link>
          )}
        </div>

        {/* Modalités de retrait / Moyen de paiement — 2 colonnes desktop, empilées sur mobile */}
        <div className="mt-4 grid gap-4 border-t border-bordure pt-6 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              <MapPin size={14} /> Modalités de retrait
            </p>
            <p className="mt-2 text-sm font-medium text-texte-principal">{MAGASIN_ADRESSE}</p>
            <p className="text-sm text-texte-secondaire">{MAGASIN_HORAIRES}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              <Wallet size={14} /> Moyen de paiement
            </p>
            {paiement ? (
              <>
                <p className="mt-2 text-sm font-medium text-texte-principal">{LIBELLES_PAIEMENT[paiement.methode]}</p>
                <p className="text-sm text-texte-secondaire">
                  Réglé le {new Date(paiement.date_transaction).toLocaleDateString("fr-FR")}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-texte-secondaire">Non renseigné</p>
            )}
          </div>
        </div>

        {/* Articles — photo + nom + prix appliqué */}
        <ul className="mt-6 flex flex-col divide-y divide-bordure border-t border-bordure">
          {lignes.map((l) => {
            const resolu = resoudreProduitEtVariante(l.produit_id, produits);
            const produit = resolu?.produit;
            return (
              <li key={l.id} className="flex items-center gap-3 py-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-fond">
                  {produit?.images[0] ? (
                    <Image src={produit.images[0]} alt="" fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] text-texte-secondaire">
                      —
                    </div>
                  )}
                </div>
                <span className="flex-1 text-sm text-texte-principal">
                  {resolu ? nomAffichageVariante(resolu.produit, resolu.variante) : "Produit"} × {l.quantite}
                </span>
                <span className="text-sm text-texte-secondaire">${(l.prix_unitaire_applique * l.quantite).toFixed(2)}</span>
              </li>
            );
          })}
        </ul>

        {/* Sous-total / Taxe / Total — décision actée n°18 */}
        <div className="ml-auto mt-2 flex max-w-xs flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-texte-secondaire">Sous-total</span>
            <span className="text-texte-principal">${detail.montant_ht.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-texte-secondaire">Taxe ({(detail.taux_taxe * 100).toFixed(0)} %)</span>
            <span className="text-texte-principal">${detail.montant_taxe.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-bordure pt-1 font-titres text-base font-bold text-texte-principal">
            <span>Total</span>
            <span>${detail.montant_ttc.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <PlanificationInstallation commandeId={commande.id} lignes={lignes} />

      <div className="mt-5 flex flex-wrap gap-4">
        <Link
          href={`/sav?commandeId=${commande.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-texte-secondaire hover:text-primaire"
        >
          <MessageCircle size={16} /> Signaler un problème avec cette commande
        </Link>
      </div>
    </div>
  );
}
