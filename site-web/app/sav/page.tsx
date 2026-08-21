"use client";

// ECR-09-001 — SAV (espace client). BF-09-002, UC-09-002.
import { use } from "react";
import { GardeClient } from "@/components/compte/GardeClient";
import { MesTickets } from "@/components/sav/MesTickets";

export default function SavPage(props: PageProps<"/sav">) {
  const searchParams = use(props.searchParams);
  const commandeId = typeof searchParams.commandeId === "string" ? searchParams.commandeId : undefined;

  return (
    <GardeClient message="Connectez-vous pour ouvrir ou suivre un ticket SAV.">
      {(session) => (
        <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
          <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">SAV &amp; Assistance</h1>
          <p className="mb-8 text-texte-secondaire">Ouvrez un ticket pour une panne ou une réclamation.</p>
          <MesTickets session={session} commandeIdPreselectionnee={commandeId} />
        </main>
      )}
    </GardeClient>
  );
}
