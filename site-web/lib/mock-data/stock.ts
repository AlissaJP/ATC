// RG-03-002 — stock_reference par défaut 100 (décision actée n°28), sauf ajustement individuel.
// Niveaux volontairement variés pour couvrir les 4 états (en_stock / alerte_orange / alerte_rouge / rupture),
// avec deux cas limites exacts (40% et 15%) pour vérifier TC-03-001-b et TC-03-001-d.
import type { Stock } from "@/lib/types/entities";

export const stock: Stock[] = [
  // prod-panneau-405w : produit à variantes (point #29) — le stock par valeur vit directement dans
  // Produit.variantes[].stock (lib/mock-data/produits.ts), pas ici.
  { produit_id: "prod-batterie-lithium-100ah", stock_actuel: 12, stock_reference: 100 },
  { produit_id: "prod-batterie-gel-200ah", stock_actuel: 0, stock_reference: 100 },
  { produit_id: "prod-regulateur-mppt-60a", stock_actuel: 80, stock_reference: 100 },
  { produit_id: "prod-onduleur-hybride-5kva", stock_actuel: 40, stock_reference: 100 },
  { produit_id: "prod-kit-cables-mc4", stock_actuel: 200, stock_reference: 100 },
  { produit_id: "prod-structure-montage", stock_actuel: 55, stock_reference: 100 },
  { produit_id: "prod-kit-mise-a-la-terre", stock_actuel: 15, stock_reference: 100 },
  { produit_id: "prod-sonnette-video", stock_actuel: 70, stock_reference: 100 },
  // prod-camera-ptz-standard : produit à variantes (point #29) — idem, stock dans variantes[].stock.
  { produit_id: "prod-camera-ptz-solaire", stock_actuel: 5, stock_reference: 50 },
  { produit_id: "prod-climatiseur-split-12000", stock_actuel: 45, stock_reference: 100 },
  { produit_id: "prod-climatiseur-split-18000", stock_actuel: 18, stock_reference: 100 },
  { produit_id: "prod-climatiseur-tgm", stock_actuel: 0, stock_reference: 100 },
];

export function trouverStockParProduit(produitId: string): Stock | undefined {
  return stock.find((s) => s.produit_id === produitId);
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
