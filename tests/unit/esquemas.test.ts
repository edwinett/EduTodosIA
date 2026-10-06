import { describe, it, expect } from "vitest";
import {
  validarRetoSchema,
  validarCandadoSchema,
  crearEquipoSchema,
  unirseEquipoSchema,
  rankingQuerySchema,
  registrarResultadoSchema,
  docenteLoginSchema,
} from "@/lib/validacion/esquemas";

describe("validarRetoSchema", () => {
  it("acepta una respuesta válida y aplica el default de pistas", () => {
    const r = validarRetoSchema.safeParse({
      retoId: "radio-morse",
      nodo: "radio",
      respuesta: "TOLIMA",
      tiempoMs: 1000,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.pistasUsadas).toBe(0);
  });
  it("rechaza un nodo inválido", () => {
    const r = validarRetoSchema.safeParse({
      retoId: "x",
      nodo: "radiofonia",
      respuesta: "a",
      tiempoMs: 1,
    });
    expect(r.success).toBe(false);
  });
  it("acepta respuestas de tipo arreglo (cronología)", () => {
    const r = validarRetoSchema.safeParse({
      retoId: "tv-cronologia",
      nodo: "tv",
      respuesta: ["h1954", "h1979", "h1998"],
      tiempoMs: 5000,
    });
    expect(r.success).toBe(true);
  });
  it("rechaza tiempos negativos", () => {
    const r = validarRetoSchema.safeParse({ retoId: "x", nodo: "radio", respuesta: "a", tiempoMs: -1 });
    expect(r.success).toBe(false);
  });
});

describe("validarCandadoSchema", () => {
  it("acepta valor string o arreglo", () => {
    expect(validarCandadoSchema.safeParse({ nodo: "radio", valor: "1929" }).success).toBe(true);
    expect(
      validarCandadoSchema.safeParse({ nodo: "final", valor: ["1929", "79", "608", "RED"] }).success,
    ).toBe(true);
  });
});

describe("crearEquipoSchema", () => {
  it("exige nombre de al menos 2 caracteres", () => {
    expect(crearEquipoSchema.safeParse({ nombre: "A" }).success).toBe(false);
    const r = crearEquipoSchema.safeParse({ nombre: "Equipo" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.avatar).toBe("satelite");
  });
  it("coacciona el semestre a número", () => {
    const r = crearEquipoSchema.safeParse({ nombre: "Equipo", semestre: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.semestre).toBe(3);
  });
});

describe("unirseEquipoSchema", () => {
  it("normaliza el código a mayúsculas y valida 6 caracteres", () => {
    const r = unirseEquipoSchema.safeParse({ codigo: "abc123", integrante: "Ana" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.codigo).toBe("ABC123");
  });
  it("rechaza códigos de longitud incorrecta", () => {
    expect(unirseEquipoSchema.safeParse({ codigo: "AB12", integrante: "Ana" }).success).toBe(false);
  });
});

describe("rankingQuerySchema", () => {
  it("aplica orden por defecto 'puntaje'", () => {
    const r = rankingQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.orden).toBe("puntaje");
      expect(r.data.limite).toBe(50);
    }
  });
});

describe("registrarResultadoSchema y docenteLoginSchema", () => {
  it("valida el resultado final", () => {
    const r = registrarResultadoSchema.safeParse({
      partidaId: "p1",
      puntaje: 100,
      tiempoTotalMs: 1000,
      precision: 90,
      estado: "GANADA",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.insignias).toEqual([]);
  });
  it("rechaza precisión fuera de rango", () => {
    expect(
      registrarResultadoSchema.safeParse({
        partidaId: "p1",
        puntaje: 1,
        tiempoTotalMs: 1,
        precision: 150,
        estado: "GANADA",
      }).success,
    ).toBe(false);
  });
  it("exige clave en docenteLoginSchema", () => {
    expect(docenteLoginSchema.safeParse({ password: "x" }).success).toBe(true);
    expect(docenteLoginSchema.safeParse({}).success).toBe(false);
  });
});
