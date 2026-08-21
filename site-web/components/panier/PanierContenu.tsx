"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore, type LignePanier } from "@/lib/store/cart-store";
import { useSessionStore } from "@/lib/store/session-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useFactureStore } from "@/lib/store/facture-store";
import { produits } from "@/lib/mock-data/produits";
import { categories } from "@/lib/mock-data/categories";
import { trouverStockParProduit } from "@/lib/mock-data/stock";
import { Toast } from "@/components/ui/Toast";
import type { Categorie } from "@/lib/types/entities";

// ECR-05-001 — Panier. RG-03-002 (quantité bornée au stock), RG-03-004/UC-05-001-E1 (recalcul du
// palier B2B applicable géré par cart-store), BF-05-002 (sous-totaux par catégorie).
function categorieRacine(produitId: string): Categorie | undefined {
  const produit = produits.find((p) => p.id === produitId);
  if (!produit) return undefined;
  const cat = categories.find((c) => c.id === produit.categorie_id);
  if (!cat) return undefined;
  return cat.parent_id ? (categories.find((c) => c.id === cat.parent_id) ?? cat) : cat;
}

export function PanierContenu() {
  const router = useRouter();
  const lignes = useCartStore((s) => s.lignes);
  const retirerLigne = useCartStore((s) => s.retirerLigne);
  const modifierQuantite = useCartStore((s) => s.modifierQuantite);
  const ajouterLigne = useCartStore((s) => s.ajouterLigne);
  const viderPanier = useCartStore((s) => s.vider);
  const session = useSessionStore((s) => s.session);
  const creerCommandeDepuisPanier = useCommandeStore((s) => s.creerCommandeDepuisPanier);
  const genererFactureProForma = useFactureStore((s) => s.genererFactureProForma);

  const [ligneSupprimee, setLigneSupprimee] = useState<LignePanier | null>(null);
  const [categoriesRepliees, setCategoriesRepliees] = useState<Set<string>>(new Set());

  const groupes = useMemo(() => {
    const map = new Map<string, { categorie: Categorie; lignes: LignePanier[] }>();
    for (const ligne of lignes) {
      const categorie = categorieRacine(ligne.produit_id);
      const cle = categorie?.id ?? "autre";
      if (!map.has(cle)) map.set(cle, { categorie: categorie ?? { id: "autre", slug: "autre", nom: "Autres" }, lignes: [] });
      map.get(cle)!.lignes.push(ligne);
    }
    return Array.from(map.values());
  }, [lignes]);

  const total = lignes.reduce((s, l) => s + l.prix_unitaire_applique * l.quantite, 0);
  const nombreArticles = lignes.reduce((s, l) => s + l.quantite, 0);

  function basculerCategorie(id: string) {
    setCategoriesRepliees((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(id)) suivant.delete(id);
      else suivant.add(id);
      return suivant;
    });
  }

  function supprimerAvecAnnulation(ligne: LignePanier) {
    retirerLigne(ligne.produit_id);
    setLigneSupprimee(ligne);
  }

  function annulerSuppression() {
    if (!ligneSupprimee) return;
    ajouterLigne(ligneSupprimee.produit_id, ligneSupprimee.quantite, ligneSupprimee.prix_unitaire_applique);
  }

  function procederAuPaiement() {
    if (!session || session.type !== "client") {
      router.push("/compte/connexion");
      return;
    }
    const commande = creerCommandeDepuisPanier(session.utilisateur_id, lignes);
    if (session.type_compte === "entreprise") {
      // Cahier 9 : COMMANDE ⟶ FACTURE_PRO_FORMA « si Entreprise », indépendamment d'un devis.
      genererFactureProForma({ commandeId: commande.id }, commande.montant_total);
    }
    viderPanier();
    router.push(`/paiement/commande/${commande.id}`);
  }

  if (lignes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-20 text-center">
        <ShoppingCart size={28} className="text-texte-secondaire" />
        <p className="font-titres text-sm font-semibold text-texte-principal">Votre panier est vide</p>
        <Link href="/" className="text-sm font-medium text-primaire hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-[1fr_320px] lg:pb-0">
      <div className="flex flex-col gap-6">
        {groupes.map(({ categorie, lignes: lignesCategorie }) => {
          const replie = categoriesRepliees.has(categorie.id);
          const sousTotal = lignesCategorie.reduce((s, l) => s + l.prix_unitaire_applique * l.quantite, 0);
          return (
            <div key={categorie.id} className="rounded-xl border border-bordure bg-background">
              <button
                type="button"
                onClick={() => basculerCategorie(categorie.id)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <span className="font-titres text-sm font-semibold text-texte-principal">{categorie.nom}</span>
                <span className="flex items-center gap-2 text-sm text-texte-secondaire">
                  ${sousTotal.toFixed(2)}
                  <ChevronDown size={16} className={`transition-transform ${replie ? "-rotate-90" : ""}`} />
                </span>
              </button>

              {!replie && (
                <div className="flex flex-col divide-y divide-bordure border-t border-bordure">
                  {lignesCategorie.map((ligne) => {
                    const produit = produits.find((p) => p.id === ligne.produit_id);
                    const stockDisponible = trouverStockParProduit(ligne.produit_id)?.stock_actuel ?? 0;
                    if (!produit) return null;
                    return (
                      <div key={ligne.produit_id} className="flex items-center gap-3 p-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-fond">
                          {produit.images[0] && (
                            <Image src={produit.images[0]} alt={produit.nom} fill className="object-cover" sizes="64px" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/produit/${produit.slug}`} className="truncate text-sm font-medium text-texte-principal hover:underline">
                            {produit.nom}
                          </Link>
                          <p className="text-xs text-texte-secondaire">${ligne.prix_unitaire_applique.toFixed(2)} / unité</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              aria-label="Diminuer la quantité"
                              onClick={() => modifierQuantite(ligne.produit_id, ligne.quantite - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-bordure text-texte-principal"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-texte-principal">
                              {ligne.quantite}
                            </span>
                            <button
                              type="button"
                              aria-label="Augmenter la quantité"
                              disabled={ligne.quantite >= stockDisponible}
                              onClick={() => modifierQuantite(ligne.produit_id, ligne.quantite + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-bordure text-texte-principal disabled:opacity-30"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-sm font-semibold text-texte-principal">
                            ${(ligne.prix_unitaire_applique * ligne.quantite).toFixed(2)}
                          </p>
                          <button
                            type="button"
                            aria-label={`Retirer ${produit.nom}`}
                            onClick={() => supprimerAvecAnnulation(ligne)}
                            className="text-texte-secondaire hover:text-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <aside className="h-fit lg:sticky lg:top-20">
        <div className="rounded-xl border border-bordure bg-background p-5">
          <p className="font-titres text-sm font-semibold text-texte-principal">Récapitulatif</p>
          <p className="mt-1 text-sm text-texte-secondaire">{nombreArticles} article(s)</p>
          <p className="mt-3 font-titres text-2xl font-bold text-primaire">${total.toFixed(2)}</p>
          <button
            type="button"
            onClick={procederAuPaiement}
            className="mt-4 hidden w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90 lg:flex"
          >
            Procéder au paiement
          </button>
        </div>
      </aside>

      {/* CTA fixe sur mobile — recommandation Cahier 7 §6 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-bordure bg-background p-4 lg:hidden">
        <button
          type="button"
          onClick={procederAuPaiement}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Procéder au paiement — ${total.toFixed(2)}
        </button>
      </div>

      {ligneSupprimee && (
        <Toast
          message="Produit retiré du panier"
          actionLabel="Annuler"
          onAction={annulerSuppression}
          onFermer={() => setLigneSupprimee(null)}
        />
      )}
    </div>
  );
}
