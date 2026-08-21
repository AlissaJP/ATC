// TC-03-002 — Barème de prix B2B par palier (RG-03-004)
import { describe, it, expect } from "vitest";
import {
  trouverPalierApplicable,
  detecterChevauchementsPaliers,
} from "@/lib/business-rules/bareme-b2b";
import type { PalierPrixB2B } from "@/lib/types/entities";

const paliers: PalierPrixB2B[] = [
  { id: "p1", produit_id: "prod-1", quantite_min: 1, quantite_max: 9, prix_unitaire: 100 },
  { id: "p2", produit_id: "prod-1", quantite_min: 10, quantite_max: 49, prix_unitaire: 90 },
  { id: "p3", produit_id: "prod-1", quantite_min: 50, prix_unitaire: 80 },
];

describe("trouverPalierApplicable — TC-03-002", () => {
  it("TC-03-002-a — quantité en début de palier (10)", () => {
    expect(trouverPalierApplicable(paliers, 10)?.prix_unitaire).toBe(90);
  });

  it("TC-03-002-b — quantité en fin de palier (49, pas de bascule prématurée)", () => {
    expect(trouverPalierApplicable(paliers, 49)?.prix_unitaire).toBe(90);
  });

  it("TC-03-002-c — quantité juste au-dessus de la borne (50) bascule vers le palier suivant", () => {
    expect(trouverPalierApplicable(paliers, 50)?.prix_unitaire).toBe(80);
  });

  it("palier illimité (500) reste sur le dernier palier", () => {
    expect(trouverPalierApplicable(paliers, 500)?.prix_unitaire).toBe(80);
  });
});

describe("detecterChevauchementsPaliers — TC-03-002-d", () => {
  it("détecte un chevauchement 1-10 / 5-20", () => {
    const conflictants: PalierPrixB2B[] = [
      { id: "a", produit_id: "prod-2", quantite_min: 1, quantite_max: 10, prix_unitaire: 50 },
      { id: "b", produit_id: "prod-2", quantite_min: 5, quantite_max: 20, prix_unitaire: 45 },
    ];
    expect(detecterChevauchementsPaliers(conflictants)).toHaveLength(1);
  });

  it("ne signale aucun conflit pour des paliers contigus valides", () => {
    expect(detecterChevauchementsPaliers(paliers)).toHaveLength(0);
  });
});
