"use client";

// ECR-12-002 (élargi) — Gestion des packages pré-configurés (BF-12-003, Must have). Raffinement Design —
// même architecture que GestionCatalogue.tsx : un clic sur un package ouvre son édition dans une fenêtre
// modale (Modal.tsx) plutôt qu'un panneau à droite de la liste ; la création reste une page à part entière
// (/admin/packages/nouveau, CreationPackage.tsx). Le formulaire package vit dans FormulairePackage.tsx,
// partagé entre les deux.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { PackagePreconfigure, Produit } from "@/lib/types/entities";
import { FormulairePackage } from "@/components/admin/FormulairePackage";
import { Modal } from "@/components/ui/Modal";

interface GestionPackagesProps {
  packages: PackagePreconfigure[];
  produits: Produit[];
  // Id du package à ouvrir automatiquement dans la fenêtre d'édition — utilisé par CreationPackage.tsx
  // pour enchaîner directement sur l'édition juste après une création (même idiome que produitInitial,
  // GestionCatalogue.tsx).
  packageInitial?: string;
}

export function GestionPackages({ packages, produits, packageInitial }: GestionPackagesProps) {
  const router = useRouter();
  const [packageOuvertId, setPackageOuvertId] = useState<string | null>(packageInitial ?? null);
  const produitsEligibles = produits.filter((p) => p.eligible_package);

  // Un clic sur un sous-lien de la sidebar ou une redirection post-création navigue vers la même route
  // avec un `package` différent : React ne réinitialise pas l'état local de ce composant client pour
  // autant, donc on resynchronise pendant le rendu — même pattern que GestionCatalogue.tsx (règle
  // react-hooks/set-state-in-effect).
  const [packageInitialTraite, setPackageInitialTraite] = useState(packageInitial);
  if (packageInitial !== packageInitialTraite) {
    setPackageInitialTraite(packageInitial);
    setPackageOuvertId(packageInitial ?? null);
  }

  const packageOuvert = packageOuvertId ? packages.find((p) => p.id === packageOuvertId) : undefined;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/packages/nouveau"
          className="flex items-center gap-1.5 rounded-lg border border-bordure px-3 py-2 text-sm font-semibold text-texte-principal hover:bg-fond"
        >
          <Plus size={16} /> Nouveau package
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPackageOuvertId(p.id)}
            className="rounded-lg border border-bordure bg-background p-3 text-left transition-colors hover:border-primaire-clair"
          >
            <p className="text-sm font-medium text-texte-principal">{p.nom}</p>
            <p className="text-xs text-texte-secondaire">${p.prix_total.toFixed(2)}</p>
          </button>
        ))}
        {packages.length === 0 && <p className="text-sm text-texte-secondaire">Aucun package pour le moment.</p>}
      </div>

      {packageOuvert && (
        <Modal titre={packageOuvert.nom} largeurMax="max-w-2xl" onFermer={() => setPackageOuvertId(null)}>
          <FormulairePackage
            key={packageOuvert.id}
            modeCreation={false}
            pack={packageOuvert}
            produitsEligibles={produitsEligibles}
            masquerTitre
            onModifie={() => router.refresh()}
            onSupprime={() => {
              router.refresh();
              setPackageOuvertId(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
