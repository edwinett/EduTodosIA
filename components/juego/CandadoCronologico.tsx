"use client";

import { useState } from "react";
import { ListaOrdenable, type ItemOrdenable } from "@/components/juego/ListaOrdenable";
import { Button } from "@/components/ui/button";

interface Props {
  itemsIniciales: ItemOrdenable[];
  // Valida localmente el orden (sin solución) y delega la comprobación real a quien lo use.
  onConfirmar: (ordenIds: string[]) => void;
  cargando?: boolean;
}

// Candado cronológico: ordena hitos del más antiguo al más reciente.
export function CandadoCronologico({ itemsIniciales, onConfirmar, cargando }: Props) {
  const [items, setItems] = useState<ItemOrdenable[]>(itemsIniciales);

  return (
    <div className="space-y-3">
      <ListaOrdenable
        items={items}
        onCambio={setItems}
        etiqueta="Ordena los hitos del más antiguo al más reciente"
      />
      <Button onClick={() => onConfirmar(items.map((i) => i.id))} disabled={cargando}>
        Confirmar orden
      </Button>
    </div>
  );
}
