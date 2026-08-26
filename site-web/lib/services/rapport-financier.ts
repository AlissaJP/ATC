// Raffinement Design (point #28) — calcul du rapport financier mensuel, en fonction pure : toutes les
// données (commandes, lignes, paiements, utilisateurs, catalogue) sont reçues en paramètre, aucun accès
// direct aux stores/mock-data ici. Ce découplage permet de remplacer les tableaux mock par de vraies
// requêtes PostgreSQL (agrégations SQL sur les tables commandes/paiements/utilisateurs) lors de
// l'intégration d'une base réelle, sans réécrire ni ce calcul ni la génération du document
// (components/admin/RapportFinancierMensuel.tsx, qui reste un document imprimable — window.print(), même
// convention que components/facture/FactureProFormaDocument.tsx et components/commande/
// RecuCommandeDocument.tsx : pas de dépendance PDF ajoutée dans cette démo, décision actée n°41).
import { calculerVentesParCategorie } from "@/lib/business-rules/ventes-categorie";
import { calculerFacture } from "@/lib/business-rules/taxe";
import type { Categorie, Commande, LigneCommande, MethodePaiement, Paiement, Produit, Utilisateur } from "@/lib/types/entities";

export interface RepartitionMoyenPaiement {
  methode: MethodePaiement;
  montant: number;
  nombre: number;
}

export interface RapportFinancierMensuel {
  mois: number; // 1-12
  annee: number;
  chiffreAffairesHT: number;
  montantTaxeCollectee: number;
  chiffreAffairesTTC: number;
  chiffreAffairesParCategorie: { nom: string; montant: number }[];
  nombreCommandes: number;
  nombreCommandesB2B: number;
  nombreCommandesB2C: number;
  repartitionParMoyenPaiement: RepartitionMoyenPaiement[];
}

function estDansLeMois(dateIso: string, mois: number, annee: number): boolean {
  const d = new Date(dateIso);
  return d.getMonth() + 1 === mois && d.getFullYear() === annee;
}

export function genererRapportMensuel(
  mois: number,
  annee: number,
  commandes: Commande[],
  lignesCommande: LigneCommande[],
  paiements: Paiement[],
  utilisateurs: Utilisateur[],
  produits: Produit[],
  categories: Categorie[]
): RapportFinancierMensuel {
  const commandesDuMois = commandes.filter((c) => estDansLeMois(c.date_creation, mois, annee));
  const idsCommandesDuMois = new Set(commandesDuMois.map((c) => c.id));

  const chiffreAffairesHT = commandesDuMois.reduce((s, c) => s + c.montant_total, 0);
  const detailTaxe = calculerFacture(chiffreAffairesHT);

  const lignesDuMois = lignesCommande.filter((l) => idsCommandesDuMois.has(l.commande_id));
  const chiffreAffairesParCategorie = calculerVentesParCategorie(lignesDuMois, produits, categories);

  const nombreCommandesB2B = commandesDuMois.filter(
    (c) => utilisateurs.find((u) => u.id === c.utilisateur_id)?.type_compte === "entreprise"
  ).length;

  const paiementsDuMois = paiements.filter(
    (p) => p.commande_id && idsCommandesDuMois.has(p.commande_id) && p.statut_transaction === "réussie"
  );
  const repartitionParMoyenPaiement: RepartitionMoyenPaiement[] = (["moncash", "carte", "paypal"] as MethodePaiement[]).map(
    (methode) => {
      const correspondants = paiementsDuMois.filter((p) => p.methode === methode);
      return {
        methode,
        montant: correspondants.reduce((s, p) => s + p.montant_usd, 0),
        nombre: correspondants.length,
      };
    }
  );

  return {
    mois,
    annee,
    chiffreAffairesHT: detailTaxe.montant_ht,
    montantTaxeCollectee: detailTaxe.montant_taxe,
    chiffreAffairesTTC: detailTaxe.montant_ttc,
    chiffreAffairesParCategorie,
    nombreCommandes: commandesDuMois.length,
    nombreCommandesB2B,
    nombreCommandesB2C: commandesDuMois.length - nombreCommandesB2B,
    repartitionParMoyenPaiement,
  };
}
