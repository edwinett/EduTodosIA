import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { rankingQuerySchema, registrarResultadoSchema } from "@/lib/validacion/esquemas";

export const runtime = "nodejs";

// GET /api/ranking — tabla de clasificación con filtros y orden.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = rankingQuerySchema.safeParse({
    orden: searchParams.get("orden") ?? undefined,
    programa: searchParams.get("programa") ?? undefined,
    semestre: searchParams.get("semestre") ?? undefined,
    limite: searchParams.get("limite") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }
  const { orden, programa, semestre, limite } = parsed.data;

  const equipos = await prisma.equipo.findMany({
    where: {
      ...(programa ? { programa } : {}),
      ...(semestre ? { semestre } : {}),
    },
    include: {
      insignias: true,
      partidas: { orderBy: { inicio: "desc" }, take: 1 },
      _count: { select: { integrantes: true } },
    },
    take: limite,
  });

  const filas = equipos.map((e) => {
    const ultima = e.partidas[0];
    return {
      equipoId: e.id,
      nombre: e.nombre,
      codigo: e.codigo,
      avatar: e.avatar,
      programa: e.programa,
      semestre: e.semestre,
      puntaje: e.puntajeTotal,
      tiempoMs: e.tiempoTotal,
      precision: ultima?.precision ?? 0,
      insignias: e.insignias.length,
      integrantes: e._count.integrantes,
      estado: ultima?.estado ?? "SIN_PARTIDA",
    };
  });

  filas.sort((a, b) => {
    switch (orden) {
      case "tiempo":
        // menor tiempo primero (solo entre quienes tienen puntaje)
        if (a.tiempoMs === 0) return 1;
        if (b.tiempoMs === 0) return -1;
        return a.tiempoMs - b.tiempoMs;
      case "precision":
        return b.precision - a.precision;
      case "insignias":
        return b.insignias - a.insignias;
      case "puntaje":
      default:
        return b.puntaje - a.puntaje;
    }
  });

  return NextResponse.json({ orden, filas });
}

// POST /api/ranking — registra el resultado final de una partida y otorga insignias.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = registrarResultadoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { partidaId, puntaje, tiempoTotalMs, precision, estado, insignias } = parsed.data;

  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) {
    return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });
  }

  await prisma.partida.update({
    where: { id: partidaId },
    data: { fin: new Date(), estado, puntaje, precision },
  });

  await prisma.equipo.update({
    where: { id: partida.equipoId },
    data: { puntajeTotal: puntaje, tiempoTotal: tiempoTotalMs },
  });

  // Otorga insignias (idempotente por @@unique insigniaId+equipoId).
  const otorgadas: string[] = [];
  for (const codigo of insignias) {
    const insignia = await prisma.insignia.findUnique({ where: { codigo } });
    if (!insignia) continue;
    try {
      await prisma.insigniaObtenida.create({
        data: { insigniaId: insignia.id, equipoId: partida.equipoId },
      });
      otorgadas.push(codigo);
    } catch {
      // ya la tenía
    }
  }

  return NextResponse.json({ ok: true, insigniasOtorgadas: otorgadas });
}
