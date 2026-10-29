// Raffinement Design — journal mock des mouvements de stock (entrées/sorties, décision actée n°47, cf.
// lib/types/entities.ts). Comme journal-agents-sav.ts (point #27), ce journal illustre les dates de
// transaction ; lib/mock-data/stock.ts reste la seule source de vérité pour la quantité affichée.
import type { MouvementStock } from "@/lib/types/entities";

type MouvementInputMock = Omit<MouvementStock, "id">;

// Intégration du catalogue ATC (étape 4) : l'historique simulé portait sur les produits de démonstration,
// supprimés. Aucun mouvement n'est inventé pour les vrais produits : le journal démarre vide et se remplit
// avec les mouvements saisis depuis /admin/stock.
export const mouvementsStock: MouvementStock[] = [];

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
