"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useComptesStore } from "@/lib/store/comptes-store";
import { useSessionStore } from "@/lib/store/session-store";
import { useGardeClient } from "@/lib/hooks/useGardeClient";
import { Toast } from "@/components/ui/Toast";

// BF-08-004 — Liste de produits favoris. Visiteur non connecté (Raffinement Design) : le bouton reste
// cliquable (plutôt que disabled) pour pouvoir expliquer pourquoi l'action est bloquée.
export function BoutonFavori({ produitId, className = "" }: { produitId: string; className?: string }) {
  const session = useSessionStore((s) => s.session);
  const favoris = useComptesStore((s) => s.favoris);
  const basculerFavori = useComptesStore((s) => s.basculerFavori);
  const { executerSiConnecte, messageToast, fermerToast, allerALaConnexion } = useGardeClient();

  const estFavori = session?.type === "client" && favoris.some((f) => f.utilisateur_id === session.utilisateur_id && f.produit_id === produitId);

  return (
    <>
      <button
        type="button"
        aria-label={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={estFavori}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          executerSiConnecte(() => {
            if (session?.type === "client") basculerFavori(session.utilisateur_id, produitId);
          }, "Connectez-vous pour ajouter ce produit à vos favoris.");
        }}
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors ${className}`}
      >
        {/* key={String(estFavori)} : remonte le cœur à chaque bascule pour rejouer le pop d'échelle
            (Raffinement Design, micro-animation favoris). */}
        <motion.span
          key={String(estFavori)}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 15 }}
          className="flex"
        >
          <Heart size={18} className={estFavori ? "fill-accent text-accent" : "text-texte-secondaire"} />
        </motion.span>
      </button>
      {messageToast && (
        <Toast message={messageToast} actionLabel="Se connecter" onAction={allerALaConnexion} onFermer={fermerToast} />
      )}
    </>
  );
}
