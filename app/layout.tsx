import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenEd",
  description:
    "Agente de WhatsApp para docentes peruanos. Contencion inmediata y registro de incidencias de aula.",
  // iOS ignora los iconos del manifest para la pantalla de inicio y usa
  // apple-icon.png, que Next sirve desde app/. Sin esto el atajo de iPhone
  // sale con una captura de la pagina en vez del icono.
  appleWebApp: {
    capable: true,
    title: "OpenEd",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#075e54",
  width: "device-width",
  initialScale: 1,
  // Sin maximumScale: bloquear el zoom rompe la accesibilidad. El salto de
  // zoom al enfocar un input en iOS ya esta resuelto con el input a 16px.
  viewportFit: "cover",
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
