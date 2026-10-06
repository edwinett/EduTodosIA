// Sistema de puntaje de "SEÑAL PERDIDA".
//
// FÓRMULA (documentada):
//   puntajeReto = base
//               + bonusTiempo        (si resuelve rápido)
//               + bonusSinPistas     (si no usó pistas)
//               - penalizacionPistas (suma del costo de las pistas reveladas)
//
//   - base: puntos propios del reto (data/misiones.ts).
//   - bonusTiempo: hasta +50% de la base, decreciente linealmente respecto
//     al tiempo sugerido. Si tardó <= tiempoObjetivo → +50% base.
//     Si tardó >= 3×tiempoObjetivo → +0. Interpolado en el medio.
//   - bonusSinPistas: +25% de la base si pistasUsadas === 0.
//   - penalizacionPistas: suma de costos (50/100/200) de las pistas reveladas.
//
//   El puntaje de un reto nunca es negativo (se recorta a 0).

export const COSTOS_PISTA = [50, 100, 200] as const;

export interface EntradaPuntaje {
  base: number;
  tiempoMs: number;
  tiempoObjetivoMs: number;
  pistasUsadas: number; // 0..3 (niveles revelados)
  correcto: boolean;
}

export function costoPistasAcumulado(pistasUsadas: number): number {
  const n = Math.max(0, Math.min(3, Math.floor(pistasUsadas)));
  let total = 0;
  for (let i = 0; i < n; i++) total += COSTOS_PISTA[i]!;
  return total;
}

export function bonusTiempo(base: number, tiempoMs: number, tiempoObjetivoMs: number): number {
  if (tiempoObjetivoMs <= 0) return 0;
  const maxBonus = base * 0.5;
  if (tiempoMs <= tiempoObjetivoMs) return Math.round(maxBonus);
  const limite = tiempoObjetivoMs * 3;
  if (tiempoMs >= limite) return 0;
  const fraccion = 1 - (tiempoMs - tiempoObjetivoMs) / (limite - tiempoObjetivoMs);
  return Math.round(maxBonus * fraccion);
}

export function puntajeReto(e: EntradaPuntaje): number {
  if (!e.correcto) return 0;
  const bonusT = bonusTiempo(e.base, e.tiempoMs, e.tiempoObjetivoMs);
  const bonusSinPistas = e.pistasUsadas === 0 ? Math.round(e.base * 0.25) : 0;
  const penalizacion = costoPistasAcumulado(e.pistasUsadas);
  const total = e.base + bonusT + bonusSinPistas - penalizacion;
  return Math.max(0, total);
}

export interface EntradaPrecision {
  totalIntentos: number;
  intentosCorrectos: number;
}

// Precisión global: % de intentos correctos sobre el total de intentos.
export function precisionGlobal(e: EntradaPrecision): number {
  if (e.totalIntentos <= 0) return 0;
  return Math.round((e.intentosCorrectos / e.totalIntentos) * 100);
}
