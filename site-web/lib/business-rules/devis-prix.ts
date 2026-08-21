// RG-04-003 — Détermination du prix d'un devis (package personnalisé), décision actée n°16
// Somme des prix de chaque composant selon son barème de palier (RG-03-004), + coût d'installation (RG-09-002) le cas échéant.
import type { PalierPrixB2B } from "@/lib/types/entities";
import { prixTotalB2B } from "./bareme-b2b";

export interface ComposantDevis {
  produit_id: string;
  quantite: number;
  paliers: PalierPrixB2B[];
}

export function calculerPrixDevis(composants: ComposantDevis[], coutInstallation = 0): number {
  const totalComposants = composants.reduce((somme, c) => {
    const prix = prixTotalB2B(c.paliers, c.quantite) ?? 0;
    return somme + prix;
  }, 0);
  return totalComposants + coutInstallation;
}
