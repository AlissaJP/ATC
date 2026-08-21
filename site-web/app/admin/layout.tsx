"use client";

// Garde d'accès + coquille du back-office — RG-12-001 (2 rôles administrateurs, décision actée n°20).
// ECR-12-001/12-002 (Phase 6) : navigation par module (AdminSidebar) avec visibilité adaptée au rôle,
// en complément des gardes par page (GardeRoleAdmin) qui bloquent aussi un accès direct par URL.
import Link from "next/link";
import { useSessionStore } from "@/lib/store/session-store";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = useSessionStore((s) => s.session);

  if (!session || session.type !== "admin") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-titres text-lg font-semibold text-texte-principal">Accès administrateur requis</p>
        <p className="mt-2 text-sm text-texte-secondaire">
          Cette section est réservée aux comptes Administrateur Général et Agent SAV (RG-12-001).
        </p>
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
    <div className="flex flex-1 flex-col">
      <div className="border-b border-bordure bg-fond px-4 py-3 md:px-6">
        <p className="text-sm text-texte-secondaire">
          Back-office ATC — <span className="font-medium text-texte-principal">{session.administrateur.nom}</span>{" "}
          ({session.administrateur.role === "general" ? "Administrateur Général" : "Agent SAV"})
        </p>
      </div>
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar role={session.administrateur.role} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
