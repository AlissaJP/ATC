"use client";

// ECR-12-005 (implicite, onglet "Clients" de RG-12-001) — Liste générale des comptes Particulier et
// Entreprise, accessible aux deux rôles admin. Combine les comptes de test seedés
// (lib/mock-data/utilisateurs.ts) et les comptes créés dynamiquement pendant la démo (comptes-store.ts),
// même logique que components/admin/ValidationEntreprises.tsx.
import { useMemo, useState } from "react";
import { Building2, User } from "lucide-react";
import { useComptesStore } from "@/lib/store/comptes-store";
import { utilisateurs as utilisateursSeed, profilsEntreprise as profilsEntrepriseSeed } from "@/lib/mock-data/utilisateurs";
import type { StatutValidationEntreprise, TypeCompte } from "@/lib/types/entities";

const LIBELLES_STATUT: Record<StatutValidationEntreprise, { label: string; classe: string }> = {
  en_attente: { label: "En attente", classe: "bg-avertissement/10 text-avertissement" },
  valide: { label: "B2B vérifié", classe: "bg-succes/10 text-succes" },
  rejete: { label: "Rejeté", classe: "bg-danger/10 text-danger" },
  complement_demande: { label: "Complément demandé", classe: "bg-primaire-clair/10 text-primaire-clair" },
};

export function GestionClients() {
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);
  const [filtre, setFiltre] = useState<TypeCompte | "tous">("tous");
  const [recherche, setRecherche] = useState("");

  const tousLesUtilisateurs = useMemo(() => [...utilisateursSeed, ...utilisateursDynamiques], [utilisateursDynamiques]);
  const tousLesProfils = useMemo(() => [...profilsEntrepriseSeed, ...profilsDynamiques], [profilsDynamiques]);

  const clients = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return tousLesUtilisateurs
      .filter((u) => filtre === "tous" || u.type_compte === filtre)
      .filter((u) => !terme || u.nom.toLowerCase().includes(terme) || u.email.toLowerCase().includes(terme))
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
  }, [tousLesUtilisateurs, filtre, recherche]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Rechercher un client…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
        <div className="flex gap-2">
          {(["tous", "particulier", "entreprise"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltre(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filtre === f ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
              }`}
            >
              {f === "tous" ? "Tous" : f === "particulier" ? "Particulier" : "Entreprise"}
            </button>
          ))}
        </div>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucun client trouvé.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map((c) => {
            const profil = c.type_compte === "entreprise" ? tousLesProfils.find((p) => p.utilisateur_id === c.id) : undefined;
            return (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-bordure bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  {c.type_compte === "entreprise" ? (
                    <Building2 size={18} className="shrink-0 text-texte-secondaire" />
                  ) : (
                    <User size={18} className="shrink-0 text-texte-secondaire" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-texte-principal">
                      {c.nom} {profil?.nom_commercial && <span className="text-texte-secondaire">— {profil.nom_commercial}</span>}
                    </p>
                    <p className="text-xs text-texte-secondaire">
                      {c.email} {c.telephone && `— ${c.telephone}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-texte-secondaire">
                    Depuis le {new Date(c.date_creation).toLocaleDateString("fr-FR")}
                  </span>
                  {profil && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LIBELLES_STATUT[profil.statut_validation].classe}`}>
                      {LIBELLES_STATUT[profil.statut_validation].label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
