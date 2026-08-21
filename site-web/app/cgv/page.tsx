// ECR-11-004 (BF-11-004) — Conditions Générales de Vente. BF-11-005 (section 8, "Export et clients de
// la diaspora") intégrée ici plutôt qu'en page séparée. Contenu lu depuis lib/mock-data/contenu-legal.ts
// (Server Component) pour rester à jour dès qu'un administrateur modifie une section (BF-12-011,
// lib/actions/contenu-admin.ts) — plus de JSX statique, voir git history de ce fichier (Phase 7) pour
// l'ancienne version si besoin de référence.
import { trouverPageLegale } from "@/lib/mock-data/contenu-legal";

export default function CGVPage() {
  const page = trouverPageLegale("cgv");

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
