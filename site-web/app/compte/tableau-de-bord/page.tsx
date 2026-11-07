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
import { useTranslation } from "@/lib/i18n/useTranslation";

const LIBELLES_STATUT: Record<string, { label: string; classe: string }> = {
  valide: { label: "tableau.statut.valide", classe: "bg-succes/10 text-succes" },
  en_attente: { label: "tableau.statut.en_attente", classe: "bg-avertissement/10 text-avertissement" },
  rejete: { label: "tableau.statut.rejete", classe: "bg-danger/10 text-danger" },
  complement_demande: { label: "tableau.statut.complement_demande", classe: "bg-primaire-clair/10 text-primaire-clair" },
};

export default function TableauDeBordPage() {
  const { t } = useTranslation();
  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);

  return (
    <GardeClient>
      {(session) => {
        const profil = profilsDynamiques.find((p) => p.utilisateur_id === session.utilisateur_id);
        const statutAffiche = session.type_compte === "entreprise" ? session.statut_validation_entreprise : undefined;

        return (
          <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
            <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">{t("compte.monCompte")}</h1>
            <div className="mb-8 flex items-center gap-3">
              {session.type_compte === "entreprise" ? (
                <Building2 size={20} className="text-primaire-clair" />
              ) : (
                <User size={20} className="text-primaire-clair" />
              )}
              <p className="text-texte-secondaire">{session.nom}</p>
              {statutAffiche && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LIBELLES_STATUT[statutAffiche]?.classe}`}>
                  {t(LIBELLES_STATUT[statutAffiche]?.label ?? "")}
                </span>
              )}
            </div>

            {statutAffiche === "complement_demande" && profil && (
              <div className="mb-8 rounded-xl border border-primaire-clair/30 bg-primaire-clair/5 p-5">
                <p className="font-titres text-sm font-semibold text-texte-principal">{t("tableau.complementTitre")}</p>
                <CompleterDossier profilId={profil.id} motif={profil.commentaire_admin} />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/devis" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                <FileText size={22} className="shrink-0 text-primaire-clair" />
                <div>
                  <p className="font-titres text-sm font-semibold text-texte-principal">{t("compte.mesDevis")}</p>
                  <p className="text-sm text-texte-secondaire">{t("tableau.devisTexte")}</p>
                </div>
              </Link>
              <Link href="/commandes" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                <Package size={22} className="shrink-0 text-primaire-clair" />
                <div>
                  <p className="font-titres text-sm font-semibold text-texte-principal">{t("compte.mesCommandes")}</p>
                  <p className="text-sm text-texte-secondaire">{t("tableau.commandesTexte")}</p>
                </div>
              </Link>
              <Link href="/compte/favoris" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                <Heart size={22} className="shrink-0 text-primaire-clair" />
                <div>
                  <p className="font-titres text-sm font-semibold text-texte-principal">{t("compte.mesFavoris")}</p>
                  <p className="text-sm text-texte-secondaire">{t("tableau.favorisTexte")}</p>
                </div>
              </Link>
              <Link href="/sav" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                <LifeBuoy size={22} className="shrink-0 text-primaire-clair" />
                <div>
                  <p className="font-titres text-sm font-semibold text-texte-principal">{t("sav.titre")}</p>
                  <p className="text-sm text-texte-secondaire">{t("tableau.savTexte")}</p>
                </div>
              </Link>
              {session.type_compte === "particulier" && (
                <Link href="/compte/inscription-entreprise" className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
                  <Building2 size={22} className="shrink-0 text-primaire-clair" />
                  <div>
                    <p className="font-titres text-sm font-semibold text-texte-principal">{t("entreprise.titre")}</p>
                    <p className="text-sm text-texte-secondaire">{t("tableau.proTexte")}</p>
                  </div>
                </Link>
              )}
            </div>

            <div className="mt-6">
              <CarnetAdresses utilisateurId={session.utilisateur_id} />
            </div>

            <div className="mt-8">
              <h2 className="mb-3 font-titres text-lg font-semibold text-texte-principal">
                {t("tableau.moyensPaiement")}
              </h2>
              <MoyensPaiement utilisateurId={session.utilisateur_id} />
            </div>
          </main>
        );
      }}
    </GardeClient>
  );
}
