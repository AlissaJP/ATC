// RG-03-002 — Statut de stock affiché (décision actée n°21)
import type { NiveauAlerteStock } from "@/lib/types/entities";

export function calculerPourcentageStock(stockActuel: number, stockReference: number): number {
  if (stockReference <= 0) return 0;
  return (stockActuel / stockReference) * 100;
}

// stockActuel null = stock non suivi (quantité non communiquée par le client) : toujours "en_stock".
export function determinerNiveauAlerteStock(
  stockActuel: number | null,
  stockReference: number
): NiveauAlerteStock {
  if (stockActuel === null) return "en_stock";
  if (stockActuel <= 0) return "rupture";

  const pourcentage = calculerPourcentageStock(stockActuel, stockReference);

  if (pourcentage <= 15) return "alerte_rouge";
  if (pourcentage <= 40) return "alerte_orange";
  return "en_stock";
}
