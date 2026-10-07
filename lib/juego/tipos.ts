// Tipos compartidos del dominio de juego.
// IMPORTANTE: este archivo NO contiene soluciones de retos (esas viven solo en el servidor).

export type NodoId = "radio" | "tv" | "telefono" | "internet" | "final";

export type TipoCandado =
  | "numerico"
  | "palabra"
  | "combinacion"
  | "cronologico";

export type TipoReto =
  | "dial"
  | "longitud-onda"
  | "morse"
  | "quiz"
  | "pixelado"
  | "estandar"
  | "cronologico"
  | "carta-ajuste"
  | "conmutador"
  | "pulsos"
  | "t9"
  | "indicativos"
  | "binario-ascii"
  | "ip-valida"
  | "dns"
  | "http"
  | "reflexion";

export type Dificultad = "facil" | "media" | "dificil";

export type EstadoNodo = "bloqueado" | "activo" | "completado";

export interface RetoPublico {
  id: string;
  nodo: NodoId;
  tipo: TipoReto;
  titulo: string;
  enunciado: string;
  dificultad: Dificultad;
  puntos: number;
  // Datos auxiliares visibles para el cliente (sin la solución).
  datos?: Record<string, unknown>;
  feedbackEducativo: string;
  pistas: PistaPublica[];
}

export interface PistaPublica {
  nivel: 1 | 2 | 3;
  texto: string;
  costoPuntos: number;
}

export interface NodoPublico {
  id: NodoId;
  nombre: string;
  descripcion: string;
  narrativa: string;
  hitoHistorico: string;
  datoAmbiental: string;
  dificultad: Dificultad;
  tiempoSugeridoMin: number;
  tipoCandado: TipoCandado;
  pistaCandado: string;
  retos: RetoPublico[];
}

export interface InsigniaDef {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: string;
}

// ---- Estado de progreso (cliente, persistido en localStorage) ----

export interface ProgresoReto {
  retoId: string;
  resuelto: boolean;
  intentos: number;
  pistasUsadas: number; // niveles de pista revelados (0..3)
  tiempoMs: number;
}

export interface ProgresoNodo {
  nodo: string;
  estado: EstadoNodo;
  candadoAbierto: boolean;
  retos: Record<string, ProgresoReto>;
}

export interface EstadoJuego {
  equipoId: string | null;
  partidaId: string | null;
  nombreEquipo: string | null;
  codigoEquipo: string | null;
  avatar: string;
  // Progreso indexado por slug de nodo (el contenido es dinámico, viene del catálogo).
  nodos: Record<string, ProgresoNodo>;
  claves: Record<string, string | null>;
  puntaje: number;
  insignias: string[]; // códigos
  inicioMs: number | null;
  finMs: number | null;
  resultado: "en-curso" | "victoria" | "derrota" | null;
}
