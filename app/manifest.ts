import type { MetadataRoute } from "next";

/**
 * Manifest de la PWA. Permite instalar OpenEd en el telefono desde el
 * navegador, sin app nativa y sin tienda: se abre a pantalla completa,
 * con su icono, y el microfono funciona igual porque produccion es https.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "OpenEd",
    short_name: "OpenEd",
    description:
      "Contención inmediata y registro de incidencias de aula para docentes peruanos.",
    lang: "es-PE",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#075e54",
    background_color: "#ece5dd",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
