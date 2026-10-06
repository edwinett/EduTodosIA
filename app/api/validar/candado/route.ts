import { NextResponse } from "next/server";
import { validarCandadoSchema } from "@/lib/validacion/esquemas";
import { validarCandado, claveParcial } from "@/lib/juego/soluciones.server";

export const runtime = "nodejs";

// POST /api/validar/candado — valida la apertura de un candado EN EL SERVIDOR.
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
  const { correcto } = validarCandado(nodo, valor);

  return NextResponse.json({
    correcto,
    // La clave parcial se entrega solo si el candado abrió.
    claveParcial: correcto ? claveParcial(nodo) : null,
  });
}
