"use client";

// Liste des commandes du client connecté — complète ECR-05-002 (retrouver une commande passée).
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { GardeClient } from "@/components/compte/GardeClient";
import { useCommandeStore } from "@/lib/store/commande-store";
import { StatutCommandeBadge } from "@/components/commande/StatutCommandeBadge";

export default function CommandesPage() {
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);

  return (
    <GardeClient>
      {(session) => {
        const commandes = [...toutesLesCommandes]
          .filter((c) => c.utilisateur_id === session.utilisateur_id)
          .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());

        return (
          <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
            <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">Mes commandes</h1>
            <p className="mb-8 text-texte-secondaire">Suivez le statut de retrait de vos commandes.</p>

            {commandes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-16 text-center">
                <PackageSearch size={28} className="text-texte-secondaire" />
                <p className="font-titres text-sm font-semibold text-texte-principal">Aucune commande pour le moment</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {commandes.map((c) => (
                  <Link
                    key={c.id}
                    href={`/commande/${c.id}`}
                    className="flex items-center justify-between rounded-xl border border-bordure bg-background p-4 transition-colors hover:border-primaire"
                  >
                    <div>
                      <p className="text-sm font-medium text-texte-principal">#{c.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-texte-secondaire">
                        {new Date(c.date_creation).toLocaleDateString("fr-FR")} — ${c.montant_total.toFixed(2)}
                      </p>
                    </div>
                    <StatutCommandeBadge statut={c.statut} />
                  </Link>
                ))}
              </div>
            )}
          </main>
        );
      }}
    </GardeClient>
  );
}
