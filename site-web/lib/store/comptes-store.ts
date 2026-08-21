// EPIC-08 — Compte Client. RG-08-001 (validation Entreprise en 4 étapes, décision actée n°17),
// RG-08-002 (formats/taille documents, décision actée n°30). Comptes créés dynamiquement pendant la
// démo (sandbox — décision actée n°41), en complément des comptes de test seedés (lib/mock-data/utilisateurs.ts).
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { profilsEntreprise as profilsEntrepriseSeed } from "@/lib/mock-data/utilisateurs";
import type {
  Adresse,
  DocumentEntreprise,
  Favori,
  ProfilEntreprise,
  StatutValidationEntreprise,
  TypeDocumentEntreprise,
  Utilisateur,
} from "@/lib/types/entities";

export interface InscriptionEntrepriseInput {
  nom_legal: string;
  nom_commercial?: string;
  nif: string;
  registre_commerce?: string;
  adresse_entreprise: string;
  telephone_professionnel: string;
  email_professionnel: string;
  representant_nom: string;
  representant_fonction: string;
  secteur_activite: string;
  taille_entreprise?: string;
}

export interface DocumentTeleverse {
  type_document: TypeDocumentEntreprise;
  nom_fichier: string;
  taille_octets: number;
}

interface ComptesState {
  utilisateurs: Utilisateur[];
  profilsEntreprise: ProfilEntreprise[];
  documentsEntreprise: DocumentEntreprise[];
  adresses: Adresse[];
  favoris: Favori[];

  inscrireParticulier: (nom: string, email: string, telephone?: string) => Utilisateur;
  inscrireEntreprise: (donnees: InscriptionEntrepriseInput, documents: DocumentTeleverse[]) => ProfilEntreprise;
  approuverDossier: (profilId: string) => void;
  rejeterDossier: (profilId: string, motif: string) => void;
  demanderComplement: (profilId: string, motif: string) => void;
  televerserDocumentsComplement: (profilId: string, documents: DocumentTeleverse[]) => void;

  ajouterAdresse: (utilisateurId: string, libelle: string, adresse: string) => void;
  retirerAdresse: (adresseId: string) => void;

  basculerFavori: (utilisateurId: string, produitId: string) => void;
}

let compteurId = 0;
function idUnique(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${Date.now()}-${compteurId}`;
}

// ECR-08-002 : un dossier Entreprise seedé (lib/mock-data/utilisateurs.ts) n'existe pas encore dans ce
// store tant qu'aucune décision admin n'a été prise dessus. On l'« adopte » (copie à même id) au premier
// geste admin, pour que les actions Approuver/Rejeter/Compléments fonctionnent uniformément sur tous les
// dossiers, seedés ou créés pendant la démo.
function avecProfilAdopte(profils: ProfilEntreprise[], profilId: string): ProfilEntreprise[] {
  if (profils.some((p) => p.id === profilId)) return profils;
  const depuisSeed = profilsEntrepriseSeed.find((p) => p.id === profilId);
  return depuisSeed ? [...profils, depuisSeed] : profils;
}

export const useComptesStore = create<ComptesState>()(
  persist(
    (set) => ({
      utilisateurs: [],
      profilsEntreprise: [],
      documentsEntreprise: [],
      adresses: [],
      favoris: [],

      inscrireParticulier: (nom, email, telephone) => {
        const utilisateur: Utilisateur = {
          id: idUnique("user"),
          type_compte: "particulier",
          email,
          nom,
          telephone,
          langue_preferee: "fr",
          date_creation: new Date().toISOString(),
          statut_compte: "actif",
        };
        set((state) => ({ utilisateurs: [...state.utilisateurs, utilisateur] }));
        return utilisateur;
      },

      // RG-08-001, étape 1 et 2 — le compte est actif immédiatement (navigation en prix public),
      // le statut B2B « en_attente » ne débloque le barème qu'après validation admin (étapes 3-4).
      inscrireEntreprise: (donnees, documents) => {
        const utilisateur: Utilisateur = {
          id: idUnique("user"),
          type_compte: "entreprise",
          email: donnees.email_professionnel,
          nom: donnees.representant_nom,
          telephone: donnees.telephone_professionnel,
          langue_preferee: "fr",
          date_creation: new Date().toISOString(),
          statut_compte: "actif",
        };
        const profil: ProfilEntreprise = {
          id: idUnique("profil"),
          utilisateur_id: utilisateur.id,
          ...donnees,
          statut_validation: "en_attente",
          date_soumission: new Date().toISOString(),
        };
        const documentsEnregistres: DocumentEntreprise[] = documents.map((d) => ({
          id: idUnique("document"),
          profil_entreprise_id: profil.id,
          type_document: d.type_document,
          fichier_url: d.nom_fichier, // démo : nom du fichier seul, pas de stockage objet réel
          date_televersement: new Date().toISOString(),
        }));
        set((state) => ({
          utilisateurs: [...state.utilisateurs, utilisateur],
          profilsEntreprise: [...state.profilsEntreprise, profil],
          documentsEntreprise: [...state.documentsEntreprise, ...documentsEnregistres],
        }));
        return profil;
      },

      approuverDossier: (profilId) =>
        set((state) => ({
          profilsEntreprise: avecProfilAdopte(state.profilsEntreprise, profilId).map((p) =>
            p.id === profilId
              ? { ...p, statut_validation: "valide" as StatutValidationEntreprise, date_validation: new Date().toISOString() }
              : p
          ),
        })),

      rejeterDossier: (profilId, motif) =>
        set((state) => ({
          profilsEntreprise: avecProfilAdopte(state.profilsEntreprise, profilId).map((p) =>
            p.id === profilId ? { ...p, statut_validation: "rejete" as StatutValidationEntreprise, commentaire_admin: motif } : p
          ),
        })),

      demanderComplement: (profilId, motif) =>
        set((state) => ({
          profilsEntreprise: avecProfilAdopte(state.profilsEntreprise, profilId).map((p) =>
            p.id === profilId
              ? { ...p, statut_validation: "complement_demande" as StatutValidationEntreprise, commentaire_admin: motif }
              : p
          ),
        })),

      // UC-08-002, A1 — retour à l'étape 2 côté client : le client complète son dossier, qui repasse en attente.
      televerserDocumentsComplement: (profilId, documents) => {
        const documentsEnregistres: DocumentEntreprise[] = documents.map((d) => ({
          id: idUnique("document"),
          profil_entreprise_id: profilId,
          type_document: d.type_document,
          fichier_url: d.nom_fichier,
          date_televersement: new Date().toISOString(),
        }));
        set((state) => ({
          documentsEntreprise: [...state.documentsEntreprise, ...documentsEnregistres],
          profilsEntreprise: state.profilsEntreprise.map((p) =>
            p.id === profilId ? { ...p, statut_validation: "en_attente" as StatutValidationEntreprise } : p
          ),
        }));
      },

      ajouterAdresse: (utilisateurId, libelle, adresse) =>
        set((state) => ({
          adresses: [
            ...state.adresses,
            { id: idUnique("adresse"), utilisateur_id: utilisateurId, libelle, adresse },
          ],
        })),

      retirerAdresse: (adresseId) =>
        set((state) => ({ adresses: state.adresses.filter((a) => a.id !== adresseId) })),

      basculerFavori: (utilisateurId, produitId) =>
        set((state) => {
          const existant = state.favoris.find((f) => f.utilisateur_id === utilisateurId && f.produit_id === produitId);
          if (existant) return { favoris: state.favoris.filter((f) => f.id !== existant.id) };
          return {
            favoris: [...state.favoris, { id: idUnique("favori"), utilisateur_id: utilisateurId, produit_id: produitId }],
          };
        }),
    }),
    { name: "atc-comptes" }
  )
);
