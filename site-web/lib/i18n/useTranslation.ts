"use client";

import { useLocaleStore } from "@/lib/store/locale-store";
import fr from "./dictionnaires/fr.json";
import en from "./dictionnaires/en.json";
import es from "./dictionnaires/es.json";

const dictionnaires = { fr, en, es } as const;

type Dictionnaire = typeof fr;

function obtenirValeur(dictionnaire: Dictionnaire, cle: string): string {
  const segments = cle.split(".");
  let valeur: unknown = dictionnaire;
  for (const segment of segments) {
    if (typeof valeur !== "object" || valeur === null) return cle;
    valeur = (valeur as Record<string, unknown>)[segment];
  }
  return typeof valeur === "string" ? valeur : cle;
}

/** Hook de traduction — clé pointée, ex. t("nav.securite"). RG-14-001. */
export function useTranslation() {
  const langue = useLocaleStore((s) => s.langue);
  const definirLangue = useLocaleStore((s) => s.definirLangue);
  const dictionnaire = dictionnaires[langue];

  const t = (cle: string) => obtenirValeur(dictionnaire, cle);

  return { t, langue, definirLangue };
}
