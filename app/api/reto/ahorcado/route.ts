import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenerRetoServidor } from "@/lib/contenido/servidor";
import { normalizar } from "@/lib/juego/validadores";

export const runtime = "nodejs";

const schema = z.object({
  retoId: z.string().min(1).max(64),
  letra: z.string().min(1).max(1),
});

// POST /api/reto/ahorcado — dado un reto de ahorcado y una letra, devuelve las
// posiciones donde aparece esa letra EN EL SERVIDOR (nunca se envía la palabra completa).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const reto = await obtenerRetoServidor(parsed.data.retoId);
  if (!reto || reto.tipo !== "ahorcado" || typeof reto.solucion !== "string") {
    return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
  }

  const palabra = normalizar(reto.solucion);
  const letra = normalizar(parsed.data.letra);
  const posiciones: number[] = [];
  for (let i = 0; i < palabra.length; i++) {
    if (palabra[i] === letra) posiciones.push(i);
  }

  return NextResponse.json({ posiciones, longitud: palabra.length });
}
