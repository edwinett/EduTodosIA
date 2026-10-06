import { setup, assign } from "xstate";
import type { NodoId } from "@/lib/juego/tipos";

// Máquina de estados del juego: fases, salas (nodos) y candados.
// Impulsa las transiciones de fase; el detalle del progreso vive en el store Zustand.

export interface ContextoJuego {
  nodoActivo: NodoId | null;
  clavesObtenidas: number; // 0..4
}

export type EventoJuego =
  | { type: "EQUIPO_LISTO" }
  | { type: "ABRIR_NODO"; nodo: NodoId }
  | { type: "CANDADO_ABIERTO"; nodo: NodoId }
  | { type: "VOLVER_MAPA" }
  | { type: "ABRIR_FINAL" }
  | { type: "GANAR" }
  | { type: "TIEMPO_AGOTADO" }
  | { type: "REINICIAR" };

export const maquinaJuego = setup({
  types: {
    context: {} as ContextoJuego,
    events: {} as EventoJuego,
  },
  guards: {
    tieneLasCuatroClaves: ({ context }) => context.clavesObtenidas >= 4,
  },
  actions: {
    activarNodo: assign({
      nodoActivo: ({ event }) =>
        event.type === "ABRIR_NODO" ? event.nodo : null,
    }),
    sumarClave: assign({
      clavesObtenidas: ({ context }) => Math.min(4, context.clavesObtenidas + 1),
      nodoActivo: () => null,
    }),
    limpiarNodo: assign({ nodoActivo: () => null }),
    reiniciar: assign({ nodoActivo: () => null, clavesObtenidas: () => 0 }),
  },
}).createMachine({
  id: "senalPerdida",
  initial: "lobby",
  context: { nodoActivo: null, clavesObtenidas: 0 },
  on: {
    TIEMPO_AGOTADO: ".derrota",
  },
  states: {
    lobby: {
      on: { EQUIPO_LISTO: "mapa" },
    },
    mapa: {
      on: {
        ABRIR_NODO: { target: "enNodo", actions: "activarNodo" },
        ABRIR_FINAL: {
          target: "cajaFuerte",
          guard: "tieneLasCuatroClaves",
        },
      },
    },
    enNodo: {
      on: {
        CANDADO_ABIERTO: { target: "mapa", actions: "sumarClave" },
        VOLVER_MAPA: { target: "mapa", actions: "limpiarNodo" },
      },
    },
    cajaFuerte: {
      on: {
        GANAR: "victoria",
        VOLVER_MAPA: "mapa",
      },
    },
    victoria: {
      type: "final",
    },
    derrota: {
      on: { REINICIAR: { target: "mapa", actions: "limpiarNodo" } },
    },
  },
});
