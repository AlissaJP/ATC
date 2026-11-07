"use client";

import { useState } from "react";
import { CreditCard, Pencil, Plus, Smartphone, Wallet } from "lucide-react";
import { useComptesStore } from "@/lib/store/comptes-store";
import type { TypeMoyenPaiementEnregistre } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";

const ICONES: Record<TypeMoyenPaiementEnregistre, typeof CreditCard> = {
  carte: CreditCard,
  moncash: Smartphone,
  paypal: Wallet,
};

const TYPES_DISPONIBLES: { id: TypeMoyenPaiementEnregistre; label: string }[] = [
  { id: "carte", label: "paiement.methode.carte" },
  { id: "moncash", label: "paiement.methode.moncash" },
  { id: "paypal", label: "paiement.methode.paypal" },
];

// RAFF-MOYENS-PAIEMENT — liste des moyens de paiement enregistrés (MonCash, carte, PayPal ; le virement
// bancaire se règle à chaque fois avec une preuve et ne s'enregistre pas). Composant double usage :
// - mode "gestion" (Espace Client) : définir par défaut / modifier / ajouter un moyen.
// - mode "selection" (écran de paiement, ECR-06-001) : chaque ligne devient un raccourci cliquable qui
//   sélectionne directement la méthode correspondante, avant la saisie manuelle classique.
// Sécurité (Cahier 8 §7) : aucune donnée de carte complète saisie ni stockée ici, uniquement un libellé
// masqué de démonstration (décision actée n°41 — sandbox, pas d'intégration PSP réelle).
export function MoyensPaiement({
  utilisateurId,
  mode = "gestion",
  methodeSelectionnee,
  moyenSelectionneId,
  onSelectionner,
}: {
  utilisateurId: string;
  mode?: "gestion" | "selection";
  methodeSelectionnee?: TypeMoyenPaiementEnregistre | null;
  // Identifiant du moyen enregistré actif (distinct d'une carte saisie manuellement) — Raffinement Design.
  moyenSelectionneId?: string | null;
  onSelectionner?: (type: TypeMoyenPaiementEnregistre, moyenId: string) => void;
}) {
  const { t } = useTranslation();
  const tousLesMoyens = useComptesStore((s) => s.moyensPaiement);
  const ajouterMoyenPaiement = useComptesStore((s) => s.ajouterMoyenPaiement);
  const modifierMoyenPaiement = useComptesStore((s) => s.modifierMoyenPaiement);
  const definirMoyenPaiementParDefaut = useComptesStore((s) => s.definirMoyenPaiementParDefaut);

  const moyens = tousLesMoyens
    .filter((m) => m.utilisateur_id === utilisateurId)
    .sort((a, b) => Number(b.par_defaut) - Number(a.par_defaut));

  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);

  if (mode === "selection") {
    if (moyens.length === 0) return null;
    return (
      <div className="mb-4 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
          {t("moyens.enregistres")}
        </p>
        {moyens.map((moyen) => {
          const Icone = ICONES[moyen.type];
          const selectionne = methodeSelectionnee === moyen.type && moyenSelectionneId === moyen.id;
          return (
            <button
              key={moyen.id}
              type="button"
              onClick={() => onSelectionner?.(moyen.type, moyen.id)}
              className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                selectionne ? "border-primaire bg-primaire/5" : "border-bordure hover:border-primaire-clair"
              }`}
            >
              <Icone size={20} className="text-primaire-clair" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-texte-principal">{moyen.libelle}</p>
                {moyen.info_secondaire && <p className="text-xs text-texte-secondaire">{moyen.info_secondaire}</p>}
              </div>
              {moyen.par_defaut && (
                <span className="shrink-0 rounded-full bg-primaire/10 px-2 py-0.5 text-[11px] font-semibold text-primaire">
                  {t("moyens.parDefaut")}
                </span>
              )}
            </button>
          );
        })}
        <p className="mt-1 text-center text-xs text-texte-secondaire">{t("moyens.ouAutre")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {moyens.length === 0 && (
        <p className="text-sm text-texte-secondaire">{t("moyens.aucun")}</p>
      )}
      {moyens.map((moyen) => {
        const Icone = ICONES[moyen.type];
        return (
          <div
            key={moyen.id}
            className={`rounded-xl border p-4 ${
              moyen.par_defaut ? "border-primaire bg-primaire/5" : "border-bordure bg-background"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Icone size={22} className="shrink-0 text-primaire-clair" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-texte-principal">{moyen.libelle}</p>
                {moyen.info_secondaire && <p className="text-xs text-texte-secondaire">{moyen.info_secondaire}</p>}
              </div>
              {moyen.par_defaut && (
                <span className="shrink-0 rounded-full bg-primaire/10 px-2 py-0.5 text-[11px] font-semibold text-primaire">
                  {t("moyens.parDefaut")}
                </span>
              )}
              <div className="flex shrink-0 items-center gap-3 text-sm font-medium">
                {!moyen.par_defaut && (
                  <button
                    type="button"
                    onClick={() => definirMoyenPaiementParDefaut(utilisateurId, moyen.id)}
                    className="text-primaire hover:underline"
                  >
                    {t("moyens.definirDefaut")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEnEdition(enEdition === moyen.id ? null : moyen.id)}
                  className="inline-flex items-center gap-1 text-texte-secondaire hover:text-primaire"
                >
                  <Pencil size={14} /> {t("moyens.modifier")}
                </button>
              </div>
            </div>

            {enEdition === moyen.id && (
              <FormulaireEdition
                libelleInitial={moyen.libelle}
                infoInitiale={moyen.info_secondaire ?? ""}
                onEnregistrer={(libelle, info) => {
                  modifierMoyenPaiement(moyen.id, libelle, info || undefined);
                  setEnEdition(null);
                }}
                onAnnuler={() => setEnEdition(null)}
              />
            )}
          </div>
        );
      })}

      {ajoutOuvert ? (
        <FormulaireAjout
          onAjouter={(type, libelle, info) => {
            ajouterMoyenPaiement(utilisateurId, type, libelle, info || undefined);
            setAjoutOuvert(false);
          }}
          onAnnuler={() => setAjoutOuvert(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAjoutOuvert(true)}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primaire hover:underline"
        >
          <Plus size={16} /> {t("moyens.ajouter")}
        </button>
      )}
    </div>
  );
}

function FormulaireEdition({
  libelleInitial,
  infoInitiale,
  onEnregistrer,
  onAnnuler,
}: {
  libelleInitial: string;
  infoInitiale: string;
  onEnregistrer: (libelle: string, info: string) => void;
  onAnnuler: () => void;
}) {
  const { t } = useTranslation();
  const [libelle, setLibelle] = useState(libelleInitial);
  const [info, setInfo] = useState(infoInitiale);

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-bordure pt-3">
      <input
        type="text"
        value={libelle}
        onChange={(e) => setLibelle(e.target.value)}
        placeholder={t("moyens.libelle")}
        className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
      />
      <input
        type="text"
        value={info}
        onChange={(e) => setInfo(e.target.value)}
        placeholder={t("moyens.infoSecondaire")}
        className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
      />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={libelle.trim().length === 0}
          onClick={() => onEnregistrer(libelle.trim(), info.trim())}
          className="rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("moyens.enregistrer")}
        </button>
        <button type="button" onClick={onAnnuler} className="text-sm font-medium text-texte-secondaire hover:text-primaire">
          {t("commun.annuler")}
        </button>
      </div>
    </div>
  );
}

function FormulaireAjout({
  onAjouter,
  onAnnuler,
}: {
  onAjouter: (type: TypeMoyenPaiementEnregistre, libelle: string, info: string) => void;
  onAnnuler: () => void;
}) {
  const { t } = useTranslation();
  const [type, setType] = useState<TypeMoyenPaiementEnregistre>("carte");
  const [libelle, setLibelle] = useState("");
  const [info, setInfo] = useState("");

  return (
    <div className="rounded-xl border border-dashed border-bordure p-4">
      <p className="mb-3 font-titres text-sm font-semibold text-texte-principal">{t("moyens.ajouter")}</p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {TYPES_DISPONIBLES.map((typeDispo) => (
            <button
              key={typeDispo.id}
              type="button"
              onClick={() => setType(typeDispo.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                type === typeDispo.id ? "border-primaire bg-primaire/5 text-primaire" : "border-bordure text-texte-secondaire"
              }`}
            >
              {t(typeDispo.label)}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          placeholder={t("moyens.libelleExemple")}
          className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
        <input
          type="text"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          placeholder={t("moyens.infoSecondaire")}
          className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
        <div className="flex gap-3">
          <button
            type="button"
            disabled={libelle.trim().length === 0}
            onClick={() => onAjouter(type, libelle.trim(), info.trim())}
            className="rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("moyens.ajouterBouton")}
          </button>
          <button type="button" onClick={onAnnuler} className="text-sm font-medium text-texte-secondaire hover:text-primaire">
            {t("commun.annuler")}
          </button>
        </div>
      </div>
    </div>
  );
}
