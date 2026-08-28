// Raffinement Design — journal mock des mouvements de stock (entrées/sorties, décision actée n°47, cf.
// lib/types/entities.ts). Comme journal-agents-sav.ts (point #27), les entrées ci-dessous simulent un
// historique déjà constitué pour tester l'affichage/les filtres — les quantités ne sont pas reconciliées
// arithmétiquement avec lib/mock-data/stock.ts (stock_actuel courant), qui reste la seule source de
// vérité pour la quantité affichée ; ce journal illustre les dates de transaction, pas un solde recalculé.
import type { MouvementStock } from "@/lib/types/entities";

type MouvementInputMock = Omit<MouvementStock, "id">;

const maintenant = Date.now();
const ilYA = (jours: number, heure = 9) => {
  const d = new Date(maintenant - jours * 24 * 60 * 60 * 1000);
  d.setHours(heure, 0, 0, 0);
  return d.toISOString();
};

export const mouvementsStock: MouvementStock[] = [
  // --- Énergie solaire ---
  { id: "mvt-1", produit_id: "prod-panneau-405w", variante_id: "var-panneau-405w", type: "entree", quantite: 40, date: ilYA(28, 8), reference: "Réassort fournisseur SolarMax" },
  { id: "mvt-2", produit_id: "prod-panneau-405w", variante_id: "var-panneau-405w", type: "sortie", quantite: 12, date: ilYA(6, 14), reference: "Commande #4F2A9C1B" },
  { id: "mvt-3", produit_id: "prod-panneau-405w", variante_id: "var-panneau-550w", type: "entree", quantite: 20, date: ilYA(28, 8), reference: "Réassort fournisseur SolarMax" },
  { id: "mvt-4", produit_id: "prod-panneau-405w", variante_id: "var-panneau-550w", type: "sortie", quantite: 5, date: ilYA(2, 11), reference: "Commande #7B31E084" },
  { id: "mvt-5", produit_id: "prod-batterie-lithium-100ah", type: "entree", quantite: 30, date: ilYA(35, 9), reference: "Réassort fournisseur EcoTech" },
  { id: "mvt-6", produit_id: "prod-batterie-lithium-100ah", type: "sortie", quantite: 10, date: ilYA(14, 15), reference: "Commande #1D9F6E52" },
  { id: "mvt-7", produit_id: "prod-batterie-lithium-100ah", type: "sortie", quantite: 8, date: ilYA(4, 10), reference: "Commande #9A4C7731" },
  { id: "mvt-8", produit_id: "prod-batterie-gel-200ah", type: "sortie", quantite: 15, date: ilYA(9, 13), reference: "Commande #3C5E8A20" },
  { id: "mvt-9", produit_id: "prod-regulateur-mppt-60a", type: "entree", quantite: 50, date: ilYA(20, 9), reference: "Réassort fournisseur EcoTech" },
  { id: "mvt-10", produit_id: "prod-kit-cables-mc4", type: "entree", quantite: 150, date: ilYA(15, 8), reference: "Réassort fournisseur" },

  // --- Climatisation ---
  { id: "mvt-11", produit_id: "prod-climatiseur-split-12000", type: "entree", quantite: 25, date: ilYA(30, 9), reference: "Réassort fournisseur Carrier" },
  { id: "mvt-12", produit_id: "prod-climatiseur-split-12000", type: "sortie", quantite: 6, date: ilYA(5, 14), reference: "Commande #2E7B4F91" },
  { id: "mvt-13", produit_id: "prod-climatiseur-split-18000", type: "sortie", quantite: 4, date: ilYA(11, 10), reference: "Commande #8A1D3C56" },
  { id: "mvt-14", produit_id: "prod-climatiseur-tgm", type: "sortie", quantite: 20, date: ilYA(18, 16), reference: "Commande #6F9A2E48" },
  { id: "mvt-15", produit_id: "prod-climatiseur-tgm", type: "entree", quantite: 15, date: ilYA(45, 9), reference: "Réassort fournisseur TGM" },

  // --- Sécurité ---
  { id: "mvt-16", produit_id: "prod-camera-ptz-standard", variante_id: "var-camera-1080p", type: "entree", quantite: 40, date: ilYA(22, 8), reference: "Réassort fournisseur SecurVision" },
  { id: "mvt-17", produit_id: "prod-camera-ptz-standard", variante_id: "var-camera-1080p", type: "sortie", quantite: 8, date: ilYA(3, 13), reference: "Commande #5B8E1A73" },
  { id: "mvt-18", produit_id: "prod-camera-ptz-standard", variante_id: "var-camera-4k", type: "entree", quantite: 12, date: ilYA(22, 8), reference: "Réassort fournisseur SecurVision" },
  { id: "mvt-19", produit_id: "prod-camera-ptz-standard", variante_id: "var-camera-4k", type: "sortie", quantite: 6, date: ilYA(1, 10), reference: "Commande #0D4F7B29" },
  { id: "mvt-20", produit_id: "prod-sonnette-video", type: "entree", quantite: 60, date: ilYA(25, 9), reference: "Réassort fournisseur SecurVision" },
  { id: "mvt-21", produit_id: "prod-sonnette-video", type: "sortie", quantite: 10, date: ilYA(7, 12), reference: "Commande #3A6C9D15" },
  { id: "mvt-22", produit_id: "prod-camera-ptz-solaire", type: "entree", quantite: 10, date: ilYA(40, 8), reference: "Réassort fournisseur SecurVision" },
];

let compteurMouvementId = 0;
function genererIdMouvement(): string {
  compteurMouvementId += 1;
  return `mvt-admin-${Date.now()}-${compteurMouvementId}`;
}

// ECR-12-002 — enregistrement d'un mouvement depuis le back-office (Raffinement Design). Mutation en
// place (voir lib/mock-data/produits.ts) ; invoquée uniquement depuis lib/actions/stock-admin.ts, qui
// porte la validation métier (quantité positive, stock suffisant pour une sortie).
export function enregistrerMouvementMock(input: MouvementInputMock): MouvementStock {
  const mouvement: MouvementStock = { id: genererIdMouvement(), ...input };
  mouvementsStock.push(mouvement);
  return mouvement;
}
