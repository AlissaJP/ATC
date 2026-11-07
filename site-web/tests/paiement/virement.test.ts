import { beforeEach, describe, expect, it } from "vitest";
import { dernierPaiement, useFactureStore } from "@/lib/store/facture-store";
import { useCommandeStore } from "@/lib/store/commande-store";

// Virement bancaire : la commande n'est validée (en préparation) qu'après vérification manuelle de la preuve.
const PREUVE = { nom: "recu.jpg", donnees: "data:image/jpeg;base64,AAAA" };

function commandeDeTest() {
  return useCommandeStore
    .getState()
    .creerCommandeDepuisPanier("client-test", [{ produit_id: "ES-01", quantite: 1, prix_unitaire_applique: 151 }]);
}

function statutCommande(id: string) {
  return useCommandeStore.getState().commandes.find((c) => c.id === id)?.statut;
}

describe("paiement par virement bancaire", () => {
  beforeEach(() => {
    useFactureStore.setState({ paiements: [], facturesProForma: [] });
    useCommandeStore.setState({ commandes: [], lignesCommande: [] });
  });

  it("met la commande en attente tant que la preuve n'est pas vérifiée", () => {
    const commande = commandeDeTest();
    const paiement = useFactureStore
      .getState()
      .enregistrerPaiement({ commandeId: commande.id, methode: "virement", montantUsd: 166.1, virement: { compte: "usd", preuve: PREUVE } });

    expect(paiement.statut_transaction).toBe("en cours");
    expect(statutCommande(commande.id)).toBe("attente_paiement");
  });

  it("valide la commande quand l'administrateur confirme le virement", () => {
    const commande = commandeDeTest();
    const paiement = useFactureStore
      .getState()
      .enregistrerPaiement({ commandeId: commande.id, methode: "virement", montantUsd: 166.1, virement: { compte: "usd", preuve: PREUVE } });

    useFactureStore.getState().validerVirement(paiement.id, "Admin Général");

    const valide = useFactureStore.getState().paiements[0];
    expect(valide.statut_transaction).toBe("réussie");
    expect(valide.virement?.verifie_par).toBe("Admin Général");
    expect(statutCommande(commande.id)).toBe("en_preparation");
  });

  it("garde la commande en attente après un refus et permet de régler à nouveau", () => {
    const commande = commandeDeTest();
    const refuse = useFactureStore
      .getState()
      .enregistrerPaiement({ commandeId: commande.id, methode: "virement", montantUsd: 166.1, virement: { compte: "usd", preuve: PREUVE } });
    useFactureStore.getState().refuserVirement(refuse.id, "Admin Général", "Montant incomplet");

    expect(useFactureStore.getState().paiements[0].virement?.motif_refus).toBe("Montant incomplet");
    expect(statutCommande(commande.id)).toBe("attente_paiement");

    // Le client règle ensuite par carte : ce dernier paiement fait foi, la commande est validée.
    useFactureStore.getState().enregistrerPaiement({ commandeId: commande.id, methode: "carte", montantUsd: 166.1 });
    expect(dernierPaiement(useFactureStore.getState().paiements, { commandeId: commande.id })?.methode).toBe("carte");
    expect(statutCommande(commande.id)).toBe("en_preparation");
  });

  it("ne change pas le statut d'une commande réglée par un autre moyen", () => {
    const commande = commandeDeTest();
    useFactureStore.getState().enregistrerPaiement({ commandeId: commande.id, methode: "moncash", montantUsd: 166.1 });
    expect(statutCommande(commande.id)).toBe("en_preparation");
  });
});
