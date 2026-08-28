import { packagesPreconfigures } from "@/lib/mock-data/packages-preconfigures";
import { produits } from "@/lib/mock-data/produits";
import { GestionPackages } from "@/components/admin/GestionPackages";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// BF-12-003 (Must have) — Création/édition des packages pré-configurés (back-office, Général uniquement,
// même restriction que /admin/catalogue — gestion de catalogue/prix, RG-12-001).
//
// `package` (id) : reçu de CreationPackage.tsx après une création réussie, pour ouvrir directement la
// fenêtre d'édition du package nouvellement créé (même idiome que `produit` sur /admin/catalogue).
export default async function AdminPackagesPage(props: PageProps<"/admin/packages">) {
  const { package: packageId } = await props.searchParams;
  const packageInitial = typeof packageId === "string" ? packageId : undefined;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Packages pré-configurés</h1>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <GestionPackages packages={packagesPreconfigures} produits={produits} packageInitial={packageInitial} />
      </GardeRoleAdmin>
    </main>
  );
}
