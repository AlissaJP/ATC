"use client";

// ECR-12-001 — Tableau de bord admin, structure validée (Raffinement Design, référence Dashboard.avif
// adaptée) : message d'accueil, 4 cartes KPI, graphique « Évolution des ventes », widget « Ventes par
// catégorie », widget « Devis en attente », widget « Dossiers Entreprise en attente ». Remplace
// l'ancienne disposition ad hoc (compteurs de stock/SAV/avis/installations, dernières commandes) —
// ces indicateurs restent accessibles depuis leurs sections dédiées de la barre latérale, désormais
// groupée (VENTES/CLIENTS/SUPPORT/CONTENU/PILOTAGE).
// Vue réduite Agent SAV (RG-12-001) : uniquement Devis en attente (carte + widget) et Commandes du mois —
// ventes, graphique financier et dossiers Entreprise restent réservés à l'Administrateur Général.
import { useMemo } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useDevisStore } from "@/lib/store/devis-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { useSessionStore } from "@/lib/store/session-store";
import { produits } from "@/lib/mock-data/produits";
import { profilsEntreprise as profilsEntrepriseSeed } from "@/lib/mock-data/utilisateurs";
import { enAttenteDepuisPlusDe48h } from "@/lib/business-rules/delai-48h";
import { StatutDevisBadge } from "@/components/devis/StatutDevisBadge";
import { GraphiqueVentes } from "@/components/admin/GraphiqueVentes";
import { VentesParCategorieWidget } from "@/components/admin/VentesParCategorieWidget";
import type { Devis, ProfilEntreprise } from "@/lib/types/entities";

function estMemeJour(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function estMemeMois(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function tendance(actuel: number, precedent: number): string {
  if (precedent <= 0) return actuel > 0 ? "nouveau" : "stable";
  const variation = ((actuel - precedent) / precedent) * 100;
  return `${variation >= 0 ? "+" : ""}${variation.toFixed(0)}% vs période précédente`;
}
function ancienneteDepuis(dateIso: string): string {
  const heures = (Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60);
  if (heures < 24) return `${Math.max(1, Math.round(heures))} h`;
  return `${Math.round(heures / 24)} j`;
}
function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  return mots.slice(0, 2).map((m) => m[0].toUpperCase()).join("");
}

export function TableauDeBord() {
  const session = useSessionStore((s) => s.session);
  const administrateur = session?.type === "admin" ? session.administrateur : null;
  const role = administrateur?.role ?? "agent_sav";
  const prenom = administrateur?.nom.split(" ")[0] ?? "";

  const devis = useDevisStore((s) => s.devis);
  const lignesDevis = useDevisStore((s) => s.lignesDevis);
  const commandes = useCommandeStore((s) => s.commandes);
  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);

  const aujourdhui = useMemo(() => new Date(), []);
  const hier = useMemo(() => new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() - 1), [aujourdhui]);
  const moisDernier = useMemo(() => new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() - 1, 1), [aujourdhui]);

  const ventesDuJour = useMemo(
    () => commandes.filter((c) => estMemeJour(new Date(c.date_creation), aujourdhui)).reduce((s, c) => s + c.montant_total, 0),
    [commandes, aujourdhui]
  );
  const ventesHier = useMemo(
    () => commandes.filter((c) => estMemeJour(new Date(c.date_creation), hier)).reduce((s, c) => s + c.montant_total, 0),
    [commandes, hier]
  );

  const commandesDuMois = useMemo(
    () => commandes.filter((c) => estMemeMois(new Date(c.date_creation), aujourdhui)),
    [commandes, aujourdhui]
  );
  const commandesMoisDernier = useMemo(
    () => commandes.filter((c) => estMemeMois(new Date(c.date_creation), moisDernier)),
    [commandes, moisDernier]
  );

  const devisEnAttente = useMemo(() => devis.filter((d) => d.statut === "en_attente"), [devis]);
  const devisEnAttentePlus48h = useMemo(
    () => devisEnAttente.filter((d) => enAttenteDepuisPlusDe48h(d.date_creation)).length,
    [devisEnAttente]
  );

  const tousLesProfils = useMemo(() => {
    const idsDynamiques = new Set(profilsDynamiques.map((p) => p.id));
    const seedsNonAdoptes = profilsEntrepriseSeed.filter((p) => !idsDynamiques.has(p.id));
    return [...seedsNonAdoptes, ...profilsDynamiques];
  }, [profilsDynamiques]);
  const comptesEntrepriseActifs = useMemo(
    () => tousLesProfils.filter((p) => p.statut_validation === "valide").length,
    [tousLesProfils]
  );
  const dossiersEntrepriseEnAttente = useMemo(
    () =>
      tousLesProfils
        .filter((p) => p.statut_validation === "en_attente")
        .sort((a, b) => new Date(a.date_soumission).getTime() - new Date(b.date_soumission).getTime()),
    [tousLesProfils]
  );

  const devisPourWidget = useMemo(
    () =>
      devis
        .filter((d) => d.statut === "en_attente" || d.statut === "repondu")
        .sort((a, b) => new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime())
        .slice(0, 6),
    [devis]
  );

  function montantEstime(d: Devis): number {
    if (d.statut === "repondu" && d.prix_total !== undefined) return d.prix_total;
    return lignesDevis
      .filter((l) => l.devis_id === d.id)
      .reduce((s, l) => s + (produits.find((p) => p.id === l.produit_id)?.prix_public ?? 0) * l.quantite, 0);
  }
  function nomEntreprise(p: ProfilEntreprise): string {
    return p.nom_commercial ?? p.nom_legal;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-titres text-2xl font-bold text-texte-principal">Tableau de bord</h1>
        <p className="mt-1 text-sm text-texte-secondaire">
          Bonjour {prenom} — voici un résumé de l&apos;activité aujourd&apos;hui.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {role === "general" && (
          <div className="rounded-xl border border-bordure bg-background p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Ventes du jour</p>
            <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">${ventesDuJour.toFixed(2)}</p>
            <p className="mt-1 text-xs text-texte-secondaire">{tendance(ventesDuJour, ventesHier)}</p>
          </div>
        )}

        <Link href="/admin/devis?statut=en_attente" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
          <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Devis en attente</p>
          <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{devisEnAttente.length}</p>
          <p className="mt-1 text-xs text-texte-secondaire">
            {devisEnAttentePlus48h > 0 ? `dont ${devisEnAttentePlus48h} depuis plus de 48h` : "aucun en retard (+48h)"}
          </p>
        </Link>

        <Link href="/admin/commandes" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
          <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Commandes du mois</p>
          <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{commandesDuMois.length}</p>
          <p className="mt-1 text-xs text-texte-secondaire">{tendance(commandesDuMois.length, commandesMoisDernier.length)}</p>
        </Link>

        {role === "general" && (
          <Link href="/admin/entreprises" className="rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire">
            <p className="text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Comptes Entreprise actifs</p>
            <p className="mt-2 font-titres text-2xl font-bold text-texte-principal">{comptesEntrepriseActifs}</p>
            <p className="mt-1 text-xs text-texte-secondaire">
              {dossiersEntrepriseEnAttente.length} dossier(s) en attente de vérification
            </p>
          </Link>
        )}
      </div>

      {role === "general" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 print:col-span-3">
            <GraphiqueVentes commandes={commandes} />
          </div>
          <div className="print:hidden">
            <VentesParCategorieWidget />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 print:hidden">
        <div className="rounded-xl border border-bordure bg-background p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-titres text-base font-semibold text-texte-principal">Devis en attente</p>
            <Link href="/admin/devis" className="text-sm font-medium text-primaire hover:underline">
              Voir tous les devis
            </Link>
          </div>
          {devisPourWidget.length === 0 ? (
            <p className="text-sm text-texte-secondaire">Aucun devis en attente ou récemment répondu.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {devisPourWidget.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-bordure px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <StatutDevisBadge statut={d.statut} />
                      <span className="text-xs text-texte-secondaire">{ancienneteDepuis(d.date_creation)}</span>
                    </div>
                    <p className="truncate text-sm font-medium text-texte-principal">${montantEstime(d).toFixed(2)} estimé</p>
                  </div>
                  <Link
                    href="/admin/devis?statut=en_attente"
                    className="flex shrink-0 items-center gap-1 text-sm font-medium text-primaire hover:underline"
                  >
                    <FileText size={14} /> Traiter
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {role === "general" && (
          <div className="rounded-xl border border-bordure bg-background p-5">
            <p className="mb-3 font-titres text-base font-semibold text-texte-principal">Dossiers Entreprise en attente</p>
            {dossiersEntrepriseEnAttente.length === 0 ? (
              <p className="text-sm text-texte-secondaire">Aucun dossier en attente de vérification.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dossiersEntrepriseEnAttente.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-bordure px-3 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaire-clair text-xs font-semibold text-white">
                      {initiales(nomEntreprise(p))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-texte-principal">{nomEntreprise(p)}</p>
                      <p className="truncate text-xs text-texte-secondaire">{p.email_professionnel}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-texte-secondaire">{new Date(p.date_soumission).toLocaleDateString("fr-FR")}</p>
                      {enAttenteDepuisPlusDe48h(p.date_soumission) && (
                        <span className="rounded-full bg-danger/10 px-1.5 py-0.5 text-[11px] font-semibold text-danger">+48h</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/admin/entreprises" className="mt-3 block text-sm font-medium text-primaire hover:underline">
              Voir tous les dossiers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
