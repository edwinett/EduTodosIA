import { describe, it, expect } from "vitest";
import { construirHechos } from "@/lib/juego/hechos";
import type { NodoId, ProgresoNodo, ProgresoReto } from "@/lib/juego/tipos";

function reto(resuelto: boolean, intentos: number, pistas = 0): ProgresoReto {
  return { retoId: "r", resuelto, intentos, pistasUsadas: pistas, tiempoMs: 0 };
}

function nodo(candadoAbierto: boolean, retos: Record<string, ProgresoReto>): ProgresoNodo {
  return { nodo: "radio", estado: candadoAbierto ? "completado" : "activo", candadoAbierto, retos };
}

function estado(overrides?: Partial<Record<NodoId, ProgresoNodo>>) {
  const nodos = {
    radio: nodo(true, { a: reto(true, 1), b: reto(true, 1) }),
    tv: nodo(true, { "tv-cronologia": reto(true, 1) }),
    telefono: nodo(true, { c: reto(true, 1) }),
    internet: nodo(true, { d: reto(true, 1, 3) }),
    final: nodo(true, { "final-reflexion": reto(true, 1) }),
    ...overrides,
  } as Record<NodoId, ProgresoNodo>;
  return {
    nodos,
    inicioMs: 0,
    finMs: 20 * 60 * 1000,
    erroresCandado: 0,
    erroresCandadoFinal: 0,
  };
}

describe("construirHechos", () => {
  it("resume correctamente una partida perfecta", () => {
    const h = construirHechos(estado(), { integrantesActivos: 4, minutosEquipoActivo: 20 });
    expect(h.retosResueltos).toBe(6);
    expect(h.nodosCompletados).toEqual(["radio", "tv", "telefono", "internet", "final"]);
    expect(h.retoCronologiaPrimerIntento).toBe(true);
    expect(h.algunRetoCon3PistasResuelto).toBe(true);
    expect(h.juegoCompletado).toBe(true);
    expect(h.preguntasAmbientalesCorrectas).toBe(1);
    expect(h.precisionGlobal).toBe(100);
    expect(h.tiempoTotalMs).toBe(20 * 60 * 1000);
  });

  it("calcula precisión < 100 cuando hubo reintentos", () => {
    const h = construirHechos(
      estado({ radio: nodo(true, { a: reto(true, 3), b: reto(true, 1) }) }),
    );
    // 6 resueltos sobre (3+1 + 1 + 1 + 1 + 1) = 8 intentos -> 75%
    expect(h.precisionGlobal).toBe(75);
  });

  it("marca cronología fuera del primer intento", () => {
    const h = construirHechos(estado({ tv: nodo(true, { "tv-cronologia": reto(true, 2) }) }));
    expect(h.retoCronologiaPrimerIntento).toBe(false);
  });

  it("tiempoTotalMs es 0 sin inicio", () => {
    const e = estado();
    const h = construirHechos({ ...e, inicioMs: null });
    expect(h.tiempoTotalMs).toBe(0);
  });
});
