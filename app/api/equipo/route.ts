import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { crearEquipoSchema, unirseEquipoSchema } from "@/lib/validacion/esquemas";
import { generarCodigoEquipo } from "@/lib/juego/reglas";
import { auth } from "@/auth";
import { z } from "zod";

export const runtime = "nodejs";

const crearConAula = crearEquipoSchema.extend({
  codigoAula: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/).optional(),
});

async function resolverAula(codigoAula?: string) {
  if (!codigoAula) return null;
  const aula = await prisma.sesionAula.findUnique({ where: { codigo: codigoAula } });
  if (!aula || aula.estado !== "ABIERTA") return null;
  return aula;
}

// POST /api/equipo — crea un equipo y abre una partida (requiere sesión).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = crearConAula.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { nombre, avatar, programa, semestre, codigoAula } = parsed.data;

  let codigo = generarCodigoEquipo();
  for (let i = 0; i < 5; i++) {
    const existe = await prisma.equipo.findUnique({ where: { codigo } });
    if (!existe) break;
    codigo = generarCodigoEquipo();
  }

  const aula = await resolverAula(codigoAula);

  const equipo = await prisma.equipo.create({
    data: {
      nombre,
      codigo,
      avatar,
      programa,
      semestre,
      sesionAulaId: aula?.id,
      integrantes: { connect: { id: session.user.id } },
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
    aula: aula ? aula.nombre : null,
  });
}

// PUT /api/equipo — unirse a un equipo existente por código (requiere sesión).
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

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

  const { codigo } = parsed.data;
  const equipo = await prisma.equipo.findUnique({
    where: { codigo },
    include: { partidas: { orderBy: { inicio: "desc" }, take: 1 } },
  });
  if (!equipo) {
    return NextResponse.json({ error: "Código de equipo no encontrado" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { equipoId: equipo.id },
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
