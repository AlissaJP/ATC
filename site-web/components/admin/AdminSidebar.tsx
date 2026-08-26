"use client";

// RG-12-001 — Navigation back-office par module, visibilité adaptée au rôle (2 rôles stricts, décision
// actée n°20). Structure groupée avec sous-éléments (Raffinement Design, Section Administration,
// validé) : chaque section principale peut déplier des sous-éléments, affichés uniquement quand la
// section est active (même comportement que la référence Stripe fournie), pas par bascule manuelle.
// L'Agent SAV ne voit pas Catalogue / Paiements / Statistiques / Paramètres généraux / Comptes
// administrateurs (gestion des prix + Paramètres généraux exclus par la règle ; Paiements et
// Statistiques suivent la même logique — signalé, aucune section du Cahier ne le précise explicitement
// pour ces deux derniers).
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CreditCard,
  FileQuestion,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Package,
  ShieldCheck,
  Star,
  Tags,
  UserCog,
  Users,
} from "lucide-react";
import { useSessionStore } from "@/lib/store/session-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { profilsEntreprise as profilsEntrepriseSeed } from "@/lib/mock-data/utilisateurs";
import type { RoleAdmin } from "@/lib/types/entities";

interface SousLienAdmin {
  href: string;
  label: string;
  badge?: boolean;
}

interface LienAdmin {
  href: string;
  label: string;
  icone: typeof LayoutDashboard;
  rolesAutorises: RoleAdmin[];
  sousLiens?: SousLienAdmin[];
}

// Élément seul en haut, sans groupe.
const LIEN_TABLEAU_DE_BORD: LienAdmin = {
  href: "/admin",
  label: "Tableau de bord",
  icone: LayoutDashboard,
  rolesAutorises: ["general", "agent_sav"],
};

const GROUPES: { titre: string; liens: LienAdmin[] }[] = [
  {
    titre: "VENTES",
    liens: [
      {
        href: "/admin/catalogue",
        label: "Catalogue",
        icone: Tags,
        rolesAutorises: ["general"],
        // Les 3 sous-éléments pointent volontairement vers la même page : Produits/Stock/Barèmes B2B
        // sont déjà affichés ensemble pour le produit sélectionné (pas des vues séparées) — ce sont ici
        // des repères de structure (conformes au doc), pas des filtres fonctionnellement distincts.
        sousLiens: [
          { href: "/admin/catalogue", label: "Produits" },
          { href: "/admin/catalogue", label: "Barèmes B2B" },
          { href: "/admin/catalogue", label: "Stock" },
        ],
      },
      { href: "/admin/packages", label: "Packages", icone: Boxes, rolesAutorises: ["general"] },
      {
        href: "/admin/devis",
        label: "Devis",
        icone: FileText,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/devis?statut=en_attente", label: "En attente" },
          { href: "/admin/devis?statut=repondu", label: "Répondus" },
          { href: "/admin/devis?statut=resolu", label: "Acceptés / Expirés" },
        ],
      },
      {
        href: "/admin/commandes",
        label: "Commandes",
        icone: Package,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/commandes?statut=en_preparation", label: "En préparation" },
          { href: "/admin/commandes?statut=prete_retrait", label: "Prêtes pour retrait" },
          { href: "/admin/commandes?statut=retiree", label: "Retirées" },
        ],
      },
      {
        href: "/admin/transactions",
        label: "Paiements",
        icone: CreditCard,
        rolesAutorises: ["general"],
        sousLiens: [
          { href: "/admin/transactions", label: "Tous les paiements" },
          { href: "/admin/transactions?methode=moncash", label: "MonCash" },
          { href: "/admin/transactions?methode=carte", label: "Carte" },
          { href: "/admin/transactions?methode=paypal", label: "PayPal" },
        ],
      },
    ],
  },
  {
    titre: "CLIENTS",
    liens: [
      {
        href: "/admin/clients",
        label: "Clients",
        icone: Users,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/clients?type=particulier", label: "Particuliers" },
          { href: "/admin/entreprises", label: "Entreprises", badge: true },
        ],
      },
      { href: "/admin/avis", label: "Avis clients", icone: Star, rolesAutorises: ["general", "agent_sav"] },
    ],
  },
  {
    titre: "SUPPORT",
    liens: [
      {
        href: "/admin/sav",
        label: "Assistance / SAV",
        icone: LifeBuoy,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/sav", label: "Tickets SAV" },
          { href: "/admin/installations", label: "Installations planifiées" },
        ],
      },
    ],
  },
  {
    titre: "CONTENU",
    liens: [
      {
        href: "/admin/contenu",
        label: "Contenu",
        icone: FileQuestion,
        rolesAutorises: ["general", "agent_sav"],
        // "Blog" (ECR-11-002) volontairement omis : la page n'existe pas (hors périmètre, cf. Axe 1
        // de l'audit qualité) — un sous-lien mènerait à une 404.
        sousLiens: [
          { href: "/admin/contenu?onglet=faq", label: "FAQ" },
          { href: "/admin/contenu?onglet=cgv", label: "Mentions légales & CGV" },
        ],
      },
    ],
  },
  {
    titre: "PILOTAGE",
    liens: [{ href: "/admin/statistiques", label: "Statistiques", icone: BarChart3, rolesAutorises: ["general"] }],
  },
];

// Bas de page, sans groupe.
const LIENS_BAS_DE_PAGE: LienAdmin[] = [
  {
    href: "/admin/parametres",
    label: "Paramètres généraux",
    icone: ShieldCheck,
    rolesAutorises: ["general"],
    // "Notifications" volontairement omis : pas d'infrastructure d'envoi réel dans cette démo, déjà
    // signalé dans app/admin/parametres/page.tsx — un sous-lien vers un réglage sans effet aurait été trompeur.
    sousLiens: [
      { href: "/admin/parametres#langues", label: "Langues" },
      { href: "/admin/parametres#taux-change", label: "Taux de change" },
    ],
  },
  { href: "/admin/comptes", label: "Comptes administrateurs", icone: ShieldCheck, rolesAutorises: ["general"] },
  { href: "/admin/agents-sav", label: "Agents SAV", icone: UserCog, rolesAutorises: ["general"] },
];

function chemin(href: string): string {
  return href.split("?")[0];
}

function estActif(pathname: string, href: string): boolean {
  const cible = chemin(href);
  return cible === "/admin" ? pathname === "/admin" : pathname.startsWith(cible);
}

// Un parent se déplie aussi si l'URL active correspond à l'un de ses sous-liens — nécessaire pour
// « Entreprises » (sous /admin/entreprises, hors préfixe /admin/clients) et « Installations planifiées »
// (sous /admin/installations, hors préfixe /admin/sav).
function LienPrincipal({ lien, pathname, badge }: { lien: LienAdmin; pathname: string; badge?: number }) {
  const actif =
    estActif(pathname, lien.href) || (lien.sousLiens?.some((sl) => estActif(pathname, sl.href)) ?? false);
  const Icone = lien.icone;
  return (
    <div>
      <Link
        href={lien.href}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          actif ? "bg-primaire text-white" : "text-texte-principal hover:bg-background"
        }`}
      >
        <Icone size={17} />
        <span className="flex-1">{lien.label}</span>
        {!!badge && (
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-white">{badge}</span>
        )}
      </Link>
      {actif && lien.sousLiens && (
        <div className="mt-1 flex flex-col gap-0.5 border-l border-bordure pl-4">
          {lien.sousLiens.map((sl) => (
            <Link
              key={sl.href}
              href={sl.href}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-texte-secondaire transition-colors hover:bg-background hover:text-texte-principal"
            >
              <span className="flex-1">{sl.label}</span>
              {sl.badge && !!badge && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ role }: { role: RoleAdmin }) {
  const pathname = usePathname();
  const router = useRouter();
  const deconnecter = useSessionStore((s) => s.deconnecter);

  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);
  const nombreEnAttente = (() => {
    const idsDynamiques = new Set(profilsDynamiques.map((p) => p.id));
    const seedsNonAdoptes = profilsEntrepriseSeed.filter((p) => !idsDynamiques.has(p.id));
    return [...seedsNonAdoptes, ...profilsDynamiques].filter((p) => p.statut_validation === "en_attente").length;
  })();

  function filtrerParRole(liens: LienAdmin[]): LienAdmin[] {
    return liens.filter((l) => l.rolesAutorises.includes(role));
  }

  return (
    <nav className="flex shrink-0 flex-col gap-4 border-b border-bordure bg-fond px-3 py-3 md:w-64 md:border-b-0 md:border-r md:px-3 md:py-6">
      <div>
        {filtrerParRole([LIEN_TABLEAU_DE_BORD]).map((l) => (
          <LienPrincipal key={l.href} lien={l} pathname={pathname} />
        ))}
      </div>

      {GROUPES.map((groupe) => {
        const liens = filtrerParRole(groupe.liens);
        if (liens.length === 0) return null;
        return (
          <div key={groupe.titre}>
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              {groupe.titre}
            </p>
            <div className="flex flex-col gap-1">
              {liens.map((l) => (
                <LienPrincipal
                  key={l.href}
                  lien={l}
                  pathname={pathname}
                  badge={l.href === "/admin/clients" ? nombreEnAttente : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-auto flex flex-col gap-1 border-t border-bordure pt-3">
        {filtrerParRole(LIENS_BAS_DE_PAGE).map((l) => (
          <LienPrincipal key={l.href} lien={l} pathname={pathname} />
        ))}
        <button
          type="button"
          onClick={() => {
            deconnecter();
            router.push("/");
          }}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-background"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
