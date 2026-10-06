import { describe, it, expect } from "vitest";
import {
  validarReto,
  validarCandado,
  claveParcial,
  CLAVES_NODO,
  CODIGO_MAESTRO,
} from "@/lib/juego/soluciones.server";

describe("validarReto", () => {
  it("valida el dial con tolerancia", () => {
    expect(validarReto("radio-dial", 100.7).correcto).toBe(true);
    expect(validarReto("radio-dial", 100.6).correcto).toBe(true);
    expect(validarReto("radio-dial", 95).correcto).toBe(false);
  });

  it("valida la longitud de onda", () => {
    expect(validarReto("radio-onda", 500).correcto).toBe(true);
    expect(validarReto("radio-onda", "500").correcto).toBe(true);
    expect(validarReto("radio-onda", 300).correcto).toBe(false);
  });

  it("valida Morse ignorando mayúsculas y tildes", () => {
    expect(validarReto("radio-morse", "TOLIMA").correcto).toBe(true);
    expect(validarReto("radio-morse", "tolima").correcto).toBe(true);
    expect(validarReto("radio-morse", "HUILA").correcto).toBe(false);
  });

  it("valida opciones de quiz por texto o índice", () => {
    expect(validarReto("radio-quiz", "Alfabetizar y educar a la población campesina rural").correcto).toBe(true);
    expect(validarReto("tv-estandar", "NTSC").correcto).toBe(true);
    expect(validarReto("net-dns", ".co").correcto).toBe(true);
    expect(validarReto("net-dns", "co").correcto).toBe(true);
    expect(validarReto("net-http", "404 (No encontrado)").correcto).toBe(true);
  });

  it("valida la cronología de TV en orden", () => {
    expect(validarReto("tv-cronologia", ["h1954", "h1979", "h1998"]).correcto).toBe(true);
    expect(validarReto("tv-cronologia", ["h1979", "h1954", "h1998"]).correcto).toBe(false);
    expect(validarReto("tv-cronologia", "no-es-array").correcto).toBe(false);
  });

  it("valida telefonía e internet", () => {
    expect(validarReto("tel-conmutador", 8).correcto).toBe(true);
    expect(validarReto("tel-pulsos", 15).correcto).toBe(true);
    expect(validarReto("tel-t9", "TDJDPA").correcto).toBe(true);
    expect(validarReto("tel-indicativos", "608 (Ibagué/Tolima)").correcto).toBe(true);
    expect(validarReto("net-binario", "RED").correcto).toBe(true);
    expect(validarReto("net-ip", "8.8.8.8").correcto).toBe(true);
    expect(validarReto("net-ip", "192.168.1.1").correcto).toBe(false);
  });

  it("valida la reflexión final", () => {
    expect(
      validarReto(
        "final-reflexion",
        "Conectar el territorio permite monitorear, divulgar y proteger el ambiente, y cerrar la brecha digital rural.",
      ).correcto,
    ).toBe(true);
  });

  it("devuelve incorrecto para un reto inexistente", () => {
    expect(validarReto("no-existe", "x").correcto).toBe(false);
  });
});

describe("validarCandado", () => {
  it("valida la clave parcial de cada nodo", () => {
    expect(validarCandado("radio", "1929").correcto).toBe(true);
    expect(validarCandado("tv", "79").correcto).toBe(true);
    expect(validarCandado("telefono", "608").correcto).toBe(true);
    expect(validarCandado("internet", "RED").correcto).toBe(true);
    expect(validarCandado("internet", "red").correcto).toBe(true);
    expect(validarCandado("radio", "0000").correcto).toBe(false);
  });

  it("valida la combinación final en orden", () => {
    expect(validarCandado("final", ["1929", "79", "608", "RED"]).correcto).toBe(true);
    expect(validarCandado("final", ["79", "1929", "608", "RED"]).correcto).toBe(false);
    expect(validarCandado("final", "x").correcto).toBe(false);
  });
});

describe("claves", () => {
  it("expone las claves de cada nodo y el código maestro", () => {
    expect(CLAVES_NODO.radio).toBe("1929");
    expect(CODIGO_MAESTRO).toEqual(["1929", "79", "608", "RED"]);
    expect(claveParcial("tv")).toBe("79");
    expect(claveParcial("final")).toContain("1929");
  });
});
