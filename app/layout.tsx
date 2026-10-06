import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEÑAL PERDIDA · Escape Room Educativo",
  description:
    "El Apagón de las Telecomunicaciones en Colombia. Escape room educativo de la Universidad del Tolima: reconecta Radio, Televisión, Telefonía e Internet.",
  authors: [{ name: "Universidad del Tolima" }],
  keywords: ["escape room", "educación", "telecomunicaciones", "Colombia", "Tolima"],
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        <main id="contenido">{children}</main>
      </body>
    </html>
  );
}
