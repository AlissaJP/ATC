// UC-09-001, scénario d'erreur E1 — Éligibilité à l'assistance à l'installation interne (RG-09-002)
import { describe, it, expect } from "vitest";
import { commandeEstEligibleInstallation, produitEstEligibleInstallation } from "@/lib/business-rules/installation-eligibilite";
import type { Categorie, Produit } from "@/lib/types/entities";

const categories: Categorie[] = [
  { id: "cat-energie-solaire", slug: "energie-solaire", nom: "Énergie solaire" },
  { id: "cat-panneaux", slug: "panneaux-solaires", nom: "Panneaux solaires", parent_id: "cat-energie-solaire" },
  { id: "cat-securite", slug: "securite", nom: "Sécurité" },
  { id: "cat-climatisation", slug: "climatisation", nom: "Climatisation" },
];

function produit(categorie_id: string): Produit {
  return {
    id: "prod-x",
    slug: "prod-x",
    nom: "Produit test",
    description: "",
    categorie_id,
    prix_public: 100,
    eligible_b2b: false,
    eligible_package: false,
    statut_publication: "publié",
    images: [],
  };
}

describe("produitEstEligibleInstallation — RG-09-002", () => {
  it("panneau solaire (sous-catégorie d'Énergie solaire) -> éligible", () => {
    expect(produitEstEligibleInstallation(produit("cat-panneaux"), categories)).toBe(true);
  });

  it("catégorie Énergie solaire directe -> éligible", () => {
    expect(produitEstEligibleInstallation(produit("cat-energie-solaire"), categories)).toBe(true);
  });

  it("E1 — climatisation -> non éligible", () => {
    expect(produitEstEligibleInstallation(produit("cat-climatisation"), categories)).toBe(false);
  });

  it("E1 — sécurité -> non éligible", () => {
    expect(produitEstEligibleInstallation(produit("cat-securite"), categories)).toBe(false);
  });
});

describe("commandeEstEligibleInstallation — RG-09-002", () => {
  it("au moins un produit solaire dans la commande -> éligible", () => {
    expect(commandeEstEligibleInstallation([produit("cat-securite"), produit("cat-panneaux")], categories)).toBe(true);
  });

  it("aucun produit solaire -> non éligible", () => {
    expect(commandeEstEligibleInstallation([produit("cat-securite"), produit("cat-climatisation")], categories)).toBe(false);
  });

  it("commande vide -> non éligible", () => {
    expect(commandeEstEligibleInstallation([], categories)).toBe(false);
  });
});
