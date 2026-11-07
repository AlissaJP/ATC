// TC-03-001 — Seuils d'alerte de stock (RG-03-002)
import { describe, it, expect } from "vitest";
import { determinerNiveauAlerteStock } from "@/lib/business-rules/stock-alerte";
import { niveauAgregeVariantes } from "@/lib/services/variantes";
import type { VarianteProduit } from "@/lib/types/entities";

describe("determinerNiveauAlerteStock — TC-03-001", () => {
  const ref = 100;

  it("TC-03-001-a — 41% -> en_stock", () => {
    expect(determinerNiveauAlerteStock(41, ref)).toBe("en_stock");
  });

  it("TC-03-001-b — 40% (exactement) -> alerte_orange", () => {
    expect(determinerNiveauAlerteStock(40, ref)).toBe("alerte_orange");
  });

  it("TC-03-001-c — 39% -> alerte_orange", () => {
    expect(determinerNiveauAlerteStock(39, ref)).toBe("alerte_orange");
  });

  it("TC-03-001-d — 15% (exactement) -> alerte_rouge", () => {
    expect(determinerNiveauAlerteStock(15, ref)).toBe("alerte_rouge");
  });

  it("TC-03-001-e — 14% -> alerte_rouge", () => {
    expect(determinerNiveauAlerteStock(14, ref)).toBe("alerte_rouge");
  });

  it("TC-03-001-f — stock nul -> rupture", () => {
    expect(determinerNiveauAlerteStock(0, ref)).toBe("rupture");
  });

  it("stock non communiqué (null) -> non_suivi, aucune disponibilité affirmée (audit A-11)", () => {
    expect(determinerNiveauAlerteStock(null, ref)).toBe("non_suivi");
  });
});

describe("niveauAgregeVariantes — produit à variantes (audit A-11)", () => {
  const variante = (stock?: number): VarianteProduit => ({ id: `v-${stock}`, attribut: "Puissance", valeur: "x", prix: 100, stock });

  it("aucune variante suivie -> non_suivi", () => {
    expect(niveauAgregeVariantes([variante(), variante()])).toBe("non_suivi");
  });

  it("au moins une variante avec un stock positif -> en_stock", () => {
    expect(niveauAgregeVariantes([variante(), variante(12)])).toBe("en_stock");
  });

  it("toutes les variantes à 0 -> rupture", () => {
    expect(niveauAgregeVariantes([variante(0), variante(0)])).toBe("rupture");
  });
});
