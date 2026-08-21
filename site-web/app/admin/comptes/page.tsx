import { ShieldCheck } from "lucide-react";
import { administrateurs } from "@/lib/mock-data/administrateurs";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// ECR-12-006 ("Should have") — Comptes administrateurs. Lecture seule : RG-12-001 fixe exactement 2 rôles
// non personnalisables (décision actée n°20), il n'y a donc rien à créer/modifier ici. Réservé au rôle
// Général par cohérence avec les autres écrans de gestion des accès — le Cahier ne précise pas
// explicitement ce point pour cet écran "Should have", signalé à l'utilisateur.
export default function AdminComptesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal">Comptes administrateurs</h1>
      <p className="mb-6 text-sm text-texte-secondaire">
        Exactement deux rôles administrateurs, non personnalisables (RG-12-001).
      </p>

      <GardeRoleAdmin rolesAutorises={["general"]}>
        <div className="flex flex-col gap-3">
          {administrateurs.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-4">
              <ShieldCheck size={20} className="shrink-0 text-primaire-clair" />
              <div>
                <p className="text-sm font-medium text-texte-principal">{a.nom}</p>
                <p className="text-xs text-texte-secondaire">{a.email}</p>
              </div>
              <span className="ml-auto rounded-full bg-fond px-2.5 py-1 text-xs font-semibold text-texte-principal">
                {a.role === "general" ? "Administrateur Général" : "Agent SAV"}
              </span>
            </div>
          ))}
        </div>
      </GardeRoleAdmin>
    </main>
  );
}
