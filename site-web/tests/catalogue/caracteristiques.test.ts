// Intégration du catalogue ATC (étape 5) — découpage des caractéristiques client pour la fiche produit.
import { describe, it, expect } from "vitest";
import { listerCaracteristiques } from "@/lib/services/caracteristiques";

describe("listerCaracteristiques", () => {
  it("une ligne par élément séparé par une virgule, sans couper les nombres décimaux", () => {
    expect(listerCaracteristiques("Catégorie A, 120 cellules, 34,9 kg, coefficient -0,29 %/°C")).toEqual([
      "Catégorie A",
      "120 cellules",
      "34,9 kg",
      "Coefficient -0,29 %/°C",
    ]);
  });

  it("ne coupe pas à l'intérieur des parenthèses", () => {
    expect(listerCaracteristiques("8 000 cycles (soit environ 100 Ah, déduit de 5,12 kWh), LiFePO4")).toEqual([
      "8 000 cycles (soit environ 100 Ah, déduit de 5,12 kWh)",
      "LiFePO4",
    ]);
  });

  it("packages : « · » seul sépare, la virgule reste une énumération", () => {
    expect(listerCaracteristiques("Onduleur Solis + 1 à 2 batteries PYTES · Cible : Particuliers, diaspora")).toEqual([
      "Onduleur Solis + 1 à 2 batteries PYTES",
      "Cible : Particuliers, diaspora",
    ]);
  });

  it("une énumération de nombres seuls n'est pas découpée (audit A-13)", () => {
    expect(listerCaracteristiques("25,6 V. Capacités annoncées : 200, 230, 280, 314 Ah")).toEqual([
      "25,6 V. Capacités annoncées : 200, 230, 280, 314 Ah",
    ]);
    expect(listerCaracteristiques("cellules LiFePO4, 8 000 cycles")).toEqual(["Cellules LiFePO4", "8 000 cycles"]);
  });

  it("« Aucune donnée », « Aucune fiche fournie » ou texte absent : aucune ligne", () => {
    expect(listerCaracteristiques("Aucune donnée")).toEqual([]);
    expect(listerCaracteristiques("Aucune fiche fournie")).toEqual([]);
    expect(listerCaracteristiques(undefined)).toEqual([]);
  });
});
