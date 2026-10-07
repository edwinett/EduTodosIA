import { auth } from "@/auth";

// Guards para Server Actions / route handlers (Node runtime).
export async function requireUsuario() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  return session.user;
}

export async function requireDocente() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  if (session.user.rol !== "DOCENTE") throw new Error("Requiere rol DOCENTE");
  return session.user;
}
