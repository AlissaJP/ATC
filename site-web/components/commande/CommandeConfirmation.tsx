"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Check, Clock, FileText, MapPin, MessageCircle, Wallet } from "lucide-react";
import { VisuelProduit } from "@/components/product/VisuelProduit";
import { useCommandeStore } from "@/lib/store/commande-store";
import { dernierPaiement, useFactureStore } from "@/lib/store/facture-store";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { produits } from "@/lib/mock-data/produits";
import { calculerFacture } from "@/lib/business-rules/taxe";
import { resoudreProduitEtVariante } from "@/lib/services/variantes";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LOCALE_INTL } from "@/lib/i18n/langues";
import { nomLigneLocalise } from "@/lib/i18n/catalogue";
import { MAGASIN_ADRESSE } from "@/lib/constants/magasin";
import { StatutCommandeBadge } from "./StatutCommandeBadge";
import { PlanificationInstallation } from "./PlanificationInstallation";


// ECR-05-002 — Confirmation de commande & statut de retrait (structure : Raffinement Design, validé).
// RG-05-001 : aucune livraison, retrait uniquement, modalités mises en évidence (Cahier 7 §7). Le
// sous-titre et le badge reflètent le vrai statut du cycle de vie (En préparation → Prête → Retirée),
// pas un message statique.
export function CommandeConfirmation({ commandeId }: { commandeId: string }) {
  const { t, langue } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);
  const commande = useMemo(() => toutesLesCommandes.find((c) => c.id === commandeId), [toutesLesCommandes, commandeId]);
  const toutesLesLignes = useCommandeStore((s) => s.lignesCommande);
  const lignes = useMemo(() => toutesLesLignes.filter((l) => l.commande_id === commandeId), [toutesLesLignes, commandeId]);
  const toutesLesFactures = useFactureStore((s) => s.facturesProForma);
  const facture = useMemo(() => toutesLesFactures.find((f) => f.commande_id === commandeId), [toutesLesFactures, commandeId]);
  const tousLesPaiements = useFactureStore((s) => s.paiements);
  const paiement = useMemo(() => dernierPaiement(tousLesPaiements, { commandeId }), [tousLesPaiements, commandeId]);

  if (!commande || (session?.type !== "admin" && (!session || session.type !== "client" || session.utilisateur_id !== commande.utilisateur_id))) {
    return <p className="text-center text-sm text-texte-secondaire">{t("commande.introuvable")}</p>;
  }

  const numero = `#${commande.id.slice(-8).toUpperCase()}`;
  const detail = calculerFacture(commande.montant_total);
  const estEntreprise = session?.type === "client" && estClientB2BVerifie(session);
  // Virement non encore vérifié : la commande n'est pas validée (pas de reçu ni d'installation à planifier).
  const enAttentePaiement = commande.statut === "attente_paiement";
  const virementRefuse = enAttentePaiement && paiement?.statut_transaction === "échouée";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-bordure bg-background p-6 sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${enAttentePaiement ? "bg-primaire/10" : "bg-succes/10"}`}
          >
            {enAttentePaiement ? <Clock size={28} className="text-primaire" /> : <Check size={28} className="text-succes" />}
          </div>
          <p className="mt-2 font-titres text-xl font-bold text-texte-principal">
            {enAttentePaiement ? t("commande.attenteValidation") : t("commande.recue")}
          </p>
          <p className="max-w-md text-sm text-texte-secondaire">
            {t(`commande.statutPhrase.${commande.statut}`, { numero })}
          </p>
          <StatutCommandeBadge statut={commande.statut} />
          {virementRefuse && session?.type === "client" && (
            <div className="mt-3 w-full max-w-md rounded-lg border border-danger/30 bg-danger/5 p-3 text-left text-sm">
              <p className="font-semibold text-danger">{t("paiement.virement.refuse")}</p>
              {paiement.virement?.motif_refus && (
                <p className="mt-1 text-texte-secondaire">
                  {t("paiement.virement.motif", { motif: paiement.virement.motif_refus })}
                </p>
              )}
              <Link
                href={`/paiement/commande/${commande.id}`}
                className="mt-2 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {t("paiement.virement.payerANouveau")}
              </Link>
            </div>
          )}
        </div>

        <div className={`mt-6 flex justify-end border-t border-bordure pt-4 ${enAttentePaiement && !(estEntreprise && facture) ? "hidden" : ""}`}>
          {estEntreprise && facture ? (
            <Link
              href={`/facture/${facture.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primaire hover:underline"
            >
              <FileText size={16} /> {t("commande.telechargerFacture")}
            </Link>
          ) : (
            <Link
              href={`/commande/${commande.id}/recu`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primaire hover:underline"
            >
              <FileText size={16} /> {t("commande.telechargerRecu")}
            </Link>
          )}
        </div>

        {/* Modalités de retrait / Moyen de paiement — 2 colonnes desktop, empilées sur mobile */}
        <div className="mt-4 grid gap-4 border-t border-bordure pt-6 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              <MapPin size={14} /> {t("commande.modalitesRetrait")}
            </p>
            <p className="mt-2 text-sm font-medium text-texte-principal">{MAGASIN_ADRESSE}</p>
            <p className="text-sm text-texte-secondaire">{t("magasin.horaires")}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              <Wallet size={14} /> {t("commande.moyenPaiement")}
            </p>
            {paiement ? (
              <>
                <p className="mt-2 text-sm font-medium text-texte-principal">{t(`paiement.methode.${paiement.methode}`)}</p>
                <p className="text-sm text-texte-secondaire">
                  {t(
                    paiement.statut_transaction === "en cours"
                      ? "commande.preuveEnvoyeeLe"
                      : paiement.statut_transaction === "échouée"
                        ? "commande.virementRefuseLe"
                        : "commande.regleLe",
                    {
                      date: new Date(paiement.virement?.date_verification ?? paiement.date_transaction).toLocaleDateString(
                        LOCALE_INTL[langue]
                      ),
                    }
                  )}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-texte-secondaire">{t("commun.nonRenseigne")}</p>
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
                  {produit ? (
                    <VisuelProduit produit={produit} sizes="48px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] text-texte-secondaire">
                      —
                    </div>
                  )}
                </div>
                <span className="flex-1 text-sm text-texte-principal">
                  {resolu ? nomLigneLocalise(resolu.produit, resolu.variante, langue) : t("commun.produit")} × {l.quantite}
                </span>
                <span className="text-sm text-texte-secondaire">${(l.prix_unitaire_applique * l.quantite).toFixed(2)}</span>
              </li>
            );
          })}
        </ul>

        {/* Sous-total / Taxe / Total — décision actée n°18 */}
        <div className="ml-auto mt-2 flex max-w-xs flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-texte-secondaire">{t("commun.sousTotal")}</span>
            <span className="text-texte-principal">${detail.montant_ht.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-texte-secondaire">{t("commun.taxe", { taux: (detail.taux_taxe * 100).toFixed(0) })}</span>
            <span className="text-texte-principal">${detail.montant_taxe.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-bordure pt-1 font-titres text-base font-bold text-texte-principal">
            <span>{t("commun.total")}</span>
            <span>${detail.montant_ttc.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {!enAttentePaiement && <PlanificationInstallation commandeId={commande.id} lignes={lignes} />}

      <div className="mt-5 flex flex-wrap gap-4">
        <Link
          href={`/sav?commandeId=${commande.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-texte-secondaire hover:text-primaire"
        >
          <MessageCircle size={16} /> {t("commande.signaler")}
        </Link>
      </div>
    </div>
  );
}
