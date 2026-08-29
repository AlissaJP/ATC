"use client";

// Raffinement Design (point #26, décision actée n°48) — page dédiée à la création d'un agent SAV,
// distincte de la fenêtre modale utilisée pour modifier un agent existant (GestionAgentsSav.tsx) — même
// idiome que CreationProduit.tsx pour Catalogue.
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormulaireAgentSav } from "@/components/admin/FormulaireAgentSav";

export function CreationAgentSav() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/agents-sav"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-texte-secondaire hover:text-texte-principal"
      >
        <ArrowLeft size={16} /> Retour à l&apos;annuaire
      </Link>
      <FormulaireAgentSav
        modeCreation
        agent={undefined}
        onCree={(id) => {
          // Redirige vers l'annuaire avec l'agent nouvellement créé déjà ouvert dans la fenêtre d'édition
          // (Raffinement Design), même idiome que CreationProduit.tsx.
          router.push(`/admin/agents-sav?agent=${id}`);
        }}
      />
    </div>
  );
}
