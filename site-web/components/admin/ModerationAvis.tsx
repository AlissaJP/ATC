"use client";

// ECR-12-003 — Modération des avis clients (back-office). RG-12-002, BF-12-012. Accessible aux deux
// rôles admin (UC-12-003, acteurs ADM-G et ADM-S).
import { useMemo, useState } from "react";
import { Check, Star, X } from "lucide-react";
import { useAvisStore } from "@/lib/store/avis-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import { produits } from "@/lib/mock-data/produits";
import type { AvisClient, StatutAvis } from "@/lib/types/entities";

function nomClient(utilisateurId: string, utilisateursDynamiques: typeof utilisateursSeed): string {
  return (
    utilisateursSeed.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client"
  );
}

function nomProduit(produitId: string): string {
  return produits.find((p) => p.id === produitId)?.nom ?? "Produit";
}

const LIBELLES_STATUT: Record<StatutAvis, { label: string; classe: string }> = {
  en_attente_moderation: { label: "En attente", classe: "bg-avertissement/10 text-avertissement" },
  publie: { label: "Publié", classe: "bg-succes/10 text-succes" },
  rejete: { label: "Rejeté", classe: "bg-danger/10 text-danger" },
};

function LigneAvis({ avis, utilisateursDynamiques }: { avis: AvisClient; utilisateursDynamiques: typeof utilisateursSeed }) {
  const approuverAvis = useAvisStore((s) => s.approuverAvis);
  const rejeterAvis = useAvisStore((s) => s.rejeterAvis);

  return (
    <div className="rounded-xl border border-bordure bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-texte-principal">{nomProduit(avis.produit_id)}</p>
          <p className="text-xs text-texte-secondaire">
            {nomClient(avis.utilisateur_id, utilisateursDynamiques)} —{" "}
            {new Date(avis.date_creation).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LIBELLES_STATUT[avis.statut].classe}`}>
          {LIBELLES_STATUT[avis.statut].label}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={14} className={n <= avis.note ? "fill-avertissement text-avertissement" : "text-bordure"} />
        ))}
      </div>
      {avis.titre && <p className="mt-2 text-sm font-semibold text-texte-principal">{avis.titre}</p>}
      {avis.commentaire && <p className="mt-1 text-sm text-texte-secondaire">{avis.commentaire}</p>}
      {avis.statut === "en_attente_moderation" && (
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => approuverAvis(avis.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-succes px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            <Check size={14} /> Approuver
          </button>
          <button
            type="button"
            onClick={() => rejeterAvis(avis.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/5"
          >
            <X size={14} /> Rejeter
          </button>
        </div>
      )}
    </div>
  );
}

// filtreInitial : reçu de la page (Server Component, lit searchParams) pour les sous-liens de la
// navigation latérale (Section Administration, Raffinement Design).
export function ModerationAvis({ filtreInitial = "en_attente_moderation" }: { filtreInitial?: StatutAvis | "tous" }) {
  const tousLesAvis = useAvisStore((s) => s.avis);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const [filtre, setFiltre] = useState<StatutAvis | "tous">(filtreInitial);

  // Un clic sur un sous-lien de la sidebar navigue vers la même route avec un `statut` différent : React
  // ne réinitialise pas l'état local de ce composant client pour autant, donc on resynchronise le filtre
  // pendant le rendu plutôt qu'un useEffect (même correction que TraitementDevis.tsx/GestionCatalogue.tsx).
  const [filtreInitialTraite, setFiltreInitialTraite] = useState(filtreInitial);
  if (filtreInitial !== filtreInitialTraite) {
    setFiltreInitialTraite(filtreInitial);
    setFiltre(filtreInitial);
  }

  const filtres: { valeur: StatutAvis | "tous"; label: string }[] = [
    { valeur: "en_attente_moderation", label: "En attente" },
    { valeur: "publie", label: "Publiés" },
    { valeur: "rejete", label: "Rejetés" },
    { valeur: "tous", label: "Tous" },
  ];

  const avisFiltres = useMemo(
    () =>
      [...tousLesAvis]
        .filter((a) => filtre === "tous" || a.statut === filtre)
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()),
    [tousLesAvis, filtre]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltre(f.valeur)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filtre === f.valeur ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {avisFiltres.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucun avis dans ce filtre.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {avisFiltres.map((a) => (
            <LigneAvis key={a.id} avis={a} utilisateursDynamiques={utilisateursDynamiques} />
          ))}
        </div>
      )}
    </div>
  );
}
