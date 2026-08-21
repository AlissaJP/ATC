// RG-03-004 — Barème de prix B2B par palier de quantité (décision actée n°16).
// 3 paliers standards par produit éligible B2B : [1-9] prix public, [10-49] -8%, [50+] -15%.
// Plages volontairement contiguës et non chevauchantes (Cahier 9, section 6).
import type { PalierPrixB2B } from "@/lib/types/entities";
import { produits } from "./produits";

function genererPaliers(produitId: string, prixPublic: number): PalierPrixB2B[] {
  const arrondir = (v: number) => Math.round(v * 100) / 100;
  return [
    { id: `${produitId}-p1`, produit_id: produitId, quantite_min: 1, quantite_max: 9, prix_unitaire: arrondir(prixPublic) },
    { id: `${produitId}-p2`, produit_id: produitId, quantite_min: 10, quantite_max: 49, prix_unitaire: arrondir(prixPublic * 0.92) },
    { id: `${produitId}-p3`, produit_id: produitId, quantite_min: 50, prix_unitaire: arrondir(prixPublic * 0.85) },
  ];
}

export const paliersPrixB2B: PalierPrixB2B[] = produits
  .filter((p) => p.eligible_b2b)
  .flatMap((p) => genererPaliers(p.id, p.prix_public));

export function paliersParProduit(produitId: string): PalierPrixB2B[] {
  return paliersPrixB2B.filter((p) => p.produit_id === produitId);
}

// --- ECR-12-002 : éditeur de barème B2B depuis le back-office (ajout/suppression, UC-12-001 E1) ---
// Mutation en place (voir lib/mock-data/produits.ts) ; invoquées uniquement depuis
// lib/actions/catalogue-admin.ts, qui porte la détection de chevauchement (detecterChevauchementsPaliers).

// Génère le barème 3 paliers par défaut (même logique que le seed initial) pour un produit qui devient
// éligible B2B depuis le formulaire admin — l'admin peut ensuite ajuster/supprimer ces paliers.
export function genererPaliersParDefaut(produitId: string, prixPublic: number): PalierPrixB2B[] {
  return genererPaliers(produitId, prixPublic);
}

export function ajouterPaliersMock(paliers: PalierPrixB2B[]): void {
  paliersPrixB2B.push(...paliers);
}

export interface PalierInputMock {
  produit_id: string;
  quantite_min: number;
  quantite_max?: number;
  prix_unitaire: number;
}

let compteurPalierId = 0;
function genererIdPalier(produitId: string): string {
  compteurPalierId += 1;
  return `${produitId}-palier-admin-${Date.now()}-${compteurPalierId}`;
}

export function ajouterPalierMock(input: PalierInputMock): PalierPrixB2B {
  const palier: PalierPrixB2B = { id: genererIdPalier(input.produit_id), ...input };
  paliersPrixB2B.push(palier);
  return palier;
}

export function supprimerPalierMock(id: string): boolean {
  const index = paliersPrixB2B.findIndex((p) => p.id === id);
  if (index === -1) return false;
  paliersPrixB2B.splice(index, 1);
  return true;
}

export function supprimerPaliersDuProduitMock(produitId: string): void {
  for (let i = paliersPrixB2B.length - 1; i >= 0; i--) {
    if (paliersPrixB2B[i].produit_id === produitId) paliersPrixB2B.splice(i, 1);
  }
}
