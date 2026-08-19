import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valet Premium | Servicio de Valet Parking para Eventos",
  description:
    "Servicio profesional de valet parking para bodas, eventos corporativos y fiestas privadas. Cotiza directo por WhatsApp."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
