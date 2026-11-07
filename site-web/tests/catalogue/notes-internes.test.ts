// Audit A-12 — aucune note interne du fichier client n'est affichée, dans aucune langue, et le contenu utile
// des fiches concernées est conservé.
import { describe, it, expect } from "vitest";
import { produits } from "@/lib/mock-data/produits";
import { packagesPreconfigures } from "@/lib/mock-data/packages-preconfigures";
import { localiserPackage, localiserProduit } from "@/lib/i18n/catalogue";
import type { Langue } from "@/lib/types/entities";

const NOTES_INTERNES =
  /cahier des charges|documents du client|seule donnée|déduit de|Rendu 3D|Cible\s*:|schéma de la fiche|specifications|client's documents|only data provided|derived from|3D rendering|Target\s*:|datasheet diagram|pliego de condiciones|documentos del cliente|único dato|deducido de|render 3D|Público\s*:|esquema de la ficha/i;

const LANGUES: Langue[] = ["fr", "en", "es"];

describe("notes internes masquées (audit A-12)", () => {
  for (const langue of LANGUES) {
    it(`aucune note interne sur les produits et packages — ${langue}`, () => {
      const textes = [
        ...produits.map((p) => localiserProduit(p, langue)).map((p) => [p.ref, p.description, p.caracteristiques]),
        ...packagesPreconfigures.map((p) => localiserPackage(p, langue)).map((p) => [p.ref, p.description, p.caracteristiques]),
      ];
      const fautifs = textes.filter(([, d, c]) => NOTES_INTERNES.test(`${d ?? ""} ${c ?? ""}`)).map(([ref]) => ref);
      expect(fautifs).toEqual([]);
    });
  }

  it("le contenu utile est conservé", () => {
    const fr = (ref: string) => produits.find((p) => p.ref === ref)!;
    const pk = (ref: string) => packagesPreconfigures.find((p) => p.ref === ref)!;
    expect(fr("ES-09").caracteristiques).toBe("6,8 kW");
    expect(fr("ES-13").caracteristiques).toBe("5,12 kWh, 51,2 V, cellules LiFePO4, 8 000 cycles");
    expect(pk("PK-01").caracteristiques).toBe("Onduleur Solis basse tension + 1 à 2 batteries PYTES");
    expect(pk("PK-05").caracteristiques).toBe("2 Sunny Island + 2 Sunny Boy + batteries");
    expect(localiserPackage(pk("PK-05"), "en").caracteristiques).toBe("2 Sunny Island + 2 Sunny Boy + batteries");
    expect(fr("CL-S").description).toBe("Service professionnel résidentiel et commercial.");
    expect(fr("ES-24").description).toBe("");
  });
});
