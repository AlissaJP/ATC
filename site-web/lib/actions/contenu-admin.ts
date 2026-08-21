"use server";

// BF-12-011 (Must have, décision actée n°9) — Gestion du contenu (FAQ, textes légaux) depuis le
// back-office. Même architecture que lib/actions/catalogue-admin.ts : mutation en place des tableaux
// mock-data + revalidatePath, pour que les pages vitrine (Server Components) reflètent les modifications
// admin dès la prochaine requête serveur. Voir catalogue-admin.ts pour la note d'architecture complète
// (pas de session serveur dans cette démo — l'autorisation par rôle reste appliquée côté UI uniquement).
import { revalidatePath } from "next/cache";
import {
  creerQuestionFAQMock,
  modifierQuestionFAQMock,
  supprimerQuestionFAQMock,
  type QuestionFAQInputMock,
} from "@/lib/mock-data/faq";
import {
  ajouterSectionLegaleMock,
  modifierSectionLegaleMock,
  supprimerSectionLegaleMock,
  type SectionLegaleInputMock,
  type SlugPageLegale,
} from "@/lib/mock-data/contenu-legal";

export interface ActionResult<T = undefined> {
  succes: boolean;
  erreur?: string;
  donnees?: T;
}

function revaliderContenu() {
  revalidatePath("/", "layout");
}

export async function creerQuestionFaqAction(input: QuestionFAQInputMock): Promise<ActionResult> {
  if (!input.question.trim() || !input.reponse.trim()) {
    return { succes: false, erreur: "Question et réponse sont obligatoires." };
  }
  creerQuestionFAQMock(input);
  revaliderContenu();
  return { succes: true };
}

export async function modifierQuestionFaqAction(
  id: string,
  patch: Partial<QuestionFAQInputMock>
): Promise<ActionResult> {
  const question = modifierQuestionFAQMock(id, patch);
  if (!question) return { succes: false, erreur: "Question introuvable." };
  revaliderContenu();
  return { succes: true };
}

export async function supprimerQuestionFaqAction(id: string): Promise<ActionResult> {
  const ok = supprimerQuestionFAQMock(id);
  if (!ok) return { succes: false, erreur: "Question introuvable." };
  revaliderContenu();
  return { succes: true };
}

export async function modifierSectionLegaleAction(
  slug: SlugPageLegale,
  sectionId: string,
  patch: Partial<SectionLegaleInputMock>
): Promise<ActionResult> {
  if (patch.titre !== undefined && !patch.titre.trim()) {
    return { succes: false, erreur: "Le titre ne peut pas être vide." };
  }
  const section = modifierSectionLegaleMock(slug, sectionId, patch);
  if (!section) return { succes: false, erreur: "Section introuvable." };
  revaliderContenu();
  return { succes: true };
}

export async function ajouterSectionLegaleAction(
  slug: SlugPageLegale,
  input: SectionLegaleInputMock
): Promise<ActionResult> {
  if (!input.titre.trim() || !input.corps.trim()) {
    return { succes: false, erreur: "Titre et corps sont obligatoires." };
  }
  const section = ajouterSectionLegaleMock(slug, input);
  if (!section) return { succes: false, erreur: "Page légale introuvable." };
  revaliderContenu();
  return { succes: true };
}

export async function supprimerSectionLegaleAction(slug: SlugPageLegale, sectionId: string): Promise<ActionResult> {
  const ok = supprimerSectionLegaleMock(slug, sectionId);
  if (!ok) return { succes: false, erreur: "Section introuvable." };
  revaliderContenu();
  return { succes: true };
}
