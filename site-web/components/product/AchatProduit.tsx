"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import type { NiveauAlerteStock, PalierPrixB2B, Produit } from "@/lib/types/entities";
import { StockBadge } from "./StockBadge";
import { BoutonFavori } from "./BoutonFavori";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { useCartStore } from "@/lib/store/cart-store";
import { usePackageDraftStore } from "@/lib/store/package-draft-store";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";

interface AchatProduitProps {
  produit: Produit;
  niveauStock: NiveauAlerteStock;
  paliers: PalierPrixB2B[];
  stockActuel: number;
}

// ECR-03-001 — Prix + barème B2B (RG-03-001, RG-03-004), sélection de quantité en temps réel,
// boutons « Ajouter au panier » / « Ajouter au package personnalisé » visuellement distincts (Cahier 7 §3).
export function AchatProduit({ produit, niveauStock, paliers, stockActuel }: AchatProduitProps) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const estB2B = estClientB2BVerifie(session);
  const ajouterLigne = useCartStore((s) => s.ajouterLigne);
  const ajouterAuPackage = usePackageDraftStore((s) => s.ajouterProduit);

  const [quantite, setQuantite] = useState(1);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const rupture = niveauStock === "rupture";
  const quantiteMax = rupture ? 0 : stockActuel;

  const palierActif = estB2B && paliers.length > 0 ? trouverPalierApplicable(paliers, quantite) : undefined;
  const prixUnitaire = palierActif ? palierActif.prix_unitaire : produit.prix_public;
  const prixTotal = prixUnitaire * quantite;

  function ajusterQuantite(delta: number) {
    setQuantite((q) => Math.min(Math.max(1, q + delta), Math.max(1, quantiteMax)));
  }

  function gererAjoutPanier() {
    if (rupture) return;
    ajouterLigne(produit.id, quantite);
    setConfirmationVisible(true);
    setTimeout(() => setConfirmationVisible(false), 1500);
  }

  function gererAjoutPackage() {
    ajouterAuPackage(produit.id);
    router.push("/packages/configurateur");
  }

  const lignesBareme = useMemo(() => [...paliers].sort((a, b) => a.quantite_min - b.quantite_min), [paliers]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <p className="font-titres text-2xl font-bold text-primaire md:text-3xl">
          ${prixUnitaire.toFixed(2)}
          {estB2B && <span className="ml-1 text-sm font-normal text-texte-secondaire">/ unité</span>}
        </p>
        <StockBadge niveau={niveauStock} />
        <BoutonFavori produitId={produit.id} className="ml-auto border border-bordure" />
      </div>

      {estB2B && lignesBareme.length > 0 && (
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
        <button
          type="button"
          onClick={gererAjoutPanier}
          disabled={rupture}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {confirmationVisible ? <Check size={18} /> : <ShoppingCart size={18} />}
          {confirmationVisible ? "Ajouté au panier" : rupture ? "Rupture de stock" : "Ajouter au panier"}
        </button>

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
    </div>
  );
}
