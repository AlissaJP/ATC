"use client";

import { use } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CommandeConfirmation } from "@/components/commande/CommandeConfirmation";

export default function CommandePage(props: PageProps<"/commande/[commandeId]">) {
  const { commandeId } = use(props.params);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <Breadcrumb
        items={[
          { label: "Panier", href: "/panier" },
          { label: "Paiement" },
          { label: "Confirmation" },
        ]}
      />
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
        Confirmation de commande
      </h1>
      <CommandeConfirmation commandeId={commandeId} />
    </main>
  );
}
