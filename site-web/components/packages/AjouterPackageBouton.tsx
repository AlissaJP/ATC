"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useGardeClient } from "@/lib/hooks/useGardeClient";
import { Toast } from "@/components/ui/Toast";
import type { LigneCompositionPackage } from "@/lib/services/packages";

export function AjouterPackageBouton({
  lignes,
  disponible,
}: {
  lignes: LigneCompositionPackage[];
  disponible: boolean;
}) {
  const ajouterLigne = useCartStore((s) => s.ajouterLigne);
  const { executerSiConnecte, messageToast, fermerToast, allerALaConnexion } = useGardeClient();
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  function gererAjout() {
    if (!disponible) return;
    executerSiConnecte(() => {
      for (const { produit, quantite } of lignes) {
        // Prix fixé au tarif public du package ("tout compris") — jamais recalculé par le barème B2B.
        ajouterLigne(produit.id, quantite, produit.prix_public);
      }
      setConfirmationVisible(true);
      setTimeout(() => setConfirmationVisible(false), 1500);
    }, "Connectez-vous pour ajouter ce package à votre panier.");
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={gererAjout}
        disabled={!disponible}
        whileTap={{ scale: 0.97 }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={confirmationVisible ? "check" : "cart"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {confirmationVisible ? <Check size={18} /> : <ShoppingCart size={18} />}
          </motion.span>
        </AnimatePresence>
        {confirmationVisible ? "Ajouté au panier" : disponible ? "Ajouter au panier" : "Indisponible actuellement"}
      </motion.button>
      {messageToast && (
        <Toast message={messageToast} actionLabel="Se connecter" onAction={allerALaConnexion} onFermer={fermerToast} />
      )}
    </>
  );
}
