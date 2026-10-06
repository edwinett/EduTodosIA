import { describe, it, expect } from "vitest";
import { costoPistaNivel, puedeRevelar, siguienteNivel } from "@/lib/juego/pistas";

describe("pistas", () => {
  it("costoPistaNivel devuelve 50/100/200", () => {
    expect(costoPistaNivel(1)).toBe(50);
    expect(costoPistaNivel(2)).toBe(100);
    expect(costoPistaNivel(3)).toBe(200);
  });

  it("puedeRevelar respeta el máximo de pistas disponibles", () => {
    expect(puedeRevelar(0, 3)).toBe(true);
    expect(puedeRevelar(2, 3)).toBe(true);
    expect(puedeRevelar(3, 3)).toBe(false);
    expect(puedeRevelar(1, 1)).toBe(false);
  });

  it("siguienteNivel avanza 1 -> 2 -> 3 -> null", () => {
    expect(siguienteNivel(0)).toBe(1);
    expect(siguienteNivel(1)).toBe(2);
    expect(siguienteNivel(2)).toBe(3);
    expect(siguienteNivel(3)).toBeNull();
  });
});
