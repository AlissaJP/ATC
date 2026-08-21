"use client";

// RG-12-001 — 2 rôles administrateurs stricts (décision actée n°20) : l'Agent SAV n'a pas accès à la
// gestion des prix/catalogue ni aux Paramètres généraux. Cette garde bloque aussi un accès direct par URL,
// en complément du masquage des liens correspondants dans components/admin/AdminSidebar.tsx.
import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useSessionStore } from "@/lib/store/session-store";
import type { RoleAdmin } from "@/lib/types/entities";

export function GardeRoleAdmin({
  rolesAutorises,
  children,
}: {
  rolesAutorises: RoleAdmin[];
  children: ReactNode;
}) {
  const session = useSessionStore((s) => s.session);

  if (session?.type !== "admin") return null; // app/admin/layout.tsx gère déjà l'accès non-admin

  if (!rolesAutorises.includes(session.administrateur.role)) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-16 text-center">
        <ShieldAlert size={28} className="text-texte-secondaire" />
        <p className="font-titres text-sm font-semibold text-texte-principal">
          Accès réservé à l&apos;Administrateur Général
        </p>
        <p className="max-w-sm text-sm text-texte-secondaire">
          Le rôle Agent SAV (RG-12-001) n&apos;a pas accès à ce module.
        </p>
        <Link href="/admin" className="text-sm font-medium text-primaire hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
