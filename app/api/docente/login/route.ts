import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { docenteLoginSchema } from "@/lib/validacion/esquemas";

export const runtime = "nodejs";

// POST /api/docente/login — autenticación simple del docente por clave.
// (Auth.js con credentials + magic link queda documentado como siguiente paso en el README.)
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = docenteLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const esperada = process.env.DOCENTE_PASSWORD ?? "tolima2024";
  if (parsed.data.password !== esperada) {
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  cookies().set("docente", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/docente/login — cerrar sesión docente.
export async function DELETE() {
  cookies().delete("docente");
  return NextResponse.json({ ok: true });
}
