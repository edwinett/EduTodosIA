import { describe, it, expect } from "vitest";
import {
  puntajeReto,
  bonusTiempo,
  costoPistasAcumulado,
  precisionGlobal,
  COSTOS_PISTA,
} from "@/lib/juego/puntaje";

describe("costoPistasAcumulado", () => {
  it("suma los costos crecientes 50/100/200", () => {
    expect(costoPistasAcumulado(0)).toBe(0);
    expect(costoPistasAcumulado(1)).toBe(50);
    expect(costoPistasAcumulado(2)).toBe(150);
    expect(costoPistasAcumulado(3)).toBe(350);
  });
  it("recorta a un máximo de 3 pistas", () => {
    expect(costoPistasAcumulado(9)).toBe(350);
  });
  it("trata valores negativos como 0", () => {
    expect(costoPistasAcumulado(-5)).toBe(0);
  });
  it("expone la tabla de costos", () => {
    expect(COSTOS_PISTA).toEqual([50, 100, 200]);
  });
});

describe("bonusTiempo", () => {
  it("otorga +50% de la base si resuelve dentro del tiempo objetivo", () => {
    expect(bonusTiempo(100, 10_000, 60_000)).toBe(50);
  });
  it("otorga 0 si tarda 3x o más el tiempo objetivo", () => {
    expect(bonusTiempo(100, 180_000, 60_000)).toBe(0);
    expect(bonusTiempo(100, 999_000, 60_000)).toBe(0);
  });
  it("interpola linealmente en el medio", () => {
    // a 2x el objetivo (punto medio entre x1 y x3) -> ~25% de la base
    expect(bonusTiempo(100, 120_000, 60_000)).toBe(25);
  });
  it("devuelve 0 si el objetivo es inválido", () => {
    expect(bonusTiempo(100, 1000, 0)).toBe(0);
  });
});

describe("puntajeReto", () => {
  it("devuelve 0 si la respuesta es incorrecta", () => {
    expect(
      puntajeReto({ base: 100, tiempoMs: 1000, tiempoObjetivoMs: 60_000, pistasUsadas: 0, correcto: false }),
    ).toBe(0);
  });
  it("suma base + bonus de tiempo + bonus sin pistas", () => {
    // base 100, rápido (+50), sin pistas (+25) = 175
    expect(
      puntajeReto({ base: 100, tiempoMs: 1000, tiempoObjetivoMs: 60_000, pistasUsadas: 0, correcto: true }),
    ).toBe(175);
  });
  it("penaliza por pistas y no aplica bonus sin pistas", () => {
    // base 100, rápido (+50), 2 pistas (-150) = 0 (no negativo)
    expect(
      puntajeReto({ base: 100, tiempoMs: 1000, tiempoObjetivoMs: 60_000, pistasUsadas: 2, correcto: true }),
    ).toBe(0);
  });
  it("nunca es negativo", () => {
    const p = puntajeReto({ base: 50, tiempoMs: 500000, tiempoObjetivoMs: 60_000, pistasUsadas: 3, correcto: true });
    expect(p).toBeGreaterThanOrEqual(0);
  });
});

describe("precisionGlobal", () => {
  it("calcula el porcentaje de aciertos", () => {
    expect(precisionGlobal({ totalIntentos: 10, intentosCorrectos: 8 })).toBe(80);
    expect(precisionGlobal({ totalIntentos: 4, intentosCorrectos: 4 })).toBe(100);
  });
  it("devuelve 0 sin intentos", () => {
    expect(precisionGlobal({ totalIntentos: 0, intentosCorrectos: 0 })).toBe(0);
  });
});
