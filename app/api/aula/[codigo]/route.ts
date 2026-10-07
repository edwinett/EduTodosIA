import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireDocente } from "@/lib/auth/guards";
import { obtenerNodosPublicos } from "@/lib/contenido/servidor";

export const runtime = "nodejs";

// GET /api/aula/[codigo] — progreso en vivo de los equipos de una sesión de aula.
export async function GET(_req: Request, { params }: { params: { codigo: string } }) {
  try {
    await requireDocente();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }

  const codigo = params.codigo.toUpperCase();
  const aula = await prisma.sesionAula.findUnique({
    where: { codigo },
    include: {
      equipos: {
        include: {
          _count: { select: { integrantes: true } },
          partidas: {
            orderBy: { inicio: "desc" },
            take: 1,
            include: { intentos: true },
          },
        },
      },
    },
  });

  if (!aula) {
    return NextResponse.json({ error: "Aula no encontrada" }, { status: 404 });
  }

  // Retos por nodo (contenido del catálogo) para calcular nodos completados.
  const nodosPublicos = await obtenerNodosPublicos();
  const jugables = nodosPublicos.filter((n) => n.id !== "final");
  const retosPorNodo: Record<string, string[]> = {};
  for (const nodo of jugables) {
    retosPorNodo[nodo.id] = nodo.retos.map((r) => r.id);
  }
  const totalNodosJugables = jugables.length;

  const equipos = aula.equipos.map((e) => {
    const partida = e.partidas[0];
    const intentos = partida?.intentos ?? [];
    const correctos = new Set(intentos.filter((i) => i.correcto).map((i) => i.retoId));

    let nodosCompletados = 0;
    for (const [, retos] of Object.entries(retosPorNodo)) {
      if (retos.length > 0 && retos.every((r) => correctos.has(r))) nodosCompletados++;
    }

    const ultimaActividad =
      intentos.length > 0
        ? Math.max(...intentos.map((i) => i.creadoEn.getTime()))
        : partida?.inicio.getTime() ?? null;

    return {
      equipoId: e.id,
      nombre: e.nombre,
      codigo: e.codigo,
      integrantes: e._count.integrantes,
      retosResueltos: correctos.size,
      nodosCompletados,
      totalNodos: totalNodosJugables,
      intentosTotales: intentos.length,
      pistasUsadas: intentos.reduce((s, i) => s + i.pistasUsadas, 0),
      puntaje: partida?.puntaje ?? 0,
      estado: partida?.estado ?? "SIN_PARTIDA",
      ultimaActividad,
    };
  });

  equipos.sort((a, b) => b.nodosCompletados - a.nodosCompletados || b.retosResueltos - a.retosResueltos);

  return NextResponse.json({
    aula: { codigo: aula.codigo, nombre: aula.nombre, estado: aula.estado },
    equipos,
    servidorMs: Date.now(),
  });
}
