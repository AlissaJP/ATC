"use client";

// Raffinement Design (correction #17) — pendant du formulaire de nouvelle carte (FormulaireNouvelleCarte.tsx) pour
// MonCash : saisie explicite du numéro à débiter pour CETTE transaction, plutôt qu'un report implicite sur un
// numéro MonCash déjà enregistré. Sandbox de démonstration (décision actée n°41) : aucune requête MonCash réelle,
// seul le numéro saisi est utilisé pour l'affichage/l'enregistrement optionnel.
import { useId } from "react";

export interface DonneesMoncash {
  numero: string;
  enregistrer: boolean;
}

export function moncashValide(donnees: DonneesMoncash): boolean {
  return donnees.numero.replace(/\D/g, "").length === 8;
}

function formaterNumero(valeur: string): string {
  const chiffres = valeur.replace(/\D/g, "").slice(0, 8);
  return chiffres.replace(/(.{4})/g, "$1 ").trim();
}

export function FormulaireNouveauMoncash({
  donnees,
  onChange,
}: {
  donnees: DonneesMoncash;
  onChange: (donnees: DonneesMoncash) => void;
}) {
  const idNumero = useId();

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-bordure p-4">
      <p className="text-sm font-semibold text-texte-principal">Numéro MonCash</p>

      <label htmlFor={idNumero} className="flex flex-col gap-1">
        <span className="text-xs font-medium text-texte-secondaire">Numéro à débiter pour cette commande</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-texte-secondaire">+509</span>
          <input
            id={idNumero}
            type="text"
            inputMode="numeric"
            placeholder="3456 7890"
            value={donnees.numero}
            onChange={(e) => onChange({ ...donnees, numero: formaterNumero(e.target.value) })}
            className="w-full rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </div>
      </label>

      <label className="flex items-center gap-2 text-sm text-texte-principal">
        <input
          type="checkbox"
          checked={donnees.enregistrer}
          onChange={(e) => onChange({ ...donnees, enregistrer: e.target.checked })}
          className="h-4 w-4 rounded border-bordure accent-primaire"
        />
        Enregistrer ce numéro pour mes prochaines commandes
      </label>
    </div>
  );
}
