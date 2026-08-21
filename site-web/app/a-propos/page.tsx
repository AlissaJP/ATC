// RAFF-A-PROPOS — Page « À propos » (Raffinement Design, ajout hors périmètre des 15 cahiers,
// consigné uniquement dans le document de raffinement, aucun BF-XX/ECR-XX officiel).
import { BanniereAPropos } from "@/components/a-propos/BanniereAPropos";
import { BlocMission } from "@/components/a-propos/BlocMission";
import { BlocValeurs } from "@/components/a-propos/BlocValeurs";
import { BlocChiffresCles } from "@/components/home/BlocChiffresCles";
import { CtaFinalAPropos } from "@/components/a-propos/CtaFinalAPropos";

export default function AProposPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 md:px-6 md:py-12">
      <BanniereAPropos />
      <BlocMission />
      <BlocValeurs />
      <BlocChiffresCles />
      <CtaFinalAPropos />
    </main>
  );
}
