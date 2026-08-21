import Link from "next/link";
import { Construction } from "lucide-react";

// Écran à construire dans une phase ultérieure (voir PLAN.md, section 5) — évite un 404 brut
// pendant la démo tout en indiquant clairement l'état d'avancement.
export function PagePlaceholder({ titre, phase }: { titre: string; phase: string }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <Construction className="mb-4 text-primaire-clair" size={32} />
      <h1 className="font-titres text-2xl font-bold text-texte-principal">{titre}</h1>
      <p className="mt-3 text-texte-secondaire">Cet écran sera construit en {phase}.</p>
      <Link href="/" className="mt-6 font-medium text-primaire hover:underline">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
