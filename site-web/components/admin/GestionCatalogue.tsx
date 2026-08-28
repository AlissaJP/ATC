"use client";

// ECR-12-002 — Gestion catalogue / barème B2B (back-office). RG-03-004, RG-12-001. L'édition du stock
// vit désormais dans sa propre section (/admin/stock, SuiviStock.tsx) plutôt qu'ici (Raffinement Design).
// Les données initiales viennent de app/admin/catalogue/page.tsx (Server Component qui lit les tableaux
// mock-data côté serveur) : après chaque mutation réussie, router.refresh() redemande le rendu serveur de
// cette route pour obtenir les props à jour — nécessaire car ce composant client ne peut pas relire
// directement les tableaux serveur (bundle client séparé du process Node, voir lib/actions/catalogue-admin.ts).
//
// Raffinement Design — un clic sur un produit ouvre son édition dans une fenêtre modale (Modal.tsx),
// plutôt qu'un panneau à droite de la liste (ancien layout maître-détail, abandonné : l'espace vide
// « Sélectionnez un produit… » n'apportait rien). La création reste une page à part entière
// (/admin/catalogue/nouveau, CreationProduit.tsx) — formulaire plus long, première saisie. Le formulaire
// produit et l'éditeur de barème B2B vivent dans FormulaireProduit.tsx, partagés entre les deux.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Plus } from "lucide-react";
import type { Categorie, Marque, PalierPrixB2B, Produit, Stock } from "@/lib/types/entities";
import { determinerNiveauAlerteStock } from "@/lib/business-rules/stock-alerte";
import { categoriesRacinesOrdonnees, idsCategorieEtEnfants } from "@/lib/services/categories-admin";
import { FormulaireProduit, EditeurPaliers } from "@/components/admin/FormulaireProduit";
import { Modal } from "@/components/ui/Modal";

interface GestionCatalogueProps {
  produits: Produit[];
  stock: Stock[];
  paliers: PalierPrixB2B[];
  categories: Categorie[];
  marques: Marque[];
  // Slug de catégorie racine reçu de la page (Server Component, lit searchParams) pour les raccourcis de
  // la navigation latérale (sous-éléments de Catalogue, Raffinement Design) — même idiome que
  // TraitementDevis.tsx. undefined/inconnu retombe sur le premier onglet (Énergie solaire).
  ongletInitial?: string;
  // Id du produit à ouvrir automatiquement dans la fenêtre d'édition — utilisé par CreationProduit.tsx
  // pour enchaîner directement sur l'édition (barème B2B compris) juste après une création.
  produitInitial?: string;
}

export function GestionCatalogue({
  produits,
  stock,
  paliers,
  categories,
  marques,
  ongletInitial,
  produitInitial,
}: GestionCatalogueProps) {
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [produitOuvertId, setProduitOuvertId] = useState<string | null>(produitInitial ?? null);

  const categoriesRacines = useMemo(() => categoriesRacinesOrdonnees(categories), [categories]);
  const [ongletId, setOngletId] = useState<string | undefined>(
    () => categoriesRacines.find((c) => c.slug === ongletInitial)?.id ?? categoriesRacines[0]?.id
  );

  // Un clic sur un sous-lien de la sidebar (Raffinement Design) navigue vers la même route avec un
  // `categorie` différent : React ne réinitialise pas l'état local de ce composant client pour autant
  // (pas de changement de clé), donc on resynchronise l'onglet actif pendant le rendu — pattern recommandé
  // par React pour « ajuster un state quand une prop change » plutôt qu'un useEffect (qui provoquerait un
  // second rendu/commit inutile ici, cf. règle react-hooks/set-state-in-effect). Même traitement pour
  // `produitInitial` (redirection post-création vers /admin/catalogue?produit=<id>).
  const [ongletInitialTraite, setOngletInitialTraite] = useState(ongletInitial);
  if (ongletInitial !== ongletInitialTraite) {
    setOngletInitialTraite(ongletInitial);
    setOngletId(categoriesRacines.find((c) => c.slug === ongletInitial)?.id ?? categoriesRacines[0]?.id);
  }
  const [produitInitialTraite, setProduitInitialTraite] = useState(produitInitial);
  if (produitInitial !== produitInitialTraite) {
    setProduitInitialTraite(produitInitial);
    setProduitOuvertId(produitInitial ?? null);
  }

  const idsCategorieOnglet = useMemo(
    () => (ongletId ? idsCategorieEtEnfants(categories, ongletId) : new Set<string>()),
    [categories, ongletId]
  );

  const produitsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return produits
      .filter((p) => idsCategorieOnglet.has(p.categorie_id))
      .filter((p) => !terme || p.nom.toLowerCase().includes(terme));
  }, [produits, recherche, idsCategorieOnglet]);

  const produitOuvert = produitOuvertId ? produits.find((p) => p.id === produitOuvertId) : undefined;
  const paliersOuvert = useMemo(
    () =>
      produitOuvert
        ? [...paliers.filter((p) => p.produit_id === produitOuvert.id)].sort((a, b) => a.quantite_min - b.quantite_min)
        : [],
    [paliers, produitOuvert]
  );

  function nomCategorie(id: string): string {
    return categories.find((c) => c.id === id)?.nom ?? id;
  }

  function choisirOnglet(id: string) {
    setOngletId(id);
  }

  const slugOngletActif = categoriesRacines.find((c) => c.id === ongletId)?.slug;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categoriesRacines.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => choisirOnglet(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              ongletId === c.id ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {c.nom}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Rechercher un produit…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair sm:max-w-sm"
        />
        <Link
          href={`/admin/catalogue/nouveau${slugOngletActif ? `?categorie=${slugOngletActif}` : ""}`}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-bordure px-3 py-2 text-sm font-semibold text-texte-principal hover:bg-fond"
        >
          <Plus size={16} /> Nouveau produit
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {produitsFiltres.map((p) => {
          const s = stock.find((st) => st.produit_id === p.id);
          const niveau = determinerNiveauAlerteStock(s?.stock_actuel ?? 0, s?.stock_reference ?? 100);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setProduitOuvertId(p.id)}
              className="rounded-lg border border-bordure bg-background p-3 text-left transition-colors hover:border-primaire-clair"
            >
              <p className="text-sm font-medium text-texte-principal">{p.nom}</p>
              <p className="text-xs text-texte-secondaire">{nomCategorie(p.categorie_id)} — ${p.prix_public}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.statut_publication === "publié" ? "bg-succes/10 text-succes" : "bg-fond text-texte-secondaire"
                  }`}
                >
                  {p.statut_publication === "publié" ? "Publié" : "Brouillon"}
                </span>
                {(niveau === "alerte_rouge" || niveau === "rupture") && (
                  <span className="flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                    <AlertTriangle size={10} /> {niveau === "rupture" ? "Rupture" : "Stock bas"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {produitsFiltres.length === 0 && <p className="text-sm text-texte-secondaire">Aucun produit trouvé.</p>}
      </div>

      {produitOuvert && (
        <Modal titre={produitOuvert.nom} largeurMax="max-w-3xl" onFermer={() => setProduitOuvertId(null)}>
          <div className="flex flex-col gap-6">
            <FormulaireProduit
              key={produitOuvert.id}
              modeCreation={false}
              produit={produitOuvert}
              categories={categories}
              marques={marques}
              masquerTitre
              onModifie={() => router.refresh()}
              onSupprime={() => {
                router.refresh();
                setProduitOuvertId(null);
              }}
            />

            {produitOuvert.eligible_b2b && (
              <EditeurPaliers
                key={`paliers-${produitOuvert.id}`}
                produitId={produitOuvert.id}
                paliers={paliersOuvert}
                onSucces={() => router.refresh()}
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
