import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { DURACION_PARTIDA_SEG } from "@/lib/juego/reglas";

export const runtime = "nodejs";

// GET /api/timer?partidaId=... — timer AUTORITATIVO. El cliente solo refleja.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const partidaId = searchParams.get("partidaId");

  if (!partidaId) {
    // Sin partida persistida: el servidor igualmente define la duración.
    return NextResponse.json({
      duracionSeg: DURACION_PARTIDA_SEG,
      restanteSeg: DURACION_PARTIDA_SEG,
      expirado: false,
      servidorMs: Date.now(),
    });
  }

  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) {
    return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });
  }

  const transcurridoSeg = Math.floor((Date.now() - partida.inicio.getTime()) / 1000);
  const restanteSeg = Math.max(0, DURACION_PARTIDA_SEG - transcurridoSeg);
  const expirado = restanteSeg <= 0 && partida.estado === "EN_CURSO";

  return NextResponse.json({
    duracionSeg: DURACION_PARTIDA_SEG,
    restanteSeg,
    expirado,
    estado: partida.estado,
    servidorMs: Date.now(),
  });
}
