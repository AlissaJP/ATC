import { GestionParametres, type OngletParametres } from "@/components/admin/GestionParametres";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

const ONGLETS_VALIDES: OngletParametres[] = ["taux-change", "langues"];

// BF-12-015 (Must have) — Paramètres généraux (back-office, Général uniquement).
//
// `onglet` : reçu des sous-liens de la sidebar (Section Administration, Raffinement Design), même idiome
// que /admin/devis.
export default async function AdminParametresPage(props: PageProps<"/admin/parametres">) {
  const { onglet } = await props.searchParams;
  const ongletInitial: OngletParametres = ONGLETS_VALIDES.includes(onglet as OngletParametres)
    ? (onglet as OngletParametres)
    : "taux-change";

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Paramètres généraux</h1>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <GestionParametres ongletInitial={ongletInitial} />
      </GardeRoleAdmin>
    </main>
  );
}
