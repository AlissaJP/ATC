"use client";

// ECR-06-002 — Facture pro forma. Accès (Cahier 6) : "Client Entreprise ayant un devis accepté ou une
// commande facturable" — jusqu'ici cette page n'avait aucune garde (n'importe quel visiteur pouvait
// consulter une facture en devinant son id). Corrigé en Phase 7 : session client requise + vérification
// que la facture appartient bien à l'utilisateur connecté (via le devis ou la commande rattaché).
// Étendu lors de l'audit qualité (BF-12-008) : un administrateur peut aussi consulter n'importe quelle
// facture depuis le nouvel écran de suivi des transactions (components/admin/GestionTransactions.tsx),
// même logique déjà en place pour la confirmation de commande (components/commande/CommandeConfirmation.tsx).
import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSessionStore } from "@/lib/store/session-store";
import { useFactureStore } from "@/lib/store/facture-store";
import { useDevisStore } from "@/lib/store/devis-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { FactureProFormaDocument } from "@/components/facture/FactureProFormaDocument";

export default function FacturePage(props: PageProps<"/facture/[factureId]">) {
  const { factureId } = use(props.params);
  const session = useSessionStore((s) => s.session);
  const factures = useFactureStore((s) => s.facturesProForma);
  const facture = factures.find((f) => f.id === factureId);
  const tousLesDevis = useDevisStore((s) => s.devis);
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);

  if (!facture) notFound();

  const utilisateurProprietaire = facture.devis_id
    ? tousLesDevis.find((d) => d.id === facture.devis_id)?.utilisateur_id
    : toutesLesCommandes.find((c) => c.id === facture.commande_id)?.utilisateur_id;

  const autorise = session?.type === "admin" || (session?.type === "client" && session.utilisateur_id === utilisateurProprietaire);

  if (!autorise) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-titres text-lg font-semibold text-texte-principal">Connexion requise</p>
        <Link
          href="/compte/connexion"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <FactureProFormaDocument facture={facture} />
    </main>
  );
}
