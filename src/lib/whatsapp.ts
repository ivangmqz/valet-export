/** Construye un enlace de WhatsApp (API wa.me) con mensaje precargado. */
export function buildWhatsAppLink(message: string, phoneOverride?: string): string {
  const phone = (phoneOverride ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

export const DEFAULT_QUOTE_MESSAGE =
  "Hola, me gustaría cotizar un servicio de valet parking para mi evento...";

export function buildEventConfirmationMessage(eventName: string, phone?: string) {
  return buildWhatsAppLink(
    `Hola, te contacto para confirmar la asistencia al evento "${eventName}" que inicia en 12 horas.`,
    phone
  );
}
