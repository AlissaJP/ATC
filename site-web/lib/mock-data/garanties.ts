// RG-09-001 — Durées de garantie par catégorie (décision actée n°19, valeurs de travail).
// Intégration du catalogue ATC : aucune entrée pour les sous-catégories du catalogue client (Panneaux
// solaires, Onduleurs...), donc aucune garantie générique affichée sur ces vrais produits — le client n'en a
// pas communiqué (une garantie fabricant figure parfois dans leurs caractéristiques). Les entrées racines
// restent pour un produit rattaché directement à une catégorie racine depuis l'admin.
import type { Garantie } from "@/lib/types/entities";

export const garanties: Garantie[] = [
  { categorie_id: "cat-energie-solaire", duree_mois: 24 },
  { categorie_id: "cat-securite", duree_mois: 12 },
  { categorie_id: "cat-climatisation", duree_mois: 12 },
];

export function trouverGarantieParCategorie(categorieId: string): Garantie | undefined {
  return garanties.find((g) => g.categorie_id === categorieId);
}
