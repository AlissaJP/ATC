// Couche d'accès aux données — résolution du prix unitaire applicable à une quantité donnée.
// RG-03-001 / RG-03-004 : barème B2B si le client est Entreprise « B2B vérifié », sinon prix public.
import { produits } from "@/lib/mock-data/produits";
import { paliersParProduit } from "@/lib/mock-data/paliers-prix-b2b";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";
import { prixEffectif, resoudreProduitEtVariante } from "@/lib/services/variantes";

export function resoudrePrixUnitaire(produitId: string, quantite: number, estB2BVerifie: boolean): number {
  const resolu = resoudreProduitEtVariante(produitId, produits);
  if (!resolu) return 0;
  const { produit, variante } = resolu;

  // Prix de variante fixe (point #29) — pas de barème B2B distinct par variante, pour rester simple
  // (le prix saisi par l'admin pour cette valeur s'applique tel quel, quel que soit le profil client).
  if (variante) return prixEffectif(produit, variante);

  if (estB2BVerifie) {
    const palier = trouverPalierApplicable(paliersParProduit(produitId), quantite);
    if (palier) return palier.prix_unitaire;
  }

  return produit.prix_public;
}
