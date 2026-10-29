"use client";

import { useState } from "react";
import Image from "next/image";
import { VisuelProduit, type ProduitVisuel } from "./VisuelProduit";

// Intégration du catalogue ATC (étape 2) — photos carrées en `contain` sur fond blanc. Un produit sans
// photo mais avec bannière l'affiche à son format 2:1 (pas de recadrage carré sur la fiche, contrairement
// aux vignettes) ; sans aucune image, visuel neutre avec le nom (VisuelProduit).
export function GalerieImages({ produit }: { produit: ProduitVisuel }) {
  const [indexActif, setIndexActif] = useState(0);
  const images = produit.images;

  if (images.length === 0) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-fond ${
          produit.image_banniere ? "aspect-[2/1] self-start" : "aspect-square"
        }`}
      >
        <VisuelProduit produit={produit} preload sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-bordure bg-white">
        <Image
          src={images[indexActif]}
          alt={produit.nom}
          fill
          preload
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndexActif(i)}
              aria-label={`Voir l'image ${i + 1}`}
              aria-current={i === indexActif}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${
                i === indexActif ? "border-primaire" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill className="object-contain" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
