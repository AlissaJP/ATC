// Raffinement Design — vue d'ensemble du stock (back-office), en fonction pure : reçoit produits/stock/
// catégories en paramètre, aucun accès direct aux mock-data/stores. Regroupe chaque produit (ou, pour un
// produit à variantes — point #29 —, chaque variante) dans l'un des 3 niveaux d'alerte affichés
// (lib/business-rules/stock-alerte.ts, RG-03-002) : "alerte_rouge" et "rupture" sont fusionnés dans le
// même panier rouge (rupture est au moins aussi critique qu'une alerte rouge), pour donner exactement 3
// paniers (vert/jaune/rouge) plutôt que les 4 niveaux bruts.
import { determinerNiveauAlerteStock } from "@/lib/business-rules/stock-alerte";
import type { Categorie, NiveauAlerteStock, Produit, Stock } from "@/lib/types/entities";

export type PanierStock = "vert" | "jaune" | "rouge";

export interface LigneSuiviStock {
  id: string;
  produitId: string;
  // Présent seulement pour une ligne issue d'une variante (point #29) — distingue les 2 chemins d'édition
  // côté SuiviStock.tsx (definirStockAction vs definirStockVarianteAction, lib/actions/catalogue-admin.ts).
  varianteId?: string;
  nom: string;
  categorieId: string;
  categorieNom: string;
  // undefined = stock non suivi pour cette variante (point #29) — toujours considéré "vert" (disponible).
  quantite?: number;
  panier: PanierStock;
}

function panierDepuisNiveau(niveau: NiveauAlerteStock): PanierStock {
  if (niveau === "en_stock") return "vert";
  if (niveau === "alerte_orange") return "jaune";
  return "rouge"; // alerte_rouge + rupture
}

// Une variante n'a pas de stock_reference propre (point #29) : 100 reprend le même défaut que celui
// appliqué à la création d'un produit sans variante (décision actée n°28, lib/actions/catalogue-admin.ts).
const REFERENCE_PAR_DEFAUT_VARIANTE = 100;

export function construireSuiviStock(produits: Produit[], stock: Stock[], categories: Categorie[]): LigneSuiviStock[] {
  const lignes: LigneSuiviStock[] = [];

  for (const produit of produits) {
    const categorieNom = categories.find((c) => c.id === produit.categorie_id)?.nom ?? "—";

    if (produit.variantes && produit.variantes.length > 0) {
      for (const variante of produit.variantes) {
        const niveau =
          variante.stock === undefined ? "en_stock" : determinerNiveauAlerteStock(variante.stock, REFERENCE_PAR_DEFAUT_VARIANTE);
        lignes.push({
          id: variante.id,
          produitId: produit.id,
          varianteId: variante.id,
          nom: `${produit.nom} — ${variante.attribut} ${variante.valeur}`,
          categorieId: produit.categorie_id,
          categorieNom,
          quantite: variante.stock,
          panier: panierDepuisNiveau(niveau),
        });
      }
      continue;
    }

    const s = stock.find((st) => st.produit_id === produit.id);
    const niveau = s ? determinerNiveauAlerteStock(s.stock_actuel, s.stock_reference) : "rupture";
    lignes.push({
      id: produit.id,
      produitId: produit.id,
      nom: produit.nom,
      categorieId: produit.categorie_id,
      categorieNom,
      quantite: s?.stock_actuel,
      panier: panierDepuisNiveau(niveau),
    });
  }

  return lignes;
}
