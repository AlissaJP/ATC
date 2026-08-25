"use client";

import { useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { IconeApple, IconeFacebook, IconeGoogle } from "./IconesSociales";

const FOURNISSEURS = [
  { id: "google", label: "Continuer avec Google", Icone: IconeGoogle },
  { id: "facebook", label: "Continuer avec Facebook", Icone: IconeFacebook },
  { id: "apple", label: "Continuer avec Apple", Icone: IconeApple },
] as const;

// RAFF-CONNEXION-SOCIALE — boutons pleine largeur avec icône + libellé (accessibilité WCAG 2.2 AA :
// un bouton icône seule est ambigu). Intégration technique réelle non disponible dans cette démo — un
// compte développeur par fournisseur (Google Cloud Console, Facebook for Developers, Apple Developer)
// est nécessaire, hors périmètre du Cahier 10 (décision actée n°35, validation finale à prévoir).
export function ConnexionSociale() {
  const [messageIndisponible, setMessageIndisponible] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs font-medium text-texte-secondaire">
        <span className="h-px flex-1 bg-bordure" />
        OU
        <span className="h-px flex-1 bg-bordure" />
      </div>

      {FOURNISSEURS.map(({ id, label, Icone }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMessageIndisponible(`Connexion avec ${label.replace("Continuer avec ", "")} — bientôt disponible.`)}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-bordure px-4 py-2.5 text-sm font-medium text-texte-principal transition-colors hover:border-primaire-clair hover:bg-fond"
        >
          <Icone size={18} />
          {label}
        </button>
      ))}

      {messageIndisponible && (
        <Toast message={messageIndisponible} onFermer={() => setMessageIndisponible(null)} />
      )}
    </div>
  );
}
