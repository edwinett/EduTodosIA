"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  guardarNodo,
  guardarReto,
  guardarPista,
  guardarInsignia,
  eliminarNodo,
  eliminarReto,
  eliminarPista,
  eliminarInsignia,
  type EstadoAccion,
} from "./actions";

const estadoInicial: EstadoAccion = { ok: false };

function Campo({
  name,
  label,
  defaultValue,
  type = "text",
  as = "input",
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  as?: "input" | "textarea";
}) {
  const id = `${name}-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          defaultValue={defaultValue}
          className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      ) : (
        <Input id={id} name={name} defaultValue={defaultValue} type={type} />
      )}
    </div>
  );
}

function Mensaje({ estado }: { estado: EstadoAccion }) {
  if (estado.error) return <p role="alert" className="text-sm text-destructive">{estado.error}</p>;
  if (estado.mensaje) return <p className="text-sm text-primary">{estado.mensaje}</p>;
  return null;
}

// ---------------------------------- NODO
export function FormNodo({ nodo }: { nodo?: NodoLite }) {
  const [estado, action, pending] = useActionState(guardarNodo, estadoInicial);
  return (
    <form action={action} className="grid gap-2 rounded-md border border-border p-3">
      {nodo?.id && <input type="hidden" name="id" defaultValue={nodo.id} />}
      <div className="grid gap-2 sm:grid-cols-2">
        <Campo name="slug" label="Slug" defaultValue={nodo?.slug} />
        <Campo name="nombre" label="Nombre" defaultValue={nodo?.nombre} />
        <Campo name="descripcion" label="Descripción" defaultValue={nodo?.descripcion} />
        <Campo name="dificultad" label="Dificultad (facil/media/dificil)" defaultValue={nodo?.dificultad} />
        <Campo name="tiempoSugeridoMin" label="Tiempo sugerido (min)" type="number" defaultValue={nodo?.tiempoSugeridoMin} />
        <Campo name="tipoCandado" label="Tipo de candado" defaultValue={nodo?.tipoCandado} />
        <Campo name="pistaCandado" label="Pista del candado" defaultValue={nodo?.pistaCandado} />
        <Campo name="claveParcial" label="Clave parcial (secreta)" defaultValue={nodo?.claveParcial} />
        <Campo name="orden" label="Orden" type="number" defaultValue={nodo?.orden} />
      </div>
      <Campo name="narrativa" label="Narrativa" as="textarea" defaultValue={nodo?.narrativa} />
      <Campo name="hitoHistorico" label="Hito histórico" as="textarea" defaultValue={nodo?.hitoHistorico} />
      <Campo name="datoAmbiental" label="Dato ambiental" as="textarea" defaultValue={nodo?.datoAmbiental} />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {nodo?.id ? "Actualizar nodo" : "Crear nodo"}
        </Button>
        {nodo?.id && <BotonEliminar id={nodo.id} accion={eliminarNodo} etiqueta="Eliminar nodo" />}
        <Mensaje estado={estado} />
      </div>
    </form>
  );
}

// ---------------------------------- RETO
export function FormReto({ nodoId, reto }: { nodoId: string; reto?: RetoLite }) {
  const [estado, action, pending] = useActionState(guardarReto, estadoInicial);
  return (
    <form action={action} className="grid gap-2 rounded-md border border-dashed border-border p-3">
      {reto?.id && <input type="hidden" name="id" defaultValue={reto.id} />}
      <input type="hidden" name="nodoId" defaultValue={nodoId} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Campo name="slug" label="Slug" defaultValue={reto?.slug} />
        <Campo name="tipo" label="Tipo" defaultValue={reto?.tipo} />
        <Campo name="titulo" label="Título" defaultValue={reto?.titulo} />
        <Campo name="puntos" label="Puntos" type="number" defaultValue={reto?.puntos} />
        <Campo name="dificultad" label="Dificultad" defaultValue={reto?.dificultad} />
        <Campo name="orden" label="Orden" type="number" defaultValue={reto?.orden} />
      </div>
      <Campo name="enunciado" label="Enunciado" as="textarea" defaultValue={reto?.enunciado} />
      <Campo name="feedbackEducativo" label="Feedback educativo" as="textarea" defaultValue={reto?.feedbackEducativo} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Campo name="imagenUrl" label="Imagen (URL, opcional)" defaultValue={reto?.imagenUrl ?? ""} />
        <Campo name="videoUrl" label="Video YouTube (URL, opcional)" defaultValue={reto?.videoUrl ?? ""} />
      </div>
      <Campo name="datosJson" label="Datos (JSON)" as="textarea" defaultValue={reto?.datosJson} />
      <Campo name="solucionJson" label="Solución (JSON, secreta)" as="textarea" defaultValue={reto?.solucionJson} />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {reto?.id ? "Actualizar reto" : "Crear reto"}
        </Button>
        {reto?.id && <BotonEliminar id={reto.id} accion={eliminarReto} etiqueta="Eliminar reto" />}
        <Mensaje estado={estado} />
      </div>
    </form>
  );
}

// ---------------------------------- PISTA
export function FormPista({ retoId, pista }: { retoId: string; pista?: PistaLite }) {
  const [estado, action, pending] = useActionState(guardarPista, estadoInicial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2 rounded-md border border-border p-2">
      {pista?.id && <input type="hidden" name="id" defaultValue={pista.id} />}
      <input type="hidden" name="retoId" defaultValue={retoId} />
      <div className="w-16">
        <Campo name="nivel" label="Nivel" type="number" defaultValue={pista?.nivel} />
      </div>
      <div className="min-w-[200px] flex-1">
        <Campo name="texto" label="Texto" defaultValue={pista?.texto} />
      </div>
      <div className="w-24">
        <Campo name="costoPuntos" label="Costo" type="number" defaultValue={pista?.costoPuntos} />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pista?.id ? "Guardar" : "Añadir"}
      </Button>
      {pista?.id && <BotonEliminar id={pista.id} accion={eliminarPista} etiqueta="Eliminar" />}
      <Mensaje estado={estado} />
    </form>
  );
}

// ---------------------------------- INSIGNIA
export function FormInsignia({ insignia }: { insignia?: InsigniaLite }) {
  const [estado, action, pending] = useActionState(guardarInsignia, estadoInicial);
  return (
    <form action={action} className="grid gap-2 rounded-md border border-border p-3">
      {insignia?.id && <input type="hidden" name="id" defaultValue={insignia.id} />}
      <div className="grid gap-2 sm:grid-cols-2">
        <Campo name="codigo" label="Código" defaultValue={insignia?.codigo} />
        <Campo name="nombre" label="Nombre" defaultValue={insignia?.nombre} />
        <Campo name="icono" label="Ícono" defaultValue={insignia?.icono} />
        <Campo name="criterio" label="Criterio" defaultValue={insignia?.criterio} />
      </div>
      <Campo name="descripcion" label="Descripción" as="textarea" defaultValue={insignia?.descripcion} />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {insignia?.id ? "Actualizar" : "Crear insignia"}
        </Button>
        {insignia?.id && (
          <BotonEliminar id={insignia.id} accion={eliminarInsignia} etiqueta="Eliminar" />
        )}
        <Mensaje estado={estado} />
      </div>
    </form>
  );
}

function BotonEliminar({
  id,
  accion,
  etiqueta,
}: {
  id: string;
  accion: (formData: FormData) => Promise<void>;
  etiqueta: string;
}) {
  return (
    <form action={accion}>
      <input type="hidden" name="id" defaultValue={id} />
      <Button type="submit" size="sm" variant="destructive">
        {etiqueta}
      </Button>
    </form>
  );
}

// ---- tipos ligeros ----
export interface NodoLite {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  narrativa: string;
  hitoHistorico: string;
  datoAmbiental: string;
  dificultad: string;
  tiempoSugeridoMin: number;
  tipoCandado: string;
  pistaCandado: string;
  claveParcial: string;
  orden: number;
}
export interface RetoLite {
  id: string;
  slug: string;
  tipo: string;
  titulo: string;
  enunciado: string;
  dificultad: string;
  puntos: number;
  datosJson: string;
  solucionJson: string;
  feedbackEducativo: string;
  imagenUrl?: string | null;
  videoUrl?: string | null;
  orden: number;
}
export interface PistaLite {
  id: string;
  nivel: number;
  texto: string;
  costoPuntos: number;
}
export interface InsigniaLite {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  criterio: string;
}
