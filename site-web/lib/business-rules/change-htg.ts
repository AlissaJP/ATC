// RG-06-003 / RG-06-004 — Taux de change HTG/USD manuel (décision actée n°24) et conversion
// exclusivement à l'affichage du paiement MonCash (décision actée n°25) ou d'un virement sur le compte en
// gourdes d'ATC. Aucune récupération automatique.

export function convertirUsdVersHtg(montantUsd: number, tauxChangeHtgUsd: number): number {
  return Math.round(montantUsd * tauxChangeHtgUsd * 100) / 100;
}
