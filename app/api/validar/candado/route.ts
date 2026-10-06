import { NextResponse } from "next/server";
import { validarCandadoSchema } from "@/lib/validacion/esquemas";
import { validarClaveCandado } from "@/lib/juego/validadores";
import { obtenerNodoServidor, obtenerClavesFinal } from "@/lib/contenido/servidor";

export const runtime = "nodejs";

// POST /api/validar/candado — valida la apertura de un candado EN EL SERVIDOR,
// leyendo la clave esperada desde el catálogo (base de datos).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = validarCandadoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { nodo, valor } = parsed.data;

  // Caja fuerte final: combinación de las 4 claves parciales en orden.
  if (nodo === "final") {
    const claves = await obtenerClavesFinal();
    const correcto = validarClaveCandado("combinacion", claves, valor);
    return NextResponse.json({ correcto, claveParcial: correcto ? claves.join("-") : null });
  }

  const nodoDb = await obtenerNodoServidor(nodo);
  if (!nodoDb) {
    return NextResponse.json({ error: "Nodo no encontrado" }, { status: 404 });
  }

  const correcto = validarClaveCandado(nodoDb.tipoCandado, nodoDb.claveParcial, valor);
  return NextResponse.json({
    correcto,
    claveParcial: correcto ? nodoDb.claveParcial : null,
  });
}
