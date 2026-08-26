"use client";

// Raffinement Design (correction #17) — pendant du formulaire de nouvelle carte pour PayPal : une vraie
// redirection/popup PayPal n'existe pas dans cette démo sans PSP réel (décision actée n°41), donc on simule
// honnêtement l'étape de connexion (choix explicite du compte pour CETTE transaction) plutôt que de réutiliser
// silencieusement un compte PayPal déjà lié. Le bouton "Se connecter" ne contacte aucun service — il valide
// simplement l'e-mail saisi et marque la connexion comme faite pour ce paiement.
import { useId } from "react";
import { Check } from "lucide-react";

export interface DonneesPaypal {
  email: string;
  connecte: boolean;
  enregistrer: boolean;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function paypalValide(donnees: DonneesPaypal): boolean {
  return donnees.connecte && REGEX_EMAIL.test(donnees.email);
}

export function FormulaireConnexionPaypal({
  donnees,
  onChange,
}: {
  donnees: DonneesPaypal;
  onChange: (donnees: DonneesPaypal) => void;
}) {
  const idEmail = useId();
  const emailValide = REGEX_EMAIL.test(donnees.email);

  if (donnees.connecte) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-bordure bg-fond p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-succes/15 text-succes">
            <Check size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-texte-principal">Connecté à PayPal</p>
            <p className="text-xs text-texte-secondaire">{donnees.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...donnees, connecte: false })}
          className="shrink-0 text-sm font-medium text-primaire hover:underline"
        >
          Changer de compte
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-bordure p-4">
      <p className="text-sm font-semibold text-texte-principal">Connexion à PayPal</p>
      <p className="text-xs text-texte-secondaire">
        Connectez-vous avec le compte PayPal que vous souhaitez utiliser pour cette commande.
      </p>

      <label htmlFor={idEmail} className="flex flex-col gap-1">
        <span className="text-xs font-medium text-texte-secondaire">E-mail du compte PayPal</span>
        <input
          id={idEmail}
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          value={donnees.email}
          onChange={(e) => onChange({ ...donnees, email: e.target.value })}
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
        Enregistrer ce compte pour mes prochaines commandes
      </label>

      <button
        type="button"
        disabled={!emailValide}
        onClick={() => onChange({ ...donnees, connecte: true })}
        className="rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Se connecter à PayPal
      </button>
    </div>
  );
}
