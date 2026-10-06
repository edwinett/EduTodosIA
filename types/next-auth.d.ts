import type { DefaultSession } from "next-auth";

// Amplía los tipos de sesión para incluir el rol y el id del usuario.
declare module "next-auth" {
  interface User {
    rol?: string;
  }
  interface Session {
    user: {
      id: string;
      rol: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: string;
    uid?: string;
  }
}
