"use client";

// Raffinement Design — page dédiée à la création d'un package pré-configuré (BF-12-003), distincte de la
// fenêtre modale utilisée pour modifier un package existant (GestionPackages.tsx) — même idiome que
// CreationProduit.tsx pour Catalogue.
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Produit } from "@/lib/types/entities";
import { FormulairePackage } from "@/components/admin/FormulairePackage";

export function CreationPackage({ produitsEligibles }: { produitsEligibles: Produit[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/packages"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-texte-secondaire hover:text-texte-principal"
      >
        <ArrowLeft size={16} /> Retour aux packages
      </Link>
      <FormulairePackage
        modeCreation
        pack={undefined}
        produitsEligibles={produitsEligibles}
        onCree={(id) => {
          // Redirige vers la liste avec le package nouvellement créé déjà ouvert dans la fenêtre d'édition
          // (Raffinement Design), même idiome que CreationProduit.tsx.
          router.push(`/admin/packages?package=${id}`);
        }}
      />
    </div>
  );
}
