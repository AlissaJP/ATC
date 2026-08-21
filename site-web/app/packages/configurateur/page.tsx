import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ConfigurateurPackage } from "@/components/packages/ConfigurateurPackage";

export default function ConfigurateurPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Packages solaires", href: "/packages" }, { label: "Configurateur" }]} />
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
        Composez votre package solaire
      </h1>
      <p className="mb-8 text-texte-secondaire">
        Sélectionnez vos composants — au moins un panneau et une batterie sont nécessaires pour envoyer votre
        demande.
      </p>
      <ConfigurateurPackage />
    </main>
  );
}
