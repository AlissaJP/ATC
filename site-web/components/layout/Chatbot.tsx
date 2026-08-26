"use client";

// Raffinement Design — Chatbot : assistant virtuel intégré au site, seul widget flottant depuis le
// retrait de la bulle WhatsApp (ChatFlottant.tsx, supprimée — le support humain reste joignable via le
// bandeau WhatsApp de BlocReassurance.tsx et via le repli ci-dessous). Recherche par mots-clés dans la
// FAQ déjà validée (lib/mock-data/faq.ts — mêmes questions/réponses que /faq, y compris les entrées
// ajoutées depuis le back-office) plutôt qu'un moteur IA : pas d'infrastructure LLM réelle dans cette
// démo statique (décision actée n°41), et un assistant à réponses scriptées ne peut structurellement
// pas dériver vers une conversation hors-sujet — contrainte demandée, obtenue sans garde-fou
// additionnel. Toute question sans correspondance suffisante redirige honnêtement vers WhatsApp.
import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircleQuestion, Send, X } from "lucide-react";
import { questionsFAQ, type QuestionFAQ } from "@/lib/mock-data/faq";
import { lienWhatsApp } from "@/lib/constants/contact";

const MOTS_VIDES = new Set([
  "le", "la", "les", "de", "des", "du", "un", "une", "et", "est", "que", "qui", "pour", "avec", "dans", "sur",
  "vous", "je", "ai", "mon", "ma", "mes", "au", "aux", "ou", "en", "ce", "cette", "comment", "quel", "quelle",
  "quels", "quelles", "proposez", "vos", "votre", "nos", "notre", "combien", "temps", "faire", "puis",
]);

// Déstemming naïf (retire un -s final sur les mots de plus de 4 lettres) — les pluriels français
// s'écrivent presque toujours par simple ajout d'un -s, donc "professionnels"/"professionnel" et
// "solaires"/"solaire" se retrouvent comparables sans dictionnaire de synonymes.
function normaliser(texte: string): string[] {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((mot) => mot.length > 2 && !MOTS_VIDES.has(mot))
    .map((mot) => (mot.length > 4 && mot.endsWith("s") ? mot.slice(0, -1) : mot));
}

function trouverMeilleureReponse(saisie: string): QuestionFAQ | undefined {
  const motsSaisie = new Set(normaliser(saisie));
  if (motsSaisie.size === 0) return undefined;

  let meilleur: { faq: QuestionFAQ; score: number } | undefined;
  for (const faq of questionsFAQ) {
    const motsFaq = normaliser(`${faq.question} ${faq.reponse}`);
    const score = motsFaq.filter((mot) => motsSaisie.has(mot)).length;
    if (score > 0 && (!meilleur || score > meilleur.score)) meilleur = { faq, score };
  }
  return meilleur?.faq;
}

const SUGGESTIONS_IDS = ["faq-paiement", "faq-garantie", "faq-b2b", "faq-retrait"];

interface Message {
  id: string;
  role: "bot" | "utilisateur";
  texte: string;
  estRepli?: boolean;
}

let compteurMessage = 0;
function idMessage(): string {
  compteurMessage += 1;
  return `msg-${compteurMessage}`;
}

const MESSAGE_ACCUEIL: Message = {
  id: idMessage(),
  role: "bot",
  texte:
    "Bonjour ! Je suis l'assistant automatisé d'ATC. Posez-moi une question sur nos produits, garanties, moyens de paiement, retrait en magasin ou compte professionnel.",
};

const MESSAGE_REPLI =
  "Cette question dépasse ce que je peux traiter. Contactez notre support via WhatsApp pour une réponse personnalisée.";

export function Chatbot() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([MESSAGE_ACCUEIL]);
  const [saisie, setSaisie] = useState("");
  const idChamp = useId();

  if (pathname.startsWith("/admin")) return null;

  function poserQuestion(question: string) {
    const texteQuestion = question.trim();
    if (!texteQuestion) return;

    const correspondance = trouverMeilleureReponse(texteQuestion);
    setMessages((etat) => [
      ...etat,
      { id: idMessage(), role: "utilisateur", texte: texteQuestion },
      correspondance
        ? { id: idMessage(), role: "bot", texte: correspondance.reponse }
        : { id: idMessage(), role: "bot", texte: MESSAGE_REPLI, estRepli: true },
    ]);
    setSaisie("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-label={ouvert ? "Fermer l'assistant ATC" : "Ouvrir l'assistant ATC"}
        aria-expanded={ouvert}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primaire text-white shadow-lg transition-transform hover:scale-105 print:hidden"
      >
        {ouvert ? <X size={24} /> : <Bot size={26} />}
      </button>

      {ouvert && (
        <div className="fixed bottom-[92px] right-5 z-30 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-bordure bg-background shadow-2xl print:hidden">
          <div className="flex items-center gap-2.5 border-b border-bordure bg-primaire px-4 py-3">
            <Bot size={20} className="text-white" />
            <div>
              <p className="font-titres text-sm font-semibold text-white">Assistant ATC</p>
              <p className="text-xs text-white/80">Assistant automatisé — pas un conseiller en direct</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "utilisateur"
                    ? "self-end bg-primaire text-white"
                    : m.estRepli
                      ? "self-start bg-avertissement/10 text-texte-principal"
                      : "self-start bg-fond text-texte-principal"
                }`}
              >
                <p>{m.texte}</p>
                {m.estRepli && (
                  <a
                    href={lienWhatsApp("Bonjour, j'ai une question qui n'a pas trouvé de réponse via l'assistant du site.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primaire hover:underline"
                  >
                    Contacter le support WhatsApp →
                  </a>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-1.5 text-xs font-medium text-texte-secondaire">
                  <MessageCircleQuestion size={13} /> Questions fréquentes
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS_IDS.map((id) => {
                    const faq = questionsFAQ.find((q) => q.id === id);
                    if (!faq) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => poserQuestion(faq.question)}
                        className="rounded-full border border-bordure px-3 py-1.5 text-xs font-medium text-texte-principal transition-colors hover:border-primaire hover:text-primaire"
                      >
                        {faq.question}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              poserQuestion(saisie);
            }}
            className="flex items-center gap-2 border-t border-bordure p-3"
          >
            <label htmlFor={idChamp} className="sr-only">
              Votre question
            </label>
            <input
              id={idChamp}
              type="text"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Posez votre question…"
              className="w-full rounded-lg border border-bordure bg-fond px-3 py-2 text-sm text-texte-principal placeholder:text-texte-secondaire focus:outline-none focus:ring-2 focus:ring-primaire-clair"
            />
            <button
              type="submit"
              aria-label="Envoyer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primaire text-white transition-opacity hover:opacity-90"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
