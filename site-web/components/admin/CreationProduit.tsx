"use client";

// Raffinement Design — page dédiée à la création d'un produit (ECR-12-002), distincte de la fenêtre
// modale utilisée pour modifier un produit existant (GestionCatalogue.tsx) : formulaire plus long, saisie
// initiale, mieux à l'aise sur une page complète.
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Categorie, Marque } from "@/lib/types/entities";
import { FormulaireProduit } from "@/components/admin/FormulaireProduit";

export function CreationProduit({
  categories,
  marques,
  categorieInitiale,
}: {
  categories: Categorie[];
  marques: Marque[];
  categorieInitiale?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/catalogue"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-texte-secondaire hover:text-texte-principal"
      >
        <ArrowLeft size={16} /> Retour au catalogue
      </Link>
      <FormulaireProduit
        modeCreation
        produit={undefined}
        categories={categories}
        marques={marques}
        categorieInitiale={categorieInitiale}
        onCree={(id) => {
          // Redirige vers le catalogue avec le produit nouvellement créé déjà ouvert dans la fenêtre
          // d'édition (Raffinement Design) : le barème B2B par défaut (si éligible, cf. FormulaireProduit)
          // y est immédiatement modifiable, sans dupliquer la gestion des paliers sur cette page.
          router.push(`/admin/catalogue?produit=${id}`);
        }}
      />
    </div>
  );
}
