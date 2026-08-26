"use client";

import { PanierContenu } from "@/components/panier/PanierContenu";
import { GardeClient } from "@/components/compte/GardeClient";

// Raffinement Design — panier réservé aux clients connectés (même règle que l'ajout au panier, cf.
// lib/hooks/useGardeClient.ts). Un panier déjà rempli avant déconnexion ne doit pas rester consultable.
// Structure alignée sur les autres pages GardeClient (app/devis, app/sav, app/compte/favoris) : le <main>
// vit dans le render prop, jamais en dehors, pour éviter un <main> imbriqué avec celui de GardeClient.
export default function PanierPage() {
  return (
    <GardeClient message="Connectez-vous pour accéder à votre panier.">
      {() => (
        <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
          <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal md:text-3xl">Panier</h1>
          <PanierContenu />
        </main>
      )}
    </GardeClient>
  );
}
