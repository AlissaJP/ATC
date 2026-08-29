"use client";

// RG-12-001 — Navigation back-office par module, visibilité adaptée au rôle (2 rôles stricts, décision
// actée n°20). Structure groupée avec sous-éléments (Raffinement Design, Section Administration,
// validé) : chaque section principale déplie ses sous-éléments quand elle est active, avec bascule
// manuelle (reclic sur la section active = replie/déplie directement, sans navigation) et un bouton global
// de repli en rail d'icônes (même comportement que la référence Stripe fournie).
// L'Agent SAV ne voit pas Catalogue / Paiements / Statistiques / Paramètres généraux / Comptes
// administrateurs (gestion des prix + Paramètres généraux exclus par la règle ; Paiements et
// Statistiques suivent la même logique — signalé, aucune section du Cahier ne le précise explicitement
// pour ces deux derniers).
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronsDownUp,
  ChevronsUpDown,
  CreditCard,
  FileBarChart,
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
  Warehouse,
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
        // Raffinement Design — sous-éléments = raccourcis vers les 3 onglets catégorie de la page
        // (GestionCatalogue.tsx), même idiome que Devis ci-dessous (paramètre de requête lu côté serveur
        // par app/admin/catalogue/page.tsx). Stock reste sa propre section (vue d'ensemble tous produits
        // confondus), pas un sous-élément du Catalogue. Le lien parent pointe directement vers le premier
        // sous-élément (même état que « Paiements ») pour que ce sous-élément soit déjà surligné au clic
        // sur la section.
        href: "/admin/catalogue?categorie=energie-solaire",
        label: "Catalogue",
        icone: Tags,
        rolesAutorises: ["general"],
        sousLiens: [
          { href: "/admin/catalogue?categorie=energie-solaire", label: "Énergie solaire" },
          { href: "/admin/catalogue?categorie=climatisation", label: "Climatisation" },
          { href: "/admin/catalogue?categorie=securite", label: "Sécurité" },
        ],
      },
      {
        // Raffinement Design — mêmes 3 sous-éléments catégorie que Catalogue (même paramètre `categorie`,
        // SuiviStock.tsx s'aligne désormais sur GestionCatalogue.tsx).
        href: "/admin/stock?categorie=energie-solaire",
        label: "Stock",
        icone: Warehouse,
        rolesAutorises: ["general"],
        sousLiens: [
          { href: "/admin/stock?categorie=energie-solaire", label: "Énergie solaire" },
          { href: "/admin/stock?categorie=climatisation", label: "Climatisation" },
          { href: "/admin/stock?categorie=securite", label: "Sécurité" },
        ],
      },
      { href: "/admin/packages", label: "Packages", icone: Boxes, rolesAutorises: ["general"] },
      {
        href: "/admin/devis?statut=en_attente",
        label: "Devis",
        icone: FileText,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/devis?statut=en_attente", label: "En attente" },
          { href: "/admin/devis?statut=repondu", label: "Répondus" },
          { href: "/admin/devis?statut=resolu", label: "Acceptés / Expirés" },
          { href: "/admin/devis?statut=tous", label: "Tous" },
        ],
      },
      {
        href: "/admin/commandes?statut=en_preparation",
        label: "Commandes",
        icone: Package,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/commandes?statut=en_preparation", label: "En préparation" },
          { href: "/admin/commandes?statut=prete_retrait", label: "Prêtes pour retrait" },
          { href: "/admin/commandes?statut=retiree", label: "Retirées" },
          { href: "/admin/commandes?statut=tous", label: "Toutes" },
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
        href: "/admin/clients?type=particulier",
        label: "Clients",
        icone: Users,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/clients?type=particulier", label: "Particuliers" },
          { href: "/admin/clients?type=entreprise", label: "Entreprises", badge: true },
        ],
      },
      {
        href: "/admin/avis?statut=en_attente_moderation",
        label: "Avis clients",
        icone: Star,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/avis?statut=en_attente_moderation", label: "En attente" },
          { href: "/admin/avis?statut=publie", label: "Publiés" },
          { href: "/admin/avis?statut=rejete", label: "Rejetés" },
          { href: "/admin/avis?statut=tous", label: "Tous" },
        ],
      },
    ],
  },
  {
    titre: "SUPPORT",
    liens: [
      {
        // Raffinement Design — sous-éléments = statuts des tickets (GestionSAV.tsx, même paramètre
        // `statut` que Devis/Commandes), plus « Installations planifiées » qui reste une page distincte
        // (autre modèle de données, cf. app/admin/installations/page.tsx).
        href: "/admin/sav?statut=ouvert",
        label: "Assistance / SAV",
        icone: LifeBuoy,
        rolesAutorises: ["general", "agent_sav"],
        sousLiens: [
          { href: "/admin/sav?statut=ouvert", label: "Ouverts" },
          { href: "/admin/sav?statut=en_cours", label: "En cours" },
          { href: "/admin/sav?statut=resolu", label: "Résolus" },
          { href: "/admin/sav?statut=ferme", label: "Fermés" },
          { href: "/admin/sav?statut=tous", label: "Tous" },
          { href: "/admin/installations", label: "Installations planifiées" },
        ],
      },
    ],
  },
  {
    titre: "CONTENU",
    liens: [
      {
        href: "/admin/contenu?onglet=faq",
        label: "Contenu",
        icone: FileQuestion,
        rolesAutorises: ["general", "agent_sav"],
        // "Blog" (ECR-11-002) volontairement omis : la page n'existe pas (hors périmètre, cf. Axe 1
        // de l'audit qualité) — un sous-lien mènerait à une 404. Un sous-lien par onglet en page
        // (GestionContenu.tsx), même granularité que ses 4 pastilles.
        sousLiens: [
          { href: "/admin/contenu?onglet=faq", label: "FAQ" },
          { href: "/admin/contenu?onglet=cgv", label: "CGV" },
          { href: "/admin/contenu?onglet=confidentialite", label: "Confidentialité" },
          { href: "/admin/contenu?onglet=mentions-legales", label: "Mentions légales" },
        ],
      },
    ],
  },
  {
    titre: "PILOTAGE",
    liens: [
      { href: "/admin/statistiques", label: "Statistiques", icone: BarChart3, rolesAutorises: ["general"] },
      { href: "/admin/rapports", label: "Rapports financiers", icone: FileBarChart, rolesAutorises: ["general"] },
    ],
  },
];

// Bas de page, sans groupe.
const LIENS_BAS_DE_PAGE: LienAdmin[] = [
  {
    href: "/admin/parametres?onglet=taux-change",
    label: "Paramètres généraux",
    icone: ShieldCheck,
    rolesAutorises: ["general"],
    // "Notifications" volontairement omis : pas d'infrastructure d'envoi réel dans cette démo, déjà
    // signalé dans app/admin/parametres/page.tsx — un sous-lien vers un réglage sans effet aurait été trompeur.
    // Raffinement Design — Taux de change et Langues sont désormais 2 onglets séparés (paramètre
    // `onglet`, GestionParametres.tsx) plutôt que 2 blocs reliés par ancre sur la même page.
    sousLiens: [
      { href: "/admin/parametres?onglet=taux-change", label: "Taux de change" },
      { href: "/admin/parametres?onglet=langues", label: "Langues" },
    ],
  },
  { href: "/admin/comptes", label: "Comptes administrateurs", icone: ShieldCheck, rolesAutorises: ["general"] },
  {
    href: "/admin/agents-sav",
    label: "Agents SAV",
    icone: UserCog,
    rolesAutorises: ["general"],
    sousLiens: [
      { href: "/admin/agents-sav", label: "Annuaire" },
      { href: "/admin/agents-sav/historique", label: "Historique des actions" },
    ],
  },
];

function chemin(href: string): string {
  return href.split("?")[0].split("#")[0];
}

function estActif(pathname: string, href: string): boolean {
  const cible = chemin(href);
  return cible === "/admin" ? pathname === "/admin" : pathname.startsWith(cible);
}

// Raffinement Design — correspondance stricte pour un sous-lien, contrairement à estActif ci-dessus
// (préfixe large, pour savoir si la section parente doit être dépliée/surlignée) : un sous-lien ne doit
// être surligné en bleu que si l'URL courante correspond exactement à SON état (même chemin, même valeur
// du paramètre de requête distinctif — categorie/statut/methode/type/onglet selon la section — ou même
// ancre pour Paramètres généraux). Un sous-lien sans paramètre (ex. « Tous les paiements ») n'est actif
// que si l'URL actuelle n'a elle-même aucun paramètre de requête pour ce chemin, sinon un autre sous-lien
// du même groupe est plus spécifique et doit être surligné à sa place.
function estSousLienActif(pathname: string, searchParams: URLSearchParams, hashActuel: string, href: string): boolean {
  const [avantHash, hashPart] = href.includes("#") ? href.split("#") : [href, undefined];
  const [hrefPath, hrefQuery] = avantHash.split("?");

  if (pathname !== hrefPath) return false;
  if (hashPart !== undefined) return hashActuel === `#${hashPart}`;

  const hrefParams = new URLSearchParams(hrefQuery ?? "");
  const clesHref = [...hrefParams.keys()];
  if (clesHref.length === 0) return [...searchParams.keys()].length === 0;
  return clesHref.every((cle) => searchParams.get(cle) === hrefParams.get(cle));
}

// Un parent se déplie aussi si l'URL active correspond à l'un de ses sous-liens — nécessaire pour
// « Installations planifiées » (sous /admin/installations, hors préfixe /admin/sav).
function LienPrincipal({
  lien,
  pathname,
  searchParams,
  hashActuel,
  onHashClique,
  replie,
  sectionsRepliees,
  onBasculerSection,
  onEntreeSection,
  badge,
}: {
  lien: LienAdmin;
  pathname: string;
  searchParams: URLSearchParams;
  hashActuel: string;
  // La navigation Next.js (<Link>) passe par history.pushState(), qui ne déclenche PAS l'évènement natif
  // hashchange (contrairement à un vrai changement de page ou history.back/forward) — sans ce callback,
  // un clic sur un sous-lien d'ancre ne mettrait à jour le surlignage qu'après un rechargement complet.
  onHashClique: (hash: string) => void;
  // Rail d'icônes (bouton global en haut de la sidebar) : plus aucun sous-lien nulle part tant qu'il est actif.
  replie: boolean;
  // Repli manuel par section (reclic sur une section déjà active), indépendant du rail global — clé =
  // chemin(lien.href), stable même si l'URL du lien porte un paramètre de requête.
  sectionsRepliees: Set<string>;
  onBasculerSection: (cle: string) => void;
  onEntreeSection: (cle: string) => void;
  badge?: number;
}) {
  const actif =
    estActif(pathname, lien.href) || (lien.sousLiens?.some((sl) => estActif(pathname, sl.href)) ?? false);
  const cle = chemin(lien.href);
  const deplie = actif && !replie && !sectionsRepliees.has(cle);
  const Icone = lien.icone;

  function onClicParent(e: React.MouseEvent<HTMLAnchorElement>) {
    if (replie || !lien.sousLiens) return; // rail d'icônes ou rien à replier : navigation normale
    if (actif) {
      // Déjà sur cette section : un reclic replie/déplie directement plutôt que de renaviguer sur place.
      e.preventDefault();
      onBasculerSection(cle);
    } else {
      // Nouvelle section : on s'assure qu'elle s'affiche dépliée (pas de repli résiduel d'une visite précédente).
      onEntreeSection(cle);
    }
  }

  return (
    <div>
      <Link
        href={lien.href}
        onClick={onClicParent}
        title={replie ? lien.label : undefined}
        className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          actif ? "bg-primaire text-white" : "text-texte-principal hover:bg-background"
        } ${replie ? "justify-center" : ""}`}
      >
        <Icone size={17} className="shrink-0" />
        {!replie && <span className="flex-1">{lien.label}</span>}
        {!replie && !!badge && (
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-white">{badge}</span>
        )}
        {replie && !!badge && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />}
      </Link>
      {deplie && lien.sousLiens && (
        <div className="mt-1 flex flex-col gap-0.5 border-l border-bordure pl-4">
          {lien.sousLiens.map((sl) => {
            const slActif = estSousLienActif(pathname, searchParams, hashActuel, sl.href);
            const indexAncre = sl.href.indexOf("#");
            return (
              <Link
                key={sl.href}
                href={sl.href}
                onClick={indexAncre !== -1 ? () => onHashClique(sl.href.slice(indexAncre)) : undefined}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  slActif ? "bg-primaire text-white font-medium" : "text-texte-secondaire hover:bg-background hover:text-texte-principal"
                }`}
              >
                <span className="flex-1">{sl.label}</span>
                {sl.badge && !!badge && (
                  <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ role }: { role: RoleAdmin }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const deconnecter = useSessionStore((s) => s.deconnecter);

  // Les sous-liens de Paramètres généraux pointent vers des ancres (#langues, #taux-change), pas des
  // paramètres de requête — usePathname()/useSearchParams() ne les voient pas, donc on lit
  // window.location.hash directement. L'évènement hashchange couvre une navigation directe avec ancre
  // dans l'URL ; le clic sur un sous-lien depuis la page (LienPrincipal, onHashClique ci-dessous) met à
  // jour ce state explicitement, car <Link> navigue via history.pushState() qui NE déclenche PAS
  // hashchange (contrairement à un vrai rechargement ou history.back/forward).
  const [hashActuel, setHashActuel] = useState("");
  useEffect(() => {
    function lireHash() {
      setHashActuel(window.location.hash);
    }
    lireHash();
    window.addEventListener("hashchange", lireHash);
    return () => window.removeEventListener("hashchange", lireHash);
  }, [pathname]);

  // Raffinement Design — bouton global (rail d'icônes, desktop uniquement — la barre mobile en haut de
  // page suit déjà une mise en page différente) + repli manuel par section (reclic sur la section active).
  const [replie, setReplie] = useState(false);
  const [sectionsRepliees, setSectionsRepliees] = useState<Set<string>>(new Set());
  function basculerSection(cle: string) {
    setSectionsRepliees((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(cle)) suivant.delete(cle);
      else suivant.add(cle);
      return suivant;
    });
  }
  function entrerDansSection(cle: string) {
    setSectionsRepliees((prev) => {
      if (!prev.has(cle)) return prev;
      const suivant = new Set(prev);
      suivant.delete(cle);
      return suivant;
    });
  }

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
    <nav
      className={`flex shrink-0 flex-col gap-4 border-b border-bordure bg-fond px-3 py-3 md:border-b-0 md:border-r md:px-3 md:py-6 ${
        replie ? "md:w-16" : "md:w-64"
      }`}
    >
      <div className="hidden items-center justify-between px-1 md:flex">
        {!replie && <span className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Menu</span>}
        <button
          type="button"
          onClick={() => setReplie((r) => !r)}
          aria-label={replie ? "Déplier le menu" : "Replier le menu"}
          title={replie ? "Déplier le menu" : "Replier le menu"}
          className={`rounded-md p-1.5 text-texte-secondaire hover:bg-background hover:text-texte-principal ${replie ? "mx-auto" : ""}`}
        >
          {replie ? <ChevronsUpDown size={16} /> : <ChevronsDownUp size={16} />}
        </button>
      </div>

      <div>
        {filtrerParRole([LIEN_TABLEAU_DE_BORD]).map((l) => (
          <LienPrincipal
            key={l.href}
            lien={l}
            pathname={pathname}
            searchParams={searchParams}
            hashActuel={hashActuel}
            onHashClique={setHashActuel}
            replie={replie}
            sectionsRepliees={sectionsRepliees}
            onBasculerSection={basculerSection}
            onEntreeSection={entrerDansSection}
          />
        ))}
      </div>

      {GROUPES.map((groupe) => {
        const liens = filtrerParRole(groupe.liens);
        if (liens.length === 0) return null;
        return (
          <div key={groupe.titre}>
            {!replie && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                {groupe.titre}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {liens.map((l) => (
                <LienPrincipal
                  key={l.href}
                  lien={l}
                  pathname={pathname}
                  searchParams={searchParams}
                  hashActuel={hashActuel}
                  onHashClique={setHashActuel}
                  replie={replie}
                  sectionsRepliees={sectionsRepliees}
                  onBasculerSection={basculerSection}
                  onEntreeSection={entrerDansSection}
                  badge={chemin(l.href) === "/admin/clients" ? nombreEnAttente : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-auto flex flex-col gap-1 border-t border-bordure pt-3">
        {filtrerParRole(LIENS_BAS_DE_PAGE).map((l) => (
          <LienPrincipal
            key={l.href}
            lien={l}
            pathname={pathname}
            searchParams={searchParams}
            hashActuel={hashActuel}
            onHashClique={setHashActuel}
            replie={replie}
            sectionsRepliees={sectionsRepliees}
            onBasculerSection={basculerSection}
            onEntreeSection={entrerDansSection}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            deconnecter();
            router.push("/");
          }}
          title={replie ? "Déconnexion" : undefined}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-background ${
            replie ? "justify-center" : ""
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          {!replie && "Déconnexion"}
        </button>
      </div>
    </nav>
  );
}
