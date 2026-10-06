import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registroSchema } from "@/lib/validacion/esquemas";

export const runtime = "nodejs";

// POST /api/registro — crea una cuenta (ESTUDIANTE o DOCENTE) con contraseña.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = registroSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { nombre, email, password, rol, programa, semestre } = parsed.data;

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
  }

  // El rol DOCENTE requiere un código de invitación para evitar auto-asignación.
  if (rol === "DOCENTE") {
    const codigo = req.headers.get("x-codigo-docente");
    if (codigo !== (process.env.CODIGO_INVITACION_DOCENTE ?? "UT-DOCENTE")) {
      return NextResponse.json(
        { error: "Código de invitación docente inválido" },
        { status: 403 },
      );
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: nombre,
      email,
      passwordHash,
      rol,
      programa,
      semestre,
      universidad: "Universidad del Tolima",
    },
  });

  return NextResponse.json({ ok: true });
}
