"use client";

import { useLangue } from "@/components/i18n/FournisseurLangue";
import { traduire, type ValeursTraduction } from "./traduire";

/** Hook de traduction — clé pointée, ex. t("nav.securite"), variables : t("cle", { nombre: 3 }). RG-14-001.
 *  Langue fournie par FournisseurLangue (cookie lu par le layout serveur) ; côté serveur, utiliser
 *  obtenirTraduction() de lib/i18n/serveur.ts. */
export function useTranslation() {
  const { langue, definirLangue } = useLangue();
  const t = (cle: string, valeurs?: ValeursTraduction) => traduire(langue, cle, valeurs);
  return { t, langue, definirLangue };
}
