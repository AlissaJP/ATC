"use client";

// Raffinement Design — visiteur non connecté : panier et favoris nécessitent un compte (BF-08-004
// pour les favoris ; même règle étendue au panier). Hook partagé par les points d'entrée « Ajouter au
// panier »/favoris (ProductCard, ProductListItem, AchatProduit, AjouterPackageBouton, BoutonFavori) pour
// éviter de dupliquer l'état du toast à chaque endroit.
import { useState } from "react";
import { useSessionStore } from "@/lib/store/session-store";

export function useGardeClient() {
  const session = useSessionStore((s) => s.session);
  const [messageToast, setMessageToast] = useState<string | null>(null);
  const estConnecte = session?.type === "client";

  function executerSiConnecte(action: () => void, messageSiNonConnecte: string) {
    if (estConnecte) {
      action();
      return;
    }
    setMessageToast(messageSiNonConnecte);
  }

  return {
    estConnecte,
    executerSiConnecte,
    messageToast,
    fermerToast: () => setMessageToast(null),
    // Navigation "dure" (pas router.push) : ce toast est monté depuis des composants imbriqués à des
    // profondeurs variables (carte produit dans un <Link>, bouton favoris en enfant, etc.) — observé
    // empiriquement, router.push perd silencieusement la transition selon le contexte d'appel, alors
    // qu'une navigation navigateur classique est fiable dans tous les cas. Sans enjeu ici : on quitte
    // délibérément la vue courante pour se connecter.
    allerALaConnexion: () => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- exception délibérée, cf. commentaire ci-dessus
      window.location.href = "/compte/connexion";
    },
  };
}
