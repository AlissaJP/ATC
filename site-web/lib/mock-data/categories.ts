// Catalogue produit fictif de démonstration — décision actée n°42.
import type { Categorie } from "@/lib/types/entities";

export const categories: Categorie[] = [
  { id: "cat-electronique", slug: "electronique", nom: "Électronique" },
  { id: "cat-energie-solaire", slug: "energie-solaire", nom: "Énergie solaire" },
  { id: "cat-panneaux", slug: "panneaux-solaires", nom: "Panneaux solaires", parent_id: "cat-energie-solaire" },
  { id: "cat-batteries", slug: "batteries", nom: "Batteries", parent_id: "cat-energie-solaire" },
  { id: "cat-regulateurs", slug: "regulateurs-onduleurs", nom: "Régulateurs & onduleurs", parent_id: "cat-energie-solaire" },
  { id: "cat-accessoires-solaires", slug: "accessoires-solaires", nom: "Accessoires solaires", parent_id: "cat-energie-solaire" },
  { id: "cat-securite", slug: "securite", nom: "Sécurité" },
  { id: "cat-climatisation", slug: "climatisation", nom: "Climatisation" },
];

export function trouverCategorieParSlug(slug: string): Categorie | undefined {
  return categories.find((c) => c.slug === slug);
}
