import { NextResponse } from "next/server";
import { validarRetoSchema } from "@/lib/validacion/esquemas";
import { validarReto } from "@/lib/juego/soluciones.server";
import { getReto } from "@/data/misiones";
import { puntajeReto } from "@/lib/juego/puntaje";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

// POST /api/validar  — valida la respuesta de un reto EN EL SERVIDOR.
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

  const reto = getReto(retoId);
  if (!reto || reto.nodo !== nodo) {
    return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
  }

  const { correcto } = validarReto(retoId, respuesta);

  const puntos = correcto
    ? puntajeReto({
        base: reto.puntos,
        tiempoMs,
        tiempoObjetivoMs: 2 * 60 * 1000, // objetivo por reto: 2 min
        pistasUsadas,
        correcto,
      })
    : 0;

  // Registro de intento (si hay partida persistida). No bloquea la respuesta.
  if (partidaId) {
    try {
      const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
      if (partida) {
        await prisma.intentoReto.create({
          data: {
            partidaId,
            retoId,
            nodo,
            respuesta: typeof respuesta === "object" ? JSON.stringify(respuesta) : String(respuesta),
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
    // El feedback educativo solo se entrega cuando la respuesta es correcta.
    feedbackEducativo: correcto ? reto.feedbackEducativo : null,
  });
}
