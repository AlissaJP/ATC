"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Clock, CreditCard, FileText, X } from "lucide-react";
import { StatutDevisBadge } from "./StatutDevisBadge";
import { Modal } from "@/components/ui/Modal";
import { produits } from "@/lib/mock-data/produits";
import { useDevisStore } from "@/lib/store/devis-store";
import { dernierPaiement, useFactureStore } from "@/lib/store/facture-store";
import { devisEstEncoreValide, texteDelaiRestant } from "@/lib/business-rules/devis-expiration";
import type { Devis } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LOCALE_INTL } from "@/lib/i18n/langues";
import { localiserProduit } from "@/lib/i18n/catalogue";

// ECR-04-003 — Carte de devis (espace client). RG-04-001, RG-04-004, RG-04-005.
export function DevisCard({ devis }: { devis: Devis }) {
  const { t, langue } = useTranslation();
  // Voir app/devis/page.tsx : sélectionner le tableau brut puis filtrer en mémo évite la boucle de rendu
  // provoquée par un sélecteur Zustand renvoyant un nouveau tableau (.filter()) à chaque appel.
  const toutesLesLignes = useDevisStore((s) => s.lignesDevis);
  const lignes = useMemo(() => toutesLesLignes.filter((l) => l.devis_id === devis.id), [toutesLesLignes, devis.id]);
  const accepterDevis = useDevisStore((s) => s.accepterDevis);
  const refuserDevis = useDevisStore((s) => s.refuserDevis);
  const toutesLesFactures = useFactureStore((s) => s.facturesProForma);
  const facture = useMemo(() => toutesLesFactures.find((f) => f.devis_id === devis.id), [toutesLesFactures, devis.id]);
  const tousLesPaiements = useFactureStore((s) => s.paiements);
  const statutPaiement = useMemo(
    () => dernierPaiement(tousLesPaiements, { devisId: devis.id })?.statut_transaction,
    [tousLesPaiements, devis.id]
  );
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);

  const encoreValide =
    devis.statut === "repondu" && devis.date_reponse
      ? devisEstEncoreValide(new Date(devis.date_reponse), new Date())
      : false;

  function confirmerAcceptation() {
    const succes = accepterDevis(devis.id);
    setModaleOuverte(false);
    if (!succes) {
      setMessageErreur(t("devis.expireErreur"));
    }
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatutDevisBadge statut={devis.statut} />
        <p className="text-xs text-texte-secondaire">
          {new Date(devis.date_creation).toLocaleDateString(LOCALE_INTL[langue])}
        </p>
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-sm text-texte-principal">
        {lignes.map((l) => {
          const produit = produits.find((p) => p.id === l.produit_id);
          return (
            <li key={l.id} className="flex justify-between">
              <span>
                {produit ? localiserProduit(produit, langue).nom : t("commun.produit")} × {l.quantite}
              </span>
            </li>
          );
        })}
      </ul>

      {devis.prix_total !== undefined && (
        <p className="mt-3 font-titres text-lg font-bold text-texte-principal">${devis.prix_total.toFixed(2)}</p>
      )}

      {devis.statut === "repondu" && devis.date_expiration_prevue && (
        <p className={`mt-1 text-xs font-medium ${encoreValide ? "text-avertissement" : "text-danger"}`}>
          {texteDelaiRestant(new Date(devis.date_expiration_prevue), new Date(), langue)}
        </p>
      )}

      {messageErreur && <p className="mt-2 text-xs font-medium text-danger">{messageErreur}</p>}

      {devis.statut === "repondu" && encoreValide && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setModaleOuverte(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-succes px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Check size={16} /> {t("devis.accepter")}
          </button>
          <button
            type="button"
            onClick={() => refuserDevis(devis.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-bordure px-4 py-2 text-sm font-semibold text-texte-principal hover:bg-fond"
          >
            <X size={16} /> {t("devis.refuser")}
          </button>
        </div>
      )}

      {devis.statut === "accepte" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {statutPaiement === "réussie" ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-succes">
              <Check size={16} /> {t("devis.regle")}
            </span>
          ) : statutPaiement === "en cours" ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primaire">
              <Clock size={16} /> {t("paiement.virement.enVerification")}
            </span>
          ) : (
            <>
              {statutPaiement === "échouée" && (
                <span className="text-sm font-medium text-danger">{t("paiement.virement.refuse")}</span>
              )}
              <Link
                href={`/paiement/devis/${devis.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                <CreditCard size={16} /> {statutPaiement === "échouée" ? t("paiement.virement.payerANouveau") : t("devis.payer")}
              </Link>
            </>
          )}
          {facture && (
            <Link
              href={`/facture/${facture.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primaire hover:underline"
            >
              <FileText size={16} /> {t("devis.facture")}
            </Link>
          )}
        </div>
      )}

      {modaleOuverte && (
        <Modal titre={t("devis.confirmerTitre")} onFermer={() => setModaleOuverte(false)}>
          <p className="text-sm text-texte-secondaire">
            {t("devis.confirmerTexte", { montant: `$${devis.prix_total?.toFixed(2)}` })}
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModaleOuverte(false)}
              className="rounded-lg border border-bordure px-4 py-2 text-sm font-medium text-texte-principal hover:bg-fond"
            >
              {t("commun.annuler")}
            </button>
            <button
              type="button"
              onClick={confirmerAcceptation}
              className="rounded-lg bg-succes px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              {t("commun.confirmer")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
