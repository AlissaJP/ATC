"use client";

// ECR-12-002 (élargi) — Création/édition des packages pré-configurés (BF-12-003, Must have). Gap
// identifié lors de l'audit qualité — seul le traitement des demandes personnalisées (ECR-04-004) était
// construit. Même architecture Server Actions + revalidatePath que GestionCatalogue.tsx (voir
// lib/actions/catalogue-admin.ts) ; remontage via `key` pour réinitialiser l'état d'édition (même raison
// documentée dans GestionCatalogue.tsx).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import type { PackagePreconfigure, Produit } from "@/lib/types/entities";
import {
  creerPackageAction,
  modifierPackageAction,
  supprimerPackageAction,
} from "@/lib/actions/catalogue-admin";
import type { PackageInputMock } from "@/lib/mock-data/packages-preconfigures";

interface GestionPackagesProps {
  packages: PackagePreconfigure[];
  produits: Produit[];
}

export function GestionPackages({ packages, produits }: GestionPackagesProps) {
  const router = useRouter();
  const [selectionId, setSelectionId] = useState<string | null>(packages[0]?.id ?? null);
  const [modeCreation, setModeCreation] = useState(false);
  const selection = modeCreation ? undefined : packages.find((p) => p.id === selectionId);
  const produitsEligibles = produits.filter((p) => p.eligible_package);

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div>
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
          <Plus size={16} /> Nouveau package
        </button>
        <div className="flex flex-col gap-2">
          {packages.map((p) => (
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
              <p className="text-xs text-texte-secondaire">${p.prix_total.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        {!modeCreation && !selection ? (
          <p className="text-sm text-texte-secondaire">Sélectionnez un package ou créez-en un nouveau.</p>
        ) : (
          <FormulairePackage
            key={modeCreation ? "creation" : selection!.id}
            modeCreation={modeCreation}
            pack={selection}
            produitsEligibles={produitsEligibles}
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
        )}
      </div>
    </div>
  );
}

function FormulairePackage({
  modeCreation,
  pack,
  produitsEligibles,
  onCree,
  onModifie,
  onSupprime,
}: {
  modeCreation: boolean;
  pack: PackagePreconfigure | undefined;
  produitsEligibles: Produit[];
  onCree: (id: string) => void;
  onModifie: () => void;
  onSupprime: () => void;
}) {
  const [nom, setNom] = useState(pack?.nom ?? "");
  const [description, setDescription] = useState(pack?.description ?? "");
  const [image, setImage] = useState(pack?.image ?? "");
  const [composition, setComposition] = useState<{ produit_id: string; quantite: number }[]>(pack?.produits ?? []);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function ajouterLigne() {
    if (produitsEligibles.length === 0) return;
    setComposition((c) => [...c, { produit_id: produitsEligibles[0].id, quantite: 1 }]);
  }

  function modifierLigne(index: number, patch: Partial<{ produit_id: string; quantite: number }>) {
    setComposition((c) => c.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function retirerLigne(index: number) {
    setComposition((c) => c.filter((_, i) => i !== index));
  }

  const prixEstime = composition.reduce((total, l) => {
    const produit = produitsEligibles.find((p) => p.id === l.produit_id);
    return total + (produit?.prix_public ?? 0) * l.quantite;
  }, 0);

  async function soumettre() {
    setEnCours(true);
    try {
      const input: PackageInputMock = { nom, description, image, produits: composition };
      if (modeCreation) {
        const resultat = await creerPackageAction(input);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        if (resultat.donnees) onCree(resultat.donnees.id);
      } else if (pack) {
        const resultat = await modifierPackageAction(pack.id, input);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        onModifie();
      }
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer() {
    if (!pack) return;
    if (!window.confirm(`Supprimer le package « ${pack.nom} » ?`)) return;
    setEnCours(true);
    try {
      const resultat = await supprimerPackageAction(pack.id);
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
        {modeCreation ? "Nouveau package" : pack?.nom}
      </p>

      <div className="grid gap-4">
        <label className="block text-sm">
          <span className="text-texte-secondaire">Nom</span>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Chemin de l&apos;image (public/images/…)</span>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/images/energie-solaire/energie-XX.webp"
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
          {!image.trim() && (
            <span className="mt-1 block text-xs text-avertissement">
              Sans image, un espace réservé « Image à venir » s&apos;affichera à la place.
            </span>
          )}
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-texte-principal">Composition</p>
        <div className="flex flex-col gap-2">
          {composition.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={l.produit_id}
                onChange={(e) => modifierLigne(i, { produit_id: e.target.value })}
                className="flex-1 rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              >
                {produitsEligibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={l.quantite}
                onChange={(e) => modifierLigne(i, { quantite: Number(e.target.value) })}
                className="w-20 rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              />
              <button type="button" onClick={() => retirerLigne(i)} className="text-texte-secondaire hover:text-danger" aria-label="Retirer">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={ajouterLigne}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-bordure px-3 py-1.5 text-xs font-semibold text-texte-principal hover:bg-fond"
        >
          <Plus size={14} /> Ajouter un produit
        </button>
      </div>

      <p className="mt-4 rounded-lg bg-fond px-3 py-2 text-sm">
        <span className="text-texte-secondaire">Prix estimé (recalculé au prix public actuel) : </span>
        <span className="font-semibold text-texte-principal">${prixEstime.toFixed(2)}</span>
      </p>

      {erreur && <p className="mt-3 text-sm font-medium text-danger">{erreur}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={enCours || !nom.trim() || composition.length === 0}
          onClick={soumettre}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primaire px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} /> {modeCreation ? "Créer le package" : "Enregistrer"}
        </button>
        {!modeCreation && pack && (
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
