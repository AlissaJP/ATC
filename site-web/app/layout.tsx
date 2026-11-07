import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { clashDisplay } from "@/lib/fonts/clash-display";
import { generalSans } from "@/lib/fonts/general-sans";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/layout/Chatbot";
import { FournisseurLangue } from "@/components/i18n/FournisseurLangue";
import { obtenirLangue, obtenirTraduction } from "@/lib/i18n/serveur";
import "./globals.css";

// Remplace Sora/Inter (Cahier 7 §2.2, décision n°43), puis Manrope, puis Montserrat — paire demandée :
// Clash Display pour les titres (font-titres) + General Sans pour le corps de texte (font-corps), toutes
// deux Fontshare et auto-hébergées via next/font/local (cf. lib/fonts/). Analogue (demandé initialement
// pour le corps) écarté : sa version gratuite ne contient que les lettres A-Z sans accents/chiffres/
// ponctuation, inutilisable pour un site en français — General Sans retenu comme équivalent visuel
// complet. Clash Display vérifiée avec le même test avant intégration (cf. lib/fonts/clash-display.ts).

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await obtenirTraduction();
  return { title: "ATC — Alpha Tech Center", description: t("meta.description") };
}

// RG-14-001 — la langue (cookie) est lue ici une fois : <html lang> et FournisseurLangue pour les
// composants client ; les pages serveur la relisent via obtenirTraduction().
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const langue = await obtenirLangue();
  return (
    <html lang={langue} className={`${clashDisplay.variable} ${generalSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-fond text-texte-principal">
        {/* Raffinement Design — micro-animations (Framer Motion). reduceMotion="user" respecte
            automatiquement prefers-reduced-motion pour toutes les animations du site, sans vérification
            manuelle dans chaque composant. */}
        <FournisseurLangue langueInitiale={langue}>
          <MotionConfig reducedMotion="user">
            <Header />
            {children}
            <Footer />
            <Chatbot />
          </MotionConfig>
        </FournisseurLangue>
      </body>
    </html>
  );
}
