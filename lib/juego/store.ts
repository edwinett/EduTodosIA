"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EstadoJuego, ProgresoNodo, ProgresoReto } from "@/lib/juego/tipos";

// El contenido (nodos/retos) es dinámico y viene del catálogo (/api/contenido),
// por eso el progreso se construye de forma PEREZOSA: se crea la entrada del nodo
// o del reto la primera vez que se interactúa con él.

function nodoVacio(slug: string): ProgresoNodo {
  return { nodo: slug, estado: "activo", candadoAbierto: false, retos: {} };
}

function retoVacio(retoId: string): ProgresoReto {
  return { retoId, resuelto: false, intentos: 0, pistasUsadas: 0, tiempoMs: 0 };
}

function clavesIniciales(): Record<string, string | null> {
  // Los 4 nodos núcleo + final; nodos extra del catálogo se agregan al obtener su clave.
  return { radio: null, tv: null, telefono: null, internet: null, final: null };
}

export interface JuegoStore extends EstadoJuego {
  erroresCandado: number;
  erroresCandadoFinal: number;
  configurarEquipo: (data: {
    equipoId: string | null;
    partidaId: string | null;
    nombreEquipo: string;
    codigoEquipo: string;
    avatar: string;
  }) => void;
  iniciarPartida: () => void;
  registrarIntento: (nodo: string, retoId: string, correcto: boolean, tiempoMs: number) => void;
  usarPista: (nodo: string, retoId: string) => void;
  abrirCandado: (nodo: string, clave: string) => void;
  registrarErrorCandado: (nodo: string) => void;
  setPuntaje: (puntaje: number) => void;
  agregarInsignias: (codigos: string[]) => void;
  terminar: (resultado: "victoria" | "derrota") => void;
  reiniciarNodo: (nodo: string) => void;
  reiniciarTodo: () => void;
}

const estadoBase = (): EstadoJuego & { erroresCandado: number; erroresCandadoFinal: number } => ({
  equipoId: null,
  partidaId: null,
  nombreEquipo: null,
  codigoEquipo: null,
  avatar: "satelite",
  nodos: {},
  claves: clavesIniciales(),
  puntaje: 0,
  insignias: [],
  inicioMs: null,
  finMs: null,
  resultado: null,
  erroresCandado: 0,
  erroresCandadoFinal: 0,
});

export const useJuego = create<JuegoStore>()(
  persist(
    (set) => ({
      ...estadoBase(),

      configurarEquipo: (data) =>
        set({
          equipoId: data.equipoId,
          partidaId: data.partidaId,
          nombreEquipo: data.nombreEquipo,
          codigoEquipo: data.codigoEquipo,
          avatar: data.avatar,
        }),

      iniciarPartida: () =>
        set((s) => ({ inicioMs: s.inicioMs ?? Date.now(), resultado: "en-curso" })),

      registrarIntento: (nodo, retoId, correcto, tiempoMs) =>
        set((s) => {
          const prog = s.nodos[nodo] ?? nodoVacio(nodo);
          const reto = prog.retos[retoId] ?? retoVacio(retoId);
          const actualizado: ProgresoReto = {
            ...reto,
            intentos: reto.intentos + 1,
            resuelto: reto.resuelto || correcto,
            tiempoMs: reto.tiempoMs + tiempoMs,
          };
          return {
            nodos: {
              ...s.nodos,
              [nodo]: { ...prog, retos: { ...prog.retos, [retoId]: actualizado } },
            },
          };
        }),

      usarPista: (nodo, retoId) =>
        set((s) => {
          const prog = s.nodos[nodo] ?? nodoVacio(nodo);
          const reto = prog.retos[retoId] ?? retoVacio(retoId);
          const pistasUsadas = Math.min(3, reto.pistasUsadas + 1);
          return {
            nodos: {
              ...s.nodos,
              [nodo]: { ...prog, retos: { ...prog.retos, [retoId]: { ...reto, pistasUsadas } } },
            },
          };
        }),

      abrirCandado: (nodo, clave) =>
        set((s) => {
          const prog = s.nodos[nodo] ?? nodoVacio(nodo);
          return {
            claves: { ...s.claves, [nodo]: clave },
            nodos: {
              ...s.nodos,
              [nodo]: { ...prog, estado: "completado", candadoAbierto: true },
            },
          };
        }),

      registrarErrorCandado: (nodo) =>
        set((s) => ({
          erroresCandado: s.erroresCandado + 1,
          erroresCandadoFinal: nodo === "final" ? s.erroresCandadoFinal + 1 : s.erroresCandadoFinal,
        })),

      setPuntaje: (puntaje) => set({ puntaje }),

      agregarInsignias: (codigos) =>
        set((s) => ({ insignias: Array.from(new Set([...s.insignias, ...codigos])) })),

      terminar: (resultado) => set({ resultado, finMs: Date.now() }),

      reiniciarNodo: (nodo) =>
        set((s) => ({
          nodos: { ...s.nodos, [nodo]: nodoVacio(nodo) },
          claves: { ...s.claves, [nodo]: null },
          resultado: "en-curso",
        })),

      reiniciarTodo: () => set({ ...estadoBase() }),
    }),
    { name: "senal-perdida-juego", version: 2 },
  ),
);
