"use client";

// ECR-06-001 — Paiement d'un devis accepté.
import { use } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { EcranPaiement } from "@/components/paiement/EcranPaiement";

export default function PaiementDevisPage(props: PageProps<"/paiement/devis/[devisId]">) {
  const { devisId } = use(props.params);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Mes devis", href: "/devis" }, { label: "Paiement" }]} />
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal md:text-3xl">Paiement</h1>
      <EcranPaiement contexte={{ type: "devis", id: devisId }} />
    </main>
  );
}
