import type { NodoId, ProgresoNodo, EstadoJuego } from "@/lib/juego/tipos";

export const DURACION_PARTIDA_SEG = Number(
  process.env.NEXT_PUBLIC_DURACION_PARTIDA_SEG ?? "5400",
); // 90 min por defecto

export const AVISOS_SEG = [900, 300, 60]; // 15, 5 y 1 minuto

export const NODOS_ORDEN = ["radio", "tv", "telefono", "internet"] as const satisfies readonly Exclude<
  NodoId,
  "final"
>[];

// Código de equipo: 6 caracteres alfanuméricos sin ambigüedades (sin O/0, I/1).
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generarCodigoEquipo(rng: () => number = Math.random): string {
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += ALFABETO[Math.floor(rng() * ALFABETO.length)];
  }
  return codigo;
}

export function esCodigoEquipoValido(codigo: string): boolean {
  return /^[A-Z0-9]{6}$/.test(codigo);
}

// Un nodo jugable está disponible siempre (orden libre); el final requiere las 4 claves.
export function nodoDisponible(estado: EstadoJuego, nodo: NodoId): boolean {
  if (nodo === "final") {
    return NODOS_ORDEN.every((n) => estado.claves[n] !== null);
  }
  return true;
}

export function nodoCompletado(progreso: ProgresoNodo | undefined): boolean {
  return !!progreso && progreso.estado === "completado" && progreso.candadoAbierto;
}

// ¿Están todas las claves parciales obtenidas?
export function todasLasClaves(estado: EstadoJuego): boolean {
  return NODOS_ORDEN.every((n) => estado.claves[n] !== null);
}

// ¿El juego está completo (caja fuerte abierta)?
export function juegoCompletado(estado: EstadoJuego): boolean {
  return estado.nodos.final?.candadoAbierto === true;
}

// Progreso 0..1 según nodos jugables completados.
export function porcentajeProgreso(estado: EstadoJuego): number {
  const completados = NODOS_ORDEN.filter((n) => nodoCompletado(estado.nodos[n])).length;
  return completados / NODOS_ORDEN.length;
}
