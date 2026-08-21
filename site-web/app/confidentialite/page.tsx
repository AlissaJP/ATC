// ECR-11-004 (BF-11-004) — Politique de confidentialité multi-juridictions (Haïti, USA, Canada, UE le
// cas échéant — décision actée n°2, Cahier 11 §11). Contenu lu depuis lib/mock-data/contenu-legal.ts,
// éditable par l'admin (BF-12-011, lib/actions/contenu-admin.ts).
import { trouverPageLegale } from "@/lib/mock-data/contenu-legal";

export default function ConfidentialitePage() {
  const page = trouverPageLegale("confidentialite");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6">
      <h1 className="mb-2 font-titres text-3xl font-bold text-texte-principal">{page?.titre}</h1>
      <p className="mb-8 text-xs text-texte-secondaire">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
      </p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-texte-secondaire">
        {page?.sections.map((s) => (
          <section key={s.id}>
            <h2 className="mb-2 font-titres text-lg font-semibold text-texte-principal">{s.titre}</h2>
            {s.corps.split("\n\n").map((paragraphe, i) => (
              <p key={i} className={i > 0 ? "mt-2" : undefined}>
                {paragraphe}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
