// Couche d'accès aux données — résolution du prix unitaire applicable à une quantité donnée.
// RG-03-001 / RG-03-004 : barème B2B si le client est Entreprise « B2B vérifié », sinon prix public.
import { produits } from "@/lib/mock-data/produits";
import { paliersParProduit } from "@/lib/mock-data/paliers-prix-b2b";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";
import { resoudreProduitEtVariante } from "@/lib/services/variantes";
import { traduire } from "@/lib/i18n/traduire";
import type { Langue } from "@/lib/types/entities";

// Libellé d'un prix au format du site ("$151.00", USD uniquement, quelle que soit la langue) ; null = prix
// non communiqué par le client (« Prix sur demande », traduit). Langue par défaut FR : l'admin reste en français.
export function formaterPrix(prix: number | null, langue: Langue = "fr"): string {
  return prix === null ? traduire(langue, "prix.surDemande") : `$${prix.toFixed(2)}`;
}

export function resoudrePrixUnitaire(produitId: string, quantite: number, estB2BVerifie: boolean): number {
  const resolu = resoudreProduitEtVariante(produitId, produits);
  if (!resolu) return 0;
  const { produit, variante } = resolu;

  // Prix de variante fixe (point #29) — pas de barème B2B distinct par variante, pour rester simple
  // (le prix saisi par l'admin pour cette valeur s'applique tel quel, quel que soit le profil client).
  if (variante) return variante.prix;

  if (estB2BVerifie) {
    const palier = trouverPalierApplicable(paliersParProduit(produitId), quantite);
    if (palier) return palier.prix_unitaire;
  }

  // Garde : un produit sans prix n'entre jamais dans le panier (cart-store, quantiteAutorisee) — ce 0
  // n'est ni affiché ni facturé.
  return produit.prix_public ?? 0;
}
