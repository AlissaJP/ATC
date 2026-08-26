// Couche d'accès aux données — compose produit + stock + barème + marque pour l'affichage catalogue.
// BF-01-012, BF-03-001, BF-03-002, BF-03-004.
import { listerProduits, listerProduitsParCategorieSlug } from "@/lib/services/produits";
import { obtenirNiveauAlerteStock } from "@/lib/services/stock";
import { obtenirPaliersProduit } from "@/lib/services/bareme";
import { trouverMarqueParId } from "@/lib/mock-data/marques";
import type { Marque, NiveauAlerteStock, PalierPrixB2B, Produit } from "@/lib/types/entities";

export interface ProduitEnrichi {
  produit: Produit;
  niveauStock: NiveauAlerteStock;
  paliers: PalierPrixB2B[];
  marque?: Marque;
}

async function enrichir(produit: Produit): Promise<ProduitEnrichi> {
  const [niveauStock, paliers] = await Promise.all([
    obtenirNiveauAlerteStock(produit.id),
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

// Ordre explicite pour les valeurs dont l'échelle n'est pas déductible du texte (ex. "2K"/"4K" ne sont
// pas des grandeurs directement comparables numériquement, contrairement à "405 Wc"/"550 Wc").
const ORDRE_CONNU: Record<string, number> = { "1080p": 0, "2K": 1, "4K": 2 };

function comparerValeursVariante(a: string, b: string): number {
  if (a in ORDRE_CONNU && b in ORDRE_CONNU) return ORDRE_CONNU[a] - ORDRE_CONNU[b];
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b);
}

// Raffinement Design — sélecteur de variante (fiche produit, ex. résolution d'une caméra, puissance d'un
// panneau solaire) : chaque valeur est un SKU (Produit) à part entière (lib/mock-data/produits.ts, champ
// variante), pas une variante virtuelle.
export async function listerVariantesProduit(groupe: string): Promise<ProduitEnrichi[]> {
  const tous = await listerProduits();
  const membres = tous.filter((p) => p.variante?.groupe === groupe);
  const enrichis = await Promise.all(membres.map(enrichir));
  return enrichis.sort((a, b) =>
    comparerValeursVariante(a.produit.variante?.valeur ?? "", b.produit.variante?.valeur ?? "")
  );
}
