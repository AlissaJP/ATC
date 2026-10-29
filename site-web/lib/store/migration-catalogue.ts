// Intégration du catalogue ATC (étape 4) — les stores persistés (localStorage) des navigateurs ayant déjà
// ouvert la démo référencent encore les produits fictifs supprimés (prod-panneau-405w...). Chaque store
// concerné passe à VERSION_CATALOGUE : zustand appelle alors une seule fois sa fonction `migrate`, qui
// écarte ces références (panier, favoris) ou ressème les données de démonstration (avis, devis). Les
// commandes ne sont pas migrées : elles sont liées aux factures et paiements (non modifiés), et leurs
// lignes orphelines s'affichent déjà sans produit (« — »).
import { produits } from "@/lib/mock-data/produits";
import { decomposerIdLigne } from "@/lib/services/variantes";

export const VERSION_CATALOGUE = 1;

// Accepte un identifiant simple ou composite "produit::variante" (panier, commande).
export function referenceProduitConnue(id: string): boolean {
  const { produitId, varianteId } = decomposerIdLigne(id);
  const produit = produits.find((p) => p.id === produitId);
  if (!produit) return false;
  return varianteId === undefined || !!produit.variantes?.some((v) => v.id === varianteId);
}
