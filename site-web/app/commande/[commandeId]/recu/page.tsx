"use client";

import { use } from "react";
import { RecuCommandeDocument } from "@/components/commande/RecuCommandeDocument";

export default function RecuCommandePage(props: PageProps<"/commande/[commandeId]/recu">) {
  const { commandeId } = use(props.params);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <RecuCommandeDocument commandeId={commandeId} />
    </main>
  );
}
