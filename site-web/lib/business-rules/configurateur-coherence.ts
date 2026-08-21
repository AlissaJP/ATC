// RG-04-006 — Cohérence minimale du configurateur de package (décision actée n°29)
// Une demande de devis via le configurateur ne peut être validée que si la configuration
// comprend au moins un panneau solaire et une batterie.

export interface ComposantConfigurateur {
  produit_id: string;
  categorie_composant: "panneau_solaire" | "batterie" | "regulateur" | "accessoire";
  quantite: number;
}

export function configurationEstValidable(composants: ComposantConfigurateur[]): boolean {
  const auMoinsUnPanneau = composants.some(
    (c) => c.categorie_composant === "panneau_solaire" && c.quantite > 0
  );
  const auMoinsUneBatterie = composants.some(
    (c) => c.categorie_composant === "batterie" && c.quantite > 0
  );
  return auMoinsUnPanneau && auMoinsUneBatterie;
}

// Classification des sous-catégories solaires (Cahier 9) vers les catégories du configurateur.
const CATEGORIES_COMPOSANT: Record<string, ComposantConfigurateur["categorie_composant"]> = {
  "cat-panneaux": "panneau_solaire",
  "cat-batteries": "batterie",
  "cat-regulateurs": "regulateur",
  "cat-accessoires-solaires": "accessoire",
};

export function categorieComposantDepuisCategorieProduit(
  categorieProduitId: string
): ComposantConfigurateur["categorie_composant"] | undefined {
  return CATEGORIES_COMPOSANT[categorieProduitId];
}
