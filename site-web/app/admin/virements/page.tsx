import { GestionVirements } from "@/components/admin/GestionVirements";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// Virements bancaires à vérifier — validation manuelle de la preuve de paiement, réservée à l'Administrateur
// Général (opération financière, comme le reste de la section Paiements). Aucune commande réglée par
// virement n'est considérée comme validée avant cette vérification.
export default function AdminVirementsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal">Virements à vérifier</h1>
      <p className="mb-6 text-sm text-texte-secondaire">
        Examinez la preuve envoyée par le client, puis validez le paiement une fois le montant reçu sur le compte ATC.
      </p>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <GestionVirements />
      </GardeRoleAdmin>
    </main>
  );
}
