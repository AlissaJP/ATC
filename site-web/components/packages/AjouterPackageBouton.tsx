"use client";

import { useState } from "react";
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
      <button
        type="button"
        onClick={gererAjout}
        disabled={!disponible}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {confirmationVisible ? <Check size={18} /> : <ShoppingCart size={18} />}
        {confirmationVisible ? "Ajouté au panier" : disponible ? "Ajouter au panier" : "Indisponible actuellement"}
      </button>
      {messageToast && (
        <Toast message={messageToast} actionLabel="Se connecter" onAction={allerALaConnexion} onFermer={fermerToast} />
      )}
    </>
  );
}
