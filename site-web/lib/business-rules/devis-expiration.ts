// RG-04-005 — Expiration d'un devis (décision actée n°22)
import { traduire } from "@/lib/i18n/traduire";
import type { Langue } from "@/lib/types/entities";
// Cas limite (décision actée n°32) : l'acceptation exactement à l'instant J+3 est encore valide ;
// l'expiration ne s'applique que strictement après ce délai.

const DELAI_EXPIRATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 jours

export function calculerDateExpiration(dateReponse: Date): Date {
  return new Date(dateReponse.getTime() + DELAI_EXPIRATION_MS);
}

/** true si le devis est encore acceptable à l'instant `maintenant` (RG-04-005, décision n°32). */
export function devisEstEncoreValide(dateReponse: Date, maintenant: Date): boolean {
  const expiration = calculerDateExpiration(dateReponse);
  return maintenant.getTime() <= expiration.getTime();
}

export function devisEstExpire(dateReponse: Date, maintenant: Date): boolean {
  return !devisEstEncoreValide(dateReponse, maintenant);
}

// Texte relatif (« Expire dans 2 jours ») — recommandation Cahier 7 §6, moins anxiogène qu'un compte à rebours.
// Langue par défaut FR (RG-14-001 : traduit sur le site public).
export function texteDelaiRestant(dateExpiration: Date, maintenant: Date, langue: Langue = "fr"): string {
  const msRestant = dateExpiration.getTime() - maintenant.getTime();
  if (msRestant <= 0) return traduire(langue, "devis.expireDelai");

  const heuresRestantes = Math.ceil(msRestant / (60 * 60 * 1000));
  if (heuresRestantes < 24) return traduire(langue, "devis.expireDansHeures", { nombre: heuresRestantes });

  const joursRestants = Math.ceil(heuresRestantes / 24);
  return traduire(langue, joursRestants > 1 ? "devis.expireDansJours" : "devis.expireDansJour", { nombre: joursRestants });
}
