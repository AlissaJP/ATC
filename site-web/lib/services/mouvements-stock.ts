// Raffinement Design — filtrage/agrégation des mouvements de stock (entrées/sorties, décision actée
// n°47), en fonctions pures (même idiome que lib/services/journal-agents-sav.ts, point #27).
import type { MouvementStock, TypeMouvementStock } from "@/lib/types/entities";

export function filtrerMouvementsStock(
  mouvements: MouvementStock[],
  filtres: { produitIds?: Set<string>; type?: TypeMouvementStock; depuis?: Date }
): MouvementStock[] {
  return [...mouvements]
    .filter((m) => !filtres.produitIds || filtres.produitIds.has(m.produit_id))
    .filter((m) => !filtres.type || m.type === filtres.type)
    .filter((m) => !filtres.depuis || new Date(m.date) >= filtres.depuis)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Date du dernier mouvement d'un type donné pour un produit (ou une variante précise, point #29) —
// affichée dans les colonnes "Dernière entrée" / "Dernière sortie" de SuiviStock.tsx.
export function derniereDateMouvement(
  mouvements: MouvementStock[],
  produitId: string,
  type: TypeMouvementStock,
  varianteId?: string
): string | undefined {
  const correspondants = mouvements.filter(
    (m) => m.produit_id === produitId && m.type === type && m.variante_id === varianteId
  );
  if (correspondants.length === 0) return undefined;
  return correspondants.reduce((plusRecent, m) => (m.date > plusRecent ? m.date : plusRecent), correspondants[0].date);
}
