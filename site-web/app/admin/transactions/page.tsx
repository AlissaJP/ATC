import { GestionTransactions } from "@/components/admin/GestionTransactions";

// BF-12-008 — Suivi des transactions par méthode de paiement + factures pro forma (back-office).
export default function AdminTransactionsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Transactions</h1>
      <GestionTransactions />
    </main>
  );
}
