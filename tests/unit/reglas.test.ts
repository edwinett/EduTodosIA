import { describe, it, expect } from "vitest";
import {
  generarCodigoEquipo,
  esCodigoEquipoValido,
  nodoDisponible,
  todasLasClaves,
  juegoCompletado,
  porcentajeProgreso,
  nodoCompletado,
  NODOS_ORDEN,
} from "@/lib/juego/reglas";
import type { EstadoJuego, NodoId, ProgresoNodo } from "@/lib/juego/tipos";

function progresoNodo(candadoAbierto: boolean): ProgresoNodo {
  return {
    nodo: "radio",
    estado: candadoAbierto ? "completado" : "activo",
    candadoAbierto,
    retos: {},
  };
}

function estado(claves: Partial<Record<NodoId, string | null>>, finales = false): EstadoJuego {
  const base: Record<NodoId, string | null> = {
    radio: null,
    tv: null,
    telefono: null,
    internet: null,
    final: null,
  };
  const nodos = {} as EstadoJuego["nodos"];
  for (const n of ["radio", "tv", "telefono", "internet", "final"] as NodoId[]) {
    nodos[n] = progresoNodo(!!claves[n]);
  }
  if (finales) nodos.final = progresoNodo(true);
  return {
    equipoId: "e1",
    partidaId: "p1",
    nombreEquipo: "x",
    codigoEquipo: "ABC123",
    avatar: "satelite",
    nodos,
    claves: { ...base, ...claves },
    puntaje: 0,
    insignias: [],
    inicioMs: 0,
    finMs: null,
    resultado: "en-curso",
  };
}

describe("generarCodigoEquipo", () => {
  it("genera 6 caracteres válidos sin ambigüedades", () => {
    for (let i = 0; i < 50; i++) {
      const c = generarCodigoEquipo();
      expect(c).toHaveLength(6);
      expect(esCodigoEquipoValido(c)).toBe(true);
      expect(c).not.toMatch(/[O0I1]/);
    }
  });
  it("es determinista con un rng dado", () => {
    const rng = () => 0;
    expect(generarCodigoEquipo(rng)).toBe("AAAAAA");
  });
});

describe("esCodigoEquipoValido", () => {
  it("acepta 6 alfanuméricos en mayúscula", () => {
    expect(esCodigoEquipoValido("ABC123")).toBe(true);
    expect(esCodigoEquipoValido("abc123")).toBe(false);
    expect(esCodigoEquipoValido("ABC12")).toBe(false);
  });
});

describe("disponibilidad y progreso", () => {
  it("los nodos jugables siempre están disponibles", () => {
    const e = estado({});
    expect(nodoDisponible(e, "radio")).toBe(true);
  });
  it("el nodo final requiere las 4 claves", () => {
    expect(nodoDisponible(estado({}), "final")).toBe(false);
    expect(
      nodoDisponible(estado({ radio: "1929", tv: "79", telefono: "608", internet: "RED" }), "final"),
    ).toBe(true);
  });
  it("todasLasClaves detecta el set completo", () => {
    expect(todasLasClaves(estado({ radio: "1929" }))).toBe(false);
    expect(
      todasLasClaves(estado({ radio: "1929", tv: "79", telefono: "608", internet: "RED" })),
    ).toBe(true);
  });
  it("porcentajeProgreso cuenta nodos completados", () => {
    const e = estado({ radio: "1929", tv: "79" });
    expect(porcentajeProgreso(e)).toBeCloseTo(0.5);
  });
  it("juegoCompletado revisa el candado final", () => {
    expect(juegoCompletado(estado({}, true))).toBe(true);
    expect(juegoCompletado(estado({}))).toBe(false);
  });
  it("nodoCompletado requiere estado completado y candado abierto", () => {
    expect(nodoCompletado(progresoNodo(true))).toBe(true);
    expect(nodoCompletado(progresoNodo(false))).toBe(false);
    expect(nodoCompletado(undefined)).toBe(false);
  });
  it("NODOS_ORDEN tiene los 4 nodos jugables", () => {
    expect(NODOS_ORDEN).toEqual(["radio", "tv", "telefono", "internet"]);
  });
});
