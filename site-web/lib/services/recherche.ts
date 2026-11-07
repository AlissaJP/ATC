// BF-02-001 — Barre de recherche avec suggestions dynamiques dès la saisie. RG-14-001 : un produit est
// trouvé par son nom français (source) comme par son nom dans la langue du visiteur.
import { produits } from "@/lib/mock-data/produits";
import { localiserProduit } from "@/lib/i18n/catalogue";
import type { Langue, Produit } from "@/lib/types/entities";

export async function rechercherProduits(requete: string, limite?: number, langue: Langue = "fr"): Promise<Produit[]> {
  const q = requete.trim().toLowerCase();
  if (q.length === 0) return [];

  const resultats = produits.filter(
    (p) =>
      p.statut_publication === "publié" &&
      (p.nom.toLowerCase().includes(q) || localiserProduit(p, langue).nom.toLowerCase().includes(q))
  );

  return limite ? resultats.slice(0, limite) : resultats;
}
