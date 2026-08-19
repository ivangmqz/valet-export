import { format } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatEventDateTime(iso: string) {
  return format(new Date(iso), "EEEE d 'de' MMMM 'de' yyyy, HH:mm 'hrs'", { locale: es });
}

export function formatShortDateTime(iso: string) {
  return format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: es });
}

export function hoursUntil(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  return diffMs / (1000 * 60 * 60);
}
