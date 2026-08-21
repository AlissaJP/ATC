// BF-01-006 — Filtre par marque. Exemples cités au Cahier 3 (HP, Dell, Toshiba) pour l'Électronique.
// Carrier et TGM sont les marques réellement visibles sur les photos d'installation climatisation
// (Photos-Traitees/climatisation) ; les autres marques sont génériques et plausibles, aucune marque
// réelle n'apparaissant sur les visuels solaire/sécurité correspondants.
import type { Marque } from "@/lib/types/entities";

export const marques: Marque[] = [
  { id: "marque-hp", nom: "HP" },
  { id: "marque-dell", nom: "Dell" },
  { id: "marque-toshiba", nom: "Toshiba" },
  { id: "marque-starlink", nom: "Starlink" },
  { id: "marque-solarmax", nom: "SolarMax" },
  { id: "marque-ecotech", nom: "EcoTech Energy" },
  { id: "marque-securvision", nom: "SecurVision" },
  { id: "marque-carrier", nom: "Carrier" },
  { id: "marque-tgm", nom: "TGM" },
];

export function trouverMarqueParId(id: string): Marque | undefined {
  return marques.find((m) => m.id === id);
}
