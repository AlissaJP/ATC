"use client";

import { useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { IconeApple, IconeFacebook, IconeGoogle } from "./IconesSociales";
import { useTranslation } from "@/lib/i18n/useTranslation";

const FOURNISSEURS = [
  { id: "google", nom: "Google", label: "connexion.continuerGoogle", Icone: IconeGoogle },
  { id: "facebook", nom: "Facebook", label: "connexion.continuerFacebook", Icone: IconeFacebook },
  { id: "apple", nom: "Apple", label: "connexion.continuerApple", Icone: IconeApple },
] as const;

// RAFF-CONNEXION-SOCIALE — boutons pleine largeur avec icône + libellé (accessibilité WCAG 2.2 AA :
// un bouton icône seule est ambigu). Intégration technique réelle non disponible dans cette démo — un
// compte développeur par fournisseur (Google Cloud Console, Facebook for Developers, Apple Developer)
// est nécessaire, hors périmètre du Cahier 10 (décision actée n°35, validation finale à prévoir).
export function ConnexionSociale() {
  const { t } = useTranslation();
  const [messageIndisponible, setMessageIndisponible] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs font-medium text-texte-secondaire">
        <span className="h-px flex-1 bg-bordure" />
        {t("connexion.ou")}
        <span className="h-px flex-1 bg-bordure" />
      </div>

      {FOURNISSEURS.map(({ id, nom, label, Icone }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMessageIndisponible(t("connexion.bientot", { fournisseur: nom }))}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-bordure px-4 py-2.5 text-sm font-medium text-texte-principal transition-colors hover:border-primaire-clair hover:bg-fond"
        >
          <Icone size={18} />
          {t(label)}
        </button>
      ))}

      {messageIndisponible && (
        <Toast message={messageIndisponible} onFermer={() => setMessageIndisponible(null)} />
      )}
    </div>
  );
}
