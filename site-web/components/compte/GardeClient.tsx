"use client";

// Garde d'accès réutilisable pour les écrans "Client connecté" (ECR-04-002, ECR-04-003, ECR-08-003,
// ECR-06-002 — champ "Accès" de chaque écran, Cahier 6). Auparavant dupliqué à l'identique dans
// app/devis, app/commandes, app/compte/favoris, app/compte/tableau-de-bord (Phase 7, factorisation).
import type { ReactNode } from "react";
import Link from "next/link";
import { useSessionStore, type SessionClient } from "@/lib/store/session-store";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function GardeClient({
  message,
  children,
}: {
  message?: string;
  children: (session: SessionClient) => ReactNode;
}) {
  const session = useSessionStore((s) => s.session);
  const { t } = useTranslation();

  if (!session || session.type !== "client") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-titres text-lg font-semibold text-texte-principal">{t("garde.connexionRequise")}</p>
        {message && <p className="mt-2 text-sm text-texte-secondaire">{message}</p>}
        <Link
          href="/compte/connexion"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          {t("compte.seConnecter")}
        </Link>
      </main>
    );
  }

  return <>{children(session)}</>;
}
