import { COSTOS_PISTA } from "@/lib/juego/puntaje";

// Lógica de pistas: 3 niveles, costo creciente (50, 100, 200).
// Nivel 1 = orientación · Nivel 2 = método · Nivel 3 = casi solución.

export function costoPistaNivel(nivel: 1 | 2 | 3): number {
  return COSTOS_PISTA[nivel - 1]!;
}

// Dado el número de pistas ya reveladas, ¿puede revelar la siguiente?
export function puedeRevelar(pistasUsadas: number, totalDisponibles: number): boolean {
  return pistasUsadas < Math.min(3, totalDisponibles);
}

// Siguiente nivel a revelar (1..3) o null si ya reveló todas.
export function siguienteNivel(pistasUsadas: number): 1 | 2 | 3 | null {
  if (pistasUsadas <= 0) return 1;
  if (pistasUsadas === 1) return 2;
  if (pistasUsadas === 2) return 3;
  return null;
}
