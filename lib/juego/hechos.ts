import type { NodoId } from "@/lib/juego/tipos";
import type { JuegoStore } from "@/lib/juego/store";
import type { HechosInsignia } from "@/lib/juego/insignias";
import { precisionGlobal } from "@/lib/juego/puntaje";

// Construye el "snapshot" de hechos para evaluar insignias a partir del estado del juego.
export function construirHechos(
  estado: Pick<
    JuegoStore,
    "nodos" | "inicioMs" | "finMs" | "erroresCandado" | "erroresCandadoFinal"
  >,
  extra?: { integrantesActivos?: number; minutosEquipoActivo?: number },
): HechosInsignia {
  const nodos = estado.nodos;
  const nodoIds: NodoId[] = ["radio", "tv", "telefono", "internet", "final"];

  let retosResueltos = 0;
  let totalIntentos = 0;
  let algunRetoCon3PistasResuelto = false;
  const pistasPorNodo: Record<string, number> = {};

  for (const id of nodoIds) {
    const nodo = nodos[id];
    if (!nodo) continue;
    let pistasNodo = 0;
    for (const reto of Object.values(nodo.retos)) {
      totalIntentos += reto.intentos;
      pistasNodo += reto.pistasUsadas;
      if (reto.resuelto) {
        retosResueltos++;
        if (reto.pistasUsadas >= 3) algunRetoCon3PistasResuelto = true;
      }
    }
    pistasPorNodo[id] = pistasNodo;
  }

  const nodosCompletados = nodoIds.filter((id) => nodos[id]?.candadoAbierto);

  const tvCrono = nodos.tv?.retos["tv-cronologia"];
  const retoCronologiaPrimerIntento = !!tvCrono && tvCrono.resuelto && tvCrono.intentos === 1;

  const finMs = estado.finMs ?? Date.now();
  const tiempoTotalMs = estado.inicioMs != null ? Math.max(0, finMs - estado.inicioMs) : 0;

  const juegoCompletado = nodos.final?.candadoAbierto === true;

  const reflexion = nodos.final?.retos["final-reflexion"];
  const preguntasAmbientalesTotales = 1;
  const preguntasAmbientalesCorrectas = reflexion?.resuelto ? 1 : 0;

  const prec = precisionGlobal({
    totalIntentos,
    intentosCorrectos: retosResueltos,
  });

  return {
    retosResueltos,
    nodosCompletados: nodosCompletados.filter((n): n is NodoId => n !== "final" || true),
    pistasPorNodo,
    retoCronologiaPrimerIntento,
    tiempoTotalMs,
    algunRetoCon3PistasResuelto,
    juegoCompletado,
    erroresCandado: estado.erroresCandado,
    erroresCandadoFinal: estado.erroresCandadoFinal,
    preguntasAmbientalesCorrectas,
    preguntasAmbientalesTotales,
    integrantesActivos: extra?.integrantesActivos ?? 1,
    minutosEquipoActivo: extra?.minutosEquipoActivo ?? Math.floor(tiempoTotalMs / 60000),
    precisionGlobal: prec,
  };
}
