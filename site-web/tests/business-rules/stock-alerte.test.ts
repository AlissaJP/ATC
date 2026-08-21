// TC-03-001 — Seuils d'alerte de stock (RG-03-002)
import { describe, it, expect } from "vitest";
import { determinerNiveauAlerteStock } from "@/lib/business-rules/stock-alerte";

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
});
