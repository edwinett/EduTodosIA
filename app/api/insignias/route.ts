import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { INSIGNIAS } from "@/data/insignias";

export const runtime = "nodejs";

// GET /api/insignias — catálogo de insignias + (opcional) obtenidas por un equipo.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const equipoId = searchParams.get("equipoId");

  let obtenidas: string[] = [];
  if (equipoId) {
    try {
      const registros = await prisma.insigniaObtenida.findMany({
        where: { equipoId },
        include: { insignia: true },
      });
      obtenidas = registros.map((r) => r.insignia.codigo);
    } catch {
      obtenidas = [];
    }
  }

  return NextResponse.json({
    catalogo: INSIGNIAS,
    obtenidas,
  });
}
