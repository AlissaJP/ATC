// RG-14-001 — résolution d'une clé de traduction, commune au serveur (lib/i18n/serveur.ts) et au client
// (useTranslation). Clé pointée (ex. "nav.securite") ; variables entre accolades remplacées par `valeurs`
// (ex. t("categorie.titre", { nombre: 3 }) pour "{nombre} produits"). Clé introuvable : la clé elle-même
// est renvoyée, pour qu'un oubli se voie à l'écran plutôt que de casser la page.
import fr from "./dictionnaires/fr.json";
import en from "./dictionnaires/en.json";
import es from "./dictionnaires/es.json";
import type { Langue } from "@/lib/types/entities";

export const dictionnaires = { fr, en, es } as const;

export type ValeursTraduction = Record<string, string | number>;
export type Traducteur = (cle: string, valeurs?: ValeursTraduction) => string;

function obtenirValeur(dictionnaire: unknown, cle: string): string | undefined {
  let valeur: unknown = dictionnaire;
  for (const segment of cle.split(".")) {
    if (typeof valeur !== "object" || valeur === null) return undefined;
    valeur = (valeur as Record<string, unknown>)[segment];
  }
  return typeof valeur === "string" ? valeur : undefined;
}

export function traduire(langue: Langue, cle: string, valeurs?: ValeursTraduction): string {
  const texte = obtenirValeur(dictionnaires[langue], cle) ?? obtenirValeur(dictionnaires.fr, cle) ?? cle;
  if (!valeurs) return texte;
  return texte.replace(/\{(\w+)\}/g, (motif, nom: string) => (nom in valeurs ? String(valeurs[nom]) : motif));
}

export function creerTraducteur(langue: Langue): Traducteur {
  return (cle, valeurs) => traduire(langue, cle, valeurs);
}
