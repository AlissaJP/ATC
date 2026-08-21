"use client";

// RG-12-001 — Navigation back-office par module, visibilité adaptée au rôle (2 rôles stricts, décision
// actée n°20). L'Agent SAV ne voit pas Catalogue / Paramètres généraux / Comptes administrateurs (gestion
// des prix + Paramètres généraux exclus par la règle ; Comptes admin réservé au Général par cohérence,
// aucune section du Cahier ne le précise explicitement — signalé à l'utilisateur).
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Building2,
  FileQuestion,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  Users,
  Wrench,
} from "lucide-react";
import type { RoleAdmin } from "@/lib/types/entities";

interface LienAdmin {
  href: string;
  label: string;
  icone: typeof LayoutDashboard;
  rolesAutorises: RoleAdmin[];
}

const LIENS: LienAdmin[] = [
  { href: "/admin", label: "Tableau de bord", icone: LayoutDashboard, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/devis", label: "Devis", icone: FileText, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/commandes", label: "Commandes", icone: Package, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/clients", label: "Clients", icone: Users, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/entreprises", label: "Dossiers Entreprise", icone: Building2, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/sav", label: "SAV & Assistance", icone: LifeBuoy, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/installations", label: "Installations", icone: Wrench, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/avis", label: "Avis clients", icone: Star, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/transactions", label: "Transactions", icone: Receipt, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/contenu", label: "Contenu", icone: FileQuestion, rolesAutorises: ["general", "agent_sav"] },
  { href: "/admin/catalogue", label: "Catalogue", icone: Tags, rolesAutorises: ["general"] },
  { href: "/admin/packages", label: "Packages pré-configurés", icone: Boxes, rolesAutorises: ["general"] },
  { href: "/admin/statistiques", label: "Statistiques", icone: BarChart3, rolesAutorises: ["general"] },
  { href: "/admin/comptes", label: "Comptes administrateurs", icone: ShieldCheck, rolesAutorises: ["general"] },
  { href: "/admin/parametres", label: "Paramètres généraux", icone: Settings, rolesAutorises: ["general"] },
];

export function AdminSidebar({ role }: { role: RoleAdmin }) {
  const pathname = usePathname();
  const liens = LIENS.filter((l) => l.rolesAutorises.includes(role));

  return (
    <nav className="flex shrink-0 flex-col gap-1 border-b border-bordure bg-fond px-3 py-3 md:w-60 md:border-b-0 md:border-r md:px-3 md:py-6">
      {liens.map((l) => {
        const actif = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        const Icone = l.icone;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              actif ? "bg-primaire text-white" : "text-texte-principal hover:bg-background"
            }`}
          >
            <Icone size={17} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
