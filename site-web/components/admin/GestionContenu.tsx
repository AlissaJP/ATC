"use client";

// ECR-12-004 (BF-12-011) — Gestion du contenu (FAQ + textes légaux) depuis le back-office. Même
// architecture que GestionCatalogue.tsx (Server Actions + revalidatePath) : voir lib/actions/
// contenu-admin.ts pour le rationnel complet. Remontage via `key` plutôt qu'un useEffect + setState pour
// réinitialiser l'état local d'édition (évite les rendus en cascade, même raison que dans GestionCatalogue.tsx).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { Categorie } from "@/lib/types/entities";
import type { QuestionFAQ } from "@/lib/mock-data/faq";
import type { PageLegale, SectionLegale, SlugPageLegale } from "@/lib/mock-data/contenu-legal";
import {
  ajouterSectionLegaleAction,
  creerQuestionFaqAction,
  modifierQuestionFaqAction,
  modifierSectionLegaleAction,
  supprimerQuestionFaqAction,
  supprimerSectionLegaleAction,
} from "@/lib/actions/contenu-admin";

interface GestionContenuProps {
  questionsFAQ: QuestionFAQ[];
  pagesLegales: PageLegale[];
  categories: Categorie[];
}

const ONGLET_LEGAL: { slug: SlugPageLegale; label: string }[] = [
  { slug: "cgv", label: "CGV" },
  { slug: "confidentialite", label: "Confidentialité" },
  { slug: "mentions-legales", label: "Mentions légales" },
];

// ongletInitial : reçu de la page (Server Component, lit searchParams) pour les raccourcis « FAQ » /
// « Mentions légales & CGV » de la navigation latérale (Section Administration, Raffinement Design).
export function GestionContenu({
  questionsFAQ,
  pagesLegales,
  categories,
  ongletInitial = "faq",
}: GestionContenuProps & { ongletInitial?: "faq" | SlugPageLegale }) {
  const router = useRouter();
  const [onglet, setOnglet] = useState<"faq" | SlugPageLegale>(ongletInitial);
  const pageLegaleActive = pagesLegales.find((p) => p.slug === onglet);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOnglet("faq")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            onglet === "faq" ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
          }`}
        >
          FAQ
        </button>
        {ONGLET_LEGAL.map((o) => (
          <button
            key={o.slug}
            type="button"
            onClick={() => setOnglet(o.slug)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              onglet === o.slug ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "faq" && (
        <PanneauFAQ questions={questionsFAQ} categories={categories} onSucces={() => router.refresh()} />
      )}
      {pageLegaleActive && <PanneauLegal page={pageLegaleActive} onSucces={() => router.refresh()} />}
    </div>
  );
}

function PanneauFAQ({
  questions,
  categories,
  onSucces,
}: {
  questions: QuestionFAQ[];
  categories: Categorie[];
  onSucces: () => void;
}) {
  const [modeCreation, setModeCreation] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setModeCreation((v) => !v)}
        className={`flex w-fit items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold ${
          modeCreation ? "border-primaire bg-primaire/5 text-primaire" : "border-bordure text-texte-principal hover:bg-fond"
        }`}
      >
        <Plus size={16} /> Nouvelle question
      </button>

      {modeCreation && (
        <FormulaireFAQ
          key="creation"
          categories={categories}
          onAnnuler={() => setModeCreation(false)}
          onSucces={() => {
            setModeCreation(false);
            onSucces();
          }}
        />
      )}

      {questions.map((q) => (
        <LigneFAQ key={q.id} question={q} categories={categories} onSucces={onSucces} />
      ))}
    </div>
  );
}

function LigneFAQ({
  question,
  categories,
  onSucces,
}: {
  question: QuestionFAQ;
  categories: Categorie[];
  onSucces: () => void;
}) {
  const [enEdition, setEnEdition] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function supprimer() {
    if (!window.confirm(`Supprimer la question « ${question.question} » ?`)) return;
    setEnCours(true);
    try {
      await supprimerQuestionFaqAction(question.id);
      onSucces();
    } finally {
      setEnCours(false);
    }
  }

  if (enEdition) {
    return (
      <FormulaireFAQ
        key={question.id}
        categories={categories}
        initial={question}
        onAnnuler={() => setEnEdition(false)}
        onSucces={() => {
          setEnEdition(false);
          onSucces();
        }}
      />
    );
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-texte-principal">{question.question}</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => setEnEdition(true)} className="text-texte-secondaire hover:text-primaire" aria-label="Modifier">
            <Pencil size={16} />
          </button>
          <button type="button" disabled={enCours} onClick={supprimer} className="text-texte-secondaire hover:text-danger" aria-label="Supprimer">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-texte-secondaire">{question.reponse}</p>
      {question.categorie_id && (
        <p className="mt-1 text-xs text-texte-secondaire">
          {categories.find((c) => c.id === question.categorie_id)?.nom ?? question.categorie_id}
        </p>
      )}
    </div>
  );
}

function FormulaireFAQ({
  initial,
  categories,
  onAnnuler,
  onSucces,
}: {
  initial?: QuestionFAQ;
  categories: Categorie[];
  onAnnuler: () => void;
  onSucces: () => void;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [reponse, setReponse] = useState(initial?.reponse ?? "");
  const [categorieId, setCategorieId] = useState(initial?.categorie_id ?? "");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function soumettre() {
    setEnCours(true);
    try {
      const input = { question, reponse, categorie_id: categorieId || undefined };
      const resultat = initial ? await modifierQuestionFaqAction(initial.id, input) : await creerQuestionFaqAction(input);
      if (!resultat.succes) {
        setErreur(resultat.erreur ?? "Une erreur est survenue.");
        return;
      }
      onSucces();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="rounded-xl border border-primaire/30 bg-primaire/5 p-4">
      <label className="block text-sm">
        <span className="text-texte-secondaire">Question</span>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-texte-secondaire">Réponse</span>
        <textarea
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-texte-secondaire">Catégorie (facultatif — vide = question générale)</span>
        <select
          value={categorieId}
          onChange={(e) => setCategorieId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        >
          <option value="">— Question générale —</option>
          {categories.filter((c) => !c.parent_id).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </label>
      {erreur && <p className="mt-2 text-sm font-medium text-danger">{erreur}</p>}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={enCours || !question.trim() || !reponse.trim()}
          onClick={soumettre}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} /> Enregistrer
        </button>
        <button type="button" onClick={onAnnuler} className="rounded-lg border border-bordure px-4 py-2 text-sm font-semibold text-texte-principal hover:bg-fond">
          Annuler
        </button>
      </div>
    </div>
  );
}

function PanneauLegal({ page, onSucces }: { page: PageLegale; onSucces: () => void }) {
  const [modeCreation, setModeCreation] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setModeCreation((v) => !v)}
        className={`flex w-fit items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold ${
          modeCreation ? "border-primaire bg-primaire/5 text-primaire" : "border-bordure text-texte-principal hover:bg-fond"
        }`}
      >
        <Plus size={16} /> Nouvelle section
      </button>

      {modeCreation && (
        <FormulaireSection
          key="creation"
          slug={page.slug}
          onAnnuler={() => setModeCreation(false)}
          onSucces={() => {
            setModeCreation(false);
            onSucces();
          }}
        />
      )}

      {page.sections.map((s) => (
        <LigneSection key={s.id} slug={page.slug} section={s} onSucces={onSucces} />
      ))}
    </div>
  );
}

function LigneSection({ slug, section, onSucces }: { slug: SlugPageLegale; section: SectionLegale; onSucces: () => void }) {
  const [enEdition, setEnEdition] = useState(false);
  const [enCours, setEnCours] = useState(false);

  async function supprimer() {
    if (!window.confirm(`Supprimer la section « ${section.titre} » ?`)) return;
    setEnCours(true);
    try {
      await supprimerSectionLegaleAction(slug, section.id);
      onSucces();
    } finally {
      setEnCours(false);
    }
  }

  if (enEdition) {
    return (
      <FormulaireSection
        key={section.id}
        slug={slug}
        initial={section}
        onAnnuler={() => setEnEdition(false)}
        onSucces={() => {
          setEnEdition(false);
          onSucces();
        }}
      />
    );
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-texte-principal">{section.titre}</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => setEnEdition(true)} className="text-texte-secondaire hover:text-primaire" aria-label="Modifier">
            <Pencil size={16} />
          </button>
          <button type="button" disabled={enCours} onClick={supprimer} className="text-texte-secondaire hover:text-danger" aria-label="Supprimer">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-texte-secondaire">{section.corps}</p>
    </div>
  );
}

function FormulaireSection({
  slug,
  initial,
  onAnnuler,
  onSucces,
}: {
  slug: SlugPageLegale;
  initial?: SectionLegale;
  onAnnuler: () => void;
  onSucces: () => void;
}) {
  const [titre, setTitre] = useState(initial?.titre ?? "");
  const [corps, setCorps] = useState(initial?.corps ?? "");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistre, setEnregistre] = useState(false);

  async function soumettre() {
    setEnCours(true);
    try {
      const input = { titre, corps };
      const resultat = initial
        ? await modifierSectionLegaleAction(slug, initial.id, input)
        : await ajouterSectionLegaleAction(slug, input);
      if (!resultat.succes) {
        setErreur(resultat.erreur ?? "Une erreur est survenue.");
        return;
      }
      if (initial) {
        setEnregistre(true);
      } else {
        onSucces();
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="rounded-xl border border-primaire/30 bg-primaire/5 p-4">
      <label className="block text-sm">
        <span className="text-texte-secondaire">Titre</span>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-texte-secondaire">Texte</span>
        <textarea
          value={corps}
          onChange={(e) => setCorps(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
      </label>
      {erreur && <p className="mt-2 text-sm font-medium text-danger">{erreur}</p>}
      {enregistre && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-succes">
          <Check size={14} /> Enregistré.
        </p>
      )}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={enCours || !titre.trim() || !corps.trim()}
          onClick={soumettre}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} /> Enregistrer
        </button>
        <button type="button" onClick={onAnnuler} className="rounded-lg border border-bordure px-4 py-2 text-sm font-semibold text-texte-principal hover:bg-fond">
          Fermer
        </button>
      </div>
    </div>
  );
}
