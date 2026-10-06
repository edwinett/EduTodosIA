"use client";

import { NODOS_ORDEN } from "@/lib/juego/reglas";
import type { NodoId } from "@/lib/juego/tipos";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ETIQUETAS: Record<Exclude<NodoId, "final">, string> = {
  radio: "Radio",
  tv: "TV",
  telefono: "Teléfono",
  internet: "Internet",
};

export function InventarioClaves({ claves }: { claves: Record<NodoId, string | null> }) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Claves obtenidas">
      {NODOS_ORDEN.map((nodo) => {
        const clave = claves[nodo];
        const obtenida = clave !== null;
        return (
          <div
            key={nodo}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
              obtenida ? "border-primary bg-primary/10" : "border-dashed border-muted-foreground/40 opacity-60",
            )}
          >
            <span className="font-semibold">{ETIQUETAS[nodo]}</span>
            <Badge variant={obtenida ? "default" : "outline"} className="font-mono">
              {obtenida ? clave : "----"}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
