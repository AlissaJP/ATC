"use client";

import { Heart } from "lucide-react";
import { useComptesStore } from "@/lib/store/comptes-store";
import { useSessionStore } from "@/lib/store/session-store";

// BF-08-004 — Liste de produits favoris.
export function BoutonFavori({ produitId, className = "" }: { produitId: string; className?: string }) {
  const session = useSessionStore((s) => s.session);
  const favoris = useComptesStore((s) => s.favoris);
  const basculerFavori = useComptesStore((s) => s.basculerFavori);

  const estFavori = session?.type === "client" && favoris.some((f) => f.utilisateur_id === session.utilisateur_id && f.produit_id === produitId);

  return (
    <button
      type="button"
      aria-label={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={estFavori}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (session?.type === "client") basculerFavori(session.utilisateur_id, produitId);
      }}
      disabled={session?.type !== "client"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Heart size={18} className={estFavori ? "fill-accent text-accent" : "text-texte-secondaire"} />
    </button>
  );
}
