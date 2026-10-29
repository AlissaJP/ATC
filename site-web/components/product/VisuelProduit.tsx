import Image from "next/image";
import type { Produit } from "@/lib/types/entities";

// Intégration du catalogue ATC (étape 2) — règles d'affichage d'un visuel produit, partagées par toutes
// les vignettes (carte, liste, recherche, panier, configurateur...) :
// 1. photo carrée du produit : `object-contain` sur fond blanc (photos détourées ou remplies, 1200×1200) ;
// 2. à défaut, bannière 2:1 recadrée au centre (`object-cover`) ;
// 3. à défaut, visuel neutre aux couleurs ATC avec le nom du produit — jamais d'image cassée.
// Le composant remplit son conteneur parent, qui doit être `relative` et fixer le format (carré en
// général).
export type ProduitVisuel = Pick<Produit, "nom" | "images" | "image_banniere">;

interface VisuelProduitProps {
  produit: ProduitVisuel;
  sizes: string;
  preload?: boolean;
  className?: string;
}

export function VisuelProduit({ produit, sizes, preload, className = "" }: VisuelProduitProps) {
  const photo = produit.images[0];
  if (photo) {
    return (
      <Image
        src={photo}
        alt={produit.nom}
        fill
        preload={preload}
        className={`bg-white object-contain ${className}`}
        sizes={sizes}
      />
    );
  }

  if (produit.image_banniere) {
    return (
      <Image
        src={produit.image_banniere}
        alt={produit.nom}
        fill
        preload={preload}
        className={`object-cover object-center ${className}`}
        sizes={sizes}
      />
    );
  }

  // Le nom n'est affiché qu'à partir de 72 px de large : dans les mini-vignettes (recherche, panier),
  // il figure déjà juste à côté et serait illisible ici.
  return (
    <div
      role="img"
      aria-label={produit.nom}
      className="@container absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primaire to-primaire-clair p-3 text-center"
    >
      <span className="hidden @min-[72px]:block">
        <span className="line-clamp-4 font-titres text-[11px] font-semibold leading-tight text-white @min-[160px]:text-sm @min-[320px]:text-xl">
          {produit.nom}
        </span>
      </span>
    </div>
  );
}
