"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductListItem } from "./ProductListItem";
import type { ProduitEnrichi } from "@/lib/services/catalogue";

// ECR-01-002 / ECR-02-001 (template partagé, Raffinement Design) — Panneau de filtres (marque,
// caractéristiques techniques dynamiques par catégorie, prix, disponible en package, disponibilité —
// BF-01-006, BF-02-002/003/004), tri, bascule vue grille/liste, et grille de produits.
type Tri = "pertinence" | "prix-asc" | "prix-desc" | "nouveautes";
type Vue = "grille" | "liste";

// Libellés lisibles pour les clés de specifications (dynamiques par catégorie — n'importe quelle clé
// présente dans les produits affichés devient un filtre, pas de liste figée par catégorie).
const LIBELLES_SPEC: Record<string, string> = {
  puissance: "Puissance",
  capacite: "Capacité",
  technologie: "Technologie",
  courant: "Courant",
  cycles: "Cycles",
  type: "Type",
  usage: "Usage",
  taille: "Taille",
  stockage: "Stockage",
  connectivite: "Connectivité",
  installation: "Installation",
  alimentation: "Alimentation",
};

function libelleSpec(cle: string): string {
  return LIBELLES_SPEC[cle] ?? cle.charAt(0).toUpperCase() + cle.slice(1);
}

function clesSpecDisponibles(produits: ProduitEnrichi[]): string[] {
  const cles = new Set<string>();
  for (const { produit } of produits) {
    for (const cle of Object.keys(produit.specifications ?? {})) cles.add(cle);
  }
  return Array.from(cles);
}

function valeursDistinctes(produits: ProduitEnrichi[], cle: string): string[] {
  const valeurs = new Set<string>();
  for (const { produit } of produits) {
    const v = produit.specifications?.[cle];
    if (v) valeurs.add(v);
  }
  return Array.from(valeurs).sort();
}

export function CatalogueBrowser({ produits }: { produits: ProduitEnrichi[] }) {
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [marques, setMarques] = useState<string[]>([]);
  const [specsSelectionnees, setSpecsSelectionnees] = useState<Record<string, string[]>>({});
  const [uniquementPackage, setUniquementPackage] = useState(false);
  const [uniquementEnStock, setUniquementEnStock] = useState(false);
  const [prixMax, setPrixMax] = useState<number | null>(null);
  const [tri, setTri] = useState<Tri>("pertinence");
  const [vue, setVue] = useState<Vue>("grille");

  const marquesDisponibles = useMemo(() => {
    const vues = new Map<string, string>();
    for (const { marque } of produits) {
      if (marque) vues.set(marque.id, marque.nom);
    }
    return Array.from(vues.entries());
  }, [produits]);

  const clesSpec = useMemo(() => clesSpecDisponibles(produits), [produits]);
  const valeursParCle = useMemo(
    () => Object.fromEntries(clesSpec.map((cle) => [cle, valeursDistinctes(produits, cle)])),
    [produits, clesSpec]
  );
  const packageDisponible = useMemo(() => produits.some((p) => p.produit.eligible_package), [produits]);
  const prixPlafondCatalogue = useMemo(
    () => Math.ceil(Math.max(...produits.map((p) => p.produit.prix_public), 0)),
    [produits]
  );

  const resultats = useMemo(() => {
    let liste = produits.filter(({ produit, niveauStock }) => {
      if (marques.length > 0 && (!produit.marque_id || !marques.includes(produit.marque_id))) return false;
      for (const [cle, valeurs] of Object.entries(specsSelectionnees)) {
        if (valeurs.length > 0 && !valeurs.includes(produit.specifications?.[cle] ?? "")) return false;
      }
      if (uniquementPackage && !produit.eligible_package) return false;
      if (uniquementEnStock && niveauStock === "rupture") return false;
      if (prixMax !== null && produit.prix_public > prixMax) return false;
      return true;
    });

    if (tri === "prix-asc") liste = [...liste].sort((a, b) => a.produit.prix_public - b.produit.prix_public);
    else if (tri === "prix-desc") liste = [...liste].sort((a, b) => b.produit.prix_public - a.produit.prix_public);
    // "Nouveautés" — le catalogue n'a pas de champ date_creation (démo statique) ; l'ordre inverse du
    // tableau produits.ts (dernier ajouté = affiché en premier) sert d'approximation raisonnable.
    else if (tri === "nouveautes") liste = [...liste].reverse();

    return liste;
  }, [produits, marques, specsSelectionnees, uniquementPackage, uniquementEnStock, prixMax, tri]);

  function basculer(liste: string[], valeur: string, setter: (v: string[]) => void) {
    setter(liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur]);
  }

  function basculerSpec(cle: string, valeur: string) {
    setSpecsSelectionnees((etat) => {
      const actuelles = etat[cle] ?? [];
      return {
        ...etat,
        [cle]: actuelles.includes(valeur) ? actuelles.filter((v) => v !== valeur) : [...actuelles, valeur],
      };
    });
  }

  const filtresActifs =
    marques.length > 0 ||
    Object.values(specsSelectionnees).some((v) => v.length > 0) ||
    uniquementPackage ||
    uniquementEnStock ||
    prixMax !== null;

  const contenuFiltres = (
    <div className="flex flex-col gap-6">
      {marquesDisponibles.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-titres text-sm font-semibold text-texte-principal">Marque</legend>
          <div className="flex flex-col gap-2">
            {marquesDisponibles.map(([id, nom]) => (
              <label key={id} className="flex items-center gap-2 text-sm text-texte-principal">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-bordure accent-primaire"
                  checked={marques.includes(id)}
                  onChange={() => basculer(marques, id, setMarques)}
                />
                {nom}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {clesSpec.map((cle) => {
        const valeurs = valeursParCle[cle];
        if (!valeurs || valeurs.length === 0) return null;
        return (
          <fieldset key={cle}>
            <legend className="mb-2 font-titres text-sm font-semibold text-texte-principal">
              {libelleSpec(cle)}
            </legend>
            <div className="flex flex-col gap-2">
              {valeurs.map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm text-texte-principal">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-bordure accent-primaire"
                    checked={(specsSelectionnees[cle] ?? []).includes(v)}
                    onChange={() => basculerSpec(cle, v)}
                  />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}

      <fieldset>
        <legend className="mb-2 font-titres text-sm font-semibold text-texte-principal">Prix maximum</legend>
        <input
          type="range"
          min={0}
          max={prixPlafondCatalogue || 1}
          value={prixMax ?? prixPlafondCatalogue}
          onChange={(e) => setPrixMax(Number(e.target.value))}
          className="w-full accent-primaire"
        />
        <p className="text-sm text-texte-secondaire">Jusqu&apos;à ${prixMax ?? prixPlafondCatalogue}</p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-titres text-sm font-semibold text-texte-principal">Disponibilité</legend>
        <label className="flex items-center gap-2 text-sm text-texte-principal">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-bordure accent-primaire"
            checked={uniquementEnStock}
            onChange={(e) => setUniquementEnStock(e.target.checked)}
          />
          En stock uniquement
        </label>
      </fieldset>

      {packageDisponible && (
        <label className="flex items-center gap-2 text-sm text-texte-principal">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-bordure accent-primaire"
            checked={uniquementPackage}
            onChange={(e) => setUniquementPackage(e.target.checked)}
          />
          Disponible en package personnalisé
        </label>
      )}

      {filtresActifs && (
        <button
          type="button"
          className="self-start text-sm font-medium text-primaire hover:underline"
          onClick={() => {
            setMarques([]);
            setSpecsSelectionnees({});
            setUniquementPackage(false);
            setUniquementEnStock(false);
            setPrixMax(null);
          }}
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">{contenuFiltres}</aside>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-bordure px-3 py-2 text-sm font-medium text-texte-principal lg:hidden"
            onClick={() => setFiltresOuverts(true)}
          >
            <SlidersHorizontal size={16} /> Filtres
          </button>
          <p className="hidden text-sm text-texte-secondaire sm:block">{resultats.length} produit(s)</p>

          <div className="ml-auto flex items-center gap-2">
            <select
              value={tri}
              onChange={(e) => setTri(e.target.value as Tri)}
              className="rounded-lg border border-bordure bg-background px-3 py-2 text-sm text-texte-principal"
              aria-label="Trier les produits"
            >
              <option value="pertinence">Pertinence</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
              <option value="nouveautes">Nouveautés</option>
            </select>

            <div className="hidden items-center gap-1 rounded-lg border border-bordure p-1 sm:flex">
              <button
                type="button"
                aria-label="Vue grille"
                aria-pressed={vue === "grille"}
                onClick={() => setVue("grille")}
                className={`flex h-8 w-8 items-center justify-center rounded-md ${
                  vue === "grille" ? "bg-primaire text-white" : "text-texte-secondaire hover:bg-fond"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                aria-label="Vue liste"
                aria-pressed={vue === "liste"}
                onClick={() => setVue("liste")}
                className={`flex h-8 w-8 items-center justify-center rounded-md ${
                  vue === "liste" ? "bg-primaire text-white" : "text-texte-secondaire hover:bg-fond"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {resultats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-bordure py-16 text-center">
            <p className="font-titres text-sm font-semibold text-texte-principal">
              Aucun produit ne correspond à ces filtres
            </p>
            <p className="mt-1 text-sm text-texte-secondaire">Essayez d&apos;élargir vos critères de recherche.</p>
          </div>
        ) : vue === "grille" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {resultats.map(({ produit, niveauStock, paliers }) => (
              <ProductCard key={produit.id} produit={produit} niveauStock={niveauStock} paliers={paliers} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {resultats.map(({ produit, niveauStock, paliers }) => (
              <ProductListItem key={produit.id} produit={produit} niveauStock={niveauStock} paliers={paliers} />
            ))}
          </div>
        )}
      </div>

      {filtresOuverts && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer les filtres"
            className="absolute inset-0 bg-texte-principal/40"
            onClick={() => setFiltresOuverts(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-titres text-base font-semibold text-texte-principal">Filtres</p>
              <button type="button" aria-label="Fermer" onClick={() => setFiltresOuverts(false)}>
                <X size={22} />
              </button>
            </div>
            {contenuFiltres}
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-primaire py-3 text-sm font-semibold text-white"
              onClick={() => setFiltresOuverts(false)}
            >
              Voir {resultats.length} résultat(s)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
