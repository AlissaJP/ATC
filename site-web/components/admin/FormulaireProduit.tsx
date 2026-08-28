"use client";

// ECR-12-002 — Formulaire produit (création ET modification) + éditeur de barème B2B, extraits de
// GestionCatalogue.tsx (Raffinement Design) pour être réutilisés à la fois dans la fenêtre modale
// d'édition (GestionCatalogue.tsx, clic sur un produit existant) et sur la page dédiée de création
// (/admin/catalogue/nouveau, CreationProduit.tsx).
import { useRef, useState } from "react";
import { Check, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import type { Categorie, Marque, PalierPrixB2B, Produit, VarianteProduit } from "@/lib/types/entities";
import {
  ajouterPalierAction,
  creerProduitAction,
  modifierProduitAction,
  supprimerPalierAction,
  supprimerProduitAction,
} from "@/lib/actions/catalogue-admin";
import type { ProduitInputMock } from "@/lib/mock-data/produits";

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

// Aucun vrai stockage fichier (décision actée n°41, sandbox sans backend) : chaque photo est convertie en
// data URL (FileReader.readAsDataURL) et stockée directement dans Produit.images — contrairement à
// CompleterDossier.tsx (qui ne garde que le nom/la taille du fichier pour un dossier KYC), ici le rendu
// réel de la photo est nécessaire (galerie produit publique), donc le contenu doit être persistable.
const TAILLE_MAX_IMAGE_OCTETS = 5 * 1024 * 1024;

export function FormulaireProduit({
  modeCreation,
  produit,
  categories,
  marques,
  categorieInitiale,
  masquerTitre = false,
  onCree,
  onModifie,
  onSupprime,
}: {
  modeCreation: boolean;
  produit: Produit | undefined;
  categories: Categorie[];
  marques: Marque[];
  // Catégorie présélectionnée à la création (onglet actif d'où vient le clic sur "Nouveau produit") —
  // ignoré en modification (categorie_id vient alors du produit).
  categorieInitiale?: string;
  // La fenêtre modale d'édition (GestionCatalogue.tsx) affiche déjà le nom du produit dans son propre
  // en-tête (Modal.tsx) — évite de le répéter juste en dessous. Toujours affiché sur la page de création
  // (CreationProduit.tsx), qui n'a pas cet en-tête.
  masquerTitre?: boolean;
  onCree?: (id: string) => void;
  onModifie?: () => void;
  onSupprime?: () => void;
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
          images: produit.images,
          variantes: produit.variantes,
        }
      : { ...FORM_VIDE, categorie_id: categorieInitiale ?? FORM_VIDE.categorie_id }
  );
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurImage, setErreurImage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const inputImageRef = useRef<HTMLInputElement>(null);

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

  function gererImages(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const fichier of fichiers) {
      if (!fichier.type.startsWith("image/")) {
        setErreurImage("Format non supporté — images uniquement (JPG, PNG…).");
        continue;
      }
      if (fichier.size > TAILLE_MAX_IMAGE_OCTETS) {
        setErreurImage("Une photo dépasse 5 Mo.");
        continue;
      }
      setErreurImage(null);
      const lecteur = new FileReader();
      lecteur.onload = () => {
        if (typeof lecteur.result === "string") {
          setForm((f) => ({ ...f, images: [...(f.images ?? []), lecteur.result as string] }));
        }
      };
      lecteur.readAsDataURL(fichier);
    }
  }
  function supprimerImage(index: number) {
    setForm((f) => ({ ...f, images: (f.images ?? []).filter((_, i) => i !== index) }));
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
        if (resultat.donnees) onCree?.(resultat.donnees.id);
      } else if (produit) {
        const resultat = await modifierProduitAction(produit.id, form);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        setErreur(null);
        setConfirmation("Produit mis à jour.");
        onModifie?.();
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
      onSupprime?.();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-6">
      {!masquerTitre && (
        <p className="mb-4 font-titres text-lg font-bold text-texte-principal">
          {modeCreation ? "Nouveau produit" : produit?.nom}
        </p>
      )}

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
        {modeCreation && form.eligible_b2b && (
          <p className="text-xs text-texte-secondaire sm:col-span-2">
            Un barème par défaut sera généré automatiquement à la création — vous pourrez l&apos;ajuster
            juste après (paliers personnalisés, suppression…).
          </p>
        )}

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

      {/* Photos du produit — Raffinement Design. Pas de vrai stockage fichier (décision actée n°41) :
          chaque photo est convertie en data URL et stockée directement dans Produit.images, pour un rendu
          réel sur la fiche produit publique (GalerieImages.tsx). */}
      <div className="mt-6 border-t border-bordure pt-5">
        <p className="mb-3 font-titres text-sm font-semibold text-texte-principal">Photos du produit</p>
        <div className="flex flex-wrap gap-3">
          {(form.images ?? []).map((src, index) => (
            <div key={src} className="relative h-24 w-24 overflow-hidden rounded-lg border border-bordure">
              {/* aperçu admin uniquement (data URL ou chemin statique) : pas la galerie publique (qui
                  reste sur next/image, GalerieImages.tsx), donc pas besoin de l'optimiseur d'images. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => supprimerImage(index)}
                aria-label="Retirer cette photo"
                className="absolute right-1 top-1 rounded-full bg-texte-principal/70 p-1 text-white hover:bg-danger"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputImageRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-bordure text-texte-secondaire hover:border-primaire hover:text-primaire"
          >
            <ImagePlus size={20} />
            <span className="text-[10px] font-medium">Ajouter</span>
          </button>
        </div>
        <input ref={inputImageRef} type="file" accept="image/*" multiple className="hidden" onChange={gererImages} />
        {erreurImage && <p className="mt-2 text-xs font-medium text-danger">{erreurImage}</p>}
        <p className="mt-2 text-xs text-texte-secondaire">JPG ou PNG, 5 Mo max par photo.</p>
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

export function EditeurPaliers({
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
