// ⚠️ ARCHIVO SOLO-SERVIDOR. No importar desde componentes cliente.
// Contiene las soluciones de los retos y las claves de los candados.
// Toda validación de respuestas ocurre aquí (en API routes), nunca en el cliente.

import type { NodoId } from "@/lib/juego/tipos";

function norm(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita tildes
}

export interface ResultadoValidacion {
  correcto: boolean;
}

type Validador = (respuesta: unknown) => boolean;

// Validadores por reto. La "respuesta" llega ya parseada por Zod en la API.
const VALIDADORES: Record<string, Validador> = {
  // RADIO
  "radio-dial": (r) => {
    const n = Number(r);
    return Number.isFinite(n) && Math.abs(n - 100.7) <= 0.2;
  },
  "radio-onda": (r) => Number(r) === 500,
  "radio-morse": (r) => norm(r) === "tolima",
  "radio-quiz": (r) =>
    norm(r).includes("alfabetiz") ||
    norm(r) === "1" ||
    norm(r).includes("educar a la poblacion campesina"),

  // TV
  "tv-pixelado": (r) => ["rtc", "rtvc"].includes(norm(r)),
  "tv-estandar": (r) => norm(r).startsWith("ntsc") || norm(r) === "1",
  "tv-cronologia": (r) => {
    const arr = Array.isArray(r) ? r.map((x) => norm(x)) : [];
    return (
      arr.length === 3 &&
      arr[0] === "h1954" &&
      arr[1] === "h1979" &&
      arr[2] === "h1998"
    );
  },

  // TELEFONÍA
  "tel-conmutador": (r) => Number(r) === 8,
  "tel-pulsos": (r) => Number(r) === 15,
  "tel-t9": (r) => norm(r) === "tdjdpa",
  "tel-indicativos": (r) => norm(r).includes("608"),

  // INTERNET
  "net-binario": (r) => norm(r) === "red",
  "net-ip": (r) => norm(r) === "8.8.8.8",
  "net-dns": (r) => norm(r).replace(/^\./, "") === "co",
  "net-http": (r) => norm(r).includes("404"),

  // FINAL
  "final-reflexion": (r) =>
    norm(r).includes("conectar el territorio") || norm(r) === "1",
};

export function validarReto(retoId: string, respuesta: unknown): ResultadoValidacion {
  const v = VALIDADORES[retoId];
  if (!v) return { correcto: false };
  return { correcto: v(respuesta) };
}

// Claves parciales de cada nodo (la clave que abre su candado).
export const CLAVES_NODO: Record<Exclude<NodoId, "final">, string> = {
  radio: "1929",
  tv: "79",
  telefono: "608",
  internet: "RED",
};

// Orden de claves para la caja fuerte final.
export const ORDEN_FINAL: NodoId[] = ["radio", "tv", "telefono", "internet"];
export const CODIGO_MAESTRO = ["1929", "79", "608", "RED"];

export function validarCandado(nodo: NodoId, valor: unknown): ResultadoValidacion {
  if (nodo === "final") {
    const arr = Array.isArray(valor) ? valor.map((x) => norm(x)) : [];
    const esperado = CODIGO_MAESTRO.map((x) => norm(x));
    return {
      correcto:
        arr.length === esperado.length &&
        arr.every((x, i) => x === esperado[i]),
    };
  }
  const clave = CLAVES_NODO[nodo as Exclude<NodoId, "final">];
  if (clave === undefined) return { correcto: false };
  return { correcto: norm(valor) === norm(clave) };
}

// Entrega la clave parcial SOLO cuando el nodo ya fue resuelto (lo decide la API).
export function claveParcial(nodo: NodoId): string | null {
  if (nodo === "final") return CODIGO_MAESTRO.join("-");
  return CLAVES_NODO[nodo as Exclude<NodoId, "final">] ?? null;
}
