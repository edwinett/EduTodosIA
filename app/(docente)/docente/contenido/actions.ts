"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireDocente } from "@/lib/auth/guards";
import {
  nodoCrudSchema,
  retoCrudSchema,
  pistaCrudSchema,
  insigniaCrudSchema,
  idSchema,
} from "@/lib/validacion/esquemas";

export interface EstadoAccion {
  ok: boolean;
  error?: string;
  mensaje?: string;
}

function fd(formData: FormData): Record<string, unknown> {
  return Object.fromEntries(formData.entries());
}

// -------------------------------- NODOS
export async function guardarNodo(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  try {
    await requireDocente();
    const parsed = nodoCrudSchema.safeParse(fd(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }
    const { id, ...data } = parsed.data;
    if (id) await prisma.nodo.update({ where: { id }, data });
    else await prisma.nodo.create({ data });
    revalidatePath("/docente/contenido");
    return { ok: true, mensaje: "Nodo guardado." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function eliminarNodo(formData: FormData): Promise<void> {
  await requireDocente();
  const { id } = idSchema.parse(fd(formData));
  await prisma.nodo.delete({ where: { id } });
  revalidatePath("/docente/contenido");
}

// -------------------------------- RETOS
export async function guardarReto(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  try {
    await requireDocente();
    const parsed = retoCrudSchema.safeParse(fd(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }
    const { id, ...data } = parsed.data;
    if (id) await prisma.reto.update({ where: { id }, data });
    else await prisma.reto.create({ data });
    revalidatePath("/docente/contenido");
    return { ok: true, mensaje: "Reto guardado." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function eliminarReto(formData: FormData): Promise<void> {
  await requireDocente();
  const { id } = idSchema.parse(fd(formData));
  await prisma.reto.delete({ where: { id } });
  revalidatePath("/docente/contenido");
}

// -------------------------------- PISTAS
export async function guardarPista(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  try {
    await requireDocente();
    const parsed = pistaCrudSchema.safeParse(fd(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }
    const { id, ...data } = parsed.data;
    if (id) await prisma.pista.update({ where: { id }, data });
    else
      await prisma.pista.upsert({
        where: { retoId_nivel: { retoId: data.retoId, nivel: data.nivel } },
        update: { texto: data.texto, costoPuntos: data.costoPuntos },
        create: data,
      });
    revalidatePath("/docente/contenido");
    return { ok: true, mensaje: "Pista guardada." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function eliminarPista(formData: FormData): Promise<void> {
  await requireDocente();
  const { id } = idSchema.parse(fd(formData));
  await prisma.pista.delete({ where: { id } });
  revalidatePath("/docente/contenido");
}

// -------------------------------- INSIGNIAS
export async function guardarInsignia(
  _prev: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  try {
    await requireDocente();
    const parsed = insigniaCrudSchema.safeParse(fd(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }
    const { id, ...data } = parsed.data;
    if (id) await prisma.insignia.update({ where: { id }, data });
    else await prisma.insignia.create({ data });
    revalidatePath("/docente/contenido");
    return { ok: true, mensaje: "Insignia guardada." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function eliminarInsignia(formData: FormData): Promise<void> {
  await requireDocente();
  const { id } = idSchema.parse(fd(formData));
  await prisma.insignia.delete({ where: { id } });
  revalidatePath("/docente/contenido");
}
