// Intégration du catalogue ATC — la conversion de catalogue-atc.json (source de vérité client) vers les
// produits et packages du site ne perd, n'invente ni ne déplace aucune donnée.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import catalogueAtc from "@/lib/mock-data/catalogue-atc.json";
import { produits } from "@/lib/mock-data/produits";
import { packagesPreconfigures } from "@/lib/mock-data/packages-preconfigures";
import { categories } from "@/lib/mock-data/categories";
import { quantiteDisponible, stock } from "@/lib/mock-data/stock";
import { paliersPrixB2B } from "@/lib/mock-data/paliers-prix-b2b";

const entrees = catalogueAtc.produits;
const SLUG_RACINE: Record<string, string> = {
  "energies-solaires": "energie-solaire",
  climatisation: "climatisation",
  securite: "securite",
};

describe("Catalogue ATC — conversion de catalogue-atc.json", () => {
  it("les 41 entrées sont présentes : 34 produits et 7 packages, identifiés par leur référence", () => {
    expect(entrees).toHaveLength(41);
    expect(produits.map((p) => p.id).sort()).toEqual(
      entrees.filter((e) => e.categorie !== "packages-solaires").map((e) => e.ref).sort()
    );
    expect(packagesPreconfigures.map((p) => p.id).sort()).toEqual(
      entrees.filter((e) => e.categorie === "packages-solaires").map((e) => e.ref).sort()
    );
  });

  it("chaque produit est rangé dans sa sous-catégorie et sa catégorie racine", () => {
    for (const e of entrees.filter((x) => x.categorie !== "packages-solaires")) {
      const produit = produits.find((p) => p.id === e.ref)!;
      const sousCategorie = categories.find((c) => c.id === produit.categorie_id)!;
      const racine = categories.find((c) => c.id === sousCategorie.parent_id)!;
      expect(sousCategorie.nom, e.ref).toBe(e.sousCategorie);
      expect(racine.slug, e.ref).toBe(SLUG_RACINE[e.categorie]);
    }
  });

  it("prix en USD repris tels quels, aucun prix ajouté (8 produits avec prix)", () => {
    expect(catalogueAtc.devise).toBe("USD");
    for (const e of entrees.filter((x) => x.categorie !== "packages-solaires")) {
      const produit = produits.find((p) => p.id === e.ref)!;
      expect(produit.prix_public, e.ref).toBe(e.prixUSD);
      expect(produit.prix_disponible, e.ref).toBe(e.prixDisponible);
      const prixVariantes = (produit.variantes ?? []).map((v) => [v.id, v.prix]);
      const attendus = e.variantes.filter((v) => v.attribut !== null).map((v) => [v.id, v.prixUSD]);
      expect(prixVariantes, e.ref).toEqual(attendus);
    }
    expect(produits.filter((p) => p.prix_disponible).map((p) => p.id).sort()).toEqual(
      ["ES-01", "ES-02", "ES-04", "ES-11", "ES-13", "ES-14", "ES-15", "ES-18"]
    );
    expect(packagesPreconfigures.every((p) => p.prix_total === null && p.produits.length === 0)).toBe(true);
  });

  it("aucun stock ni palier B2B inventé", () => {
    expect(stock.every((s) => s.stock_actuel === null && s.stock_reference === 100)).toBe(true);
    expect(produits.flatMap((p) => p.variantes ?? []).every((v) => v.stock === undefined)).toBe(true);
    expect(paliersPrixB2B).toHaveLength(0);
  });

  it("un produit à variantes au stock non suivi reste disponible (configurateur, packages)", () => {
    expect(quantiteDisponible("ES-01")).toBeUndefined(); // variantes, stock non communiqué
    expect(quantiteDisponible("ES-03")).toBeUndefined(); // sans variantes, stock non communiqué
    expect(quantiteDisponible("inconnu")).toBe(0);
  });

  it("toutes les images référencées existent dans public/", () => {
    const chemins = [
      ...produits.flatMap((p) => [...p.images, ...(p.image_banniere ? [p.image_banniere] : [])]),
      ...packagesPreconfigures.map((p) => p.image),
    ];
    for (const chemin of chemins) expect(existsSync(join(process.cwd(), "public", chemin)), chemin).toBe(true);
  });
});
