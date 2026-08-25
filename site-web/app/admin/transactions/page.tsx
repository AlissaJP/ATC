import { GestionTransactions } from "@/components/admin/GestionTransactions";
import type { MethodePaiement } from "@/lib/types/entities";

// BF-12-008 — Suivi des paiements par méthode + factures pro forma (back-office). Renommé
// "Transactions" → "Paiements" dans la navigation (Raffinement Design, Section Administration).
const METHODES_VALIDES: MethodePaiement[] = ["moncash", "carte", "paypal"];

export default async function AdminTransactionsPage(props: PageProps<"/admin/transactions">) {
  const { methode } = await props.searchParams;
  const filtreInitial = METHODES_VALIDES.includes(methode as MethodePaiement) ? (methode as MethodePaiement) : "tous";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Paiements</h1>
      <GestionTransactions filtreInitial={filtreInitial} />
    </main>
  );
}
