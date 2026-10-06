import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

function csvEscape(valor: unknown): string {
  const s = String(valor ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// GET /api/docente/export — exporta el ranking a CSV (solo docente autenticado).
export async function GET() {
  const esDocente = cookies().get("docente")?.value === "1";
  if (!esDocente) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const equipos = await prisma.equipo.findMany({
    include: {
      insignias: true,
      partidas: { orderBy: { inicio: "desc" }, take: 1 },
      _count: { select: { integrantes: true } },
    },
    orderBy: { puntajeTotal: "desc" },
  });

  const encabezado = [
    "nombre",
    "codigo",
    "programa",
    "semestre",
    "puntaje",
    "tiempo_ms",
    "precision",
    "insignias",
    "integrantes",
    "estado",
  ];

  const filas = equipos.map((e) => {
    const ultima = e.partidas[0];
    return [
      e.nombre,
      e.codigo,
      e.programa ?? "",
      e.semestre ?? "",
      e.puntajeTotal,
      e.tiempoTotal,
      ultima?.precision ?? 0,
      e.insignias.length,
      e._count.integrantes,
      ultima?.estado ?? "SIN_PARTIDA",
    ].map(csvEscape).join(",");
  });

  const csv = [encabezado.join(","), ...filas].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ranking-senal-perdida.csv"',
    },
  });
}
