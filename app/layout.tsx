import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenEd",
  description:
    "Agente de WhatsApp para docentes peruanos. Contencion inmediata y registro de incidencias de aula.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE">
      <body>{children}</body>
    </html>
  );
}
