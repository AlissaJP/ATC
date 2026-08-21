// Couche d'accès aux données — résolution du prix unitaire applicable à une quantité donnée.
// RG-03-001 / RG-03-004 : barème B2B si le client est Entreprise « B2B vérifié », sinon prix public.
import { produits } from "@/lib/mock-data/produits";
import { paliersParProduit } from "@/lib/mock-data/paliers-prix-b2b";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";

export function resoudrePrixUnitaire(produitId: string, quantite: number, estB2BVerifie: boolean): number {
  const produit = produits.find((p) => p.id === produitId);
  if (!produit) return 0;

  if (estB2BVerifie) {
    const palier = trouverPalierApplicable(paliersParProduit(produitId), quantite);
    if (palier) return palier.prix_unitaire;
  }

  return produit.prix_public;
}
