// TC-06-001-c — Calcul de la taxe à 10 % avec arrondi au centime le plus proche (décision actée n°33)
import { describe, it, expect } from "vitest";
import { calculerFacture } from "@/lib/business-rules/taxe";

describe("calculerFacture — TC-06-001-c", () => {
  it("arrondit la taxe et le TTC au centime le plus proche", () => {
    const facture = calculerFacture(19.995);
    expect(facture.montant_taxe).toBe(2.0);
    expect(facture.montant_ttc).toBe(22.0);
  });

  it("applique bien 10% sur un montant simple", () => {
    const facture = calculerFacture(100);
    expect(facture.montant_taxe).toBe(10);
    expect(facture.montant_ttc).toBe(110);
  });
});
