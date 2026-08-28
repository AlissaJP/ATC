"use client";

// Raffinement Design — vue d'ensemble du stock (back-office), 3 paniers par niveau d'alerte, éditable
// directement ici (le Catalogue ne gère plus le stock, cf. GestionCatalogue.tsx) : c'est désormais la
// seule section pour consulter ET modifier les quantités. Le calcul des paniers vit dans
// lib/services/suivi-stock.ts (fonction pure) ; l'édition appelle lib/actions/catalogue-admin.ts
// (definirStockAction pour un produit sans variantes, definirStockVarianteAction pour une variante,
// point #29) puis router.refresh() pour relire les tableaux mock-data côté serveur.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, CheckCircle2, Pencil, X, XCircle } from "lucide-react";
import type { Categorie, Produit, Stock } from "@/lib/types/entities";
import { construireSuiviStock, type LigneSuiviStock, type PanierStock } from "@/lib/services/suivi-stock";
import { definirStockAction, definirStockVarianteAction } from "@/lib/actions/catalogue-admin";

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

// RG-03-002 / décision actée n°28 — même défaut que la création d'un produit sans variante, utilisé
// quand un produit n'a encore aucune ligne dans le tableau `stock` (jamais édité jusqu'ici).
const REFERENCE_PAR_DEFAUT = 100;

export function SuiviStock({ produits, stock, categories }: { produits: Produit[]; stock: Stock[]; categories: Categorie[] }) {
  const router = useRouter();
  const lignes = construireSuiviStock(produits, stock, categories);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [valeur, setValeur] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function commencerEdition(ligne: LigneSuiviStock) {
    setEditionId(ligne.id);
    setValeur(ligne.quantite ?? 0);
    setErreur(null);
  }

  function annulerEdition() {
    setEditionId(null);
    setErreur(null);
  }

  async function enregistrer(ligne: LigneSuiviStock) {
    setEnCours(true);
    try {
      const resultat = ligne.varianteId
        ? await definirStockVarianteAction(ligne.produitId, ligne.varianteId, valeur)
        : await definirStockAction(
            ligne.produitId,
            valeur,
            stock.find((s) => s.produit_id === ligne.produitId)?.stock_reference ?? REFERENCE_PAR_DEFAUT
          );
      if (!resultat.succes) {
        setErreur(resultat.erreur ?? "Une erreur est survenue.");
        return;
      }
      setEditionId(null);
      router.refresh();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {PANIERS.map(({ valeur: panierValeur, titre, icone: Icone, classeEnTete, classeIcone }) => {
        const lignesPanier = lignes.filter((l) => l.panier === panierValeur);
        return (
          <div key={panierValeur} className="overflow-hidden rounded-xl border border-bordure bg-background">
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
                      {editionId === l.id && erreur && <p className="mt-1 text-xs font-medium text-danger">{erreur}</p>}
                    </div>

                    {editionId === l.id ? (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          autoFocus
                          value={valeur}
                          onChange={(e) => setValeur(Number(e.target.value))}
                          className="w-20 rounded-lg border border-bordure px-2 py-1 text-right text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
                        />
                        <button
                          type="button"
                          disabled={enCours}
                          onClick={() => enregistrer(l)}
                          aria-label="Enregistrer la quantité"
                          className="rounded-md p-1.5 text-succes hover:bg-succes/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={enCours}
                          onClick={annulerEdition}
                          aria-label="Annuler"
                          className="rounded-md p-1.5 text-texte-secondaire hover:bg-fond disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => commencerEdition(l)}
                        className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-texte-principal hover:bg-fond"
                      >
                        {l.quantite === undefined ? "Non suivi" : l.quantite}
                        <Pencil size={12} className="text-texte-secondaire" />
                      </button>
                    )}
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
