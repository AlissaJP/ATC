// RG-03-002 — stock_reference par défaut 100 (décision actée n°28), sauf ajustement individuel.
// Intégration du catalogue ATC (étape 4) : le client n'a communiqué aucune quantité. Chaque produit sans
// variantes reçoit donc le stock de référence par défaut (100) et un stock_actuel null = non suivi
// (« En stock », aucune quantité inventée). Les seuils d'alerte (≤ 40 % orange, ≤ 15 % rouge) s'appliquent
// dès qu'une quantité réelle est saisie depuis /admin/stock. Pour un produit à variantes, le stock vit
// dans Produit.variantes[].stock (point #29), pas ici.
import type { Stock } from "@/lib/types/entities";
import { produits } from "./produits";

const STOCK_REFERENCE_PAR_DEFAUT = 100;

export const stock: Stock[] = produits
  .filter((p) => !p.variantes || p.variantes.length === 0)
  .map((p) => ({ produit_id: p.id, stock_actuel: null, stock_reference: STOCK_REFERENCE_PAR_DEFAUT }));

export function trouverStockParProduit(produitId: string): Stock | undefined {
  return stock.find((s) => s.produit_id === produitId);
}

// Quantité vendable d'un produit référencé sans variante choisie (configurateur, package, ligne simple).
// undefined = stock non suivi (stock_actuel null : aucun plafond, même convention que
// stockEffectifVariante) ; 0 si le produit n'a aucune ligne de stock (comportement historique : rupture).
// Un produit à variantes n'a pas de ligne ici (point #29) : son stock est la somme de celui de ses
// variantes, non suivi dès qu'une variante ne l'est pas — sinon il paraîtrait en rupture, ce qui rendait
// par exemple le panneau ES-01, seul panneau du catalogue ATC, impossible à choisir dans le configurateur.
export function quantiteDisponible(produitId: string): number | undefined {
  const variantes = produits.find((p) => p.id === produitId)?.variantes;
  if (variantes && variantes.length > 0) {
    if (variantes.some((v) => v.stock === undefined)) return undefined;
    return variantes.reduce((total, v) => total + Math.max(0, v.stock ?? 0), 0);
  }
  const s = trouverStockParProduit(produitId);
  if (!s) return 0;
  return s.stock_actuel ?? undefined;
}

// ECR-12-002 — édition stock_actuel / stock_reference depuis le back-office. Mutation en place
// (voir lib/mock-data/produits.ts) ; invoquée uniquement depuis lib/actions/catalogue-admin.ts.
export function definirStockMock(produitId: string, stockActuel: number, stockReference: number): Stock {
  const index = stock.findIndex((s) => s.produit_id === produitId);
  const ligne: Stock = { produit_id: produitId, stock_actuel: stockActuel, stock_reference: stockReference };
  if (index === -1) {
    stock.push(ligne);
  } else {
    stock.splice(index, 1, ligne);
  }
  return ligne;
}

export function supprimerStockMock(produitId: string): void {
  const index = stock.findIndex((s) => s.produit_id === produitId);
  if (index !== -1) stock.splice(index, 1);
}

// Raffinement Design — la section Stock (/admin/stock, SuiviStock.tsx) est éditable directement (plus de
// duplication de cette édition dans le Catalogue). Pour un produit à variantes (point #29), le stock vit
// dans Produit.variantes[].stock plutôt que dans ce tableau : voir definirStockVarianteMock,
// lib/mock-data/produits.ts.
