import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware edge-safe: usa solo authConfig (sin Prisma/bcrypt).
// El callback `authorized` decide el acceso a /docente/* y rutas de juego.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  // La lógica vive en authConfig.callbacks.authorized; aquí no hace falta nada extra.
  return;
});

export const config = {
  matcher: ["/docente/:path*", "/mapa/:path*", "/sala/:path*", "/final/:path*", "/juego/:path*"],
};
