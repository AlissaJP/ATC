"use client";

// ECR-08-003 — Espace client (tableau de bord et historique). RG-08-001 (affichage conditionnel
// selon le statut B2B). BF-08-002, BF-08-003, BF-08-004.
import Link from "next/link";
import { Building2, FileText, Heart, LifeBuoy, Package, User } from "lucide-react";
import { GardeClient } from "@/components/compte/GardeClient";
import { useComptesStore } from "@/lib/store/comptes-store";
import { CarnetAdresses } from "@/components/compte/CarnetAdresses";
import { CompleterDossier } from "@/components/compte/CompleterDossier";
import { MoyensPaiement } from "@/components/compte/MoyensPaiement";

const LIBELLES_STATUT: Record<string, { label: string; classe: string }> = {
  valide: { label: "Entreprise — B2B vérifié", classe: "bg-succes/10 text-succes" },
  en_attente: { label: "Entreprise — en attente de vérification", classe: "bg-avertissement/10 text-avertissement" },
  rejete: { label: "Entreprise — dossier rejeté", classe: "bg-danger/10 text-danger" },
  complement_demande: { label: "Entreprise — complément requis", classe: "bg-primaire-clair/10 text-primaire-clair" },
};

export default function TableauDeBordPage() {
  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);

  return (
    <GardeClient>
      {(session) => {
        const profil = profilsDynamiques.find((p) => p.utilisateur_id === session.utilisateur_id);
        const statutAffiche = session.type_compte === "entreprise" ? session.statut_validation_entreprise : undefined;

        return (
          <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
            <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">Mon compte</h1>
            <div className="mb-8 flex items-center gap-3">
              {session.type_compte === "entreprise" ? (
                <Building2 size={20} className="text-primaire-clair" />
              ) : (
                <User size={20} className="text-primaire-clair" />
              )}
              <p className="text-texte-secondaire">{session.nom}</p>
              {statutAffiche && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LIBELLES_STATUT[statutAffiche]?.classe}`}>
                  {LIBELLES_STATUT[statutAffiche]?.label}
                </span>
              )}
            </div>

            {statutAffiche === "complement_demande" && profil && (
              <div className="mb-8 rounded-xl border border-primaire-clair/30 bg-primaire-clair/5 p-5">
                <p className="font-titres text-sm font-semibold text-texte-principal">Complément de dossier requis</p>
                <CompleterDossier profilId={profil.id} motif={profil.commentaire_admin} />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/devis" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                <FileText size={22} className="shrink-0 text-primaire-clair" />
                <div>
                  <p className="font-titres text-sm font-semibold text-texte-principal">Mes devis</p>
                  <p className="text-sm text-texte-secondaire">Suivre mes demandes de package</p>
                </div>
              </Link>
              <Link href="/commandes" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                <Package size={22} className="shrink-0 text-primaire-clair" />
                <div>
                  <p className="font-titres text-sm font-semibold text-texte-principal">Mes commandes</p>
                  <p className="text-sm text-texte-secondaire">Suivre le statut de retrait</p>
                </div>
              </Link>
              <Link href="/compte/favoris" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                <Heart size={22} className="shrink-0 text-primaire-clair" />
                <div>
                  <p className="font-titres text-sm font-semibold text-texte-principal">Mes favoris</p>
                  <p className="text-sm text-texte-secondaire">Produits enregistrés</p>
                </div>
              </Link>
              <Link href="/sav" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                <LifeBuoy size={22} className="shrink-0 text-primaire-clair" />
                <div>
                  <p className="font-titres text-sm font-semibold text-texte-principal">SAV &amp; Assistance</p>
                  <p className="text-sm text-texte-secondaire">Ouvrir ou suivre un ticket</p>
                </div>
              </Link>
              {session.type_compte === "particulier" && (
                <Link href="/compte/inscription-entreprise" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                  <Building2 size={22} className="shrink-0 text-primaire-clair" />
                  <div>
                    <p className="font-titres text-sm font-semibold text-texte-principal">Devenir client professionnel</p>
                    <p className="text-sm text-texte-secondaire">Accéder au barème B2B</p>
                  </div>
                </Link>
              )}
            </div>

            <div className="mt-6">
              <CarnetAdresses utilisateurId={session.utilisateur_id} />
            </div>

            <div className="mt-8">
              <h2 className="mb-3 font-titres text-lg font-semibold text-texte-principal">
                Moyens de paiement enregistrés
              </h2>
              <MoyensPaiement utilisateurId={session.utilisateur_id} />
            </div>
          </main>
        );
      }}
    </GardeClient>
  );
}
