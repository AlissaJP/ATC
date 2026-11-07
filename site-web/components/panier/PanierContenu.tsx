"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { VisuelProduit } from "@/components/product/VisuelProduit";
import { useCartStore, type LignePanier } from "@/lib/store/cart-store";
import { useSessionStore } from "@/lib/store/session-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useFactureStore } from "@/lib/store/facture-store";
import { produits } from "@/lib/mock-data/produits";
import { categories } from "@/lib/mock-data/categories";
import { quantiteDisponible } from "@/lib/mock-data/stock";
import { resoudreProduitEtVariante } from "@/lib/services/variantes";
import { calculerFacture } from "@/lib/business-rules/taxe";
import { Toast } from "@/components/ui/Toast";
import type { Categorie } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { nomCategorie, nomLigneLocalise } from "@/lib/i18n/catalogue";

// ECR-05-001 — Panier. RG-03-002 (quantité bornée au stock), RG-03-004/UC-05-001-E1 (recalcul du
// palier B2B applicable géré par cart-store), BF-05-002 (sous-totaux par catégorie).
// Point #29 — ligne.produit_id peut être un identifiant composite "produit::variante" (une seule fiche
// produit avec options de variantes) : résolu partout ici via resoudreProduitEtVariante, jamais par un
// simple produits.find(), pour ne pas faire disparaître silencieusement la ligne du panier.
function categorieRacine(produitId: string): Categorie | undefined {
  const resolu = resoudreProduitEtVariante(produitId, produits);
  if (!resolu) return undefined;
  const cat = categories.find((c) => c.id === resolu.produit.categorie_id);
  if (!cat) return undefined;
  return cat.parent_id ? (categories.find((c) => c.id === cat.parent_id) ?? cat) : cat;
}

export function PanierContenu() {
  const router = useRouter();
  const { t, langue } = useTranslation();
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
  // Taxe de 10 % (décision actée n°18) — même calcul que l'écran de paiement (EcranPaiement), pour que le
  // montant annoncé ici soit exactement celui réglé ensuite (audit A-01).
  const detailTaxe = calculerFacture(total);
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

  const toastSuppression = ligneSupprimee && (
    <Toast
      message={t("panier.produitRetire")}
      actionLabel={t("commun.annuler")}
      onAction={annulerSuppression}
      onFermer={() => setLigneSupprimee(null)}
    />
  );

  if (lignes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-20 text-center">
        <ShoppingCart size={28} className="text-texte-secondaire" />
        <p className="font-titres text-sm font-semibold text-texte-principal">{t("panier.vide")}</p>
        <Link href="/" className="text-sm font-medium text-primaire hover:underline">
          {t("panier.retourCatalogue")}
        </Link>
        {toastSuppression}
      </div>
    );
  }

  return (
    // minmax(0,1fr) : sans cette borne, la colonne s'élargit à la longueur du nom de produit (texte sur une
    // ligne) et la page déborde sur téléphone, repoussant la barre de paiement hors de l'écran (audit A-20).
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 pb-24 lg:grid-cols-[minmax(0,1fr)_320px] lg:pb-0">
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
                <span className="font-titres text-sm font-semibold text-texte-principal">{categorie.id === "autre" ? t("commun.autres") : nomCategorie(categorie, langue)}</span>
                <span className="flex items-center gap-2 text-sm text-texte-secondaire">
                  ${sousTotal.toFixed(2)}
                  <ChevronDown size={16} className={`transition-transform ${replie ? "-rotate-90" : ""}`} />
                </span>
              </button>

              {!replie && (
                <div className="flex flex-col divide-y divide-bordure border-t border-bordure">
                  {lignesCategorie.map((ligne) => {
                    const resolu = resoudreProduitEtVariante(ligne.produit_id, produits);
                    if (!resolu) return null;
                    const { produit, variante } = resolu;
                    const stockDisponible = variante
                      ? (variante.stock ?? Number.POSITIVE_INFINITY)
                      : (quantiteDisponible(ligne.produit_id) ?? Number.POSITIVE_INFINITY); // undefined = non suivi
                    return (
                      <div key={ligne.produit_id} className="flex items-center gap-3 p-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-fond">
                          <VisuelProduit produit={produit} sizes="64px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/produit/${produit.slug}`} className="block truncate text-sm font-medium text-texte-principal hover:underline">
                            {nomLigneLocalise(produit, variante, langue)}
                          </Link>
                          <p className="text-xs text-texte-secondaire">{t("commun.parUnite", { prix: `$${ligne.prix_unitaire_applique.toFixed(2)}` })}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={t("produit.diminuer")}
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
                              aria-label={t("produit.augmenter")}
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
                            aria-label={t("panier.retirer", { produit: nomLigneLocalise(produit, variante, langue) })}
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
          <p className="font-titres text-sm font-semibold text-texte-principal">{t("panier.recapitulatif")}</p>
          <p className="mt-1 text-sm text-texte-secondaire">{t("panier.articles", { nombre: nombreArticles })}</p>
          <div className="mt-3 flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-texte-secondaire">{t("commun.sousTotal")}</span>
              <span className="text-texte-principal">${detailTaxe.montant_ht.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texte-secondaire">{t("commun.taxe", { taux: (detailTaxe.taux_taxe * 100).toFixed(0) })}</span>
              <span className="text-texte-principal">${detailTaxe.montant_taxe.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-bordure pt-2">
            <span className="font-titres text-sm font-semibold text-texte-principal">{t("commun.total")}</span>
            <span className="font-titres text-2xl font-bold text-primaire">${detailTaxe.montant_ttc.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={procederAuPaiement}
            className="mt-4 hidden w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90 lg:flex"
          >
            {t("panier.payer")}
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
          {t("panier.payerMontant", { montant: `$${detailTaxe.montant_ttc.toFixed(2)}` })}
        </button>
      </div>

      {toastSuppression}
    </div>
  );
}
