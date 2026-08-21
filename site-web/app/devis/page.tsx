"use client";

// ECR-04-003 — Suivi de devis (espace client). BF-04-005.
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { DevisCard } from "@/components/devis/DevisCard";
import { GardeClient } from "@/components/compte/GardeClient";
import { useDevisStore } from "@/lib/store/devis-store";

export default function DevisPage() {
  // Sélectionne le tableau brut (référence stable) puis filtre en mémo — un sélecteur Zustand qui
  // renvoie un nouveau tableau à chaque appel (ex. via .filter() interne) provoque une boucle de rendu.
  const tousLesDevis = useDevisStore((s) => s.devis);

  return (
    <GardeClient message="Connectez-vous pour consulter vos devis.">
      {(session) => {
        const devisTries = [...tousLesDevis]
          .filter((d) => d.utilisateur_id === session.utilisateur_id)
          .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());

        return (
          <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
            <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">Mes devis</h1>
            <p className="mb-8 text-texte-secondaire">Suivez l&apos;état de vos demandes de package solaire.</p>

            {devisTries.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-16 text-center">
                <FileQuestion size={28} className="text-texte-secondaire" />
                <p className="font-titres text-sm font-semibold text-texte-principal">Aucun devis pour le moment</p>
                <Link href="/packages/configurateur" className="text-sm font-medium text-primaire hover:underline">
                  Composer un package personnalisé
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {devisTries.map((d) => (
                  <DevisCard key={d.id} devis={d} />
                ))}
              </div>
            )}
          </main>
        );
      }}
    </GardeClient>
  );
}
