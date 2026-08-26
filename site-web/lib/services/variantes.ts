// Raffinement Design (point #29) — résolution d'un identifiant panier/commande vers son produit et,
// éventuellement, sa variante. Un produit avec variantes n'a plus de SKU (Produit) séparé par valeur
// (correction du mécanisme du point #23) : le panier/la commande référencent un identifiant composite
// `${produit.id}::${variante.id}` construit ici, jamais assemblé ailleurs, pour que le format reste un
// détail interne remplaçable (ex. par une vraie ligne `commande_id, produit_id, variante_id` en base)
// sans toucher aux appelants.
import type { NiveauAlerteStock, Produit, VarianteProduit } from "@/lib/types/entities";

const SEPARATEUR = "::";

export function construireIdLigne(produitId: string, varianteId?: string): string {
  return varianteId ? `${produitId}${SEPARATEUR}${varianteId}` : produitId;
}

export function decomposerIdLigne(id: string): { produitId: string; varianteId?: string } {
  const [produitId, varianteId] = id.split(SEPARATEUR);
  return { produitId, varianteId };
}

export interface ProduitEtVariante {
  produit: Produit;
  variante?: VarianteProduit;
}

export function resoudreProduitEtVariante(id: string, tousLesProduits: Produit[]): ProduitEtVariante | undefined {
  const { produitId, varianteId } = decomposerIdLigne(id);
  const produit = tousLesProduits.find((p) => p.id === produitId);
  if (!produit) return undefined;
  const variante = varianteId ? produit.variantes?.find((v) => v.id === varianteId) : undefined;
  return { produit, variante };
}

export function nomAffichageVariante(produit: Produit, variante: VarianteProduit | undefined): string {
  return variante ? `${produit.nom} — ${variante.attribut} ${variante.valeur}` : produit.nom;
}

export function prixEffectif(produit: Produit, variante: VarianteProduit | undefined): number {
  return variante ? variante.prix : produit.prix_public;
}

// undefined = stock non suivi pour cette variante (toujours disponible, pas de plafond de quantité réel).
export function stockEffectifVariante(variante: VarianteProduit | undefined): number | undefined {
  return variante?.stock;
}

export function prixDepart(produit: Produit): number {
  if (!produit.variantes || produit.variantes.length === 0) return produit.prix_public;
  return Math.min(...produit.variantes.map((v) => v.prix));
}

// Niveau agrégé pour l'affichage catalogue (carte produit) d'un produit à variantes : il n'y a pas de
// stock unique à ce niveau (chaque variante porte le sien). "rupture" seulement si TOUTES les variantes
// sont explicitement à 0 ; sinon "en_stock" (au moins une valeur reste disponible, ou son stock n'est
// pas suivi). La fiche produit affiche ensuite le niveau exact de la variante sélectionnée.
export function niveauAgregeVariantes(variantes: VarianteProduit[]): NiveauAlerteStock {
  const toutesEpuisees = variantes.every((v) => v.stock !== undefined && v.stock <= 0);
  return toutesEpuisees ? "rupture" : "en_stock";
}
