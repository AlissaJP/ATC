import Image from "next/image";

// Intégration du catalogue ATC — règles d'affichage de l'étape 2 pour une image du catalogue dont on ne
// connaît que le chemin : photo produit carrée (/images/produits/) entière en `contain` sur fond blanc,
// bannière 2:1 (/images/bannieres/) en `cover` recadrée au centre. Remplit son conteneur parent, qui doit
// être `relative` et fixer le format. (Pour un Produit, VisuelProduit applique la même règle.)
export function estPhotoProduit(src: string): boolean {
  return src.startsWith("/images/produits/");
}

export function ImageCatalogue({
  src,
  alt,
  sizes,
  preload,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      preload={preload}
      className={`${estPhotoProduit(src) ? "bg-white object-contain" : "object-cover object-center"} ${className}`}
      sizes={sizes}
    />
  );
}
