import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { crearEquipoSchema, unirseEquipoSchema } from "@/lib/validacion/esquemas";
import { generarCodigoEquipo } from "@/lib/juego/reglas";

export const runtime = "nodejs";

// POST /api/equipo — crea un equipo y abre una partida.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = crearEquipoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { nombre, avatar, programa, semestre, integrante } = parsed.data;

  // Genera un código único (reintenta ante colisiones).
  let codigo = generarCodigoEquipo();
  for (let i = 0; i < 5; i++) {
    const existe = await prisma.equipo.findUnique({ where: { codigo } });
    if (!existe) break;
    codigo = generarCodigoEquipo();
  }

  const equipo = await prisma.equipo.create({
    data: {
      nombre,
      codigo,
      avatar,
      programa,
      semestre,
      integrantes: integrante
        ? {
            create: {
              nombre: integrante,
              email: `${codigo.toLowerCase()}-${Date.now()}@aula.local`,
              rol: "ESTUDIANTE",
              programa,
              semestre,
            },
          }
        : undefined,
    },
  });

  const partida = await prisma.partida.create({
    data: { equipoId: equipo.id, estado: "EN_CURSO" },
  });

  return NextResponse.json({
    equipoId: equipo.id,
    codigo: equipo.codigo,
    nombre: equipo.nombre,
    avatar: equipo.avatar,
    partidaId: partida.id,
  });
}

// PUT /api/equipo — unirse a un equipo existente por código.
export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = unirseEquipoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { codigo, integrante } = parsed.data;
  const equipo = await prisma.equipo.findUnique({
    where: { codigo },
    include: { partidas: { orderBy: { inicio: "desc" }, take: 1 } },
  });

  if (!equipo) {
    return NextResponse.json({ error: "Código de equipo no encontrado" }, { status: 404 });
  }

  await prisma.usuario.create({
    data: {
      nombre: integrante,
      email: `${codigo.toLowerCase()}-${Date.now()}@aula.local`,
      rol: "ESTUDIANTE",
      equipoId: equipo.id,
      programa: equipo.programa,
      semestre: equipo.semestre,
    },
  });

  const partida =
    equipo.partidas[0] ??
    (await prisma.partida.create({ data: { equipoId: equipo.id, estado: "EN_CURSO" } }));

  return NextResponse.json({
    equipoId: equipo.id,
    codigo: equipo.codigo,
    nombre: equipo.nombre,
    avatar: equipo.avatar,
    partidaId: partida.id,
  });
}
