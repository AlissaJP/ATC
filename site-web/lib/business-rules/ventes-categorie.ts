// BF-15-001 — Ventes par catégorie (3 catégories racines ATC : Énergie solaire, Sécurité, Climatisation
// — Électronique retirée du catalogue, l'entreprise ne vend plus cette gamme). Logique partagée entre Statistiques
// (back-office) et le widget du tableau de bord administrateur (ECR-12-001, même structure visuelle).
import type { Categorie, LigneCommande, Produit } from "@/lib/types/entities";
import { resoudreProduitEtVariante } from "@/lib/services/variantes";

function categorieRacine(categorieId: string, categories: Categorie[]): Categorie | undefined {
  const categorie = categories.find((c) => c.id === categorieId);
  if (!categorie) return undefined;
  if (!categorie.parent_id) return categorie;
  return categories.find((c) => c.id === categorie.parent_id) ?? categorie;
}

export function calculerVentesParCategorie(
  lignesCommande: LigneCommande[],
  produits: Produit[],
  categories: Categorie[]
): { nom: string; montant: number }[] {
  const totaux = new Map<string, number>();
  for (const ligne of lignesCommande) {
    // ligne.produit_id peut être un identifiant composite "produit::variante" (point #29) — résolu vers
    // le produit de base, la catégorie ne dépend pas de la variante choisie.
    const produit = resoudreProduitEtVariante(ligne.produit_id, produits)?.produit;
    if (!produit) continue;
    const racine = categorieRacine(produit.categorie_id, categories);
    if (!racine) continue;
    const montant = ligne.prix_unitaire_applique * ligne.quantite;
    totaux.set(racine.nom, (totaux.get(racine.nom) ?? 0) + montant);
  }
  return categories
    .filter((c) => !c.parent_id)
    .map((c) => ({ nom: c.nom, montant: totaux.get(c.nom) ?? 0 }))
    .sort((a, b) => b.montant - a.montant);
}
