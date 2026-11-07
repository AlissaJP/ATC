"use client";

// Liste des commandes du client connecté — complète ECR-05-002 (retrouver une commande passée).
// Une commande réglée par virement n'apparaît parmi les commandes validées qu'après vérification de la
// preuve par un administrateur ; d'ici là, elle figure dans une section distincte « paiement en vérification ».
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { GardeClient } from "@/components/compte/GardeClient";
import { useCommandeStore } from "@/lib/store/commande-store";
import { StatutCommandeBadge } from "@/components/commande/StatutCommandeBadge";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LOCALE_INTL } from "@/lib/i18n/langues";
import type { Commande } from "@/lib/types/entities";

function LigneCommande({ commande }: { commande: Commande }) {
  const { langue } = useTranslation();
  return (
    <Link
      href={`/commande/${commande.id}`}
      className="flex items-center justify-between rounded-xl border border-bordure bg-background p-4 transition-colors hover:border-primaire"
    >
      <div>
        <p className="text-sm font-medium text-texte-principal">#{commande.id.slice(-8).toUpperCase()}</p>
        <p className="text-xs text-texte-secondaire">
          {new Date(commande.date_creation).toLocaleDateString(LOCALE_INTL[langue])} — ${commande.montant_total.toFixed(2)}
        </p>
      </div>
      <StatutCommandeBadge statut={commande.statut} />
    </Link>
  );
}

export default function CommandesPage() {
  const { t } = useTranslation();
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);

  return (
    <GardeClient>
      {(session) => {
        const commandes = [...toutesLesCommandes]
          .filter((c) => c.utilisateur_id === session.utilisateur_id)
          .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
        const enAttente = commandes.filter((c) => c.statut === "attente_paiement");
        const validees = commandes.filter((c) => c.statut !== "attente_paiement");

        return (
          <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
            <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">{t("commandes.titre")}</h1>
            <p className="mb-8 text-texte-secondaire">{t("commandes.sousTitre")}</p>

            {enAttente.length > 0 && (
              <section className="mb-8">
                <h2 className="font-titres text-base font-semibold text-texte-principal">{t("commandes.enAttenteTitre")}</h2>
                <p className="mb-3 text-sm text-texte-secondaire">{t("commandes.enAttenteTexte")}</p>
                <div className="flex flex-col gap-3">
                  {enAttente.map((c) => (
                    <LigneCommande key={c.id} commande={c} />
                  ))}
                </div>
              </section>
            )}

            {enAttente.length > 0 && validees.length > 0 && (
              <h2 className="mb-3 font-titres text-base font-semibold text-texte-principal">{t("commandes.valideesTitre")}</h2>
            )}

            {validees.length === 0 ? (
              enAttente.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-16 text-center">
                  <PackageSearch size={28} className="text-texte-secondaire" />
                  <p className="font-titres text-sm font-semibold text-texte-principal">{t("commandes.aucune")}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                {validees.map((c) => (
                  <LigneCommande key={c.id} commande={c} />
                ))}
              </div>
            )}
          </main>
        );
      }}
    </GardeClient>
  );
}
