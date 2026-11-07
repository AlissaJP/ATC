// RG-14-001 — langues du site (FR par défaut, EN/ES). Module partagé serveur/client : la langue choisie
// vit dans un cookie, lisible par les Server Components (pages catalogue, fiche produit...) comme par le
// client — un simple localStorage n'était visible que des composants client, d'où un site à moitié traduit.
import type { Langue } from "@/lib/types/entities";

export const LANGUES: Langue[] = ["fr", "en", "es"];
export const LANGUE_PAR_DEFAUT: Langue = "fr";
export const COOKIE_LANGUE = "atc-langue";

// Locale Intl par langue (dates, nombres) — remplace les "fr-FR" figés.
export const LOCALE_INTL: Record<Langue, string> = { fr: "fr-FR", en: "en-US", es: "es-ES" };

export function estLangue(valeur: unknown): valeur is Langue {
  return typeof valeur === "string" && (LANGUES as string[]).includes(valeur);
}
