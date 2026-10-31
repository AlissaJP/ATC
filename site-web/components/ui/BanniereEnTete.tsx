import { ImageCatalogue, estPhotoProduit } from "./ImageCatalogue";

// Intégration du catalogue ATC (étape 6) — image d'en-tête au format 2:1 (pages catégorie, page packages) :
// bannière en `cover`, photo produit carrée (ex. SE-01 pour Sécurité) entière sur fond blanc.
export function BanniereEnTete({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className={`relative aspect-[2/1] w-full overflow-hidden rounded-xl ${
        estPhotoProduit(src) ? "border border-bordure bg-white" : "bg-fond"
      }`}
    >
      <ImageCatalogue src={src} alt={alt} preload sizes="(max-width: 768px) 100vw, 50vw" />
    </div>
  );
}
