"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  filas?: number;
  columnas?: number;
  imagen?: string;
  onEnviar: (orden: string[]) => void;
  cargando?: boolean;
}

interface Pieza {
  id: string; // "p0".."pN"
  fila: number;
  col: number;
}

function Ficha({ pieza, filas, columnas, imagen }: { pieza: Pieza; filas: number; columnas: number; imagen?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pieza.id,
  });
  const estilo: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(imagen
      ? {
          backgroundImage: `url(${imagen})`,
          backgroundSize: `${columnas * 100}% ${filas * 100}%`,
          backgroundPosition:
            columnas > 1 && filas > 1
              ? `${(pieza.col / (columnas - 1)) * 100}% ${(pieza.fila / (filas - 1)) * 100}%`
              : "center",
        }
      : {}),
  };
  const indice = pieza.fila * columnas + pieza.col + 1;
  return (
    <button
      ref={setNodeRef}
      style={estilo}
      {...attributes}
      {...listeners}
      aria-label={`Pieza ${indice}`}
      className={cn(
        "flex aspect-square touch-none items-center justify-center rounded border border-border bg-secondary text-lg font-bold",
        isDragging && "z-10 ring-2 ring-ring",
      )}
    >
      {!imagen && indice}
    </button>
  );
}

// Rompecabezas: ordena las piezas (imagen o numeradas) en la cuadrícula correcta.
export function Rompecabezas({ filas = 3, columnas = 3, imagen, onEnviar, cargando }: Props) {
  const total = filas * columnas;
  const [piezas, setPiezas] = useState<Pieza[]>(() => {
    const base: Pieza[] = Array.from({ length: total }, (_, i) => ({
      id: `p${i}`,
      fila: Math.floor(i / columnas),
      col: i % columnas,
    }));
    // Baraja asegurando que no quede resuelto.
    const mezclado = [...base];
    for (let i = mezclado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mezclado[i], mezclado[j]] = [mezclado[j]!, mezclado[i]!];
    }
    if (mezclado.every((p, i) => p.id === `p${i}`) && total > 1) {
      [mezclado[0], mezclado[1]] = [mezclado[1]!, mezclado[0]!];
    }
    return mezclado;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = piezas.findIndex((p) => p.id === active.id);
      const newIndex = piezas.findIndex((p) => p.id === over.id);
      setPiezas(arrayMove(piezas, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={piezas.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div
            className="mx-auto grid max-w-xs gap-1"
            style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}
            aria-label="Rompecabezas (arrastra o usa Tab + espacio/flechas)"
          >
            {piezas.map((p) => (
              <Ficha key={p.id} pieza={p} filas={filas} columnas={columnas} imagen={imagen} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={() => onEnviar(piezas.map((p) => p.id))} disabled={cargando}>
        Comprobar rompecabezas
      </Button>
    </div>
  );
}
