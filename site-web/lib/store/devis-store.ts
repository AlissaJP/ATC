// EPIC-04 — Devis & Packages. Cycle de vie complet du devis (RG-04-001 à 006).
// État interactif de démonstration (pas de backend réel — décision actée n°41) : persisté en
// mémoire/localStorage côté client, au même titre que le panier (lib/store/cart-store.ts).
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Devis, LigneDevis, StatutDevis } from "@/lib/types/entities";
import { produits } from "@/lib/mock-data/produits";
import { paliersParProduit } from "@/lib/mock-data/paliers-prix-b2b";
import { utilisateurs, trouverProfilEntrepriseParUtilisateur } from "@/lib/mock-data/utilisateurs";
import { trouverPalierApplicable } from "@/lib/business-rules/bareme-b2b";
import { calculerDateExpiration, devisEstEncoreValide } from "@/lib/business-rules/devis-expiration";
import { useFactureStore } from "@/lib/store/facture-store";
import { useCommandeStore } from "@/lib/store/commande-store";

export interface LigneDevisDemandee {
  produit_id: string;
  quantite: number;
}

interface DevisState {
  devis: Devis[];
  lignesDevis: LigneDevis[];
  creerDevis: (
    utilisateurId: string,
    typeOrigine: Devis["type_origine"],
    lignes: LigneDevisDemandee[]
  ) => Devis;
  repondreDevis: (devisId: string, coutInstallation: number, administrateurId: string) => void;
  accepterDevis: (devisId: string) => boolean;
  refuserDevis: (devisId: string) => void;
  convertirEnCommande: (devisId: string) => boolean;
  devisParUtilisateur: (utilisateurId: string) => Devis[];
  lignesParDevis: (devisId: string) => LigneDevis[];
}

// Prix applicable au moment de la réponse (RG-04-003) : barème B2B si Entreprise vérifiée, sinon prix public.
// Exporté pour permettre à l'écran admin (ECR-04-004) d'afficher un calcul en lecture seule avant envoi.
export function prixApplicablePourUtilisateur(produitId: string, quantite: number, utilisateurId: string): number {
  const utilisateur = utilisateurs.find((u) => u.id === utilisateurId);
  const profil = utilisateur ? trouverProfilEntrepriseParUtilisateur(utilisateur.id) : undefined;
  const estB2BVerifie = utilisateur?.type_compte === "entreprise" && profil?.statut_validation === "valide";

  if (estB2BVerifie) {
    const palier = trouverPalierApplicable(paliersParProduit(produitId), quantite);
    if (palier) return palier.prix_unitaire;
  }
  const produit = produits.find((p) => p.id === produitId);
  return produit?.prix_public ?? 0;
}

let compteurId = 0;
function idUnique(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${Date.now()}-${compteurId}`;
}

export const useDevisStore = create<DevisState>()(
  persist(
    (set, get) => ({
      devis: seedDevis(),
      lignesDevis: seedLignesDevis(),

      creerDevis: (utilisateurId, typeOrigine, lignes) => {
        // RG-04-002 — Génération automatique de la demande, statut initial "En attente".
        const nouveauDevis: Devis = {
          id: idUnique("devis"),
          utilisateur_id: utilisateurId,
          type_origine: typeOrigine,
          statut: "en_attente",
          date_creation: new Date().toISOString(),
        };
        const nouvellesLignes: LigneDevis[] = lignes.map((l) => ({
          id: idUnique("ligne-devis"),
          devis_id: nouveauDevis.id,
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire_applique: 0, // figé seulement à la réponse (RG-04-003)
        }));
        set((state) => ({
          devis: [nouveauDevis, ...state.devis],
          lignesDevis: [...state.lignesDevis, ...nouvellesLignes],
        }));
        return nouveauDevis;
      },

      repondreDevis: (devisId, coutInstallation, administrateurId) => {
        const devis = get().devis.find((d) => d.id === devisId);
        if (!devis) return;

        const lignes = get().lignesDevis.filter((l) => l.devis_id === devisId);
        const lignesTarifees = lignes.map((l) => ({
          ...l,
          prix_unitaire_applique: prixApplicablePourUtilisateur(l.produit_id, l.quantite, devis.utilisateur_id),
        }));
        const prixComposants = lignesTarifees.reduce((s, l) => s + l.prix_unitaire_applique * l.quantite, 0);
        const dateReponse = new Date();

        set((state) => ({
          lignesDevis: state.lignesDevis.map(
            (l) => lignesTarifees.find((lt) => lt.id === l.id) ?? l
          ),
          devis: state.devis.map((d) =>
            d.id === devisId
              ? {
                  ...d,
                  statut: "repondu" as StatutDevis,
                  cout_installation: coutInstallation,
                  prix_total: prixComposants + coutInstallation,
                  date_reponse: dateReponse.toISOString(),
                  date_expiration_prevue: calculerDateExpiration(dateReponse).toISOString(),
                  administrateur_id: administrateurId,
                }
              : d
          ),
        }));
      },

      accepterDevis: (devisId) => {
        const devis = get().devis.find((d) => d.id === devisId);
        if (!devis || devis.statut !== "repondu" || !devis.date_reponse) return false;
        // RG-04-005 / décision actée n°32 — acceptation impossible strictement après J+3.
        if (!devisEstEncoreValide(new Date(devis.date_reponse), new Date())) return false;

        set((state) => ({
          devis: state.devis.map((d) => (d.id === devisId ? { ...d, statut: "accepte" as StatutDevis } : d)),
        }));

        // RG-06-002 — facture pro forma générée automatiquement à l'acceptation d'un devis Entreprise,
        // avant paiement (décision actée n°18).
        const utilisateur = utilisateurs.find((u) => u.id === devis.utilisateur_id);
        if (utilisateur?.type_compte === "entreprise" && devis.prix_total !== undefined) {
          // devis.prix_total (composants + installation) constitue le montant hors taxe de la facture ;
          // la taxe de 10 % (RG-06-002) est calculée séparément, uniquement au niveau de la facture.
          const { facturesProForma, genererFactureProForma } = useFactureStore.getState();
          const dejaGeneree = facturesProForma.some((f) => f.devis_id === devisId);
          if (!dejaGeneree) genererFactureProForma({ devisId }, devis.prix_total);
        }

        return true;
      },

      refuserDevis: (devisId) => {
        set((state) => ({
          devis: state.devis.map((d) => (d.id === devisId ? { ...d, statut: "refuse" as StatutDevis } : d)),
        }));
      },

      convertirEnCommande: (devisId) => {
        // RG-04-004 — la conversion en commande fige le prix (non modifiable a posteriori).
        // Le paiement (Phase 3) doit précéder la conversion.
        const devis = get().devis.find((d) => d.id === devisId);
        if (!devis || devis.statut !== "accepte" || devis.prix_total === undefined) return false;

        const paiement = useFactureStore.getState().paiements.find((p) => p.devis_id === devisId);
        if (!paiement) return false;

        const lignes = get().lignesDevis.filter((l) => l.devis_id === devisId);
        useCommandeStore
          .getState()
          .creerCommandeDepuisDevis(devis.utilisateur_id, devisId, devis.prix_total, lignes);

        set((state) => ({
          devis: state.devis.map((d) => (d.id === devisId ? { ...d, statut: "converti" as StatutDevis } : d)),
        }));
        return true;
      },

      // ⚠️ Ces deux getters filtrent à chaque appel : à n'utiliser que ponctuellement (ex. dans un
      // gestionnaire d'événement via useDevisStore.getState()), jamais comme sélecteur direct d'un hook
      // (useDevisStore((s) => s.xxx(id))) — le nouveau tableau retourné à chaque rendu provoquerait une
      // boucle infinie. Pour un usage réactif, sélectionner le tableau brut (s.devis / s.lignesDevis) et
      // filtrer localement avec useMemo (voir app/devis/page.tsx).
      devisParUtilisateur: (utilisateurId) => get().devis.filter((d) => d.utilisateur_id === utilisateurId),
      lignesParDevis: (devisId) => get().lignesDevis.filter((l) => l.devis_id === devisId),
    }),
    { name: "atc-devis" }
  )
);

// --- Jeu de données de démonstration : couvre les 6 statuts (RG-04-001) ---
// Note sur le cas limite (décision actée n°32) : comme ce store est persisté (localStorage), une date de
// réponse figée à "exactement J-3" ne resterait valide qu'à l'instant précis de la première initialisation.
// Le devis "limite-j3" est donc semé avec une marge de quelques heures pour rester démontrable pendant
// toute la session de démo, avant de basculer naturellement sur "Expiré" — comportement correct, pas un bug.
function seedDevis(): Devis[] {
  const maintenant = Date.now();
  const jours = (n: number) => new Date(maintenant - n * 24 * 60 * 60 * 1000).toISOString();
  const dateReponseValide = new Date(maintenant - 1 * 24 * 60 * 60 * 1000);
  const dateReponseLimite = new Date(maintenant - 2.9 * 24 * 60 * 60 * 1000);

  return [
    {
      id: "devis-seed-en-attente",
      utilisateur_id: "user-particulier-1",
      type_origine: "configurateur_personnalise",
      statut: "en_attente",
      date_creation: jours(0.5),
    },
    {
      // 10 × $225,40 (palier 10-49) + 1 × $520 (palier 1-9) + 1 × $165 (palier 1-9) + $250 installation.
      id: "devis-seed-repondu-valide",
      utilisateur_id: "user-entreprise-verifiee",
      type_origine: "configurateur_personnalise",
      statut: "repondu",
      prix_total: 3189,
      cout_installation: 250,
      date_creation: jours(2),
      date_reponse: dateReponseValide.toISOString(),
      date_expiration_prevue: calculerDateExpiration(dateReponseValide).toISOString(),
      administrateur_id: "admin-general",
    },
    {
      // Cas limite décision actée n°32 : proche de J+3, encore acceptable jusqu'à expiration stricte.
      id: "devis-seed-repondu-limite-j3",
      utilisateur_id: "user-entreprise-verifiee",
      type_origine: "configurateur_personnalise",
      statut: "repondu",
      prix_total: 945,
      cout_installation: 0,
      date_creation: jours(6),
      date_reponse: dateReponseLimite.toISOString(),
      date_expiration_prevue: calculerDateExpiration(dateReponseLimite).toISOString(),
      administrateur_id: "admin-general",
    },
    {
      // 1 × $189 + 1 × $410 + 1 × $165 (prix public — Particulier, aucun palier B2B).
      id: "devis-seed-accepte",
      utilisateur_id: "user-particulier-1",
      type_origine: "configurateur_personnalise",
      statut: "accepte",
      prix_total: 764,
      cout_installation: 0,
      date_creation: jours(10),
      date_reponse: jours(9),
      date_expiration_prevue: jours(6),
      administrateur_id: "admin-general",
    },
    {
      // 10 × $225,40 (palier 10-49) + 1 × $890 (palier 1-9) + $300 installation.
      id: "devis-seed-refuse",
      utilisateur_id: "user-entreprise-verifiee",
      type_origine: "configurateur_personnalise",
      statut: "refuse",
      prix_total: 3444,
      cout_installation: 300,
      date_creation: jours(15),
      date_reponse: jours(14),
      date_expiration_prevue: jours(11),
      administrateur_id: "admin-general",
    },
    {
      // 2 × $165 + 4 × $35 (prix public — Particulier).
      id: "devis-seed-expire",
      utilisateur_id: "user-particulier-1",
      type_origine: "configurateur_personnalise",
      statut: "expire",
      prix_total: 470,
      cout_installation: 0,
      date_creation: jours(20),
      date_reponse: jours(19),
      date_expiration_prevue: jours(16),
      administrateur_id: "admin-general",
    },
  ];
}

function seedLignesDevis(): LigneDevis[] {
  return [
    { id: "ligne-seed-1", devis_id: "devis-seed-en-attente", produit_id: "prod-panneau-405w", quantite: 2, prix_unitaire_applique: 0 },
    { id: "ligne-seed-2", devis_id: "devis-seed-en-attente", produit_id: "prod-batterie-lithium-100ah", quantite: 1, prix_unitaire_applique: 0 },

    { id: "ligne-seed-3", devis_id: "devis-seed-repondu-valide", produit_id: "prod-panneau-550w", quantite: 10, prix_unitaire_applique: 225.4 },
    { id: "ligne-seed-4", devis_id: "devis-seed-repondu-valide", produit_id: "prod-batterie-lithium-100ah", quantite: 1, prix_unitaire_applique: 520 },
    { id: "ligne-seed-5", devis_id: "devis-seed-repondu-valide", produit_id: "prod-regulateur-mppt-60a", quantite: 1, prix_unitaire_applique: 165 },

    { id: "ligne-seed-6", devis_id: "devis-seed-repondu-limite-j3", produit_id: "prod-panneau-405w", quantite: 5, prix_unitaire_applique: 189 },

    { id: "ligne-seed-7", devis_id: "devis-seed-accepte", produit_id: "prod-panneau-405w", quantite: 1, prix_unitaire_applique: 189 },
    { id: "ligne-seed-8", devis_id: "devis-seed-accepte", produit_id: "prod-batterie-gel-200ah", quantite: 1, prix_unitaire_applique: 410 },
    { id: "ligne-seed-9", devis_id: "devis-seed-accepte", produit_id: "prod-regulateur-mppt-60a", quantite: 1, prix_unitaire_applique: 165 },

    { id: "ligne-seed-10", devis_id: "devis-seed-refuse", produit_id: "prod-panneau-550w", quantite: 10, prix_unitaire_applique: 225.4 },
    { id: "ligne-seed-11", devis_id: "devis-seed-refuse", produit_id: "prod-onduleur-hybride-5kva", quantite: 1, prix_unitaire_applique: 890 },

    { id: "ligne-seed-12", devis_id: "devis-seed-expire", produit_id: "prod-regulateur-mppt-60a", quantite: 2, prix_unitaire_applique: 165 },
    { id: "ligne-seed-13", devis_id: "devis-seed-expire", produit_id: "prod-kit-cables-mc4", quantite: 4, prix_unitaire_applique: 35 },
  ];
}
