import localFont from "next/font/local";

// Fontshare, licence gratuite/usage commercial (self-hosting explicitement autorisé), auto-hébergé via
// next/font/local — même méthode que General Sans (lib/fonts/general-sans.ts). Remplace Montserrat pour
// les titres (font-titres). Glyphes accentués français vérifiés avant intégration (à/â/é/è/ê/ë/ï/î/ô/ö/
// ù/û/ü/ç/œ + majuscules, chiffres, guillemets « ») — jeu complet, contrairement à "Analogue" écarté plus
// tôt pour le corps de texte.
export const clashDisplay = localFont({
  src: "./ClashDisplay-Variable.woff2",
  weight: "200 700",
  display: "swap",
  variable: "--font-clash-display",
});
