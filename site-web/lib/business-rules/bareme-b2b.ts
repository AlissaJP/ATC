// RG-03-004 — Barème de prix B2B par palier de quantité (décision actée n°16)
// Cahier 9, section 6 : aucune plage [quantite_min, quantite_max] ne doit chevaucher une autre plage du même produit.
import type { PalierPrixB2B } from "@/lib/types/entities";

/**
 * Retourne le palier applicable pour une quantité donnée.
 * Si la quantité dépasse le plus haut palier défini, le dernier palier (illimité) s'applique.
 * Si la quantité est inférieure au plus bas palier, le palier le plus proche (le premier) s'applique
 * — Cahier 6, ECR-03-001, scénario A2 de UC-03-001.
 */
export function trouverPalierApplicable(
  paliers: PalierPrixB2B[],
  quantite: number
): PalierPrixB2B | undefined {
  if (paliers.length === 0) return undefined;

  const tries = [...paliers].sort((a, b) => a.quantite_min - b.quantite_min);

  const exact = tries.find(
    (p) => quantite >= p.quantite_min && (p.quantite_max === undefined || quantite <= p.quantite_max)
  );
  if (exact) return exact;

  if (quantite < tries[0].quantite_min) return tries[0];
  return tries[tries.length - 1];
}

export function prixTotalB2B(paliers: PalierPrixB2B[], quantite: number): number | undefined {
  const palier = trouverPalierApplicable(paliers, quantite);
  return palier ? palier.prix_unitaire * quantite : undefined;
}

export interface ConflitPalier {
  a: PalierPrixB2B;
  b: PalierPrixB2B;
}

/** Détecte les chevauchements de plages pour un même produit — contrainte d'intégrité Cahier 9 section 6. */
export function detecterChevauchementsPaliers(paliers: PalierPrixB2B[]): ConflitPalier[] {
  const conflits: ConflitPalier[] = [];
  const tries = [...paliers].sort((a, b) => a.quantite_min - b.quantite_min);

  for (let i = 0; i < tries.length; i++) {
    for (let j = i + 1; j < tries.length; j++) {
      const a = tries[i];
      const b = tries[j];
      const finA = a.quantite_max ?? Infinity;
      if (b.quantite_min <= finA) {
        conflits.push({ a, b });
      }
    }
  }
  return conflits;
}
