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

  it("« Aucune donnée », « Aucune fiche fournie » ou texte absent : aucune ligne", () => {
    expect(listerCaracteristiques("Aucune donnée")).toEqual([]);
    expect(listerCaracteristiques("Aucune fiche fournie")).toEqual([]);
    expect(listerCaracteristiques(undefined)).toEqual([]);
  });
});
