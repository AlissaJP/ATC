// Virement bancaire — coordonnées des comptes ATC affichées au client sur l'écran de paiement.
// ⚠️ VALEURS DE DÉMONSTRATION : ni la banque, ni le bénéficiaire, ni les numéros de compte n'ont été fournis
// par ATC. À remplacer par les vraies coordonnées avant mise en production (BANQUE_VIREMENT_DEMO passera
// alors à false, ce qui retire le bandeau « démonstration » de l'écran de paiement).
import type { CompteVirement } from "@/lib/types/entities";

export const BANQUE_VIREMENT_DEMO = true;

export const BANQUE_VIREMENT = {
  banque: "Banque de démonstration",
  beneficiaire: "ATC — Alpha Tech Center",
  comptes: {
    htg: "000-0000000-1",
    usd: "000-0000000-2",
  } satisfies Record<CompteVirement, string>,
};
