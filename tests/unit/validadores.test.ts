import { describe, it, expect } from "vitest";
import {
  normalizar,
  validarRespuestaTipo,
  validarClaveCandado,
} from "@/lib/juego/validadores";

describe("normalizar", () => {
  it("quita tildes, espacios y mayúsculas", () => {
    expect(normalizar("  Ibagué ")).toBe("ibague");
    expect(normalizar(null)).toBe("");
  });
});

describe("validarRespuestaTipo", () => {
  it("dial: número con tolerancia (objeto o número)", () => {
    expect(validarRespuestaTipo("dial", { valor: 100.7, tolerancia: 0.2 }, 100.6)).toBe(true);
    expect(validarRespuestaTipo("dial", { valor: 100.7, tolerancia: 0.2 }, 95)).toBe(false);
    expect(validarRespuestaTipo("dial", 100.7, 100.7)).toBe(true);
    expect(validarRespuestaTipo("dial", { valor: 100.7 }, 100.85)).toBe(true); // tolerancia por defecto 0.2
    expect(validarRespuestaTipo("dial", { valor: 100.7 }, "abc")).toBe(false);
  });

  it("tipos numéricos: igualdad exacta", () => {
    expect(validarRespuestaTipo("longitud-onda", 500, "500")).toBe(true);
    expect(validarRespuestaTipo("pulsos", 15, 15)).toBe(true);
    expect(validarRespuestaTipo("conmutador", 8, 9)).toBe(false);
  });

  it("cronológico: orden exacto", () => {
    expect(validarRespuestaTipo("cronologico", ["h1954", "h1979", "h1998"], ["h1954", "h1979", "h1998"])).toBe(true);
    expect(validarRespuestaTipo("cronologico", ["h1954", "h1979", "h1998"], ["h1979", "h1954", "h1998"])).toBe(false);
    expect(validarRespuestaTipo("cronologico", ["h1954"], "no-array")).toBe(false);
    expect(validarRespuestaTipo("cronologico", "no-array", ["h1954"])).toBe(false);
  });

  it("texto/opciones: igualdad normalizada, con solución string o arreglo", () => {
    expect(validarRespuestaTipo("morse", "TOLIMA", "tolima")).toBe(true);
    expect(validarRespuestaTipo("quiz", "Opción Correcta", "opcion correcta")).toBe(true);
    expect(validarRespuestaTipo("pixelado", ["RTC", "RTVC"], "rtvc")).toBe(true);
    expect(validarRespuestaTipo("pixelado", ["RTC", "RTVC"], "otra")).toBe(false);
    expect(validarRespuestaTipo("t9", "TDJDPA", "tdjdpa")).toBe(true);
  });
});

describe("mecánicas nuevas", () => {
  it("rompecabezas: orden exacto de piezas", () => {
    const sol = ["p0", "p1", "p2", "p3"];
    expect(validarRespuestaTipo("rompecabezas", sol, ["p0", "p1", "p2", "p3"])).toBe(true);
    expect(validarRespuestaTipo("rompecabezas", sol, ["p1", "p0", "p2", "p3"])).toBe(false);
  });

  it("crucigrama: todas las entradas deben coincidir (normalizado)", () => {
    const sol = { h1: "PULSOS", v1: "DISCO" };
    expect(validarRespuestaTipo("crucigrama", sol, { h1: "pulsos", v1: "disco" })).toBe(true);
    expect(validarRespuestaTipo("crucigrama", sol, { h1: "PULSOS", v1: "DISCA" })).toBe(false);
    expect(validarRespuestaTipo("crucigrama", sol, { h1: "PULSOS" })).toBe(false);
    expect(validarRespuestaTipo("crucigrama", sol, "no-objeto")).toBe(false);
  });

  it("sopa de letras: conjunto de palabras sin importar el orden", () => {
    const sol = ["RED", "DATOS", "ENLACE"];
    expect(validarRespuestaTipo("sopa-de-letras", sol, ["enlace", "red", "datos"])).toBe(true);
    expect(validarRespuestaTipo("sopa-de-letras", sol, ["red", "datos"])).toBe(false);
    expect(validarRespuestaTipo("sopa-de-letras", sol, ["red", "datos", "otra"])).toBe(false);
  });

  it("ahorcado y adivinanza se validan como texto", () => {
    expect(validarRespuestaTipo("ahorcado", "SUTATENZA", "sutatenza")).toBe(true);
    expect(validarRespuestaTipo("adivinanza", ["radio", "la radio"], "La Radio")).toBe(true);
    expect(validarRespuestaTipo("adivinanza", ["radio", "la radio"], "television")).toBe(false);
  });
});

describe("validarClaveCandado", () => {
  it("numérico/palabra: igualdad normalizada", () => {
    expect(validarClaveCandado("numerico", "1929", "1929")).toBe(true);
    expect(validarClaveCandado("palabra", "RED", "red")).toBe(true);
    expect(validarClaveCandado("numerico", "1929", "0000")).toBe(false);
  });

  it("combinación: arreglo en orden exacto", () => {
    expect(validarClaveCandado("combinacion", ["1929", "79", "608", "RED"], ["1929", "79", "608", "RED"])).toBe(true);
    expect(validarClaveCandado("combinacion", ["1929", "79", "608", "RED"], ["79", "1929", "608", "RED"])).toBe(false);
    expect(validarClaveCandado("combinacion", ["1929"], "no-array")).toBe(false);
  });
});
