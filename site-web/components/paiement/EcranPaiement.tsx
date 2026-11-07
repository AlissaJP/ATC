"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Clock, CreditCard, Landmark, Loader2, Smartphone, Wallet } from "lucide-react";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { useDevisStore } from "@/lib/store/devis-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { dernierPaiement, useFactureStore } from "@/lib/store/facture-store";
import { useParametresStore } from "@/lib/store/parametres-store";
import { convertirUsdVersHtg } from "@/lib/business-rules/change-htg";
import { calculerFacture } from "@/lib/business-rules/taxe";
import { MoyensPaiement } from "@/components/compte/MoyensPaiement";
import { FormulaireNouvelleCarte, carteValide, type DonneesCarte } from "@/components/paiement/FormulaireNouvelleCarte";
import { FormulaireNouveauMoncash, moncashValide, type DonneesMoncash } from "@/components/paiement/FormulaireNouveauMoncash";
import { FormulaireConnexionPaypal, paypalValide, type DonneesPaypal } from "@/components/paiement/FormulaireConnexionPaypal";
import { FormulaireVirement, virementValide, type DonneesVirement } from "@/components/paiement/FormulaireVirement";
import { useComptesStore } from "@/lib/store/comptes-store";
import type { MethodePaiement } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LOCALE_INTL } from "@/lib/i18n/langues";

const CARTE_VIDE: DonneesCarte = { numero: "", expiration: "", cvv: "", titulaire: "", enregistrer: false };
const MONCASH_VIDE: DonneesMoncash = { numero: "", enregistrer: false };
const PAYPAL_VIDE: DonneesPaypal = { email: "", connecte: false, enregistrer: false };
const VIREMENT_VIDE: DonneesVirement = { compte: null, preuve: null };

// ECR-06-001 — Paiement, réutilisé pour un devis accepté (Phase 3) ou une commande panier (Phase 4).
// RG-06-001 (moyens acceptés — virement bancaire ajouté à la demande du client, avec preuve vérifiée
// manuellement), RG-06-003/004 (conversion HTG au taux interne, figée au moment de la confirmation —
// TC-06-001-a/b ; appliquée aussi au virement sur le compte en gourdes).
const MOYENS: { id: MethodePaiement; label: string; icone: typeof Smartphone }[] = [
  { id: "moncash", label: "paiement.methode.moncash", icone: Smartphone },
  { id: "carte", label: "paiement.methode.carte", icone: CreditCard },
  { id: "paypal", label: "paiement.methode.paypal", icone: Wallet },
  { id: "virement", label: "paiement.methode.virement", icone: Landmark },
];

type Etape = "selection" | "traitement" | "succes" | "echec";
export type ContextePaiement = { type: "devis"; id: string } | { type: "commande"; id: string };

export function EcranPaiement({ contexte }: { contexte: ContextePaiement }) {
  const { t, langue } = useTranslation();
  const session = useSessionStore((s) => s.session);

  const tousLesDevis = useDevisStore((s) => s.devis);
  const devis = useMemo(
    () => (contexte.type === "devis" ? tousLesDevis.find((d) => d.id === contexte.id) : undefined),
    [tousLesDevis, contexte]
  );
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);
  const commande = useMemo(
    () => (contexte.type === "commande" ? toutesLesCommandes.find((c) => c.id === contexte.id) : undefined),
    [toutesLesCommandes, contexte]
  );

  const tousLesPaiements = useFactureStore((s) => s.paiements);
  // Dernier règlement : un virement refusé laisse le client payer à nouveau (motif affiché ci-dessous).
  const paiementExistant = useMemo(
    () => dernierPaiement(tousLesPaiements, contexte.type === "devis" ? { devisId: contexte.id } : { commandeId: contexte.id }),
    [tousLesPaiements, contexte]
  );
  const enregistrerPaiement = useFactureStore((s) => s.enregistrerPaiement);
  const genererFactureProForma = useFactureStore((s) => s.genererFactureProForma);
  const toutesLesFactures = useFactureStore((s) => s.facturesProForma);
  const facture = useMemo(
    () =>
      contexte.type === "devis"
        ? toutesLesFactures.find((f) => f.devis_id === contexte.id)
        : toutesLesFactures.find((f) => f.commande_id === contexte.id),
    [toutesLesFactures, contexte]
  );

  const tauxActuel = useParametresStore((s) => s.taux_change_htg_usd);
  const ajouterMoyenPaiement = useComptesStore((s) => s.ajouterMoyenPaiement);
  const tousLesMoyensPaiement = useComptesStore((s) => s.moyensPaiement);

  const [methode, setMethode] = useState<MethodePaiement | null>(null);
  // null = saisie manuelle pour cette transaction (nouvelle carte / numéro MonCash / compte PayPal) ; sinon id
  // du moyen enregistré utilisé — Raffinement Design (#13 pour la carte, généralisé au #17 pour MonCash/PayPal) :
  // la commande doit être réglée avec le moyen effectivement choisi/saisi à cette étape, jamais silencieusement
  // reporté sur un moyen enregistré par défaut.
  const [moyenSelectionneId, setMoyenSelectionneId] = useState<string | null>(null);
  const [carte, setCarte] = useState<DonneesCarte>(CARTE_VIDE);
  const [moncash, setMoncash] = useState<DonneesMoncash>(MONCASH_VIDE);
  const [paypal, setPaypal] = useState<DonneesPaypal>(PAYPAL_VIDE);
  const [virement, setVirement] = useState<DonneesVirement>(VIREMENT_VIDE);
  const [etape, setEtape] = useState<Etape>("selection");

  if (!session || session.type !== "client") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-bordure bg-background p-8 text-center">
        <p className="font-titres text-lg font-semibold text-texte-principal">{t("garde.connexionRequise")}</p>
        <Link href="/compte/connexion" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          {t("commun.seConnecter")}
        </Link>
      </div>
    );
  }

  const cible = contexte.type === "devis" ? devis : commande;
  const utilisateurCible = contexte.type === "devis" ? devis?.utilisateur_id : commande?.utilisateur_id;

  if (!cible || utilisateurCible !== session.utilisateur_id) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-dashed border-bordure p-8 text-center text-sm text-texte-secondaire">
        {contexte.type === "devis" ? t("paiement.devisIntrouvable") : t("commande.introuvable")}
      </div>
    );
  }

  if (etape === "selection" && paiementExistant?.statut_transaction === "en cours") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-avertissement/30 bg-avertissement/5 p-8 text-center">
        <Clock size={28} className="mx-auto text-avertissement" />
        <p className="mt-3 font-titres text-lg font-semibold text-texte-principal">{t("paiement.virement.enVerification")}</p>
        <p className="mt-1 text-sm text-texte-secondaire">{t("paiement.virement.enVerificationTexte")}</p>
        <Link
          href={contexte.type === "devis" ? "/devis" : `/commande/${contexte.id}`}
          className="mt-4 inline-block text-sm font-medium text-primaire hover:underline"
        >
          {contexte.type === "devis" ? t("paiement.retourDevis") : t("paiement.voirCommande")}
        </Link>
      </div>
    );
  }

  if (
    etape === "selection" &&
    (paiementExistant?.statut_transaction === "réussie" || (contexte.type === "devis" && devis?.statut === "converti"))
  ) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-succes/30 bg-succes/5 p-8 text-center">
        <Check size={28} className="mx-auto text-succes" />
        <p className="mt-3 font-titres text-lg font-semibold text-texte-principal">
          {contexte.type === "devis" ? t("paiement.devisDejaRegle") : t("paiement.commandeDejaReglee")}
        </p>
        {facture && (
          <Link href={`/facture/${facture.id}`} className="mt-4 inline-block text-sm font-medium text-primaire hover:underline">
            {t("paiement.voirFacture")}
          </Link>
        )}
      </div>
    );
  }

  if (contexte.type === "devis" && (devis?.statut !== "accepte" || devis.prix_total === undefined)) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-dashed border-bordure p-8 text-center text-sm text-texte-secondaire">
        {t("paiement.devisPasPret")}
      </div>
    );
  }

  // montantHT : base hors-taxe (déjà la convention existante — c'est ce qui est transmis à
  // genererFactureProForma ci-dessous). Le montant réellement dû/réglé inclut la taxe de 10 %
  // (décision actée n°18) — cf. CommandeConfirmation.tsx pour le détail Sous-total/Taxe/Total.
  const montantHT = contexte.type === "devis" ? (devis?.prix_total ?? 0) : (commande?.montant_total ?? 0);
  const detailTaxe = calculerFacture(montantHT);
  const montant = detailTaxe.montant_ttc;
  const montantHtg = convertirUsdVersHtg(montant, tauxActuel);

  // Saisie libre = aucun moyen enregistré explicitement choisi pour cette transaction (bouton générique
  // MonCash/Carte/PayPal ci-dessous) — dans ce cas, le moyen effectivement utilisé est celui saisi/connecté
  // ici, jamais un moyen enregistré implicite.
  const estSaisieLibre = moyenSelectionneId === null;
  const carteEstNouvelle = methode === "carte" && estSaisieLibre;
  const paiementValide =
    methode !== null &&
    (!estSaisieLibre ||
      (methode === "carte" && carteValide(carte)) ||
      (methode === "moncash" && moncashValide(moncash)) ||
      (methode === "paypal" && paypalValide(paypal)) ||
      (methode === "virement" && virementValide(virement)));
  const reference =
    contexte.type === "devis"
      ? t("paiement.virement.referenceDevis", { numero: contexte.id.slice(-8).toUpperCase() })
      : t("paiement.virement.referenceCommande", { numero: contexte.id.slice(-8).toUpperCase() });
  const utilisateurId = session.utilisateur_id;
  const possedeCarteEnregistree = tousLesMoyensPaiement.some(
    (m) => m.utilisateur_id === utilisateurId && m.type === "carte"
  );

  function confirmerPaiement() {
    if (!methode || !paiementValide) return;
    setEtape("traitement");
    const enGourdes = methode === "moncash" || (methode === "virement" && virement.compte === "htg");
    const tauxFige = enGourdes ? tauxActuel : undefined;
    const montantHtgFige = enGourdes ? convertirUsdVersHtg(montant, tauxActuel) : undefined;

    // Sandbox de démonstration (décision actée n°41) : la transaction aboutit toujours ; l'état
    // "échec" ci-dessous reste implémenté pour respecter les états d'écran requis (Cahier 6).
    setTimeout(() => {
      const rattachement = contexte.type === "devis" ? { devisId: contexte.id } : { commandeId: contexte.id };
      enregistrerPaiement({
        ...rattachement,
        methode,
        montantUsd: montant,
        montantHtg: montantHtgFige,
        tauxChangeApplique: tauxFige,
        virement:
          methode === "virement" && virement.compte && virement.preuve
            ? { compte: virement.compte, preuve: virement.preuve }
            : undefined,
      });

      // Raffinement Design — nouveau moyen enregistré uniquement si l'utilisateur l'a explicitement demandé
      // (jamais automatique), pour les trois types de moyens saisis manuellement à cette étape.
      if (estSaisieLibre && methode === "carte" && carte.enregistrer) {
        const chiffres = carte.numero.replace(/\s/g, "");
        ajouterMoyenPaiement(utilisateurId, "carte", `Carte •••• ${chiffres.slice(-4)}`);
      }
      if (estSaisieLibre && methode === "moncash" && moncash.enregistrer) {
        const chiffres = moncash.numero.replace(/\D/g, "");
        ajouterMoyenPaiement(utilisateurId, "moncash", `MonCash — •••• ${chiffres.slice(-4)}`);
      }
      if (estSaisieLibre && methode === "paypal" && paypal.enregistrer) {
        const [utilisateurPaypal] = paypal.email.split("@");
        ajouterMoyenPaiement(utilisateurId, "paypal", "PayPal connecté", `${utilisateurPaypal}***@…`);
      }

      // RG-06-002, Cahier 9 (COMMANDE ⟶ FACTURE_PRO_FORMA « si Entreprise ») — une commande directe
      // (hors devis) génère aussi une facture pro forma pour un client Entreprise. montantHT (pas
      // montant/ttc) : genererFactureProForma calcule elle-même la taxe à partir de la base HT.
      if (contexte.type === "commande" && estClientB2BVerifie(session) && !facture) {
        genererFactureProForma({ commandeId: contexte.id }, montantHT);
      }

      setEtape("succes");
    }, 1400);
  }

  if (etape === "traitement") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-bordure bg-background p-8 text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-primaire" />
        <p className="mt-3 font-titres text-base font-semibold text-texte-principal">{t("paiement.traitement")}</p>
        <p className="mt-1 text-sm text-texte-secondaire">{t("paiement.nePasFermer")}</p>
      </div>
    );
  }

  if (etape === "echec") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
        <AlertTriangle size={28} className="mx-auto text-danger" />
        <p className="mt-3 font-titres text-base font-semibold text-texte-principal">{t("paiement.echec")}</p>
        <p className="mt-1 text-sm text-texte-secondaire">{t("paiement.echecTexte")}</p>
        <button
          type="button"
          onClick={() => setEtape("selection")}
          className="mt-5 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          {t("paiement.reessayer")}
        </button>
      </div>
    );
  }

  if (etape === "succes") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-succes/30 bg-succes/5 p-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.35, type: "spring", stiffness: 300, damping: 18 }}
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-succes/15"
        >
          <Check size={26} className="text-succes" />
        </motion.div>
        <p className="mt-3 font-titres text-lg font-semibold text-texte-principal">
          {methode === "virement" ? t("paiement.virement.preuveEnvoyee") : t("paiement.confirme")}
        </p>
        <p className="mt-1 text-sm text-texte-secondaire">
          {methode === "virement"
            ? t("paiement.virement.enVerificationTexte")
            : contexte.type === "devis"
              ? t("paiement.confirmeDevis")
              : t("paiement.confirmeCommande")}
        </p>
        {facture && (
          <Link href={`/facture/${facture.id}`} className="mt-4 inline-block text-sm font-medium text-primaire hover:underline">
            {t("paiement.voirFacture")}
          </Link>
        )}
        <Link
          href={contexte.type === "devis" ? "/devis" : `/commande/${contexte.id}`}
          className="mt-4 block text-sm font-medium text-texte-secondaire hover:underline"
        >
          {contexte.type === "devis" ? t("paiement.retourDevis") : t("paiement.voirCommande")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-bordure bg-background p-6">
        <p className="text-sm text-texte-secondaire">{t("paiement.montantARegler")}</p>
        <p className="font-titres text-3xl font-bold text-primaire">${montant.toFixed(2)}</p>
        <p className="mt-1 text-xs text-texte-secondaire">
          {t("paiement.dontTaxe", {
            taux: (detailTaxe.taux_taxe * 100).toFixed(0),
            montant: `$${detailTaxe.montant_taxe.toFixed(2)}`,
          })}
        </p>

        {paiementExistant?.statut_transaction === "échouée" && paiementExistant.virement && (
          <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm">
            <p className="font-semibold text-danger">{t("paiement.virement.refuse")}</p>
            {paiementExistant.virement.motif_refus && (
              <p className="mt-1 text-texte-secondaire">
                {t("paiement.virement.motif", { motif: paiementExistant.virement.motif_refus })}
              </p>
            )}
            <p className="mt-1 text-texte-secondaire">{t("paiement.virement.refuseAide")}</p>
          </div>
        )}

        <div className="mt-6">
          <MoyensPaiement
            utilisateurId={session.utilisateur_id}
            mode="selection"
            methodeSelectionnee={methode === "virement" ? null : methode}
            moyenSelectionneId={moyenSelectionneId}
            onSelectionner={(type, moyenId) => {
              setMethode(type);
              setMoyenSelectionneId(moyenId);
            }}
          />
        </div>

        <div className="grid gap-3">
          {MOYENS.map(({ id, label, icone: Icone }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMethode(id);
                // Choisir un moyen ici (plutôt qu'un moyen enregistré ci-dessus) ouvre systématiquement une
                // saisie/connexion propre à cette transaction — jamais un report silencieux sur un moyen
                // enregistré par défaut (carte, numéro MonCash ou compte PayPal).
                setMoyenSelectionneId(null);
              }}
              className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                methode === id && estSaisieLibre
                  ? "border-primaire bg-primaire/5"
                  : "border-bordure hover:border-primaire-clair"
              }`}
            >
              <Icone size={20} className="text-primaire-clair" />
              <span className="text-sm font-medium text-texte-principal">
                {id === "carte" && possedeCarteEnregistree ? t("paiement.nouvelleCarteBouton") : t(label)}
              </span>
            </button>
          ))}
        </div>

        {carteEstNouvelle && <FormulaireNouvelleCarte donnees={carte} onChange={setCarte} />}
        {methode === "moncash" && estSaisieLibre && <FormulaireNouveauMoncash donnees={moncash} onChange={setMoncash} />}
        {methode === "paypal" && estSaisieLibre && <FormulaireConnexionPaypal donnees={paypal} onChange={setPaypal} />}
        {methode === "virement" && (
          <FormulaireVirement
            donnees={virement}
            onChange={setVirement}
            montantUsd={montant}
            montantHtg={montantHtg}
            taux={tauxActuel}
            reference={reference}
          />
        )}

        {methode === "moncash" && (
          <div className="mt-4 rounded-lg bg-fond p-4 text-sm">
            <p className="text-texte-secondaire">{t("paiement.montantConverti")}</p>
            <p className="font-titres text-xl font-bold text-texte-principal">
              {montantHtg.toLocaleString(LOCALE_INTL[langue], { maximumFractionDigits: 2 })} HTG
            </p>
            <p className="mt-1 text-xs text-texte-secondaire">{t("paiement.tauxApplique", { taux: tauxActuel })}</p>
          </div>
        )}

        <button
          type="button"
          disabled={!paiementValide}
          onClick={confirmerPaiement}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {methode === "virement" ? t("paiement.virement.envoyer") : t("paiement.confirmer")}
        </button>
      </div>
    </div>
  );
}
