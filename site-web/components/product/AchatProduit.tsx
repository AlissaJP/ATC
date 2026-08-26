"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import type { NiveauAlerteStock, PalierPrixB2B, Produit, VarianteProduit } from "@/lib/types/entities";
import { StockBadge } from "./StockBadge";
import { BoutonFavori } from "./BoutonFavori";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { useCartStore } from "@/lib/store/cart-store";
import { usePackageDraftStore } from "@/lib/store/package-draft-store";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";
import { useGardeClient } from "@/lib/hooks/useGardeClient";
import { construireIdLigne } from "@/lib/services/variantes";
import { Toast } from "@/components/ui/Toast";

interface AchatProduitProps {
  produit: Produit;
  niveauStock: NiveauAlerteStock;
  paliers: PalierPrixB2B[];
  stockActuel: number;
  // Point #29 — options de variantes avec prix, imbriquées sur le produit (remplace le mécanisme à SKU
  // séparés du point #23). Jamais fourni si le produit a moins de 2 valeurs (cf. app/produit/[slug]/page.tsx).
  variantes?: VarianteProduit[];
}

// ECR-03-001 — Prix + barème B2B (RG-03-001, RG-03-004), sélection de quantité en temps réel,
// boutons « Ajouter au panier » / « Ajouter au package personnalisé » visuellement distincts (Cahier 7 §3).
export function AchatProduit({ produit, niveauStock, paliers, stockActuel, variantes }: AchatProduitProps) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const estB2B = estClientB2BVerifie(session);
  const ajouterLigne = useCartStore((s) => s.ajouterLigne);
  const ajouterAuPackage = usePackageDraftStore((s) => s.ajouterProduit);
  const { executerSiConnecte, messageToast, fermerToast, allerALaConnexion } = useGardeClient();

  const [quantite, setQuantite] = useState(1);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  // Point #29 — id de la variante active : la première par défaut. Change au clic sur un chip, jamais de
  // navigation (une seule fiche produit, quelle que soit la valeur choisie).
  const [varianteSelectionneeId, setVarianteSelectionneeId] = useState(variantes?.[0]?.id);
  const [derniereVarianteAjusteeId, setDerniereVarianteAjusteeId] = useState(variantes?.[0]?.id);

  const varianteActive = variantes?.find((v) => v.id === varianteSelectionneeId);

  // Regroupe les variantes par attribut (ex. "Puissance", "Résolution") pour afficher un sélecteur par
  // attribut — sans matrice combinée entre attributs (une seule variante active à la fois, celle du
  // dernier chip cliqué, quel que soit son attribut). Aucun produit de cette démo n'a besoin de plus d'un
  // attribut simultané ; rester simple plutôt que construire une combinatoire non demandée.
  const groupesParAttribut = useMemo(() => {
    if (!variantes) return [];
    const ordre: string[] = [];
    const groupes = new Map<string, VarianteProduit[]>();
    for (const v of variantes) {
      if (!groupes.has(v.attribut)) {
        groupes.set(v.attribut, []);
        ordre.push(v.attribut);
      }
      groupes.get(v.attribut)!.push(v);
    }
    return ordre.map((attribut) => ({ attribut, valeurs: groupes.get(attribut)! }));
  }, [variantes]);

  const niveauStockActif: NiveauAlerteStock = varianteActive
    ? varianteActive.stock !== undefined && varianteActive.stock <= 0
      ? "rupture"
      : "en_stock"
    : niveauStock;
  // undefined = stock non suivi pour cette variante (point #29) — pas de plafond réel, valeur haute
  // uniquement pour borner le sélecteur de quantité de l'interface.
  const stockActuelActif = varianteActive ? (varianteActive.stock ?? 99) : stockActuel;

  const rupture = niveauStockActif === "rupture";
  const quantiteMax = rupture ? 0 : stockActuelActif;

  const palierActif = estB2B && paliers.length > 0 && !varianteActive ? trouverPalierApplicable(paliers, quantite) : undefined;
  // Prix de variante fixe (point #29) — pas de barème B2B distinct par variante, pour rester simple.
  const prixUnitaire = varianteActive ? varianteActive.prix : palierActif ? palierActif.prix_unitaire : produit.prix_public;
  const prixTotal = prixUnitaire * quantite;

  function ajusterQuantite(delta: number) {
    setQuantite((q) => Math.min(Math.max(1, q + delta), Math.max(1, quantiteMax)));
  }

  function gererAjoutPanier() {
    if (rupture) return;
    executerSiConnecte(() => {
      ajouterLigne(construireIdLigne(produit.id, varianteActive?.id), quantite, prixUnitaire);
      setConfirmationVisible(true);
      setTimeout(() => setConfirmationVisible(false), 1500);
    }, "Connectez-vous pour ajouter ce produit à votre panier.");
  }

  function gererAjoutPackage() {
    ajouterAuPackage(produit.id);
    router.push("/packages/configurateur");
  }

  // Réinitialise la quantité au changement de variante — le stock max diffère par variante, une
  // quantité choisie sous l'ancienne valeur pourrait dépasser le stock de la nouvelle. Ajustement en
  // cours de rendu (pattern recommandé react.dev pour dériver un état d'un changement de prop/état sans
  // passer par un effet) plutôt qu'un useEffect, qui provoquerait un second rendu en cascade évitable.
  if (varianteSelectionneeId !== derniereVarianteAjusteeId) {
    setDerniereVarianteAjusteeId(varianteSelectionneeId);
    setQuantite(1);
  }

  const lignesBareme = useMemo(() => [...paliers].sort((a, b) => a.quantite_min - b.quantite_min), [paliers]);

  return (
    <div className="flex flex-col gap-5">
      {groupesParAttribut.map(({ attribut, valeurs }) => (
        <div key={attribut}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">{attribut}</p>
          <div className="flex flex-wrap gap-2">
            {valeurs.map((v) => {
              const actif = v.id === varianteSelectionneeId;
              const varianteRupture = v.stock !== undefined && v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={actif}
                  onClick={() => setVarianteSelectionneeId(v.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    actif
                      ? "border-primaire bg-primaire/5 text-primaire"
                      : varianteRupture
                        ? "border-bordure text-texte-secondaire opacity-50"
                        : "border-bordure text-texte-principal hover:border-primaire hover:text-primaire"
                  }`}
                >
                  {v.valeur}
                  {varianteRupture && !actif && " — rupture"}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {varianteActive?.description && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={varianteSelectionneeId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="-mt-2 text-sm text-texte-secondaire"
          >
            {varianteActive.description}
          </motion.p>
        </AnimatePresence>
      )}

      <div className="flex items-center gap-3">
        <p className="font-titres text-2xl font-bold text-primaire md:text-3xl">
          ${prixUnitaire.toFixed(2)}
          {estB2B && <span className="ml-1 text-sm font-normal text-texte-secondaire">/ unité</span>}
        </p>
        <StockBadge niveau={niveauStockActif} />
        <BoutonFavori produitId={produit.id} className="ml-auto border border-bordure" />
      </div>

      {estB2B && !varianteActive && lignesBareme.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-bordure">
          <table className="w-full min-w-[320px] text-sm">
            <caption className="sr-only">Barème de prix professionnel par palier de quantité</caption>
            <thead>
              <tr className="bg-fond text-left text-texte-secondaire">
                <th scope="col" className="px-3 py-2 font-medium">
                  Plage de quantité
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Prix unitaire
                </th>
              </tr>
            </thead>
            <tbody>
              {lignesBareme.map((p) => {
                const actif = palierActif?.id === p.id;
                return (
                  <tr
                    key={p.id}
                    className={`border-t border-bordure transition-colors ${actif ? "bg-primaire/5 font-semibold text-primaire" : "text-texte-principal"}`}
                  >
                    <td className="px-3 py-2">
                      {p.quantite_min}
                      {p.quantite_max ? `–${p.quantite_max}` : "+"}
                    </td>
                    <td className="px-3 py-2">${p.prix_unitaire.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-bordure">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            className="flex h-11 w-11 items-center justify-center text-texte-principal disabled:opacity-40"
            onClick={() => ajusterQuantite(-1)}
            disabled={rupture || quantite <= 1}
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-texte-principal">{quantite}</span>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            className="flex h-11 w-11 items-center justify-center text-texte-principal disabled:opacity-40"
            onClick={() => ajusterQuantite(1)}
            disabled={rupture || quantite >= quantiteMax}
          >
            <Plus size={16} />
          </button>
        </div>
        {estB2B && <p className="font-titres text-lg font-bold text-texte-principal">Total : ${prixTotal.toFixed(2)}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <motion.button
          type="button"
          onClick={gererAjoutPanier}
          disabled={rupture}
          whileTap={{ scale: 0.97 }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
          {confirmationVisible ? "Ajouté au panier" : rupture ? "Rupture de stock" : "Ajouter au panier"}
        </motion.button>

        {produit.eligible_package && (
          <button
            type="button"
            onClick={gererAjoutPackage}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primaire px-5 py-3 text-sm font-semibold text-primaire transition-colors hover:bg-primaire/5"
          >
            <Package size={18} />
            Ajouter au package personnalisé
          </button>
        )}
      </div>

      {messageToast && (
        <Toast message={messageToast} actionLabel="Se connecter" onAction={allerALaConnexion} onFermer={fermerToast} />
      )}
    </div>
  );
}
