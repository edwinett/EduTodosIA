import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireDocente } from "@/lib/auth/guards";
import { crearSesionAulaSchema } from "@/lib/validacion/esquemas";
import { generarCodigoEquipo } from "@/lib/juego/reglas";

export const runtime = "nodejs";

// GET /api/aula — lista las sesiones de aula del docente autenticado.
export async function GET() {
  try {
    const docente = await requireDocente();
    const aulas = await prisma.sesionAula.findMany({
      where: { docenteId: docente.id },
      orderBy: { creadaEn: "desc" },
      include: { _count: { select: { equipos: true } } },
    });
    return NextResponse.json({ aulas });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

// POST /api/aula — crea una sesión de aula con código de 6 caracteres.
export async function POST(req: Request) {
  let docente;
  try {
    docente = await requireDocente();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = crearSesionAulaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  let codigo = generarCodigoEquipo();
  for (let i = 0; i < 5; i++) {
    const existe = await prisma.sesionAula.findUnique({ where: { codigo } });
    if (!existe) break;
    codigo = generarCodigoEquipo();
  }

  const aula = await prisma.sesionAula.create({
    data: { nombre: parsed.data.nombre, codigo, docenteId: docente.id },
  });

  return NextResponse.json({ aula });
}
