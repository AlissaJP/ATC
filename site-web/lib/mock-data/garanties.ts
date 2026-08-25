// RG-09-001 — Durées de garantie par catégorie (décision actée n°19, valeurs de travail).
import type { Garantie } from "@/lib/types/entities";

export const garanties: Garantie[] = [
  { categorie_id: "cat-energie-solaire", duree_mois: 24 },
  { categorie_id: "cat-panneaux", duree_mois: 24 },
  { categorie_id: "cat-batteries", duree_mois: 24 },
  { categorie_id: "cat-regulateurs", duree_mois: 24 },
  { categorie_id: "cat-accessoires-solaires", duree_mois: 24 },
  { categorie_id: "cat-securite", duree_mois: 12 },
  { categorie_id: "cat-climatisation", duree_mois: 12 },
];

export function trouverGarantieParCategorie(categorieId: string): Garantie | undefined {
  return garanties.find((g) => g.categorie_id === categorieId);
}
