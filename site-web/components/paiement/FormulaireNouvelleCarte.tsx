"use client";

// Raffinement Design — formulaire de nouvelle carte, systématiquement proposé au paiement même si des
// cartes sont déjà enregistrées (distinct d'un raccourci "moyen enregistré"). Sandbox de démonstration
// (décision actée n°41) : aucune intégration PSP réelle, aucune donnée de carte transmise ni stockée en
// clair — seuls les 4 derniers chiffres sont conservés si l'utilisateur choisit d'enregistrer la carte,
// même convention que les moyens de paiement déjà enregistrés (components/compte/MoyensPaiement.tsx).
import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface DonneesCarte {
  numero: string;
  expiration: string;
  cvv: string;
  titulaire: string;
  enregistrer: boolean;
}

export function carteValide(donnees: DonneesCarte): boolean {
  const chiffres = donnees.numero.replace(/\s/g, "");
  return (
    chiffres.length >= 15 &&
    chiffres.length <= 16 &&
    /^\d{2}\/\d{2}$/.test(donnees.expiration) &&
    /^\d{3,4}$/.test(donnees.cvv) &&
    donnees.titulaire.trim().length > 0
  );
}

function formaterNumero(valeur: string): string {
  const chiffres = valeur.replace(/\D/g, "").slice(0, 16);
  return chiffres.replace(/(.{4})/g, "$1 ").trim();
}

export type TypeCarte = "visa" | "mastercard" | null;

// Détection purement visuelle côté client (règles BIN/IIN standards) — n'a aucune valeur de validation
// réelle, le vrai type de carte n'est confirmé que par le PSP lors d'une transaction réelle. Visa : préfixe
// 4. Mastercard : préfixes 51-55, ou plage étendue 2221-2720 (cf. plage BIN Mastercard 2017).
export function detecterTypeCarte(numero: string): TypeCarte {
  const chiffres = numero.replace(/\D/g, "");
  if (chiffres.length === 0) return null;

  if (chiffres[0] === "4") return "visa";

  const deuxPremiers = Number(chiffres.slice(0, 2));
  if (chiffres.length >= 2 && deuxPremiers >= 51 && deuxPremiers <= 55) return "mastercard";

  if (chiffres.length >= 4) {
    const quatrePremiers = Number(chiffres.slice(0, 4));
    if (quatrePremiers >= 2221 && quatrePremiers <= 2720) return "mastercard";
  }

  return null;
}

function LogoVisa() {
  return (
    <span className="rounded bg-[#1A1F71] px-1.5 py-0.5 font-titres text-[11px] font-bold italic tracking-wide text-white">
      VISA
    </span>
  );
}

function LogoMastercard() {
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" aria-hidden="true">
      <circle cx="11" cy="9" r="8" fill="#EB001B" />
      <circle cx="17" cy="9" r="8" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  );
}

function formaterExpiration(valeur: string): string {
  const chiffres = valeur.replace(/\D/g, "").slice(0, 4);
  return chiffres.length > 2 ? `${chiffres.slice(0, 2)}/${chiffres.slice(2)}` : chiffres;
}

export function FormulaireNouvelleCarte({
  donnees,
  onChange,
}: {
  donnees: DonneesCarte;
  onChange: (donnees: DonneesCarte) => void;
}) {
  const idNumero = useId();
  const idExpiration = useId();
  const idCvv = useId();
  const idTitulaire = useId();
  const typeCarte = detecterTypeCarte(donnees.numero);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-bordure p-4">
      <p className="text-sm font-semibold text-texte-principal">Nouvelle carte</p>

      <label htmlFor={idNumero} className="flex flex-col gap-1">
        <span className="text-xs font-medium text-texte-secondaire">Numéro de carte</span>
        <div className="relative">
          <input
            id={idNumero}
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={donnees.numero}
            onChange={(e) => onChange({ ...donnees, numero: formaterNumero(e.target.value) })}
            className="w-full rounded-lg border border-bordure px-3 py-2 pr-12 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <AnimatePresence mode="wait">
              {typeCarte && (
                <motion.span
                  key={typeCarte}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  aria-label={typeCarte === "visa" ? "Carte Visa détectée" : "Carte Mastercard détectée"}
                >
                  {typeCarte === "visa" ? <LogoVisa /> : <LogoMastercard />}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label htmlFor={idExpiration} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-texte-secondaire">Expiration (MM/AA)</span>
          <input
            id={idExpiration}
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={donnees.expiration}
            onChange={(e) => onChange({ ...donnees, expiration: formaterExpiration(e.target.value) })}
            className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label htmlFor={idCvv} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-texte-secondaire">CVV</span>
          <input
            id={idCvv}
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={donnees.cvv}
            onChange={(e) => onChange({ ...donnees, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
      </div>

      <label htmlFor={idTitulaire} className="flex flex-col gap-1">
        <span className="text-xs font-medium text-texte-secondaire">Nom du titulaire</span>
        <input
          id={idTitulaire}
          type="text"
          autoComplete="cc-name"
          placeholder="Tel qu'inscrit sur la carte"
          value={donnees.titulaire}
          onChange={(e) => onChange({ ...donnees, titulaire: e.target.value })}
          className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-texte-principal">
        <input
          type="checkbox"
          checked={donnees.enregistrer}
          onChange={(e) => onChange({ ...donnees, enregistrer: e.target.checked })}
          className="h-4 w-4 rounded border-bordure accent-primaire"
        />
        Enregistrer cette carte pour mes prochaines commandes
      </label>
    </div>
  );
}
