import type { NextAuthConfig } from "next-auth";

// Configuración EDGE-SAFE de Auth.js (sin adaptador Prisma ni bcrypt).
// La usa el middleware para leer el JWT y proteger rutas.
// Rutas protegidas:
//   /docente/*  → solo rol DOCENTE
//   /mapa, /sala/*, /final, /juego/* → cualquier usuario autenticado
export const RUTAS_DOCENTE = ["/docente"];
export const RUTAS_JUEGO = ["/mapa", "/sala", "/final", "/juego"];

export const authConfig = {
  // trustHost debe estar también aquí (no solo en auth.ts): el middleware usa SOLO
  // authConfig y, sin esto, difiere la decisión de "cookie segura" entre edge y node
  // (en http el edge buscaría una cookie __Secure-… inexistente y no vería la sesión).
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [], // Se definen en auth.ts (Node runtime).
  callbacks: {
    // Propaga rol e id al token/sesión (se fija en el login, en Node).
    jwt({ token, user }) {
      if (user) {
        token.rol = (user as { rol?: string }).rol ?? "ESTUDIANTE";
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.rol = (token.rol as string) ?? "ESTUDIANTE";
        session.user.id = (token.uid as string) ?? session.user.id;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const rol = auth?.user?.rol;
      const logueado = !!auth?.user;

      const esRutaDocente = RUTAS_DOCENTE.some((r) => pathname.startsWith(r));
      const esRutaJuego = RUTAS_JUEGO.some((r) => pathname.startsWith(r));

      if (esRutaDocente) return logueado && rol === "DOCENTE";
      if (esRutaJuego) return logueado;
      return true;
    },
  },
} satisfies NextAuthConfig;
