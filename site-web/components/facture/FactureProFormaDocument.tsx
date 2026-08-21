"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import { useDevisStore } from "@/lib/store/devis-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useSessionStore } from "@/lib/store/session-store";
import { produits } from "@/lib/mock-data/produits";
import { utilisateurs, trouverProfilEntrepriseParUtilisateur } from "@/lib/mock-data/utilisateurs";
import type { FactureProForma } from "@/lib/types/entities";

// ECR-06-002 — Facture pro forma. RG-06-002 : mentions obligatoires (identité ATC, identité client,
// détail produits/prix, conditions de paiement, devise USD, taxe 10 %).
// Rattachée à un devis (Phase 3) ou directement à une commande panier (Phase 4).
export function FactureProFormaDocument({ facture }: { facture: FactureProForma }) {
  const toutesLesLignesDevis = useDevisStore((s) => s.lignesDevis);
  const tousLesDevis = useDevisStore((s) => s.devis);
  const devis = useMemo(() => tousLesDevis.find((d) => d.id === facture.devis_id), [tousLesDevis, facture.devis_id]);

  const toutesLesLignesCommande = useCommandeStore((s) => s.lignesCommande);
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);
  const commande = useMemo(
    () => toutesLesCommandes.find((c) => c.id === facture.commande_id),
    [toutesLesCommandes, facture.commande_id]
  );

  const lignes = useMemo(() => {
    if (facture.devis_id) return toutesLesLignesDevis.filter((l) => l.devis_id === facture.devis_id);
    if (facture.commande_id) return toutesLesLignesCommande.filter((l) => l.commande_id === facture.commande_id);
    return [];
  }, [facture, toutesLesLignesDevis, toutesLesLignesCommande]);

  const session = useSessionStore((s) => s.session);
  const utilisateurId = devis?.utilisateur_id ?? commande?.utilisateur_id;
  const utilisateur = utilisateurId ? utilisateurs.find((u) => u.id === utilisateurId) : undefined;
  const profil = utilisateur ? trouverProfilEntrepriseParUtilisateur(utilisateur.id) : undefined;

  if (session?.type !== "admin" && (!session || session.type !== "client" || session.utilisateur_id !== utilisateurId)) {
    return <p className="text-center text-sm text-texte-secondaire">Facture introuvable.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-end print:hidden">
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
            <p className="text-sm text-texte-secondaire">Facture pro forma</p>
          </div>
          <div className="text-right">
            <p className="font-titres text-sm font-semibold text-texte-principal">{facture.numero_sequentiel}</p>
            <p className="text-xs text-texte-secondaire">
              {new Date(facture.date_generation).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Client</p>
            {profil ? (
              <>
                <p className="mt-1 text-sm font-medium text-texte-principal">{profil.nom_legal}</p>
                <p className="text-sm text-texte-secondaire">{profil.adresse_entreprise}</p>
                <p className="text-sm text-texte-secondaire">NIF : {profil.nif}</p>
              </>
            ) : (
              <p className="mt-1 text-sm font-medium text-texte-principal">{utilisateur?.nom}</p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              Conditions de paiement
            </p>
            <p className="mt-1 text-sm text-texte-secondaire">MonCash, carte Visa/Mastercard ou PayPal</p>
            <p className="text-sm text-texte-secondaire">Devise : USD</p>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-bordure text-left text-texte-secondaire">
              <th className="pb-2 font-medium">Produit</th>
              <th className="pb-2 text-right font-medium">Qté</th>
              <th className="pb-2 text-right font-medium">Prix unitaire</th>
              <th className="pb-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => {
              const produit = produits.find((p) => p.id === l.produit_id);
              return (
                <tr key={l.id} className="border-b border-bordure/60">
                  <td className="py-2 text-texte-principal">{produit?.nom ?? "Produit"}</td>
                  <td className="py-2 text-right text-texte-secondaire">{l.quantite}</td>
                  <td className="py-2 text-right text-texte-secondaire">${l.prix_unitaire_applique.toFixed(2)}</td>
                  <td className="py-2 text-right text-texte-principal">
                    ${(l.prix_unitaire_applique * l.quantite).toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {devis?.cout_installation ? (
              <tr className="border-b border-bordure/60">
                <td className="py-2 text-texte-principal" colSpan={3}>
                  Installation
                </td>
                <td className="py-2 text-right text-texte-principal">${devis.cout_installation.toFixed(2)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className="mt-4 ml-auto flex max-w-xs flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-texte-secondaire">Sous-total (HT)</span>
            <span className="text-texte-principal">${facture.montant_ht.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-texte-secondaire">Taxe ({(facture.taux_taxe * 100).toFixed(0)} %)</span>
            <span className="text-texte-principal">${facture.montant_taxe.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-bordure pt-1 font-titres text-base font-bold text-texte-principal">
            <span>Total (TTC)</span>
            <span>${facture.montant_ttc.toFixed(2)}</span>
          </div>
        </div>

        <p className="mt-8 border-t border-bordure pt-4 text-xs text-texte-secondaire">
          Document généré automatiquement {devis ? "à l'acceptation du devis" : "à la commande"} — sans valeur
          fiscale définitive. Retrait en magasin uniquement, aucun service de livraison.
        </p>
      </div>
    </div>
  );
}
