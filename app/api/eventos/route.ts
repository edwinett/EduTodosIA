import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

// GET /api/eventos?partidaId=... — intentos/eventos de una partida (uso docente/diagnóstico).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const partidaId = searchParams.get("partidaId");
  const equipoId = searchParams.get("equipoId");

  if (!partidaId && !equipoId) {
    return NextResponse.json({ error: "Falta partidaId o equipoId" }, { status: 400 });
  }

  const where = partidaId
    ? { partidaId }
    : { partida: { equipoId: equipoId! } };

  const intentos = await prisma.intentoReto.findMany({
    where,
    orderBy: { creadoEn: "asc" },
    take: 500,
  });

  // Resumen simple de diagnóstico.
  const porReto: Record<string, { intentos: number; correctos: number; pistas: number }> = {};
  for (const it of intentos) {
    const r = (porReto[it.retoId] ??= { intentos: 0, correctos: 0, pistas: 0 });
    r.intentos++;
    if (it.correcto) r.correctos++;
    r.pistas += it.pistasUsadas;
  }

  return NextResponse.json({ intentos, resumenPorReto: porReto });
}
