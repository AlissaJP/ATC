// BF-02-001 — Barre de recherche avec suggestions dynamiques dès la saisie.
import { produits } from "@/lib/mock-data/produits";
import type { Produit } from "@/lib/types/entities";

export async function rechercherProduits(requete: string, limite?: number): Promise<Produit[]> {
  const q = requete.trim().toLowerCase();
  if (q.length === 0) return [];

  const resultats = produits.filter(
    (p) => p.statut_publication === "publié" && p.nom.toLowerCase().includes(q)
  );

  return limite ? resultats.slice(0, limite) : resultats;
}
