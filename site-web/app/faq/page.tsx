// ECR-11-001 — FAQ générale et par catégorie (BF-11-001, BF-11-002). Contenu lu depuis
// lib/mock-data/faq.ts, éditable par l'admin (BF-12-011, lib/actions/contenu-admin.ts).
import Link from "next/link";
import { questionsFAQ } from "@/lib/mock-data/faq";
import { categories } from "@/lib/mock-data/categories";
import { AccordeonFAQ } from "@/components/faq/AccordeonFAQ";

export default function FAQPage() {
  const questionsGenerales = questionsFAQ.filter((q) => !q.categorie_id);
  const categoriesAvecQuestions = categories
    .filter((c) => !c.parent_id)
    .map((c) => ({ categorie: c, questions: questionsFAQ.filter((q) => q.categorie_id === c.id) }))
    .filter((g) => g.questions.length > 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6">
      <h1 className="mb-2 font-titres text-3xl font-bold text-texte-principal">Foire aux questions</h1>
      <p className="mb-8 text-texte-secondaire">
        Vous ne trouvez pas de réponse ? <Link href="/contact" className="font-medium text-primaire hover:underline">Contactez-nous</Link>.
      </p>

      <div className="flex flex-col gap-10">
        {questionsGenerales.length > 0 && (
          <section>
            <h2 className="mb-4 font-titres text-lg font-semibold text-texte-principal">Questions générales</h2>
            <AccordeonFAQ questions={questionsGenerales} />
          </section>
        )}

        {categoriesAvecQuestions.map(({ categorie, questions }) => (
          <section key={categorie.id}>
            <h2 className="mb-4 font-titres text-lg font-semibold text-texte-principal">{categorie.nom}</h2>
            <AccordeonFAQ questions={questions} />
          </section>
        ))}
      </div>
    </main>
  );
}
