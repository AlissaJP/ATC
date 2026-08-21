// Couche d'accès aux données — stock. RG-03-002.
import { trouverStockParProduit } from "@/lib/mock-data/stock";
import { determinerNiveauAlerteStock } from "@/lib/business-rules/stock-alerte";
import type { NiveauAlerteStock } from "@/lib/types/entities";

export async function obtenirNiveauAlerteStock(produitId: string): Promise<NiveauAlerteStock> {
  const s = trouverStockParProduit(produitId);
  if (!s) return "rupture";
  return determinerNiveauAlerteStock(s.stock_actuel, s.stock_reference);
}

export async function obtenirStock(produitId: string) {
  return trouverStockParProduit(produitId);
}
