// TC-04-001 — Cycle de vie et expiration d'un devis (RG-04-001, RG-04-005, décision actée n°32)
import { describe, it, expect } from "vitest";
import { devisEstEncoreValide, calculerDateExpiration } from "@/lib/business-rules/devis-expiration";

describe("devisEstEncoreValide — TC-04-001", () => {
  const dateReponse = new Date("2026-08-01T10:00:00Z");

  it("TC-04-001-a — acceptation à J+2 (dans le délai)", () => {
    const maintenant = new Date("2026-08-03T10:00:00Z");
    expect(devisEstEncoreValide(dateReponse, maintenant)).toBe(true);
  });

  it("TC-04-001-b — acceptation exactement à J+3 -> encore valide (décision n°32)", () => {
    const maintenant = calculerDateExpiration(dateReponse);
    expect(devisEstEncoreValide(dateReponse, maintenant)).toBe(true);
  });

  it("TC-04-001-c — acceptation après J+3 -> expiré", () => {
    const maintenant = new Date(calculerDateExpiration(dateReponse).getTime() + 1000);
    expect(devisEstEncoreValide(dateReponse, maintenant)).toBe(false);
  });
});
