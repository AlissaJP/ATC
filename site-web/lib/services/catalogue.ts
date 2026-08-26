// Couche d'accès aux données — compose produit + stock + barème + marque pour l'affichage catalogue.
// BF-01-012, BF-03-001, BF-03-002, BF-03-004.
import { listerProduits, listerProduitsParCategorieSlug } from "@/lib/services/produits";
import { obtenirNiveauAlerteStock } from "@/lib/services/stock";
import { obtenirPaliersProduit } from "@/lib/services/bareme";
import { niveauAgregeVariantes } from "@/lib/services/variantes";
import { trouverMarqueParId } from "@/lib/mock-data/marques";
import type { Marque, NiveauAlerteStock, PalierPrixB2B, Produit } from "@/lib/types/entities";

export interface ProduitEnrichi {
  produit: Produit;
  niveauStock: NiveauAlerteStock;
  paliers: PalierPrixB2B[];
  marque?: Marque;
}

async function enrichir(produit: Produit): Promise<ProduitEnrichi> {
  // Point #29 — un produit à variantes n'a pas de stock unique à ce niveau : chaque variante porte le
  // sien (Produit.variantes[].stock), agrégé ici pour l'affichage catalogue (StockBadge de la carte).
  const [niveauStock, paliers] = await Promise.all([
    produit.variantes && produit.variantes.length > 0
      ? Promise.resolve(niveauAgregeVariantes(produit.variantes))
      : obtenirNiveauAlerteStock(produit.id),
    obtenirPaliersProduit(produit.id),
  ]);
  return { produit, niveauStock, paliers, marque: produit.marque_id ? trouverMarqueParId(produit.marque_id) : undefined };
}

export async function listerProduitsEnrichis(categorieSlug?: string): Promise<ProduitEnrichi[]> {
  const produits = categorieSlug
    ? await listerProduitsParCategorieSlug(categorieSlug)
    : await listerProduits();
  return Promise.all(produits.map(enrichir));
}

export async function obtenirProduitEnrichiParSlug(slug: string): Promise<ProduitEnrichi | undefined> {
  const tous = await listerProduits();
  const produit = tous.find((p) => p.slug === slug);
  if (!produit) return undefined;
  return enrichir(produit);
}

export async function listerProduitsEnrichisParIds(ids: string[]): Promise<ProduitEnrichi[]> {
  const tous = await listerProduits();
  const produits = ids.map((id) => tous.find((p) => p.id === id)).filter((p): p is Produit => Boolean(p));
  return Promise.all(produits.map(enrichir));
}
