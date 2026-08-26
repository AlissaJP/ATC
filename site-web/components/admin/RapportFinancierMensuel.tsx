"use client";

// Raffinement Design (point #28) — rapport financier mensuel, téléchargeable. Même convention que
// FactureProFormaDocument.tsx / RecuCommandeDocument.tsx / GraphiqueVentes.tsx : window.print() sur un
// document mis en forme pour l'impression (« Enregistrer au format PDF » du navigateur) — aucune
// dépendance PDF ajoutée (décision actée n°41, sandbox sans backend réel). Le calcul lui-même est isolé
// dans lib/services/rapport-financier.ts (fonction pure), ce composant ne fait qu'appeler et afficher.
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useFactureStore } from "@/lib/store/facture-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { produits } from "@/lib/mock-data/produits";
import { categories } from "@/lib/mock-data/categories";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import { genererRapportMensuel } from "@/lib/services/rapport-financier";
import type { MethodePaiement } from "@/lib/types/entities";

const LIBELLES_MOYEN_PAIEMENT: Record<MethodePaiement, string> = {
  moncash: "MonCash",
  carte: "Carte Visa/Mastercard",
  paypal: "PayPal",
};

const NOMS_MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function moisAnneeCourants(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function RapportFinancierMensuel() {
  const [moisAnnee, setMoisAnnee] = useState(moisAnneeCourants);

  const commandes = useCommandeStore((s) => s.commandes);
  const lignesCommande = useCommandeStore((s) => s.lignesCommande);
  const paiements = useFactureStore((s) => s.paiements);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);

  const [anneeStr, moisStr] = moisAnnee.split("-");
  const annee = Number(anneeStr);
  const mois = Number(moisStr);

  const rapport = useMemo(
    () =>
      genererRapportMensuel(
        mois,
        annee,
        commandes,
        lignesCommande,
        paiements,
        [...utilisateursSeed, ...utilisateursDynamiques],
        produits,
        categories
      ),
    [mois, annee, commandes, lignesCommande, paiements, utilisateursDynamiques]
  );

  const dateGeneration = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const maxCategorie = Math.max(1, ...rapport.chiffreAffairesParCategorie.map((c) => c.montant));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <label className="text-sm">
          <span className="mr-2 text-texte-secondaire">Mois</span>
          <input
            type="month"
            value={moisAnnee}
            onChange={(e) => setMoisAnnee(e.target.value)}
            className="rounded-lg border border-bordure bg-background px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-primaire px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Download size={16} /> Télécharger (PDF)
        </button>
      </div>

      <div className="rounded-xl border border-bordure bg-background p-8 print:border-none print:p-0">
        <div className="flex items-start justify-between border-b border-bordure pb-6">
          <div>
            <p className="font-titres text-lg font-bold text-primaire">ATC — Alpha Tech Center</p>
            <p className="text-sm text-texte-secondaire">Rapport financier mensuel</p>
          </div>
          <div className="text-right">
            <p className="font-titres text-sm font-semibold text-texte-principal">
              {NOMS_MOIS[rapport.mois - 1]} {rapport.annee}
            </p>
            <p className="text-xs text-texte-secondaire">Généré le {dateGeneration}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              Chiffre d&apos;affaires (TTC)
            </p>
            <p className="mt-1 font-titres text-2xl font-bold text-primaire">${rapport.chiffreAffairesTTC.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              Taxe collectée (10 %)
            </p>
            <p className="mt-1 font-titres text-2xl font-bold text-texte-principal">
              ${rapport.montantTaxeCollectee.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Commandes</p>
            <p className="mt-1 font-titres text-2xl font-bold text-texte-principal">{rapport.nombreCommandes}</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 font-titres text-sm font-semibold text-texte-principal">Chiffre d&apos;affaires par catégorie</p>
          {rapport.chiffreAffairesParCategorie.every((c) => c.montant === 0) ? (
            <p className="text-sm text-texte-secondaire">Aucune vente enregistrée sur cette période.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {rapport.chiffreAffairesParCategorie.map((c) => (
                <div key={c.nom}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-texte-principal">{c.nom}</span>
                    <span className="font-medium text-texte-principal">${c.montant.toFixed(2)}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-fond">
                    <div
                      className="h-2.5 rounded-full bg-primaire"
                      style={{ width: `${(c.montant / maxCategorie) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 font-titres text-sm font-semibold text-texte-principal">Répartition B2B / B2C</p>
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-texte-secondaire">Commandes B2C (particuliers)</span>
                <span className="font-medium text-texte-principal">{rapport.nombreCommandesB2C}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-texte-secondaire">Commandes B2B (entreprises)</span>
                <span className="font-medium text-texte-principal">{rapport.nombreCommandesB2B}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 font-titres text-sm font-semibold text-texte-principal">Par moyen de paiement</p>
            <div className="flex flex-col gap-1.5 text-sm">
              {rapport.repartitionParMoyenPaiement.map((r) => (
                <div key={r.methode} className="flex justify-between">
                  <span className="text-texte-secondaire">
                    {LIBELLES_MOYEN_PAIEMENT[r.methode]} ({r.nombre})
                  </span>
                  <span className="font-medium text-texte-principal">${r.montant.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-bordure pt-4 text-xs text-texte-secondaire">
          Document généré automatiquement à partir des commandes enregistrées durant cette session de
          démonstration — sans valeur fiscale définitive.
        </p>
      </div>
    </div>
  );
}
