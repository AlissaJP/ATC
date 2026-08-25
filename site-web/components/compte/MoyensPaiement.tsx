"use client";

import { useState } from "react";
import { CreditCard, Pencil, Plus, Smartphone, Wallet } from "lucide-react";
import { useComptesStore } from "@/lib/store/comptes-store";
import type { TypeMoyenPaiementEnregistre } from "@/lib/types/entities";

const ICONES: Record<TypeMoyenPaiementEnregistre, typeof CreditCard> = {
  carte: CreditCard,
  moncash: Smartphone,
  paypal: Wallet,
};

const TYPES_DISPONIBLES: { id: TypeMoyenPaiementEnregistre; label: string }[] = [
  { id: "carte", label: "Carte Visa/Mastercard" },
  { id: "moncash", label: "MonCash" },
  { id: "paypal", label: "PayPal" },
];

// RAFF-MOYENS-PAIEMENT — liste des moyens de paiement enregistrés (RG-06-001 : MonCash, carte, PayPal
// uniquement, jamais de virement). Composant double usage :
// - mode "gestion" (Espace Client) : définir par défaut / modifier / ajouter un moyen.
// - mode "selection" (écran de paiement, ECR-06-001) : chaque ligne devient un raccourci cliquable qui
//   sélectionne directement la méthode correspondante, avant la saisie manuelle classique.
// Sécurité (Cahier 8 §7) : aucune donnée de carte complète saisie ni stockée ici, uniquement un libellé
// masqué de démonstration (décision actée n°41 — sandbox, pas d'intégration PSP réelle).
export function MoyensPaiement({
  utilisateurId,
  mode = "gestion",
  methodeSelectionnee,
  onSelectionner,
}: {
  utilisateurId: string;
  mode?: "gestion" | "selection";
  methodeSelectionnee?: TypeMoyenPaiementEnregistre | null;
  onSelectionner?: (type: TypeMoyenPaiementEnregistre) => void;
}) {
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
          Vos moyens enregistrés
        </p>
        {moyens.map((moyen) => {
          const Icone = ICONES[moyen.type];
          const selectionne = methodeSelectionnee === moyen.type;
          return (
            <button
              key={moyen.id}
              type="button"
              onClick={() => onSelectionner?.(moyen.type)}
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
                  Par défaut
                </span>
              )}
            </button>
          );
        })}
        <p className="mt-1 text-center text-xs text-texte-secondaire">— OU choisissez un autre moyen ci-dessous —</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {moyens.length === 0 && (
        <p className="text-sm text-texte-secondaire">Aucun moyen de paiement enregistré pour le moment.</p>
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
                  Par défaut
                </span>
              )}
              <div className="flex shrink-0 items-center gap-3 text-sm font-medium">
                {!moyen.par_defaut && (
                  <button
                    type="button"
                    onClick={() => definirMoyenPaiementParDefaut(utilisateurId, moyen.id)}
                    className="text-primaire hover:underline"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEnEdition(enEdition === moyen.id ? null : moyen.id)}
                  className="inline-flex items-center gap-1 text-texte-secondaire hover:text-primaire"
                >
                  <Pencil size={14} /> Modifier
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
          <Plus size={16} /> Ajouter un moyen de paiement
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
  const [libelle, setLibelle] = useState(libelleInitial);
  const [info, setInfo] = useState(infoInitiale);

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-bordure pt-3">
      <input
        type="text"
        value={libelle}
        onChange={(e) => setLibelle(e.target.value)}
        placeholder="Libellé"
        className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
      />
      <input
        type="text"
        value={info}
        onChange={(e) => setInfo(e.target.value)}
        placeholder="Information secondaire (facultatif)"
        className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
      />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={libelle.trim().length === 0}
          onClick={() => onEnregistrer(libelle.trim(), info.trim())}
          className="rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enregistrer
        </button>
        <button type="button" onClick={onAnnuler} className="text-sm font-medium text-texte-secondaire hover:text-primaire">
          Annuler
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
  const [type, setType] = useState<TypeMoyenPaiementEnregistre>("carte");
  const [libelle, setLibelle] = useState("");
  const [info, setInfo] = useState("");

  return (
    <div className="rounded-xl border border-dashed border-bordure p-4">
      <p className="mb-3 font-titres text-sm font-semibold text-texte-principal">Ajouter un moyen de paiement</p>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {TYPES_DISPONIBLES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                type === t.id ? "border-primaire bg-primaire/5 text-primaire" : "border-bordure text-texte-secondaire"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          placeholder="Libellé (ex. Carte •••• 1234)"
          className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
        <input
          type="text"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          placeholder="Information secondaire (facultatif)"
          className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
        <div className="flex gap-3">
          <button
            type="button"
            disabled={libelle.trim().length === 0}
            onClick={() => onAjouter(type, libelle.trim(), info.trim())}
            className="rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ajouter
          </button>
          <button type="button" onClick={onAnnuler} className="text-sm font-medium text-texte-secondaire hover:text-primaire">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
