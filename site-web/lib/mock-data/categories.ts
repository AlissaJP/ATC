// Catégories du catalogue ATC — racines (navigation) et sous-catégories du catalogue client
// (catalogue-atc.json, champ `sousCategorie`). Intégration du catalogue ATC (étape 4) : les sous-catégories
// de démonstration (Batteries, Régulateurs & onduleurs, Accessoires solaires) sont remplacées par celles du
// client. Les slugs racines restent inchangés pour ne casser aucune URL. Les packages solaires ne sont pas
// une catégorie du catalogue (lib/mock-data/packages-preconfigures.ts, page /packages).
import type { Categorie } from "@/lib/types/entities";

export const categories: Categorie[] = [
  { id: "cat-energie-solaire", slug: "energie-solaire", nom: "Énergie solaire" },
  { id: "cat-panneaux", slug: "panneaux-solaires", nom: "Panneaux solaires", parent_id: "cat-energie-solaire" },
  { id: "cat-onduleurs", slug: "onduleurs", nom: "Onduleurs", parent_id: "cat-energie-solaire" },
  { id: "cat-batteries-lithium", slug: "batteries-lithium", nom: "Batteries lithium", parent_id: "cat-energie-solaire" },
  {
    id: "cat-stockage-commercial",
    slug: "stockage-commercial-industriel",
    nom: "Stockage commercial et industriel",
    parent_id: "cat-energie-solaire",
  },
  {
    id: "cat-structures-accessoires",
    slug: "structures-accessoires",
    nom: "Structures et accessoires",
    parent_id: "cat-energie-solaire",
  },
  { id: "cat-securite", slug: "securite", nom: "Sécurité" },
  { id: "cat-cameras", slug: "cameras", nom: "Caméras", parent_id: "cat-securite" },
  { id: "cat-climatisation", slug: "climatisation", nom: "Climatisation" },
  {
    id: "cat-climatiseurs-residentiels",
    slug: "climatiseurs-residentiels",
    nom: "Climatiseurs résidentiels (split mural)",
    parent_id: "cat-climatisation",
  },
  {
    id: "cat-climatisation-centrale",
    slug: "climatisation-centrale-commerciale",
    nom: "Climatisation centrale et commerciale",
    parent_id: "cat-climatisation",
  },
  { id: "cat-gaines", slug: "gaines-distribution-air", nom: "Gaines et distribution d'air", parent_id: "cat-climatisation" },
  { id: "cat-service-climatisation", slug: "service-climatisation", nom: "Service associé", parent_id: "cat-climatisation" },
];

export function trouverCategorieParSlug(slug: string): Categorie | undefined {
  return categories.find((c) => c.slug === slug);
}
