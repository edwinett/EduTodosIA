import { NextResponse } from "next/server";
import { validarRetoSchema } from "@/lib/validacion/esquemas";
import { validarRespuestaTipo } from "@/lib/juego/validadores";
import { obtenerRetoServidor } from "@/lib/contenido/servidor";
import { puntajeReto } from "@/lib/juego/puntaje";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

// POST /api/validar — valida la respuesta de un reto EN EL SERVIDOR, leyendo la
// solución desde el catálogo (base de datos) y validando de forma dinámica por tipo.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = validarRetoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { retoId, nodo, respuesta, tiempoMs, pistasUsadas, partidaId } = parsed.data;

  const reto = await obtenerRetoServidor(retoId);
  if (!reto || reto.nodoSlug !== nodo) {
    return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
  }

  const correcto = validarRespuestaTipo(reto.tipo, reto.solucion, respuesta);

  const puntos = correcto
    ? puntajeReto({
        base: reto.puntos,
        tiempoMs,
        tiempoObjetivoMs: 2 * 60 * 1000,
        pistasUsadas,
        correcto,
      })
    : 0;

  if (partidaId) {
    try {
      const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
      if (partida) {
        await prisma.intentoReto.create({
          data: {
            partidaId,
            retoId,
            nodo,
            respuesta:
              typeof respuesta === "object" ? JSON.stringify(respuesta) : String(respuesta),
            correcto,
            tiempoMs,
            pistasUsadas,
          },
        });
      }
    } catch {
      // Persistencia opcional; el juego sigue siendo jugable sin BD.
    }
  }

  return NextResponse.json({
    correcto,
    puntos,
    feedbackEducativo: correcto ? reto.feedbackEducativo : null,
  });
}
