// Capa de contenido del juego leída desde el catálogo (base de datos).
// ⚠️ SOLO-SERVIDOR. La versión pública NUNCA incluye solución ni clave parcial.

import { prisma } from "@/lib/db/prisma";
import { NODOS_ORDEN } from "@/lib/juego/reglas";
import type {
  NodoPublico,
  RetoPublico,
  Dificultad,
  TipoCandado,
  TipoReto,
  NodoId,
} from "@/lib/juego/tipos";

function parseJson(valor: string, porDefecto: unknown): unknown {
  try {
    return JSON.parse(valor);
  } catch {
    return porDefecto;
  }
}

// Nodos públicos (para el cliente): sin claveParcial ni solucionJson.
export async function obtenerNodosPublicos(): Promise<NodoPublico[]> {
  const nodos = await prisma.nodo.findMany({
    orderBy: { orden: "asc" },
    include: {
      retos: {
        orderBy: { orden: "asc" },
        include: { pistas: { orderBy: { nivel: "asc" } } },
      },
    },
  });

  return nodos.map((n) => {
    const retos: RetoPublico[] = n.retos.map((r) => ({
      id: r.slug,
      nodo: n.slug as NodoId,
      tipo: r.tipo as TipoReto,
      titulo: r.titulo,
      enunciado: r.enunciado,
      dificultad: r.dificultad as Dificultad,
      puntos: r.puntos,
      datos: parseJson(r.datosJson, {}) as Record<string, unknown>,
      feedbackEducativo: r.feedbackEducativo,
      pistas: r.pistas.map((p) => ({
        nivel: p.nivel as 1 | 2 | 3,
        texto: p.texto,
        costoPuntos: p.costoPuntos,
      })),
    }));

    return {
      id: n.slug as NodoId,
      nombre: n.nombre,
      descripcion: n.descripcion,
      narrativa: n.narrativa,
      hitoHistorico: n.hitoHistorico,
      datoAmbiental: n.datoAmbiental,
      dificultad: n.dificultad as Dificultad,
      tiempoSugeridoMin: n.tiempoSugeridoMin,
      tipoCandado: n.tipoCandado as TipoCandado,
      pistaCandado: n.pistaCandado,
      retos,
    };
  });
}

// Datos de un reto para VALIDAR en el servidor (incluye la solución).
export async function obtenerRetoServidor(slug: string) {
  const reto = await prisma.reto.findUnique({
    where: { slug },
    include: { nodo: { select: { slug: true } } },
  });
  if (!reto) return null;
  return {
    slug: reto.slug,
    tipo: reto.tipo,
    puntos: reto.puntos,
    feedbackEducativo: reto.feedbackEducativo,
    nodoSlug: reto.nodo.slug,
    solucion: parseJson(reto.solucionJson, null),
  };
}

// Datos de un nodo para validar su candado (incluye la clave parcial).
export async function obtenerNodoServidor(slug: string) {
  const nodo = await prisma.nodo.findUnique({ where: { slug } });
  if (!nodo) return null;
  return { slug: nodo.slug, tipoCandado: nodo.tipoCandado, claveParcial: nodo.claveParcial };
}

// Claves parciales de los 4 nodos núcleo, en orden, para la caja fuerte final.
export async function obtenerClavesFinal(): Promise<string[]> {
  const nodos = await prisma.nodo.findMany({
    where: { slug: { in: [...NODOS_ORDEN] } },
    select: { slug: true, claveParcial: true },
  });
  const porSlug = new Map(nodos.map((n) => [n.slug, n.claveParcial]));
  return NODOS_ORDEN.map((s) => porSlug.get(s) ?? "");
}
