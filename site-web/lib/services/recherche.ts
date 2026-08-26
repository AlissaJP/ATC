// BF-02-001 — Barre de recherche avec suggestions dynamiques dès la saisie.
import { produits } from "@/lib/mock-data/produits";
import type { Produit } from "@/lib/types/entities";

export async function rechercherProduits(requete: string, limite?: number): Promise<Produit[]> {
  const q = requete.trim().toLowerCase();
  if (q.length === 0) return [];

  // Correction #23 — les SKU de variante de résolution non canoniques ne sont pas trouvables
  // indépendamment (cf. lib/services/produits.ts) : une seule fiche produit par groupe de résolutions.
  const resultats = produits.filter(
    (p) => p.statut_publication === "publié" && !p.variante_resolution?.masque && p.nom.toLowerCase().includes(q)
  );

  return limite ? resultats.slice(0, limite) : resultats;
}
