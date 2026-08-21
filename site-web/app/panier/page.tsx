import { PanierContenu } from "@/components/panier/PanierContenu";

export default function PanierPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal md:text-3xl">Panier</h1>
      <PanierContenu />
    </main>
  );
}
