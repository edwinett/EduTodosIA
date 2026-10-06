"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NODOS } from "@/data/misiones";
import type {
  EstadoJuego,
  NodoId,
  ProgresoNodo,
  ProgresoReto,
} from "@/lib/juego/tipos";

function nodosIniciales(): Record<NodoId, ProgresoNodo> {
  const out = {} as Record<NodoId, ProgresoNodo>;
  for (const nodo of NODOS) {
    const retos: Record<string, ProgresoReto> = {};
    for (const reto of nodo.retos) {
      retos[reto.id] = {
        retoId: reto.id,
        resuelto: false,
        intentos: 0,
        pistasUsadas: 0,
        tiempoMs: 0,
      };
    }
    out[nodo.id] = {
      nodo: nodo.id,
      estado: nodo.id === "final" ? "bloqueado" : "activo",
      candadoAbierto: false,
      retos,
    };
  }
  return out;
}

function clavesIniciales(): Record<NodoId, string | null> {
  return { radio: null, tv: null, telefono: null, internet: null, final: null };
}

export interface JuegoStore extends EstadoJuego {
  erroresCandado: number;
  erroresCandadoFinal: number;
  // acciones
  configurarEquipo: (data: {
    equipoId: string | null;
    partidaId: string | null;
    nombreEquipo: string;
    codigoEquipo: string;
    avatar: string;
  }) => void;
  iniciarPartida: () => void;
  registrarIntento: (
    nodo: NodoId,
    retoId: string,
    correcto: boolean,
    tiempoMs: number,
  ) => void;
  usarPista: (nodo: NodoId, retoId: string) => void;
  abrirCandado: (nodo: NodoId, clave: string) => void;
  registrarErrorCandado: (nodo: NodoId) => void;
  setPuntaje: (puntaje: number) => void;
  agregarInsignias: (codigos: string[]) => void;
  terminar: (resultado: "victoria" | "derrota") => void;
  reiniciarNodo: (nodo: NodoId) => void;
  reiniciarTodo: () => void;
}

const estadoBase = (): EstadoJuego & {
  erroresCandado: number;
  erroresCandadoFinal: number;
} => ({
  equipoId: null,
  partidaId: null,
  nombreEquipo: null,
  codigoEquipo: null,
  avatar: "satelite",
  nodos: nodosIniciales(),
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
    (set, get) => ({
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
        set((s) => ({
          inicioMs: s.inicioMs ?? Date.now(),
          resultado: "en-curso",
        })),

      registrarIntento: (nodo, retoId, correcto, tiempoMs) =>
        set((s) => {
          const prog = s.nodos[nodo];
          if (!prog) return s;
          const reto = prog.retos[retoId];
          if (!reto) return s;
          const actualizado: ProgresoReto = {
            ...reto,
            intentos: reto.intentos + 1,
            resuelto: reto.resuelto || correcto,
            tiempoMs: reto.tiempoMs + tiempoMs,
          };
          return {
            nodos: {
              ...s.nodos,
              [nodo]: {
                ...prog,
                retos: { ...prog.retos, [retoId]: actualizado },
              },
            },
          };
        }),

      usarPista: (nodo, retoId) =>
        set((s) => {
          const prog = s.nodos[nodo];
          if (!prog) return s;
          const reto = prog.retos[retoId];
          if (!reto) return s;
          const pistasUsadas = Math.min(3, reto.pistasUsadas + 1);
          return {
            nodos: {
              ...s.nodos,
              [nodo]: {
                ...prog,
                retos: { ...prog.retos, [retoId]: { ...reto, pistasUsadas } },
              },
            },
          };
        }),

      abrirCandado: (nodo, clave) =>
        set((s) => ({
          claves: { ...s.claves, [nodo]: clave },
          nodos: {
            ...s.nodos,
            [nodo]: {
              ...s.nodos[nodo]!,
              estado: "completado",
              candadoAbierto: true,
            },
          },
        })),

      registrarErrorCandado: (nodo) =>
        set((s) => ({
          erroresCandado: s.erroresCandado + 1,
          erroresCandadoFinal:
            nodo === "final" ? s.erroresCandadoFinal + 1 : s.erroresCandadoFinal,
        })),

      setPuntaje: (puntaje) => set({ puntaje }),

      agregarInsignias: (codigos) =>
        set((s) => ({
          insignias: Array.from(new Set([...s.insignias, ...codigos])),
        })),

      terminar: (resultado) => set({ resultado, finMs: Date.now() }),

      reiniciarNodo: (nodo) =>
        set((s) => {
          const base = nodosIniciales()[nodo]!;
          return {
            nodos: { ...s.nodos, [nodo]: base },
            claves: { ...s.claves, [nodo]: null },
            resultado: "en-curso",
          };
        }),

      reiniciarTodo: () => set({ ...estadoBase() }),
    }),
    {
      name: "senal-perdida-juego",
      version: 1,
    },
  ),
);
