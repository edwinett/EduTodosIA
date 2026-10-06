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
  integrante: z.string().min(2).max(60),
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
