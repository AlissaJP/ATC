// RG-06-003 — Taux de change défini manuellement par l'administrateur, jamais automatique.
// Valeur de démonstration plausible pour la phase de démo.
import type { ParametresGeneraux } from "@/lib/types/entities";

export const parametresGeneraux: ParametresGeneraux = {
  id: "parametres-singleton",
  taux_change_htg_usd: 132.5,
  langues_actives: ["fr", "en", "es"],
  date_derniere_maj_taux: "2026-08-10T09:00:00Z",
};
