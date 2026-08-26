"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LifeBuoy, LogOut, User } from "lucide-react";
import { useSessionStore } from "@/lib/store/session-store";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Reflète l'état de session dans l'en-tête — jamais connecté par défaut (section 6 du prompt de mission).
export function CompteMenu() {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const session = useSessionStore((s) => s.session);
  const deconnecter = useSessionStore((s) => s.deconnecter);
  const { t } = useTranslation();

  // Raffinement Design (#19) — quel que soit le type de compte, la déconnexion invalide toujours la
  // session avant de rediriger vers l'accueil public (jamais laissé sur une page qui pourrait exiger une
  // connexion, ce qui provoquerait une redirection en boucle vers la page de connexion). Même destination
  // que la déconnexion depuis la barre latérale du back-office (AdminSidebar.tsx) pour rester cohérent —
  // aucune page de connexion admin dédiée n'existe séparément de /compte/connexion.
  function seDeconnecter() {
    deconnecter();
    setOuvert(false);
    router.push("/");
  }

  const libelle =
    session?.type === "client" ? session.nom : session?.type === "admin" ? session.administrateur.nom : null;

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-texte-principal hover:bg-fond"
        aria-haspopup="menu"
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
      >
        <User size={22} />
        {libelle && <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">{libelle}</span>}
      </button>

      <AnimatePresence>
        {ouvert && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOuvert(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-bordure bg-background shadow-lg">
            {!session && (
              <div className="flex flex-col gap-2 p-3">
                <Link
                  href="/compte/connexion"
                  className="rounded-lg bg-primaire px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-90"
                  onClick={() => setOuvert(false)}
                >
                  {t("compte.seConnecter")}
                </Link>
                <Link
                  href="/compte/inscription"
                  className="rounded-lg border border-bordure px-4 py-2.5 text-center text-sm font-semibold text-texte-principal hover:border-primaire hover:text-primaire"
                  onClick={() => setOuvert(false)}
                >
                  {t("compte.sInscrire")}
                </Link>
              </div>
            )}

            {session?.type === "client" && (
              <>
                <div className="border-b border-bordure px-4 py-3">
                  <p className="text-sm font-semibold text-texte-principal">{session.nom}</p>
                  <p className="text-xs text-texte-secondaire">
                    {session.type_compte === "particulier" ? t("compte.compteParticulier") : t("compte.compteEntreprise")}
                  </p>
                </div>
                <Link
                  href="/compte/tableau-de-bord"
                  className="block px-4 py-2.5 text-sm text-texte-principal hover:bg-fond"
                  onClick={() => setOuvert(false)}
                >
                  {t("compte.monCompte")}
                </Link>
                <Link
                  href="/devis"
                  className="block px-4 py-2.5 text-sm text-texte-principal hover:bg-fond"
                  onClick={() => setOuvert(false)}
                >
                  {t("compte.mesDevis")}
                </Link>
                <Link
                  href="/commandes"
                  className="block px-4 py-2.5 text-sm text-texte-principal hover:bg-fond"
                  onClick={() => setOuvert(false)}
                >
                  {t("compte.mesCommandes")}
                </Link>
                <Link
                  href="/compte/favoris"
                  className="block px-4 py-2.5 text-sm text-texte-principal hover:bg-fond"
                  onClick={() => setOuvert(false)}
                >
                  {t("compte.mesFavoris")}
                </Link>
                <Link
                  href="/sav"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-texte-principal hover:bg-fond"
                  onClick={() => setOuvert(false)}
                >
                  <LifeBuoy size={16} /> SAV &amp; Assistance
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-danger hover:bg-fond"
                  onClick={seDeconnecter}
                >
                  <LogOut size={16} /> {t("compte.seDeconnecter")}
                </button>
              </>
            )}

            {session?.type === "admin" && (
              <>
                <div className="border-b border-bordure px-4 py-3">
                  <p className="text-sm font-semibold text-texte-principal">{session.administrateur.nom}</p>
                  <p className="text-xs text-texte-secondaire">
                    {session.administrateur.role === "general" ? "Administrateur Général" : "Agent SAV"}
                  </p>
                </div>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-texte-principal hover:bg-fond"
                  onClick={() => setOuvert(false)}
                >
                  <LayoutDashboard size={16} /> {t("compte.backOffice")}
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-danger hover:bg-fond"
                  onClick={seDeconnecter}
                >
                  <LogOut size={16} /> {t("compte.seDeconnecter")}
                </button>
              </>
            )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
