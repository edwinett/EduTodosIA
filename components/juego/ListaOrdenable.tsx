"use client";

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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ItemOrdenable {
  id: string;
  texto: string;
}

function Fila({ item }: { item: ItemOrdenable }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex touch-none items-center gap-2 rounded-md border border-border bg-background px-3 py-2",
        isDragging && "opacity-70 ring-2 ring-ring",
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span>{item.texto}</span>
    </li>
  );
}

interface Props {
  items: ItemOrdenable[];
  onCambio: (items: ItemOrdenable[]) => void;
  etiqueta?: string;
}

export function ListaOrdenable({ items, onCambio, etiqueta }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onCambio(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2" aria-label={etiqueta ?? "Lista ordenable (usa Tab y espacio/flechas)"}>
          {items.map((item) => (
            <Fila key={item.id} item={item} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
