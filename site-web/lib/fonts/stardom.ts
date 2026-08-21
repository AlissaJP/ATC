import localFont from "next/font/local";

// Police d'accent Fontshare (licence gratuite, usage commercial), auto-hébergée via next/font/local
// car non disponible sur Google Fonts. Une seule graisse (400) — réservée au titre principal du hero
// (components/home/BanniereSolaire.tsx), jamais au texte courant ni aux autres titres.
export const stardom = localFont({
  src: "./Stardom-Regular.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-stardom",
});
