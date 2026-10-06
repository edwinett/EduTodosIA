import { INSIGNIAS } from "@/data/insignias";
import type { NodoId } from "@/lib/juego/tipos";

// Hechos necesarios para evaluar las 12 insignias. Es un "snapshot" verificable
// que puede construirse tanto en el cliente (optimista) como en el servidor (autoritativo).
export interface HechosInsignia {
  retosResueltos: number;
  nodosCompletados: NodoId[];
  pistasPorNodo: Record<string, number>; // total de pistas usadas por nodo
  retoCronologiaPrimerIntento: boolean; // tv-cronologia resuelto en el 1er intento
  tiempoTotalMs: number;
  algunRetoCon3PistasResuelto: boolean;
  juegoCompletado: boolean;
  erroresCandado: number; // errores totales al abrir candados
  erroresCandadoFinal: number;
  preguntasAmbientalesCorrectas: number;
  preguntasAmbientalesTotales: number;
  integrantesActivos: number;
  minutosEquipoActivo: number;
  precisionGlobal: number; // 0..100
}

const TREINTA_MIN_MS = 30 * 60 * 1000;

type Criterio = (h: HechosInsignia) => boolean;

const CRITERIOS: Record<string, Criterio> = {
  "primer-contacto": (h) => h.retosResueltos >= 1,
  sintonizador: (h) =>
    h.nodosCompletados.includes("radio") && (h.pistasPorNodo["radio"] ?? 0) === 0,
  "operador-central": (h) => h.nodosCompletados.includes("telefono"),
  "ingeniero-red": (h) => h.nodosCompletados.includes("internet"),
  cronista: (h) =>
    h.nodosCompletados.includes("tv") && h.retoCronologiaPrimerIntento,
  velocista: (h) =>
    (["radio", "tv", "telefono", "internet"] as NodoId[]).every((n) =>
      h.nodosCompletados.includes(n),
    ) && h.tiempoTotalMs < TREINTA_MIN_MS,
  "detective-analogico": (h) => h.algunRetoCon3PistasResuelto,
  "guardian-memoria": (h) => h.juegoCompletado && h.erroresCandado === 0,
  "eco-logico": (h) =>
    h.preguntasAmbientalesTotales > 0 &&
    h.preguntasAmbientalesCorrectas === h.preguntasAmbientalesTotales,
  "trabajo-equipo": (h) => h.integrantesActivos >= 4 && h.minutosEquipoActivo >= 15,
  "maestro-codigo": (h) => h.juegoCompletado && h.erroresCandadoFinal === 0,
  "tolimense-ilustre": (h) => h.precisionGlobal === 100,
};

// Devuelve los códigos de insignia obtenidos según los hechos.
export function evaluarInsignias(h: HechosInsignia): string[] {
  return INSIGNIAS.filter((i) => {
    const c = CRITERIOS[i.codigo];
    return c ? c(h) : false;
  }).map((i) => i.codigo);
}

// Insignias nuevas respecto a las ya obtenidas.
export function insigniasNuevas(h: HechosInsignia, yaObtenidas: string[]): string[] {
  const todas = evaluarInsignias(h);
  const set = new Set(yaObtenidas);
  return todas.filter((c) => !set.has(c));
}
