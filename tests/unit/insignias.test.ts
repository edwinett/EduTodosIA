import { describe, it, expect } from "vitest";
import { evaluarInsignias, insigniasNuevas, type HechosInsignia } from "@/lib/juego/insignias";

function hechosBase(): HechosInsignia {
  return {
    retosResueltos: 0,
    nodosCompletados: [],
    pistasPorNodo: {},
    retoCronologiaPrimerIntento: false,
    tiempoTotalMs: 0,
    algunRetoCon3PistasResuelto: false,
    juegoCompletado: false,
    erroresCandado: 0,
    erroresCandadoFinal: 0,
    preguntasAmbientalesCorrectas: 0,
    preguntasAmbientalesTotales: 1,
    integrantesActivos: 1,
    minutosEquipoActivo: 0,
    precisionGlobal: 0,
  };
}

describe("evaluarInsignias", () => {
  it("otorga 'primer-contacto' al resolver un reto", () => {
    const r = evaluarInsignias({ ...hechosBase(), retosResueltos: 1 });
    expect(r).toContain("primer-contacto");
  });

  it("otorga 'sintonizador' al completar radio sin pistas", () => {
    const r = evaluarInsignias({
      ...hechosBase(),
      nodosCompletados: ["radio"],
      pistasPorNodo: { radio: 0 },
    });
    expect(r).toContain("sintonizador");
  });

  it("no otorga 'sintonizador' si usó pistas en radio", () => {
    const r = evaluarInsignias({
      ...hechosBase(),
      nodosCompletados: ["radio"],
      pistasPorNodo: { radio: 2 },
    });
    expect(r).not.toContain("sintonizador");
  });

  it("otorga 'cronista' solo con la cronología al primer intento", () => {
    expect(
      evaluarInsignias({ ...hechosBase(), nodosCompletados: ["tv"], retoCronologiaPrimerIntento: true }),
    ).toContain("cronista");
    expect(
      evaluarInsignias({ ...hechosBase(), nodosCompletados: ["tv"], retoCronologiaPrimerIntento: false }),
    ).not.toContain("cronista");
  });

  it("otorga 'velocista' con los 4 nodos en < 30 min", () => {
    const r = evaluarInsignias({
      ...hechosBase(),
      nodosCompletados: ["radio", "tv", "telefono", "internet"],
      tiempoTotalMs: 20 * 60 * 1000,
    });
    expect(r).toContain("velocista");
  });

  it("otorga insignias de maestría al completar sin errores", () => {
    const r = evaluarInsignias({
      ...hechosBase(),
      juegoCompletado: true,
      erroresCandado: 0,
      erroresCandadoFinal: 0,
      precisionGlobal: 100,
      preguntasAmbientalesCorrectas: 1,
      integrantesActivos: 4,
      minutosEquipoActivo: 20,
      algunRetoCon3PistasResuelto: true,
    });
    expect(r).toEqual(
      expect.arrayContaining([
        "guardian-memoria",
        "maestro-codigo",
        "tolimense-ilustre",
        "eco-logico",
        "trabajo-equipo",
        "detective-analogico",
      ]),
    );
  });

  it("no otorga 'guardian-memoria' con errores de candado", () => {
    const r = evaluarInsignias({ ...hechosBase(), juegoCompletado: true, erroresCandado: 2 });
    expect(r).not.toContain("guardian-memoria");
  });
});

describe("insigniasNuevas", () => {
  it("devuelve solo las que no están ya obtenidas", () => {
    const h = { ...hechosBase(), retosResueltos: 1 };
    expect(insigniasNuevas(h, [])).toContain("primer-contacto");
    expect(insigniasNuevas(h, ["primer-contacto"])).not.toContain("primer-contacto");
  });
});
