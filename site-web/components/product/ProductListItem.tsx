"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import type { NiveauAlerteStock, PalierPrixB2B, Produit } from "@/lib/types/entities";
import { StockBadge } from "./StockBadge";
import { BoutonFavori } from "./BoutonFavori";
import { VisuelProduit } from "./VisuelProduit";
import { Etoiles } from "./Etoiles";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { useCartStore } from "@/lib/store/cart-store";
import { useAvisStore } from "@/lib/store/avis-store";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";
import { calculerAvisPublies } from "@/lib/services/avis";
import { useGardeClient } from "@/lib/hooks/useGardeClient";
import { prixDepart } from "@/lib/services/variantes";
import { formaterPrix } from "@/lib/services/prix";
import { Toast } from "@/components/ui/Toast";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { localiserProduit } from "@/lib/i18n/catalogue";

// ECR-01-002/ECR-02-001 — variante « vue liste » de ProductCard (bascule grille/liste, Raffinement Design).
interface ProductListItemProps {
  produit: Produit;
  niveauStock: NiveauAlerteStock;
  paliers: PalierPrixB2B[];
}

export function ProductListItem({ produit: produitSource, niveauStock, paliers }: ProductListItemProps) {
  const { t, langue } = useTranslation();
  // Traduction à l'affichage (nom, variantes) ; les identifiants restent ceux du produit source.
  const produit = localiserProduit(produitSource, langue);
  const session = useSessionStore((s) => s.session);
  const estB2B = estClientB2BVerifie(session);
  const palierDepart = estB2B && paliers.length > 0 ? trouverPalierApplicable(paliers, 1) : undefined;
  const aDesVariantes = !!produit.variantes && produit.variantes.length > 1;
  const prixAffiche = aDesVariantes ? prixDepart(produit) : palierDepart ? palierDepart.prix_unitaire : produit.prix_public;

  const tousLesAvis = useAvisStore((s) => s.avis);
  const { moyenne, nombre } = calculerAvisPublies(tousLesAvis, produit.id);

  const ajouterLigne = useCartStore((s) => s.ajouterLigne);
  const { executerSiConnecte, messageToast, fermerToast, allerALaConnexion } = useGardeClient();
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  return (
    <Link
      href={`/produit/${produit.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-bordure bg-background p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-fond">
        <VisuelProduit produit={produit} sizes="80px" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-titres text-sm font-semibold text-texte-principal">{produit.nom}</h3>
        {nombre > 0 && moyenne !== undefined && (
          <div className="mt-1 flex items-center gap-1.5">
            <Etoiles note={Math.round(moyenne)} taille={12} />
            <span className="text-xs text-texte-secondaire">({nombre})</span>
          </div>
        )}
        {/* « Prix sur demande » : pas de badge de stock, comme sur la fiche produit. */}
        {produit.prix_disponible && (
          <div className="mt-1">
            <StockBadge niveau={niveauStock} />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <p className="font-titres text-base font-bold text-primaire">
          {prixAffiche !== null && (aDesVariantes || palierDepart)
            ? t("prix.aPartirDe", { prix: formaterPrix(prixAffiche) })
            : formaterPrix(prixAffiche, langue)}
        </p>
        <BoutonFavori produitId={produit.id} className="static h-9 w-9" />
        {/* Point #29 — un produit à variantes exige de choisir une valeur avant l'ajout : pas de bouton
            d'ajout rapide ici, la ligne mène déjà à la fiche produit (sélecteur + description dédiée). */}
        {!aDesVariantes && produit.prix_disponible && (
          <motion.button
            type="button"
            aria-label={t("produit.ajouterPanier")}
            disabled={niveauStock === "rupture"}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              executerSiConnecte(() => {
                ajouterLigne(produit.id, 1);
                setConfirmationVisible(true);
                setTimeout(() => setConfirmationVisible(false), 1200);
              }, t("produit.connexionPanier"));
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaire text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={confirmationVisible ? "check" : "plus"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                {confirmationVisible ? <Check size={18} /> : <Plus size={18} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </div>
      {messageToast && (
        <Toast message={messageToast} actionLabel={t("commun.seConnecter")} onAction={allerALaConnexion} onFermer={fermerToast} />
      )}
    </Link>
  );
}
