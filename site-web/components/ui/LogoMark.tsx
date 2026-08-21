import Image from "next/image";

interface LogoMarkProps {
  className?: string;
}

/**
 * Seuls des visuels de logo composites (emblème + accroche + badges) sont disponibles
 * (Photos-Traitees/logo, décision actée n°44 — aucune charte écrite, ces fichiers font foi).
 * Fichier mis à jour le 2026-08-20 (nouvel export fourni). Le cadrage isole la bande supérieure
 * (emblème « ATC ») via un ratio d'aspect calculé sur les dimensions réelles du fichier actuel
 * (1320x1045, bandeau utile ~600px), pour un repère de marque compact et lisible dans l'en-tête.
 */
export function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <div
      className={`relative aspect-[1320/600] h-11 md:h-13 overflow-hidden rounded-md ${className}`}
    >
      <Image
        src="/images/logo/logo-02.png"
        alt="ATC — Alpha Tech Center"
        fill
        priority
        className="object-cover object-top"
        sizes="200px"
      />
    </div>
  );
}
