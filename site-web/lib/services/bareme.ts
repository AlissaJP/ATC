// Couche d'accès aux données — barème de prix B2B. RG-03-004.
import { paliersParProduit } from "@/lib/mock-data/paliers-prix-b2b";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";

export async function obtenirPaliersProduit(produitId: string) {
  return paliersParProduit(produitId);
}

export async function obtenirPrixApplicable(produitId: string, quantite: number) {
  const paliers = paliersParProduit(produitId);
  return trouverPalierApplicable(paliers, quantite);
}
