// RG-06-002 — Génération de la facture pro forma (décision actée n°18)
// Taxe locale de 10 %, arrondie au centime le plus proche — méthode arithmétique standard (décision actée n°33).

export const TAUX_TAXE_DEFAUT = 0.10;

function arrondirCentime(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

export interface DetailFacture {
  montant_ht: number;
  taux_taxe: number;
  montant_taxe: number;
  montant_ttc: number;
}

export function calculerFacture(montantHT: number, tauxTaxe: number = TAUX_TAXE_DEFAUT): DetailFacture {
  const montantTaxe = arrondirCentime(montantHT * tauxTaxe);
  const montantTTC = arrondirCentime(montantHT + montantTaxe);
  return {
    montant_ht: arrondirCentime(montantHT),
    taux_taxe: tauxTaxe,
    montant_taxe: montantTaxe,
    montant_ttc: montantTTC,
  };
}
