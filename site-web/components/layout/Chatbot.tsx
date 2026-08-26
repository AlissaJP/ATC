"use client";

// Raffinement Design — Chatbot : assistant virtuel intégré au site, seul widget flottant depuis le
// retrait de la bulle WhatsApp (ChatFlottant.tsx, supprimée — le support humain reste joignable via le
// bandeau WhatsApp de BlocReassurance.tsx et via le repli ci-dessous). Recherche par mots-clés dans la
// FAQ déjà validée (lib/mock-data/faq.ts — mêmes questions/réponses que /faq, y compris les entrées
// ajoutées depuis le back-office) plutôt qu'un moteur IA : pas d'infrastructure LLM réelle dans cette
// démo statique (décision actée n°41), et un assistant à réponses scriptées ne peut structurellement
// pas dériver vers une conversation hors-sujet — contrainte demandée, obtenue sans garde-fou
// additionnel. Toute question sans correspondance suffisante redirige honnêtement vers WhatsApp.
//
// Raffinement Design (refonte esthétique) — le délai avant réponse et l'indicateur "en train d'écrire"
// sont purement cosmétiques (la réponse est déjà connue au moment de l'envoi, recherche synchrone dans
// la FAQ) : ils simulent le rythme d'une vraie conversation plutôt qu'un affichage instantané, sans
// prétendre à une génération réelle. MotionConfig (app/layout.tsx) applique reducedMotion="user" à tout
// le sous-arbre : aucune vérification manuelle de prefers-reduced-motion n'est nécessaire ici.
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
const DELAI_REPONSE_MS = 700;

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
  const [aDejaOuvert, setADejaOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([MESSAGE_ACCUEIL]);
  const [saisie, setSaisie] = useState("");
  const [enTrainDecrire, setEnTrainDecrire] = useState(false);
  const idChamp = useId();
  const finDesMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finDesMessagesRef.current?.scrollIntoView({ block: "end" });
  }, [messages, enTrainDecrire]);

  if (pathname.startsWith("/admin")) return null;

  function ouvrirFermer() {
    setOuvert((v) => !v);
    setADejaOuvert(true);
  }

  function poserQuestion(question: string) {
    const texteQuestion = question.trim();
    if (!texteQuestion || enTrainDecrire) return;

    const correspondance = trouverMeilleureReponse(texteQuestion);
    setMessages((etat) => [...etat, { id: idMessage(), role: "utilisateur", texte: texteQuestion }]);
    setSaisie("");
    setEnTrainDecrire(true);

    setTimeout(() => {
      setMessages((etat) => [
        ...etat,
        correspondance
          ? { id: idMessage(), role: "bot", texte: correspondance.reponse }
          : { id: idMessage(), role: "bot", texte: MESSAGE_REPLI, estRepli: true },
      ]);
      setEnTrainDecrire(false);
    }, DELAI_REPONSE_MS);
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={ouvrirFermer}
        aria-label={ouvert ? "Fermer l'assistant ATC" : "Ouvrir l'assistant ATC"}
        aria-expanded={ouvert}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={
          !ouvert && !aDejaOuvert
            ? { opacity: 1, scale: [1, 1.06, 1] }
            : { opacity: 1, scale: 1 }
        }
        transition={
          !ouvert && !aDejaOuvert
            ? { scale: { duration: 1.6, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" } }
            : { duration: 0.3, ease: "easeOut" }
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primaire to-primaire-clair text-white shadow-lg print:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ouvert ? "fermer" : "ouvrir"}
            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {ouvert ? <X size={24} /> : <Bot size={26} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-[92px] right-5 z-30 flex h-[min(88vh,34rem)] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-bordure bg-background shadow-2xl print:hidden sm:h-[min(80vh,32rem)] sm:w-[23.75rem]"
          >
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-primaire to-primaire-clair px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="font-titres text-sm font-semibold text-white">Assistant ATC</p>
                <p className="text-xs text-white/80">Assistant automatisé — pas un conseiller en direct</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
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

              {enTrainDecrire && (
                <div
                  className="flex items-center gap-1 self-start rounded-xl bg-fond px-3 py-2.5 shadow-sm"
                  aria-live="polite"
                  aria-label="L'assistant est en train d'écrire"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-texte-secondaire"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              )}

              {messages.length === 1 && !enTrainDecrire && (
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
              <div ref={finDesMessagesRef} />
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
                disabled={enTrainDecrire}
                className="w-full rounded-lg border border-bordure bg-fond px-3 py-2 text-sm text-texte-principal placeholder:text-texte-secondaire focus:outline-none focus:ring-2 focus:ring-primaire-clair disabled:opacity-60"
              />
              <motion.button
                type="submit"
                aria-label="Envoyer"
                disabled={enTrainDecrire}
                whileTap={{ scale: 0.9 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primaire text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send size={16} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
