import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ConfigurateurPackage } from "@/components/packages/ConfigurateurPackage";
import { obtenirTraduction } from "@/lib/i18n/serveur";

export default async function ConfigurateurPage() {
  const { t } = await obtenirTraduction();
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: t("nav.packages"), href: "/packages" }, { label: t("configurateur.filAriane") }]} />
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
        {t("configurateur.titre")}
      </h1>
      <p className="mb-8 text-texte-secondaire">
        {t("configurateur.intro")}
      </p>
      <ConfigurateurPackage />
    </main>
  );
}
