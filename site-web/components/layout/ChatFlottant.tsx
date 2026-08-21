"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_LIEN } from "@/lib/constants/contact";

// ECR-01-002/ECR-02-001 (Raffinement Design) — widget de chat flottant, confirmé présent sur tout le
// site (pas seulement l'accueil) : correspond au support WhatsApp déjà prévu (BF-09-003), pas un
// chatbot séparé — un seul canal de support existe chez ATC. Masqué en back-office (non pertinent
// pour le personnel administratif).
export function ChatFlottant() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={WHATSAPP_LIEN}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec notre équipe sur WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-succes text-white shadow-lg transition-transform hover:scale-105 print:hidden"
    >
      <MessageCircle size={26} />
    </a>
  );
}
