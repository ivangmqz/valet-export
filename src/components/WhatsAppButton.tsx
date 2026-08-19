"use client";

import { DEFAULT_QUOTE_MESSAGE, buildWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  message?: string;
  variant?: "floating" | "inline";
  label?: string;
}

/** CTA de WhatsApp. `variant="floating"` renderiza el botón flotante fijo en pantalla. */
export default function WhatsAppButton({
  message = DEFAULT_QUOTE_MESSAGE,
  variant = "inline",
  label = "Cotizar por WhatsApp"
}: WhatsAppButtonProps) {
  const href = buildWhatsAppLink(message);

  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Cotizar por WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-4 font-semibold text-white shadow-2xl shadow-[#25D366]/40 transition hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
      >
        <WhatsAppIcon />
        <span className="hidden sm:inline">Cotizar ahora</span>
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
      <WhatsAppIcon />
      {label}
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current">
      <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.4.68 4.63 1.86 6.53L4 29l7.6-1.83a12.9 12.9 0 0 0 4.44.79h.01c6.64 0 12.04-5.4 12.04-12.04C28.09 8.4 22.68 3 16.04 3Zm0 21.9h-.01a10.1 10.1 0 0 1-5.15-1.41l-.37-.22-4.51 1.09 1.2-4.39-.24-.45a10.06 10.06 0 0 1-1.55-5.38c0-5.56 4.53-10.09 10.1-10.09 2.7 0 5.24 1.05 7.15 2.96a10.03 10.03 0 0 1 2.96 7.14c0 5.57-4.53 10.1-10.1 10.1Zm5.53-7.56c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.68-2.09-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.65-.94-2.26-.25-.6-.5-.51-.68-.52h-.58c-.2 0-.53.07-.8.38-.28.3-1.05 1.03-1.05 2.52s1.08 2.93 1.23 3.13c.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.79-.73 2.04-1.44.25-.7.25-1.31.18-1.44-.08-.13-.28-.2-.58-.35Z" />
    </svg>
  );
}
