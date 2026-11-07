// RG-14-001 — traduction des contenus éditoriaux mock (FAQ) à l'affichage. Les questions de démonstration
// ont leur traduction dans les dictionnaires (faq.<id>.question / .reponse) ; une question ajoutée depuis
// l'admin, sans traduction, s'affiche dans sa langue de saisie.
import type { QuestionFAQ } from "@/lib/mock-data/faq";
import type { Langue } from "@/lib/types/entities";
import { traduire } from "./traduire";

function traduireOuOriginal(langue: Langue, cle: string, original: string): string {
  const traduit = traduire(langue, cle);
  return traduit === cle ? original : traduit;
}

export function localiserFAQ(question: QuestionFAQ, langue: Langue): QuestionFAQ {
  if (langue === "fr") return question;
  return {
    ...question,
    question: traduireOuOriginal(langue, `faq.${question.id}.question`, question.question),
    reponse: traduireOuOriginal(langue, `faq.${question.id}.reponse`, question.reponse),
  };
}
