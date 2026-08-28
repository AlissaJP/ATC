import { produits } from "@/lib/mock-data/produits";
import { CreationPackage } from "@/components/admin/CreationPackage";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// BF-12-003 — Page dédiée à la création d'un package pré-configuré (Général uniquement — RG-12-001),
// distincte de la fenêtre modale d'édition (GestionPackages.tsx, Raffinement Design).
export default function AdminNouveauPackagePage() {
  const produitsEligibles = produits.filter((p) => p.eligible_package);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Nouveau package</h1>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <CreationPackage produitsEligibles={produitsEligibles} />
      </GardeRoleAdmin>
    </main>
  );
}
