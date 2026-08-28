// Raffinement Design — navigation par catégorie racine, partagée entre Catalogue (GestionCatalogue.tsx)
// et Stock (SuiviStock.tsx) : mêmes 3 catégories, même ordre que la navigation publique du site (pas
// l'ordre brut de lib/mock-data/categories.ts, où Sécurité précède Climatisation) — Packages n'est pas
// une catégorie du catalogue (cf. Header.tsx).
import type { Categorie } from "@/lib/types/entities";

export const ORDRE_SLUGS_CATEGORIES_ADMIN = ["energie-solaire", "climatisation", "securite"];

export function categoriesRacinesOrdonnees(categories: Categorie[]): Categorie[] {
  const racines = categories.filter((c) => !c.parent_id);
  return ORDRE_SLUGS_CATEGORIES_ADMIN.map((slug) => racines.find((c) => c.slug === slug)).filter(
    (c): c is Categorie => Boolean(c)
  );
}

// Une catégorie racine (ex. Énergie solaire) regroupe aussi les produits de ses sous-catégories (ex.
// Panneaux, Batteries) — même agrégation que lib/services/produits.ts (listerProduitsParCategorieSlug).
export function idsCategorieEtEnfants(categories: Categorie[], racineId: string): Set<string> {
  const enfants = categories.filter((c) => c.parent_id === racineId).map((c) => c.id);
  return new Set([racineId, ...enfants]);
}
