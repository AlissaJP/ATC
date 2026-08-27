// Raffinement Design — vue d'ensemble du stock (back-office), 3 paniers par niveau d'alerte. Composant
// de présentation pur (aucun state/interactivité) : le calcul vit dans lib/services/suivi-stock.ts.
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { Categorie, Produit, Stock } from "@/lib/types/entities";
import { construireSuiviStock, type LigneSuiviStock, type PanierStock } from "@/lib/services/suivi-stock";

const PANIERS: {
  valeur: PanierStock;
  titre: string;
  icone: typeof CheckCircle2;
  classeEnTete: string;
  classeIcone: string;
}[] = [
  { valeur: "vert", titre: "En stock", icone: CheckCircle2, classeEnTete: "bg-succes/10", classeIcone: "text-succes" },
  {
    valeur: "jaune",
    titre: "Stock faible",
    icone: AlertTriangle,
    classeEnTete: "bg-avertissement/10",
    classeIcone: "text-avertissement",
  },
  {
    valeur: "rouge",
    titre: "Stock critique / Rupture",
    icone: XCircle,
    classeEnTete: "bg-danger/10",
    classeIcone: "text-danger",
  },
];

export function SuiviStock({ produits, stock, categories }: { produits: Produit[]; stock: Stock[]; categories: Categorie[] }) {
  const lignes = construireSuiviStock(produits, stock, categories);

  return (
    <div className="flex flex-col gap-6">
      {PANIERS.map(({ valeur, titre, icone: Icone, classeEnTete, classeIcone }) => {
        const lignesPanier = lignes.filter((l) => l.panier === valeur);
        return (
          <div key={valeur} className="overflow-hidden rounded-xl border border-bordure bg-background">
            <div className={`flex items-center gap-2.5 px-5 py-3 ${classeEnTete}`}>
              <Icone size={18} className={classeIcone} />
              <p className="font-titres text-sm font-semibold text-texte-principal">{titre}</p>
              <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-texte-secondaire">
                {lignesPanier.length}
              </span>
            </div>

            {lignesPanier.length === 0 ? (
              <p className="px-5 py-4 text-sm text-texte-secondaire">Aucun produit dans ce panier.</p>
            ) : (
              <ul className="divide-y divide-bordure">
                {lignesPanier.map((l: LigneSuiviStock) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-texte-principal">{l.nom}</p>
                      <p className="text-xs text-texte-secondaire">{l.categorieNom}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-texte-principal">
                      {l.quantite === undefined ? "Non suivi" : l.quantite}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
