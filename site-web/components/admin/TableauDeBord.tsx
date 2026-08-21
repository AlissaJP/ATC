"use client";

// ECR-12-001 — Tableau de bord admin. Widgets : ventes du jour/mois, devis en attente, produits en
// alerte de stock, dossiers Entreprise en attente, tickets SAV ouverts (EPIC-09), avis en attente de
// modération (RG-12-002), dernières commandes.
// Les compteurs devis/commandes/Entreprise/SAV/avis lisent les stores Zustand (état interactif de démo,
// décision actée n°41) ; le compteur de stock est calculé côté serveur (app/admin/page.tsx) car il dépend
// du catalogue, lu depuis les Server Components (voir lib/actions/catalogue-admin.ts).
import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Building2, FileText, LifeBuoy, Package, Star, Tags, Wrench } from "lucide-react";
import { useDevisStore } from "@/lib/store/devis-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { useSavStore } from "@/lib/store/sav-store";
import { useAvisStore } from "@/lib/store/avis-store";
import { useInstallationStore } from "@/lib/store/installation-store";
import { utilisateurs as utilisateursSeed, profilsEntreprise as profilsEntrepriseSeed } from "@/lib/mock-data/utilisateurs";
import { useSessionStore } from "@/lib/store/session-store";
import { StatutCommandeBadge } from "@/components/commande/StatutCommandeBadge";

function estAujourdhui(dateIso: string): boolean {
  const d = new Date(dateIso);
  const auj = new Date();
  return d.getFullYear() === auj.getFullYear() && d.getMonth() === auj.getMonth() && d.getDate() === auj.getDate();
}

function estCeMois(dateIso: string): boolean {
  const d = new Date(dateIso);
  const auj = new Date();
  return d.getFullYear() === auj.getFullYear() && d.getMonth() === auj.getMonth();
}

function nomClient(utilisateurId: string, utilisateursDynamiques: typeof utilisateursSeed): string {
  return (
    utilisateursSeed.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client"
  );
}

export function TableauDeBord({ produitsEnAlerte }: { produitsEnAlerte: number }) {
  const session = useSessionStore((s) => s.session);
  const role = session?.type === "admin" ? session.administrateur.role : "agent_sav";

  const devis = useDevisStore((s) => s.devis);
  const commandes = useCommandeStore((s) => s.commandes);
  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const tickets = useSavStore((s) => s.tickets);
  const avis = useAvisStore((s) => s.avis);
  const installations = useInstallationStore((s) => s.installations);

  const devisEnAttente = useMemo(() => devis.filter((d) => d.statut === "en_attente").length, [devis]);
  const ticketsOuverts = useMemo(() => tickets.filter((t) => t.statut === "ouvert").length, [tickets]);
  const avisEnAttente = useMemo(() => avis.filter((a) => a.statut === "en_attente_moderation").length, [avis]);
  const installationsPlanifiees = useMemo(() => installations.filter((i) => i.statut === "planifie").length, [installations]);

  const ventesDuJour = useMemo(
    () => commandes.filter((c) => estAujourdhui(c.date_creation)).reduce((s, c) => s + c.montant_total, 0),
    [commandes]
  );
  const ventesDuMois = useMemo(
    () => commandes.filter((c) => estCeMois(c.date_creation)).reduce((s, c) => s + c.montant_total, 0),
    [commandes]
  );

  const dernieresCommandes = useMemo(
    () => [...commandes].sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()).slice(0, 5),
    [commandes]
  );

  const dossiersEntrepriseEnAttente = useMemo(() => {
    const idsDynamiques = new Set(profilsDynamiques.map((p) => p.id));
    const seedsNonAdoptes = profilsEntrepriseSeed.filter((p) => !idsDynamiques.has(p.id));
    return [...seedsNonAdoptes, ...profilsDynamiques].filter((p) => p.statut_validation === "en_attente").length;
  }, [profilsDynamiques]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-bordure bg-background p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Ventes du jour</p>
          <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">${ventesDuJour.toFixed(2)}</p>
          <p className="mt-1 text-xs text-texte-secondaire">Ce mois : ${ventesDuMois.toFixed(2)}</p>
        </div>

        <Link href="/admin/devis" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
          <div className="flex items-center gap-2 text-texte-secondaire">
            <FileText size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Devis en attente</p>
          </div>
          <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{devisEnAttente}</p>
        </Link>

        {role === "general" && (
          <Link href="/admin/catalogue" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
            <div className="flex items-center gap-2 text-texte-secondaire">
              <AlertTriangle size={16} />
              <p className="text-xs font-semibold uppercase tracking-wide">Produits en alerte de stock</p>
            </div>
            <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{produitsEnAlerte}</p>
          </Link>
        )}

        <Link href="/admin/entreprises" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
          <div className="flex items-center gap-2 text-texte-secondaire">
            <Building2 size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Dossiers Entreprise en attente</p>
          </div>
          <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{dossiersEntrepriseEnAttente}</p>
        </Link>

        <Link href="/admin/sav" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
          <div className="flex items-center gap-2 text-texte-secondaire">
            <LifeBuoy size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Tickets SAV ouverts</p>
          </div>
          <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{ticketsOuverts}</p>
        </Link>

        <Link href="/admin/avis" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
          <div className="flex items-center gap-2 text-texte-secondaire">
            <Star size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Avis en attente de modération</p>
          </div>
          <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{avisEnAttente}</p>
        </Link>

        <Link href="/admin/installations" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
          <div className="flex items-center gap-2 text-texte-secondaire">
            <Wrench size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Installations planifiées</p>
          </div>
          <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{installationsPlanifiees}</p>
        </Link>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-titres text-lg font-semibold text-texte-principal">Dernières commandes</h2>
          <Link href="/admin/commandes" className="flex items-center gap-1 text-sm font-medium text-primaire hover:underline">
            <Package size={14} /> Voir toutes
          </Link>
        </div>
        {dernieresCommandes.length === 0 ? (
          <p className="text-sm text-texte-secondaire">Aucune commande pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {dernieresCommandes.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-bordure bg-background px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-texte-principal">
                    #{c.id.slice(-8).toUpperCase()} — {nomClient(c.utilisateur_id, utilisateursDynamiques)}
                  </p>
                  <p className="text-xs text-texte-secondaire">
                    {new Date(c.date_creation).toLocaleDateString("fr-FR")} — ${c.montant_total.toFixed(2)}
                  </p>
                </div>
                <StatutCommandeBadge statut={c.statut} />
              </div>
            ))}
          </div>
        )}
      </div>

      {role === "general" && (
        <Link
          href="/admin/catalogue"
          className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire"
        >
          <Tags size={24} className="text-primaire-clair" />
          <div>
            <p className="font-titres text-sm font-semibold text-texte-principal">Gestion du catalogue</p>
            <p className="text-sm text-texte-secondaire">Produits, stock et barème B2B (ECR-12-002)</p>
          </div>
        </Link>
      )}
    </div>
  );
}
