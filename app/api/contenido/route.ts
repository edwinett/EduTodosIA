import { NextResponse } from "next/server";
import { obtenerNodosPublicos } from "@/lib/contenido/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/contenido — contenido PÚBLICO del juego (sin soluciones ni claves).
// El cliente consume esto; la validación sigue ocurriendo solo en el servidor.
export async function GET() {
  const nodos = await obtenerNodosPublicos();
  return NextResponse.json({ nodos });
}
