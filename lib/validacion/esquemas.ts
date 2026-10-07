import { z } from "zod";

export const NODOS_VALIDOS = ["radio", "tv", "telefono", "internet", "final"] as const;
export const ROLES_VALIDOS = ["ESTUDIANTE", "DOCENTE"] as const;

export const nodoSchema = z.enum(NODOS_VALIDOS);

// Respuesta a un reto: puede ser string, número o array (según el tipo de reto).
export const respuestaRetoSchema = z.union([
  z.string().max(500),
  z.number(),
  z.array(z.string().max(100)).max(20),
]);

export const validarRetoSchema = z.object({
  partidaId: z.string().min(1).max(64).optional(),
  retoId: z.string().min(1).max(64),
  nodo: nodoSchema,
  respuesta: respuestaRetoSchema,
  tiempoMs: z.number().int().nonnegative().max(1000 * 60 * 60),
  pistasUsadas: z.number().int().min(0).max(3).default(0),
});
export type ValidarRetoInput = z.infer<typeof validarRetoSchema>;

export const validarCandadoSchema = z.object({
  partidaId: z.string().min(1).max(64).optional(),
  nodo: nodoSchema,
  valor: z.union([z.string().max(100), z.array(z.string().max(100)).max(10)]),
});
export type ValidarCandadoInput = z.infer<typeof validarCandadoSchema>;

export const crearEquipoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(40),
  avatar: z.string().min(1).max(30).default("satelite"),
  programa: z.string().max(80).optional(),
  semestre: z.coerce.number().int().min(1).max(12).optional(),
  integrante: z.string().min(2).max(60).optional(),
});
export type CrearEquipoInput = z.infer<typeof crearEquipoSchema>;

export const unirseEquipoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6}$/, "El código debe tener 6 caracteres alfanuméricos"),
  // El integrante se toma de la sesión autenticada; se mantiene opcional por compatibilidad.
  integrante: z.string().min(2).max(60).optional(),
});
export type UnirseEquipoInput = z.infer<typeof unirseEquipoSchema>;

export const timerSchema = z.object({
  partidaId: z.string().min(1).max(64),
});

export const registrarResultadoSchema = z.object({
  partidaId: z.string().min(1).max(64),
  puntaje: z.number().int().nonnegative(),
  tiempoTotalMs: z.number().int().nonnegative(),
  precision: z.number().min(0).max(100),
  estado: z.enum(["GANADA", "PERDIDA"]),
  insignias: z.array(z.string().max(40)).max(20).default([]),
});
export type RegistrarResultadoInput = z.infer<typeof registrarResultadoSchema>;

export const rankingQuerySchema = z.object({
  orden: z.enum(["puntaje", "tiempo", "precision", "insignias"]).default("puntaje"),
  programa: z.string().max(80).optional(),
  semestre: z.coerce.number().int().min(1).max(12).optional(),
  limite: z.coerce.number().int().min(1).max(200).default(50),
});
export type RankingQuery = z.infer<typeof rankingQuerySchema>;

export const docenteLoginSchema = z.object({
  password: z.string().min(1).max(100),
});

// ---- Autenticación (Auth.js) ----
export const loginCredsSchema = z.object({
  email: z.string().email("Correo inválido").max(120),
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),
});
export type LoginCredsInput = z.infer<typeof loginCredsSchema>;

export const registroSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(80),
  email: z.string().email("Correo inválido").max(120),
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),
  rol: z.enum(ROLES_VALIDOS).default("ESTUDIANTE"),
  programa: z.string().max(80).optional(),
  semestre: z.coerce.number().int().min(1).max(12).optional(),
});
export type RegistroInput = z.infer<typeof registroSchema>;

// ---- Modo aula ----
export const crearSesionAulaSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(80),
});

export const unirseAulaSchema = z.object({
  codigoAula: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6}$/, "El código de aula debe tener 6 caracteres"),
});

// ---- CRUD de contenido (Server Actions docente) ----
const jsonString = z
  .string()
  .max(5000)
  .refine((s) => {
    try {
      JSON.parse(s);
      return true;
    } catch {
      return false;
    }
  }, "JSON inválido");

export const nodoCrudSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,20}$/, "slug inválido (minúsculas, números, guiones)"),
  nombre: z.string().min(2).max(60),
  descripcion: z.string().min(2).max(300),
  narrativa: z.string().min(2).max(2000),
  hitoHistorico: z.string().min(2).max(1000),
  datoAmbiental: z.string().min(2).max(1000),
  dificultad: z.enum(["facil", "media", "dificil"]),
  tiempoSugeridoMin: z.coerce.number().int().min(1).max(60),
  tipoCandado: z.enum(["numerico", "palabra", "combinacion", "cronologico"]),
  pistaCandado: z.string().min(2).max(300),
  claveParcial: z.string().max(100).default(""),
  orden: z.coerce.number().int().min(0).max(99).default(0),
});
export type NodoCrudInput = z.infer<typeof nodoCrudSchema>;

export const retoCrudSchema = z.object({
  id: z.string().optional(),
  nodoId: z.string().min(1),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,40}$/, "slug inválido"),
  tipo: z.string().min(2).max(40),
  titulo: z.string().min(2).max(120),
  enunciado: z.string().min(2).max(1000),
  dificultad: z.enum(["facil", "media", "dificil"]),
  puntos: z.coerce.number().int().min(0).max(1000),
  datosJson: jsonString.default("{}"),
  solucionJson: jsonString.default("null"),
  feedbackEducativo: z.string().min(2).max(1000),
  orden: z.coerce.number().int().min(0).max(99).default(0),
});
export type RetoCrudInput = z.infer<typeof retoCrudSchema>;

export const pistaCrudSchema = z.object({
  id: z.string().optional(),
  retoId: z.string().min(1),
  nivel: z.coerce.number().int().min(1).max(3),
  texto: z.string().min(2).max(500),
  costoPuntos: z.coerce.number().int().min(0).max(1000),
});
export type PistaCrudInput = z.infer<typeof pistaCrudSchema>;

export const insigniaCrudSchema = z.object({
  id: z.string().optional(),
  codigo: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,40}$/, "código inválido"),
  nombre: z.string().min(2).max(60),
  descripcion: z.string().min(2).max(300),
  icono: z.string().min(1).max(30),
  criterio: z.string().min(2).max(300),
});
export type InsigniaCrudInput = z.infer<typeof insigniaCrudSchema>;

export const idSchema = z.object({ id: z.string().min(1).max(64) });
