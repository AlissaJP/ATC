import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { generalSans } from "@/lib/fonts/general-sans";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatFlottant } from "@/components/layout/ChatFlottant";
import "./globals.css";

// Remplace Sora/Inter (Cahier 7 §2.2, décision n°43), puis Manrope, puis Clash Display/Satoshi —
// paire demandée : Montserrat pour les titres (font-titres) + General Sans pour le corps de texte
// (font-corps). Analogue (demandé initialement) écarté : sa version gratuite ne contient que les
// lettres A-Z sans accents/chiffres/ponctuation, inutilisable pour un site en français — General
// Sans (Fontshare) retenu comme équivalent visuel complet, cf. lib/fonts/general-sans.ts.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATC — Alpha Tech Center",
  description:
    "Énergie solaire, sécurité et climatisation en Haïti — vente au détail et professionnelle.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${generalSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-fond text-texte-principal">
        <Header />
        {children}
        <Footer />
        <ChatFlottant />
      </body>
    </html>
  );
}
