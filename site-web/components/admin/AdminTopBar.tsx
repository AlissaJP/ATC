"use client";

// ECR-12-001 — Barre du haut du back-office : recherche (produit/client/commande), notifications
// (agrégation d'éléments en attente de traitement, pas d'envoi réel — décision actée n°41), profil de
// l'administrateur connecté. Remplace la barre de texte simple précédente (app/admin/layout.tsx).
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useDevisStore } from "@/lib/store/devis-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { useSavStore } from "@/lib/store/sav-store";
import { produits } from "@/lib/mock-data/produits";
import { utilisateurs as utilisateursSeed, profilsEntreprise as profilsEntrepriseSeed } from "@/lib/mock-data/utilisateurs";
import { enAttenteDepuisPlusDe48h } from "@/lib/business-rules/delai-48h";
import type { Administrateur, Produit, Utilisateur } from "@/lib/types/entities";

function initiales(nom: string): string {
  const mots = nom.replace(/\(.*?\)/g, "").trim().split(/\s+/).filter(Boolean);
  return mots.slice(0, 2).map((m) => m[0].toUpperCase()).join("");
}

interface ResultatCommande {
  id: string;
  nomClient: string;
  montant: number;
}

export function AdminTopBar({ administrateur }: { administrateur: Administrateur }) {
  const devis = useDevisStore((s) => s.devis);
  const commandes = useCommandeStore((s) => s.commandes);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);
  const tickets = useSavStore((s) => s.tickets);

  const utilisateursTous: Utilisateur[] = useMemo(
    () => [...utilisateursSeed, ...utilisateursDynamiques],
    [utilisateursDynamiques]
  );

  function nomClient(utilisateurId: string): string {
    return utilisateursTous.find((u) => u.id === utilisateurId)?.nom ?? "Client";
  }

  // --- Recherche ---
  const [requete, setRequete] = useState("");
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const rechercheRef = useRef<HTMLDivElement>(null);

  const terme = requete.trim().toLowerCase();
  const produitsTrouves: Produit[] = useMemo(
    () => (terme.length < 2 ? [] : produits.filter((p) => p.nom.toLowerCase().includes(terme)).slice(0, 4)),
    [terme]
  );
  const clientsTrouves: Utilisateur[] = useMemo(
    () =>
      terme.length < 2
        ? []
        : utilisateursTous.filter((u) => u.nom.toLowerCase().includes(terme) || u.email.toLowerCase().includes(terme)).slice(0, 4),
    [terme, utilisateursTous]
  );
  const commandesTrouvees: ResultatCommande[] = useMemo(() => {
    if (terme.length < 2) return [];
    return commandes
      .filter((c) => c.id.slice(-8).toLowerCase().includes(terme) || nomClient(c.utilisateur_id).toLowerCase().includes(terme))
      .slice(0, 4)
      .map((c) => ({ id: c.id, nomClient: nomClient(c.utilisateur_id), montant: c.montant_total }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terme, commandes, utilisateursTous]);

  const aucunResultat =
    terme.length >= 2 && produitsTrouves.length === 0 && clientsTrouves.length === 0 && commandesTrouvees.length === 0;

  useEffect(() => {
    function surClicExterieur(e: MouseEvent) {
      if (rechercheRef.current && !rechercheRef.current.contains(e.target as Node)) setRechercheOuverte(false);
    }
    document.addEventListener("mousedown", surClicExterieur);
    return () => document.removeEventListener("mousedown", surClicExterieur);
  }, []);

  // --- Notifications (agrégation, pas d'infrastructure d'envoi réelle) ---
  const devisEnAttentePlus48h = useMemo(
    () => devis.filter((d) => d.statut === "en_attente" && enAttenteDepuisPlusDe48h(d.date_creation)).length,
    [devis]
  );
  const ticketsOuverts = useMemo(() => tickets.filter((t) => t.statut === "ouvert").length, [tickets]);
  const dossiersEntreprisePlus48h = useMemo(() => {
    const idsDynamiques = new Set(profilsDynamiques.map((p) => p.id));
    const seedsNonAdoptes = profilsEntrepriseSeed.filter((p) => !idsDynamiques.has(p.id));
    return [...seedsNonAdoptes, ...profilsDynamiques].filter(
      (p) => p.statut_validation === "en_attente" && enAttenteDepuisPlusDe48h(p.date_soumission)
    ).length;
  }, [profilsDynamiques]);

  const notifications = [
    devisEnAttentePlus48h > 0 && {
      texte: `${devisEnAttentePlus48h} devis en attente depuis plus de 48h`,
      lien: "/admin/devis?statut=en_attente",
    },
    administrateur.role === "general" &&
      dossiersEntreprisePlus48h > 0 && {
        texte: `${dossiersEntreprisePlus48h} dossier(s) Entreprise en attente depuis plus de 48h`,
        lien: "/admin/clients?type=entreprise",
      },
    ticketsOuverts > 0 && { texte: `${ticketsOuverts} ticket(s) SAV ouvert(s)`, lien: "/admin/sav" },
  ].filter(Boolean) as { texte: string; lien: string }[];

  const [notifOuvertes, setNotifOuvertes] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function surClicExterieur(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOuvertes(false);
    }
    document.addEventListener("mousedown", surClicExterieur);
    return () => document.removeEventListener("mousedown", surClicExterieur);
  }, []);

  return (
    <div className="flex items-center gap-4 border-b border-bordure bg-fond px-4 py-3 md:px-6">
      <div ref={rechercheRef} className="relative max-w-sm flex-1">
        <div className="flex items-center gap-2 rounded-full border border-bordure bg-background px-3 py-2">
          <Search size={16} className="shrink-0 text-texte-secondaire" />
          <input
            type="text"
            value={requete}
            onChange={(e) => {
              setRequete(e.target.value);
              setRechercheOuverte(true);
            }}
            onFocus={() => setRechercheOuverte(true)}
            placeholder="Rechercher un produit, un client, une commande…"
            aria-label="Rechercher un produit, un client ou une commande"
            className="w-full bg-transparent text-sm text-texte-principal placeholder:text-texte-secondaire focus:outline-none"
          />
        </div>

        {rechercheOuverte && terme.length >= 2 && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-xl border border-bordure bg-background shadow-lg">
            {aucunResultat && <p className="px-3 py-3 text-sm text-texte-secondaire">Aucun résultat pour « {requete} ».</p>}

            {produitsTrouves.length > 0 && (
              <div className="border-b border-bordure py-1">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Produits</p>
                {produitsTrouves.map((p) => (
                  <Link
                    key={p.id}
                    href="/admin/catalogue"
                    onClick={() => setRechercheOuverte(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-fond"
                  >
                    <span className="truncate text-texte-principal">{p.nom}</span>
                    <span className="shrink-0 text-texte-secondaire">${p.prix_public.toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            )}

            {clientsTrouves.length > 0 && (
              <div className="border-b border-bordure py-1">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Clients</p>
                {clientsTrouves.map((u) => (
                  <Link
                    key={u.id}
                    href={u.type_compte === "entreprise" ? "/admin/clients?type=entreprise" : "/admin/clients?type=particulier"}
                    onClick={() => setRechercheOuverte(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-fond"
                  >
                    <span className="truncate text-texte-principal">{u.nom}</span>
                    <span className="shrink-0 truncate text-xs text-texte-secondaire">{u.email}</span>
                  </Link>
                ))}
              </div>
            )}

            {commandesTrouvees.length > 0 && (
              <div className="py-1">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Commandes</p>
                {commandesTrouvees.map((c) => (
                  <Link
                    key={c.id}
                    href="/admin/commandes"
                    onClick={() => setRechercheOuverte(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-fond"
                  >
                    <span className="truncate text-texte-principal">
                      #{c.id.slice(-8).toUpperCase()} — {c.nomClient}
                    </span>
                    <span className="shrink-0 text-texte-secondaire">${c.montant.toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={() => setNotifOuvertes((v) => !v)}
          aria-label="Notifications"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-texte-secondaire hover:bg-background"
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
          )}
        </button>

        {notifOuvertes && (
          <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-bordure bg-background shadow-lg">
            {notifications.length === 0 ? (
              <p className="px-3 py-3 text-sm text-texte-secondaire">Rien à signaler pour le moment.</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.lien + n.texte}
                  href={n.lien}
                  onClick={() => setNotifOuvertes(false)}
                  className="block border-b border-bordure px-3 py-2.5 text-sm text-texte-principal last:border-b-0 hover:bg-fond"
                >
                  {n.texte}
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primaire text-sm font-semibold text-white">
          {initiales(administrateur.nom)}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-texte-principal">{administrateur.nom}</p>
          <p className="text-xs text-texte-secondaire">
            {administrateur.role === "general" ? "Administrateur Général" : "Agent SAV"}
          </p>
        </div>
      </div>
    </div>
  );
}
