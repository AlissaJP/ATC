"use client";

// ECR-12-002 — Gestion catalogue / stock / barème B2B (back-office). RG-03-002, RG-03-004, RG-12-001.
// Les données initiales viennent de app/admin/catalogue/page.tsx (Server Component qui lit les tableaux
// mock-data côté serveur) : après chaque mutation réussie, router.refresh() redemande le rendu serveur de
// cette route pour obtenir les props à jour — nécessaire car ce composant client ne peut pas relire
// directement les tableaux serveur (bundle client séparé du process Node, voir lib/actions/catalogue-admin.ts).
//
// PanneauProduit / EditeurStock / EditeurPaliers sont remontés via `key={selection.id ?? "creation"}`
// lors d'un changement de sélection plutôt que resynchronisés par un useEffect + setState (qui provoque
// des rendus en cascade) — l'état local part alors directement de la bonne valeur initiale.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Plus, Save, Trash2 } from "lucide-react";
import type { Categorie, Marque, PalierPrixB2B, Produit, Stock, VarianteProduit } from "@/lib/types/entities";
import { determinerNiveauAlerteStock } from "@/lib/business-rules/stock-alerte";
import {
  ajouterPalierAction,
  creerProduitAction,
  definirStockAction,
  modifierProduitAction,
  supprimerPalierAction,
  supprimerProduitAction,
} from "@/lib/actions/catalogue-admin";
import type { ProduitInputMock } from "@/lib/mock-data/produits";

interface GestionCatalogueProps {
  produits: Produit[];
  stock: Stock[];
  paliers: PalierPrixB2B[];
  categories: Categorie[];
  marques: Marque[];
}

const FORM_VIDE: ProduitInputMock = {
  nom: "",
  description: "",
  categorie_id: "",
  marque_id: undefined,
  prix_public: 0,
  eligible_b2b: false,
  eligible_package: false,
  statut_publication: "brouillon",
};

export function GestionCatalogue({ produits, stock, paliers, categories, marques }: GestionCatalogueProps) {
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [selectionId, setSelectionId] = useState<string | null>(produits[0]?.id ?? null);
  const [modeCreation, setModeCreation] = useState(false);

  const produitsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return produits;
    return produits.filter((p) => p.nom.toLowerCase().includes(terme));
  }, [produits, recherche]);

  const selection = modeCreation ? undefined : produits.find((p) => p.id === selectionId);
  const stockSelection = selection ? stock.find((s) => s.produit_id === selection.id) : undefined;
  const paliersSelection = useMemo(
    () =>
      selection
        ? [...paliers.filter((p) => p.produit_id === selection.id)].sort((a, b) => a.quantite_min - b.quantite_min)
        : [],
    [paliers, selection]
  );

  function nomCategorie(id: string): string {
    return categories.find((c) => c.id === id)?.nom ?? id;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <input
            type="search"
            placeholder="Rechercher un produit…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setModeCreation(true);
            setSelectionId(null);
          }}
          className={`mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold ${
            modeCreation ? "border-primaire bg-primaire/5 text-primaire" : "border-bordure text-texte-principal hover:bg-fond"
          }`}
        >
          <Plus size={16} /> Nouveau produit
        </button>

        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
          {produitsFiltres.map((p) => {
            const s = stock.find((st) => st.produit_id === p.id);
            const niveau = determinerNiveauAlerteStock(s?.stock_actuel ?? 0, s?.stock_reference ?? 100);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setModeCreation(false);
                  setSelectionId(p.id);
                }}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  !modeCreation && selectionId === p.id
                    ? "border-primaire bg-primaire/5"
                    : "border-bordure bg-background hover:border-primaire-clair"
                }`}
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
      </div>

      <div>
        {!modeCreation && !selection ? (
          <p className="text-sm text-texte-secondaire">Sélectionnez un produit ou créez-en un nouveau.</p>
        ) : (
          <div className="flex flex-col gap-6">
            <PanneauProduit
              key={modeCreation ? "creation" : selection!.id}
              modeCreation={modeCreation}
              produit={selection}
              categories={categories}
              marques={marques}
              onCree={(id) => {
                router.refresh();
                setModeCreation(false);
                setSelectionId(id);
              }}
              onModifie={() => router.refresh()}
              onSupprime={() => {
                router.refresh();
                setSelectionId(null);
              }}
            />

            {!modeCreation && selection && (
              <EditeurStock
                key={`stock-${selection.id}`}
                produitId={selection.id}
                stock={stockSelection}
                onSucces={() => router.refresh()}
              />
            )}

            {!modeCreation && selection && selection.eligible_b2b && (
              <EditeurPaliers
                key={`paliers-${selection.id}`}
                produitId={selection.id}
                paliers={paliersSelection}
                onSucces={() => router.refresh()}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PanneauProduit({
  modeCreation,
  produit,
  categories,
  marques,
  onCree,
  onModifie,
  onSupprime,
}: {
  modeCreation: boolean;
  produit: Produit | undefined;
  categories: Categorie[];
  marques: Marque[];
  onCree: (id: string) => void;
  onModifie: () => void;
  onSupprime: () => void;
}) {
  const [form, setForm] = useState<ProduitInputMock>(() =>
    produit
      ? {
          nom: produit.nom,
          description: produit.description,
          categorie_id: produit.categorie_id,
          marque_id: produit.marque_id,
          prix_public: produit.prix_public,
          eligible_b2b: produit.eligible_b2b,
          eligible_package: produit.eligible_package,
          statut_publication: produit.statut_publication,
          variantes: produit.variantes,
        }
      : FORM_VIDE
  );
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  function varianteVide(): VarianteProduit {
    return { id: crypto.randomUUID(), attribut: "", valeur: "", prix: 0 };
  }
  function ajouterVariante() {
    setForm((f) => ({ ...f, variantes: [...(f.variantes ?? []), varianteVide()] }));
  }
  function modifierVariante(index: number, patch: Partial<VarianteProduit>) {
    setForm((f) => ({
      ...f,
      variantes: (f.variantes ?? []).map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  }
  function supprimerVariante(index: number) {
    setForm((f) => ({ ...f, variantes: (f.variantes ?? []).filter((_, i) => i !== index) }));
  }

  async function soumettre() {
    setEnCours(true);
    try {
      if (modeCreation) {
        const resultat = await creerProduitAction(form);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        if (resultat.donnees) onCree(resultat.donnees.id);
      } else if (produit) {
        const resultat = await modifierProduitAction(produit.id, form);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        setErreur(null);
        setConfirmation("Produit mis à jour.");
        onModifie();
      }
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer() {
    if (!produit) return;
    if (!window.confirm(`Supprimer définitivement « ${produit.nom} » du catalogue ?`)) return;
    setEnCours(true);
    try {
      const resultat = await supprimerProduitAction(produit.id);
      if (!resultat.succes) {
        setErreur(resultat.erreur ?? "Une erreur est survenue.");
        return;
      }
      onSupprime();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-6">
      <p className="mb-4 font-titres text-lg font-bold text-texte-principal">
        {modeCreation ? "Nouveau produit" : produit?.nom}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-texte-secondaire">Nom</span>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="text-texte-secondaire">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Prix public (USD)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.prix_public}
            onChange={(e) => setForm((f) => ({ ...f, prix_public: Number(e.target.value) }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Catégorie</span>
          <select
            value={form.categorie_id}
            onChange={(e) => setForm((f) => ({ ...f, categorie_id: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          >
            <option value="">— Choisir —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Marque</span>
          <select
            value={form.marque_id ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, marque_id: e.target.value || undefined }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          >
            <option value="">— Aucune —</option>
            {marques.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Statut de publication</span>
          <select
            value={form.statut_publication}
            onChange={(e) =>
              setForm((f) => ({ ...f, statut_publication: e.target.value as ProduitInputMock["statut_publication"] }))
            }
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          >
            <option value="brouillon">Brouillon</option>
            <option value="publié">Publié</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.eligible_b2b}
            onChange={(e) => setForm((f) => ({ ...f, eligible_b2b: e.target.checked }))}
            className="h-4 w-4 rounded border-bordure"
          />
          <span className="text-texte-principal">Éligible barème B2B (RG-03-004)</span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.eligible_package}
            onChange={(e) => setForm((f) => ({ ...f, eligible_package: e.target.checked }))}
            className="h-4 w-4 rounded border-bordure"
          />
          <span className="text-texte-principal">Éligible configurateur de package</span>
        </label>
      </div>

      {/* Point #29 — section facultative : un produit n'a pas de variantes par défaut. Chaque valeur a
          son propre prix (et, en option, son propre stock) — pas de matrice combinée entre attributs. */}
      <div className="mt-6 border-t border-bordure pt-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.variantes}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                variantes: e.target.checked ? (f.variantes && f.variantes.length > 0 ? f.variantes : [varianteVide()]) : undefined,
              }))
            }
            className="h-4 w-4 rounded border-bordure"
          />
          <span className="font-titres text-sm font-semibold text-texte-principal">
            Options du produit (variantes avec prix)
          </span>
        </label>

        {form.variantes && (
          <div className="mt-4 flex flex-col gap-4">
            {form.variantes.map((v, index) => (
              <div key={v.id} className="grid gap-3 rounded-lg border border-bordure p-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-texte-secondaire">Attribut</span>
                  <input
                    type="text"
                    value={v.attribut}
                    onChange={(e) => modifierVariante(index, { attribut: e.target.value })}
                    placeholder="ex. Puissance, Résolution…"
                    className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-texte-secondaire">Valeur</span>
                  <input
                    type="text"
                    value={v.valeur}
                    onChange={(e) => modifierVariante(index, { valeur: e.target.value })}
                    placeholder="ex. 405W, 4K…"
                    className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-texte-secondaire">Prix (USD)</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={v.prix}
                    onChange={(e) => modifierVariante(index, { prix: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-texte-secondaire">Stock (facultatif — vide = non suivi)</span>
                  <input
                    type="number"
                    min={0}
                    value={v.stock ?? ""}
                    onChange={(e) =>
                      modifierVariante(index, { stock: e.target.value === "" ? undefined : Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="text-texte-secondaire">Description (facultatif — points forts de cette valeur)</span>
                  <textarea
                    value={v.description ?? ""}
                    onChange={(e) => modifierVariante(index, { description: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => supprimerVariante(index)}
                  className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-danger hover:underline sm:col-span-2"
                >
                  <Trash2 size={14} /> Retirer cette valeur
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={ajouterVariante}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-bordure px-3 py-2 text-sm font-medium text-texte-principal hover:bg-fond"
            >
              <Plus size={14} /> Ajouter une valeur
            </button>
            <p className="text-xs text-texte-secondaire">
              Plusieurs attributs différents peuvent coexister sur ce produit (ex. Puissance et Couleur), mais sans
              matrice combinée : chaque ligne reste une valeur indépendante avec son propre prix.
            </p>
          </div>
        )}
      </div>

      {erreur && <p className="mt-4 text-sm font-medium text-danger">{erreur}</p>}
      {confirmation && (
        <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-succes">
          <Check size={14} /> {confirmation}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={enCours}
          onClick={soumettre}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primaire px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} /> {modeCreation ? "Créer le produit" : "Enregistrer"}
        </button>
        {!modeCreation && produit && (
          <button
            type="button"
            disabled={enCours}
            onClick={supprimer}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} /> Supprimer
          </button>
        )}
      </div>
    </div>
  );
}

function EditeurStock({
  produitId,
  stock,
  onSucces,
}: {
  produitId: string;
  stock: Stock | undefined;
  onSucces: () => void;
}) {
  const [stockActuel, setStockActuel] = useState(stock?.stock_actuel ?? 0);
  const [stockReference, setStockReference] = useState(stock?.stock_reference ?? 100);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function enregistrer() {
    setEnCours(true);
    try {
      const resultat = await definirStockAction(produitId, stockActuel, stockReference);
      if (!resultat.succes) {
        setErreur(resultat.erreur ?? "Une erreur est survenue.");
        return;
      }
      setErreur(null);
      onSucces();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-6">
      <p className="mb-4 font-titres text-base font-semibold text-texte-principal">Stock (RG-03-002)</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-texte-secondaire">Stock actuel</span>
          <input
            type="number"
            min={0}
            value={stockActuel}
            onChange={(e) => setStockActuel(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Stock de référence</span>
          <input
            type="number"
            min={1}
            value={stockReference}
            onChange={(e) => setStockReference(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
      </div>
      {erreur && <p className="mt-3 text-sm font-medium text-danger">{erreur}</p>}
      <button
        type="button"
        disabled={enCours}
        onClick={enregistrer}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-bordure px-4 py-2 text-sm font-semibold text-texte-principal hover:bg-fond disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save size={16} /> Mettre à jour le stock
      </button>
    </div>
  );
}

function EditeurPaliers({
  produitId,
  paliers,
  onSucces,
}: {
  produitId: string;
  paliers: PalierPrixB2B[];
  onSucces: () => void;
}) {
  const [quantiteMin, setQuantiteMin] = useState(1);
  const [quantiteMax, setQuantiteMax] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function ajouter() {
    setEnCours(true);
    try {
      const resultat = await ajouterPalierAction({
        produit_id: produitId,
        quantite_min: quantiteMin,
        quantite_max: quantiteMax === "" ? undefined : Number(quantiteMax),
        prix_unitaire: prixUnitaire,
      });
      if (!resultat.succes) {
        setErreur(resultat.erreur ?? "Une erreur est survenue.");
        return;
      }
      setErreur(null);
      setQuantiteMin(1);
      setQuantiteMax("");
      setPrixUnitaire(0);
      onSucces();
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer(id: string) {
    setEnCours(true);
    try {
      const resultat = await supprimerPalierAction(id);
      if (!resultat.succes) {
        setErreur(resultat.erreur ?? "Une erreur est survenue.");
        return;
      }
      setErreur(null);
      onSucces();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-6">
      <p className="mb-4 font-titres text-base font-semibold text-texte-principal">Barème B2B (RG-03-004)</p>

      {paliers.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucun palier défini.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {paliers.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-fond px-3 py-2 text-sm text-texte-principal"
            >
              <span>
                {p.quantite_min}
                {p.quantite_max ? `–${p.quantite_max}` : "+"} unités — ${p.prix_unitaire.toFixed(2)} / unité
              </span>
              <button
                type="button"
                disabled={enCours}
                onClick={() => supprimer(p.id)}
                className="text-texte-secondaire hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Supprimer ce palier"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-texte-secondaire">Qté min</span>
          <input
            type="number"
            min={1}
            value={quantiteMin}
            onChange={(e) => setQuantiteMin(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Qté max (vide = illimité)</span>
          <input
            type="number"
            min={quantiteMin}
            value={quantiteMax}
            onChange={(e) => setQuantiteMax(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Prix unitaire (USD)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={prixUnitaire}
            onChange={(e) => setPrixUnitaire(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
      </div>

      {erreur && <p className="mt-3 text-sm font-medium text-danger">{erreur}</p>}

      <button
        type="button"
        disabled={enCours}
        onClick={ajouter}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-bordure px-4 py-2 text-sm font-semibold text-texte-principal hover:bg-fond disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={16} /> Ajouter ce palier
      </button>
    </div>
  );
}
