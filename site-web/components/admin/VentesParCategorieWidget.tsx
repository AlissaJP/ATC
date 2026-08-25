"use client";

// ECR-12-001 — Widget compact « Ventes par catégorie » du tableau de bord (remplace « Traffic Sources »
// de la référence ClarityUI) : même structure visuelle que Statistiques.tsx, avec les 4 vraies catégories ATC.
import { useMemo } from "react";
import { useCommandeStore } from "@/lib/store/commande-store";
import { produits } from "@/lib/mock-data/produits";
import { categories } from "@/lib/mock-data/categories";
import { calculerVentesParCategorie } from "@/lib/business-rules/ventes-categorie";

export function VentesParCategorieWidget() {
  const lignesCommande = useCommandeStore((s) => s.lignesCommande);
  const ventesParCategorie = useMemo(
    () => calculerVentesParCategorie(lignesCommande, produits, categories),
    [lignesCommande]
  );
  const maxVente = Math.max(1, ...ventesParCategorie.map((v) => v.montant));

  return (
    <div className="rounded-xl border border-bordure bg-background p-5">
      <p className="mb-4 font-titres text-base font-semibold text-texte-principal">Ventes par catégorie</p>
      <div className="flex flex-col gap-3">
        {ventesParCategorie.map((v) => (
          <div key={v.nom}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-texte-principal">{v.nom}</span>
              <span className="font-medium text-texte-principal">${v.montant.toFixed(2)}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-fond">
              <div
                className="h-2.5 rounded-full bg-primaire transition-all"
                style={{ width: `${(v.montant / maxVente) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
