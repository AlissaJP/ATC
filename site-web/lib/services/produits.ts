// Couche d'accès aux données — produits. Signatures async dès le départ pour permettre
// un remplacement futur par des appels PostgreSQL (Cahier 8) sans changer l'interface consommée par l'UI.
// BF-03-001 à BF-03-007.
import { produits, produitsParCategorie, trouverProduitParSlug } from "@/lib/mock-data/produits";
import { categories, trouverCategorieParSlug } from "@/lib/mock-data/categories";
import type { Produit } from "@/lib/types/entities";

export async function listerProduits(): Promise<Produit[]> {
  return produits.filter((p) => p.statut_publication === "publié");
}

export async function obtenirProduitParSlug(slug: string): Promise<Produit | undefined> {
  return trouverProduitParSlug(slug);
}

export async function listerProduitsParCategorieSlug(categorieSlug: string): Promise<Produit[]> {
  const categorie = trouverCategorieParSlug(categorieSlug);
  if (!categorie) return [];

  // Une catégorie parente (ex. Énergie solaire) regroupe les produits de ses sous-catégories
  // (ex. Panneaux, Batteries) — BF-01-012.
  const idsCategorie = [
    categorie.id,
    ...categories.filter((c) => c.parent_id === categorie.id).map((c) => c.id),
  ];

  // Correction #23 — les SKU de variante non canoniques (variante.masque) n'apparaissent jamais comme
  // fiche produit indépendante en catalogue ; seul le SKU canonique du groupe y figure, avec un
  // sélecteur de variante sur sa propre fiche (AchatProduit.tsx).
  return idsCategorie.flatMap((id) => produitsParCategorie(id)).filter((p) => !p.variante?.masque);
}

export async function listerCategories() {
  return categories;
}
