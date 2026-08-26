"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, PackagePlus, Plus } from "lucide-react";
import type { NiveauAlerteStock, PalierPrixB2B, Produit } from "@/lib/types/entities";
import { StockBadge } from "./StockBadge";
import { BoutonFavori } from "./BoutonFavori";
import { Etoiles } from "./Etoiles";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { useCartStore } from "@/lib/store/cart-store";
import { useAvisStore } from "@/lib/store/avis-store";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";
import { calculerAvisPublies } from "@/lib/services/avis";
import { useGardeClient } from "@/lib/hooks/useGardeClient";
import { prixDepart } from "@/lib/services/variantes";
import { Toast } from "@/components/ui/Toast";

// RG-03-001 / RG-03-004 — prix public par défaut, ou prix de départ du barème si client B2B vérifié.
interface ProductCardProps {
  produit: Produit;
  niveauStock: NiveauAlerteStock;
  paliers: PalierPrixB2B[];
}

export function ProductCard({ produit, niveauStock, paliers }: ProductCardProps) {
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
      className="group flex flex-col overflow-hidden rounded-xl border border-bordure bg-background transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-fond">
        {produit.images[0] ? (
          <Image
            src={produit.images[0]}
            alt={produit.nom}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-texte-secondaire">
            Image à venir
          </div>
        )}
        {produit.eligible_package && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold text-primaire shadow-sm"
            title="Disponible en package personnalisé"
          >
            <PackagePlus size={12} /> Package
          </span>
        )}
        <BoutonFavori produitId={produit.id} className="absolute right-2 top-2 h-8 w-8" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-titres text-sm font-semibold leading-snug text-texte-principal">
          {produit.nom}
        </h3>
        {nombre > 0 && moyenne !== undefined && (
          <div className="flex items-center gap-1.5">
            <Etoiles note={Math.round(moyenne)} taille={12} />
            <span className="text-xs text-texte-secondaire">({nombre})</span>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <p className="font-titres text-base font-bold text-primaire">
              {(aDesVariantes || palierDepart) && "À partir de "}${prixAffiche.toFixed(2)}
            </p>
            <StockBadge niveau={niveauStock} />
          </div>
          {/* Point #29 — un produit à variantes exige de choisir une valeur avant l'ajout : pas de bouton
              d'ajout rapide ici, la carte mène déjà à la fiche produit (sélecteur + description dédiée). */}
          {!aDesVariantes && (
            <motion.button
              type="button"
              aria-label="Ajouter au panier"
              disabled={niveauStock === "rupture"}
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                executerSiConnecte(() => {
                  ajouterLigne(produit.id, 1);
                  setConfirmationVisible(true);
                  setTimeout(() => setConfirmationVisible(false), 1200);
                }, "Connectez-vous pour ajouter ce produit à votre panier.");
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
      </div>
      {messageToast && (
        <Toast message={messageToast} actionLabel="Se connecter" onAction={allerALaConnexion} onFermer={fermerToast} />
      )}
    </Link>
  );
}
