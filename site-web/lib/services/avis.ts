import type { AvisClient } from "@/lib/types/entities";

// Calcul partagé entre AvisProduit.tsx (fiche produit) et ProductCard.tsx (grille catalogue) —
// seuls les avis "publie" (modérés) sont comptés côté client, jamais ceux en attente/rejetés.
export function calculerAvisPublies(avis: AvisClient[], produitId: string) {
  const publies = avis.filter((a) => a.produit_id === produitId && a.statut === "publie");
  const moyenne = publies.length > 0 ? publies.reduce((s, a) => s + a.note, 0) / publies.length : undefined;
  return { moyenne, nombre: publies.length };
}
