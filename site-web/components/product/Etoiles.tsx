import { Star } from "lucide-react";

// Rangée d'étoiles partagée — AvisProduit.tsx (fiche produit) et ProductCard.tsx (grille catalogue).
export function Etoiles({ note, taille = 16 }: { note: number; taille?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${note} sur 5 étoiles`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={taille} className={n <= note ? "fill-avertissement text-avertissement" : "text-bordure"} />
      ))}
    </div>
  );
}
