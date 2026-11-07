"use client";

// RG-14-001 — fournit la langue courante aux composants client (useTranslation). Valeur initiale : la
// langue lue dans le cookie par le layout serveur, pour que le premier rendu client corresponde au HTML
// serveur. Au changement : mise à jour immédiate côté client, cookie enregistré par la Server Action, puis
// rafraîchissement de la route pour les Server Components.
import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Langue } from "@/lib/types/entities";
import { COOKIE_LANGUE, LANGUE_PAR_DEFAUT, estLangue } from "@/lib/i18n/langues";
import { definirLangueAction } from "@/lib/actions/langue";

interface ContexteLangueValeur {
  langue: Langue;
  definirLangue: (langue: Langue) => void;
}

const ContexteLangue = createContext<ContexteLangueValeur>({
  langue: LANGUE_PAR_DEFAUT,
  definirLangue: () => {},
});

// Ancien stockage (zustand persist, localStorage uniquement) — repris une fois pour ne pas faire perdre
// leur choix aux visiteurs qui avaient déjà changé de langue.
const ANCIENNE_CLE_LOCALSTORAGE = "atc-langue";

export function FournisseurLangue({ langueInitiale, children }: { langueInitiale: Langue; children: React.ReactNode }) {
  const router = useRouter();
  const [, demarrerTransition] = useTransition();
  const [langue, setLangue] = useState(langueInitiale);
  // Resynchronise si le serveur renvoie une autre langue (ex. après rafraîchissement) — ajustement pendant
  // le rendu plutôt qu'un effet (pattern recommandé par react.dev).
  const [langueServeur, setLangueServeur] = useState(langueInitiale);
  if (langueInitiale !== langueServeur) {
    setLangueServeur(langueInitiale);
    setLangue(langueInitiale);
  }

  function definirLangue(nouvelle: Langue) {
    setLangue(nouvelle);
    demarrerTransition(async () => {
      await definirLangueAction(nouvelle);
      router.refresh();
    });
  }

  useEffect(() => {
    try {
      const ancienne = localStorage.getItem(ANCIENNE_CLE_LOCALSTORAGE);
      if (ancienne === null) return;
      localStorage.removeItem(ANCIENNE_CLE_LOCALSTORAGE);
      const valeur: unknown = JSON.parse(ancienne)?.state?.langue;
      const cookiePresent = document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_LANGUE}=`));
      // Pas de setState ici : après le rafraîchissement, le layout renvoie la nouvelle langue, reprise par
      // l'ajustement en cours de rendu ci-dessus.
      if (!cookiePresent && estLangue(valeur) && valeur !== langueInitiale) {
        demarrerTransition(async () => {
          await definirLangueAction(valeur);
          router.refresh();
        });
      }
    } catch {
      // localStorage indisponible ou valeur illisible : on garde la langue du cookie.
    }
    // Reprise unique au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ContexteLangue.Provider value={{ langue, definirLangue }}>{children}</ContexteLangue.Provider>;
}

// Espace administrateur : toujours en français (équipe ATC), quelle que soit la langue choisie sur le site
// public — les composants partagés (badges de statut, modale...) y restent donc en français.
export function LangueFrancaiseFigee({ children }: { children: React.ReactNode }) {
  return (
    <ContexteLangue.Provider value={{ langue: LANGUE_PAR_DEFAUT, definirLangue: () => {} }}>{children}</ContexteLangue.Provider>
  );
}

export function useLangue(): ContexteLangueValeur {
  return useContext(ContexteLangue);
}
