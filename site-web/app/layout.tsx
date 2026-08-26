import type { Metadata } from "next";
import { clashDisplay } from "@/lib/fonts/clash-display";
import { generalSans } from "@/lib/fonts/general-sans";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatFlottant } from "@/components/layout/ChatFlottant";
import { Chatbot } from "@/components/layout/Chatbot";
import "./globals.css";

// Remplace Sora/Inter (Cahier 7 §2.2, décision n°43), puis Manrope, puis Montserrat — paire demandée :
// Clash Display pour les titres (font-titres) + General Sans pour le corps de texte (font-corps), toutes
// deux Fontshare et auto-hébergées via next/font/local (cf. lib/fonts/). Analogue (demandé initialement
// pour le corps) écarté : sa version gratuite ne contient que les lettres A-Z sans accents/chiffres/
// ponctuation, inutilisable pour un site en français — General Sans retenu comme équivalent visuel
// complet. Clash Display vérifiée avec le même test avant intégration (cf. lib/fonts/clash-display.ts).

export const metadata: Metadata = {
  title: "ATC — Alpha Tech Center",
  description:
    "Énergie solaire, sécurité et climatisation en Haïti — vente au détail et professionnelle.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${clashDisplay.variable} ${generalSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-fond text-texte-principal">
        <Header />
        {children}
        <Footer />
        <ChatFlottant />
        <Chatbot />
      </body>
    </html>
  );
}
