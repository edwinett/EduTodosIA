import { ContenidoProvider } from "@/lib/contenido/cliente";

// Provee el contenido del juego (nodos/retos desde el catálogo de la BD) a todas
// las pantallas de juego.
export default function JuegoLayout({ children }: { children: React.ReactNode }) {
  return <ContenidoProvider>{children}</ContenidoProvider>;
}
