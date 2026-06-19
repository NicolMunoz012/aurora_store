"use client";
// =============================================================================
// components/client/WhatsappButton.tsx — Opens WhatsApp URL (Req 14.5)
// =============================================================================

interface WhatsappButtonProps {
  whatsappUrl: string;
}

export function WhatsappButton({ whatsappUrl }: WhatsappButtonProps) {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
    >
      📲 Enviar por WhatsApp
    </a>
  );
}
