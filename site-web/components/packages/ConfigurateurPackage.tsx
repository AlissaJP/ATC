"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Send } from "lucide-react";
import { produits } from "@/lib/mock-data/produits";
import { categories } from "@/lib/mock-data/categories";
import { trouverStockParProduit } from "@/lib/mock-data/stock";
import { paliersParProduit } from "@/lib/mock-data/paliers-prix-b2b";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";
import {
  categorieComposantDepuisCategorieProduit,
  configurationEstValidable,
  type ComposantConfigurateur,
} from "@/lib/business-rules/configurateur-coherence";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { useDevisStore } from "@/lib/store/devis-store";
import { usePackageDraftStore } from "@/lib/store/package-draft-store";

const CATEGORIES_CONFIGURATEUR = [
  { id: "cat-panneaux", titre: "Panneaux solaires" },
  { id: "cat-batteries", titre: "Batteries" },
  { id: "cat-regulateurs", titre: "Régulateurs & onduleurs" },
  { id: "cat-accessoires-solaires", titre: "Accessoires" },
] as const;

function prixUnitairePourSession(produitId: string, quantite: number, estB2B: boolean): number {
  const produit = produits.find((p) => p.id === produitId);
  if (!produit) return 0;
  if (estB2B) {
    const palier = trouverPalierApplicable(paliersParProduit(produitId), quantite);
    if (palier) return palier.prix_unitaire;
  }
  return produit.prix_public;
}

// ECR-04-002 — Configurateur de package personnalisé. RG-04-002, RG-04-006, RG-03-004.
export function ConfigurateurPackage() {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const estB2B = estClientB2BVerifie(session);
  const creerDevis = useDevisStore((s) => s.creerDevis);
  const viderPackageDraft = usePackageDraftStore((s) => s.vider);

  // Reprend le produit ajouté depuis une fiche produit ("Ajouter au package personnalisé" — BF-03-004),
  // via un initialiseur paresseux (lu une seule fois au montage) plutôt qu'un effet, pour éviter un
  // setState synchrone dans un effet (react-hooks/set-state-in-effect).
  const [selection, setSelection] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const id of usePackageDraftStore.getState().produitsIds) initial[id] = 1;
    return initial;
  });
  const [envoye, setEnvoye] = useState(false);

  function modifierQuantite(produitId: string, delta: number) {
    setSelection((prev) => {
      const quantiteMax = trouverStockParProduit(produitId)?.stock_actuel ?? 0;
      const actuelle = prev[produitId] ?? 0;
      const suivante = Math.min(Math.max(0, actuelle + delta), quantiteMax);
      const copie = { ...prev };
      if (suivante === 0) delete copie[produitId];
      else copie[produitId] = suivante;
      return copie;
    });
  }

  const composants: ComposantConfigurateur[] = useMemo(
    () =>
      Object.entries(selection).map(([produitId, quantite]) => {
        const produit = produits.find((p) => p.id === produitId);
        return {
          produit_id: produitId,
          quantite,
          categorie_composant: categorieComposantDepuisCategorieProduit(produit?.categorie_id ?? "") ?? "accessoire",
        };
      }),
    [selection]
  );

  const validable = configurationEstValidable(composants);
  const nombreElements = Object.values(selection).reduce((n, q) => n + q, 0);
  const prixTotal = Object.entries(selection).reduce(
    (total, [produitId, quantite]) => total + prixUnitairePourSession(produitId, quantite, estB2B) * quantite,
    0
  );

  function envoyerDemande() {
    if (!session || session.type !== "client" || !validable) return;
    creerDevis(
      session.utilisateur_id,
      "configurateur_personnalise",
      Object.entries(selection).map(([produit_id, quantite]) => ({ produit_id, quantite }))
    );
    viderPackageDraft();
    setEnvoye(true);
    setTimeout(() => router.push("/devis"), 1200);
  }

  if (!session || session.type !== "client") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-bordure bg-background p-8 text-center">
        <p className="font-titres text-lg font-semibold text-texte-principal">Connexion requise</p>
        <p className="mt-2 text-sm text-texte-secondaire">
          Le configurateur de package personnalisé est réservé aux clients connectés (Particulier ou
          Entreprise).
        </p>
        <Link
          href="/compte/connexion"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-10">
        {CATEGORIES_CONFIGURATEUR.map((cat) => {
          const categorie = categories.find((c) => c.id === cat.id);
          const produitsCategorie = produits.filter((p) => p.categorie_id === cat.id);
          return (
            <section key={cat.id}>
              <h2 className="mb-4 font-titres text-lg font-semibold text-texte-principal">
                {categorie?.nom ?? cat.titre}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {produitsCategorie.map((produit) => {
                  const s = trouverStockParProduit(produit.id);
                  const rupture = !s || s.stock_actuel <= 0;
                  const quantite = selection[produit.id] ?? 0;
                  return (
                    <div
                      key={produit.id}
                      className={`flex flex-col overflow-hidden rounded-xl border ${
                        quantite > 0 ? "border-primaire ring-1 ring-primaire" : "border-bordure"
                      } bg-background ${rupture ? "opacity-50" : ""}`}
                    >
                      <div className="relative aspect-square w-full bg-fond">
                        {produit.images[0] && (
                          <Image src={produit.images[0]} alt={produit.nom} fill className="object-cover" sizes="200px" />
                        )}
                        {rupture && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-danger px-2 py-0.5 text-[10px] font-semibold text-white">
                            Rupture
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                        <p className="text-xs font-medium leading-snug text-texte-principal">{produit.nom}</p>
                        <p className="text-xs text-texte-secondaire">${produit.prix_public.toFixed(2)}</p>
                        <div className="mt-auto flex items-center justify-between pt-1">
                          <button
                            type="button"
                            disabled={rupture || quantite === 0}
                            aria-label={`Retirer ${produit.nom}`}
                            onClick={() => modifierQuantite(produit.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-bordure text-texte-principal disabled:opacity-30"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold text-texte-principal">{quantite}</span>
                          <button
                            type="button"
                            disabled={rupture || quantite >= (s?.stock_actuel ?? 0)}
                            aria-label={`Ajouter ${produit.nom}`}
                            onClick={() => modifierQuantite(produit.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-bordure text-texte-principal disabled:opacity-30"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Récapitulatif fixe (sticky) — Cahier 7, ECR-04-002 */}
      <aside className="h-fit lg:sticky lg:top-20">
        <div className="rounded-xl border border-bordure bg-background p-5">
          <p className="font-titres text-sm font-semibold text-texte-principal">Récapitulatif</p>
          <p className="mt-1 text-sm text-texte-secondaire">{nombreElements} élément(s) sélectionné(s)</p>
          <p className="mt-3 font-titres text-2xl font-bold text-primaire">${prixTotal.toFixed(2)}</p>
          <p className="mt-1 text-xs text-texte-secondaire">Estimation indicative, hors coût d&apos;installation.</p>

          {!validable && nombreElements > 0 && (
            <p className="mt-3 rounded-lg bg-avertissement/10 px-3 py-2 text-xs text-avertissement">
              Au moins un panneau solaire et une batterie sont requis pour envoyer la demande.
            </p>
          )}

          <button
            type="button"
            onClick={envoyerDemande}
            disabled={!validable || envoye}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
            {envoye ? "Demande envoyée !" : "Envoyer ma demande de devis"}
          </button>
        </div>
      </aside>
    </div>
  );
}
