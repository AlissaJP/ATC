// RG-09-002 — Éligibilité à l'assistance à l'installation interne : réservée aux produits de la famille
// Énergie solaire achetés via package pré-configuré ou devis personnalisé ; non applicable à
// l'électronique, la sécurité ou la climatisation en V1. UC-09-001, scénario d'erreur E1 : un produit non
// éligible ne doit simplement pas afficher l'option de planification.
import type { Categorie, Produit } from "@/lib/types/entities";

const CATEGORIE_ENERGIE_SOLAIRE = "cat-energie-solaire";

function categorieRacine(categorieId: string, categories: Categorie[]): Categorie | undefined {
  const categorie = categories.find((c) => c.id === categorieId);
  if (!categorie) return undefined;
  if (!categorie.parent_id) return categorie;
  return categories.find((c) => c.id === categorie.parent_id) ?? categorie;
}

export function produitEstEligibleInstallation(produit: Produit, categories: Categorie[]): boolean {
  return categorieRacine(produit.categorie_id, categories)?.id === CATEGORIE_ENERGIE_SOLAIRE;
}

export function commandeEstEligibleInstallation(produitsCommande: Produit[], categories: Categorie[]): boolean {
  return produitsCommande.some((p) => produitEstEligibleInstallation(p, categories));
}
