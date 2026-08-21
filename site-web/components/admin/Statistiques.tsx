"use client";

// ECR-15-001 — Statistiques (back-office, Général uniquement — UC-15-001 acteur ADM-G). BF-15-001
// (ventes par catégorie), BF-15-002 (taux de conversion devis → commande). BF-15-003 (comportement
// client / parcours / abandons, Could have) est délibérément omis : aucune infrastructure de suivi de
// navigation n'existe dans cette démo statique, et l'inventer produirait des données fictives présentées
// comme des mesures réelles — signalé à l'utilisateur plutôt qu'improvisé.
// Graphique à barres simple, une seule teinte (recommandation Cahier 7 §7 : « graphiques simples,
// barres/lignes, pas de surcharge visuelle »), cohérent avec la méthode de la compétence dataviz interne
// (une seule série de magnitude ⇒ une seule teinte, jamais de palette catégorielle pour ce cas).
import { useMemo } from "react";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useDevisStore } from "@/lib/store/devis-store";
import { produits } from "@/lib/mock-data/produits";
import { categories } from "@/lib/mock-data/categories";
import type { Categorie } from "@/lib/types/entities";

function categorieRacine(categorieId: string): Categorie | undefined {
  const categorie = categories.find((c) => c.id === categorieId);
  if (!categorie) return undefined;
  if (!categorie.parent_id) return categorie;
  return categories.find((c) => c.id === categorie.parent_id) ?? categorie;
}

export function Statistiques() {
  const lignesCommande = useCommandeStore((s) => s.lignesCommande);
  const devis = useDevisStore((s) => s.devis);

  const ventesParCategorie = useMemo(() => {
    const totaux = new Map<string, number>();
    for (const ligne of lignesCommande) {
      const produit = produits.find((p) => p.id === ligne.produit_id);
      if (!produit) continue;
      const racine = categorieRacine(produit.categorie_id);
      if (!racine) continue;
      const montant = ligne.prix_unitaire_applique * ligne.quantite;
      totaux.set(racine.nom, (totaux.get(racine.nom) ?? 0) + montant);
    }
    return categories
      .filter((c) => !c.parent_id)
      .map((c) => ({ nom: c.nom, montant: totaux.get(c.nom) ?? 0 }))
      .sort((a, b) => b.montant - a.montant);
  }, [lignesCommande]);

  const maxVente = Math.max(1, ...ventesParCategorie.map((v) => v.montant));
  const totalVentes = ventesParCategorie.reduce((s, v) => s + v.montant, 0);

  const conversion = useMemo(() => {
    // Dénominateur = devis ayant reçu une réponse (donc ayant eu une chance de se convertir) ;
    // "en_attente" n'a pas encore été traité, exclu du calcul. Numérateur = devis convertis en commande.
    const repondus = devis.filter((d) => d.statut !== "en_attente");
    const convertis = devis.filter((d) => d.statut === "converti");
    const taux = repondus.length > 0 ? (convertis.length / repondus.length) * 100 : 0;
    return { taux, convertis: convertis.length, repondus: repondus.length };
  }, [devis]);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-bordure bg-background p-6">
        <p className="mb-1 font-titres text-base font-semibold text-texte-principal">Ventes par catégorie</p>
        <p className="mb-5 text-xs text-texte-secondaire">Total : ${totalVentes.toFixed(2)}</p>
        <div className="flex flex-col gap-4">
          {ventesParCategorie.map((v) => (
            <div key={v.nom}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-texte-principal">{v.nom}</span>
                <span className="font-medium text-texte-principal">${v.montant.toFixed(2)}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-fond">
                <div
                  className="h-3 rounded-full bg-primaire transition-all"
                  style={{ width: `${(v.montant / maxVente) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {totalVentes === 0 && (
          <p className="mt-4 text-xs text-texte-secondaire">
            Aucune vente enregistrée pendant cette session de démonstration.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-bordure bg-background p-6">
        <p className="mb-1 font-titres text-base font-semibold text-texte-principal">
          Taux de conversion devis → commande
        </p>
        <p className="mt-3 font-titres text-3xl font-bold text-primaire">{conversion.taux.toFixed(0)}%</p>
        <p className="mt-1 text-sm text-texte-secondaire">
          {conversion.convertis} devis converti(s) sur {conversion.repondus} devis répondu(s)
        </p>
      </div>

      <p className="text-xs text-texte-secondaire">
        Le suivi du comportement client (parcours, abandons — BF-15-003, priorité « Could have ») n&apos;est
        pas disponible : cette démo n&apos;intègre aucun outil de mesure d&apos;audience.
      </p>
    </div>
  );
}
