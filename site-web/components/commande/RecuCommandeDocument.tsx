"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useFactureStore } from "@/lib/store/facture-store";
import { useSessionStore } from "@/lib/store/session-store";
import { produits } from "@/lib/mock-data/produits";
import { utilisateurs } from "@/lib/mock-data/utilisateurs";
import { calculerFacture } from "@/lib/business-rules/taxe";
import { resoudreProduitEtVariante } from "@/lib/services/variantes";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LOCALE_INTL } from "@/lib/i18n/langues";
import { nomLigneLocalise } from "@/lib/i18n/catalogue";


// RAFF (Raffinement Design, ECR-05-002) — reçu pour un client Particulier, pendant de
// FactureProFormaDocument.tsx (réservée aux clients Entreprise). Même traitement « télécharger » =
// window.print() sur un document mis en forme pour l'impression (pas de génération PDF réelle).
export function RecuCommandeDocument({ commandeId }: { commandeId: string }) {
  const { t, langue } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);
  const commande = useMemo(() => toutesLesCommandes.find((c) => c.id === commandeId), [toutesLesCommandes, commandeId]);
  const toutesLesLignes = useCommandeStore((s) => s.lignesCommande);
  const lignes = useMemo(() => toutesLesLignes.filter((l) => l.commande_id === commandeId), [toutesLesLignes, commandeId]);
  const tousLesPaiements = useFactureStore((s) => s.paiements);
  // Seul un règlement confirmé figure sur le reçu (un virement en vérification ou refusé n'en est pas un).
  const paiement = useMemo(
    () => tousLesPaiements.find((p) => p.commande_id === commandeId && p.statut_transaction === "réussie"),
    [tousLesPaiements, commandeId]
  );

  if (!commande || session?.type !== "client" || session.utilisateur_id !== commande.utilisateur_id) {
    return <p className="text-center text-sm text-texte-secondaire">{t("recu.introuvable")}</p>;
  }

  const utilisateur = utilisateurs.find((u) => u.id === commande.utilisateur_id);
  const detail = calculerFacture(commande.montant_total);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-primaire px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Download size={16} /> {t("commun.telechargerPdf")}
        </button>
      </div>

      <div className="rounded-xl border border-bordure bg-background p-8 print:border-none print:p-0">
        <div className="flex items-start justify-between border-b border-bordure pb-6">
          <div>
            <p className="font-titres text-lg font-bold text-primaire">ATC — Alpha Tech Center</p>
            <p className="text-sm text-texte-secondaire">{t("recu.titre")}</p>
          </div>
          <div className="text-right">
            <p className="font-titres text-sm font-semibold text-texte-principal">
              #{commande.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-texte-secondaire">
              {new Date(commande.date_creation).toLocaleDateString(LOCALE_INTL[langue])}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">{t("commun.client")}</p>
          <p className="mt-1 text-sm font-medium text-texte-principal">{utilisateur?.nom ?? t("avis.auteurDefaut")}</p>
          {paiement && (
            <p className="text-sm text-texte-secondaire">
              {t("recu.reglePar", {
                methode: t(`paiement.methode.${paiement.methode}`),
                date: new Date(paiement.date_transaction).toLocaleDateString(LOCALE_INTL[langue]),
              })}
            </p>
          )}
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-bordure text-left text-texte-secondaire">
              <th className="pb-2 font-medium">{t("commun.produit")}</th>
              <th className="pb-2 text-right font-medium">{t("commun.quantiteAbregee")}</th>
              <th className="pb-2 text-right font-medium">{t("produit.prixUnitaire")}</th>
              <th className="pb-2 text-right font-medium">{t("commun.total")}</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => {
              const resolu = resoudreProduitEtVariante(l.produit_id, produits);
              return (
                <tr key={l.id} className="border-b border-bordure/60">
                  <td className="py-2 text-texte-principal">
                    {resolu ? nomLigneLocalise(resolu.produit, resolu.variante, langue) : t("commun.produit")}
                  </td>
                  <td className="py-2 text-right text-texte-secondaire">{l.quantite}</td>
                  <td className="py-2 text-right text-texte-secondaire">${l.prix_unitaire_applique.toFixed(2)}</td>
                  <td className="py-2 text-right text-texte-principal">
                    ${(l.prix_unitaire_applique * l.quantite).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 ml-auto flex max-w-xs flex-col gap-1 text-sm">
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

        <p className="mt-8 border-t border-bordure pt-4 text-xs text-texte-secondaire">
          {t("recu.mention")}
        </p>
      </div>
    </div>
  );
}
