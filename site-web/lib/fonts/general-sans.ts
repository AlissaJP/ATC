import localFont from "next/font/local";

// Fontshare, licence gratuite/usage commercial, auto-hébergé via next/font/local. Remplace Satoshi
// pour le corps de texte (font-corps) — choisie comme équivalent complet (accents/chiffres/ponctuation)
// à "Analogue", dont la version gratuite ne contient que A-Z sans accents/chiffres/ponctuation.
export const generalSans = localFont({
  src: "./GeneralSans-Variable.woff2",
  weight: "200 700",
  display: "swap",
  variable: "--font-general-sans",
});
