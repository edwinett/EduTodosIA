"use client";

import type { PistaPublica } from "@/lib/juego/tipos";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface Props {
  pistas: PistaPublica[];
  pistasUsadas: number; // niveles revelados
  onRevelar: () => void;
}

// Sistema de pistas: nivel 1 orientación, 2 método, 3 casi solución. Cada una resta puntos.
export function PanelPistas({ pistas, pistasUsadas, onRevelar }: Props) {
  const reveladas = pistas.slice(0, pistasUsadas);
  const siguiente = pistas[pistasUsadas];

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-accent/50 bg-accent/5 p-3">
      <p className="flex items-center gap-2 text-sm font-medium text-accent">
        <Lightbulb className="h-4 w-4" aria-hidden /> Pistas ({pistasUsadas}/{pistas.length})
      </p>
      <ul className="space-y-1 text-sm">
        {reveladas.map((p) => (
          <li key={p.nivel} className="rounded bg-background/60 px-2 py-1">
            <span className="font-semibold">Nivel {p.nivel}:</span> {p.texto}{" "}
            <span className="text-xs text-muted-foreground">(−{p.costoPuntos} pts)</span>
          </li>
        ))}
      </ul>
      {siguiente ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRevelar}
          aria-label={`Revelar pista de nivel ${siguiente.nivel}, cuesta ${siguiente.costoPuntos} puntos`}
        >
          Revelar pista nivel {siguiente.nivel} (−{siguiente.costoPuntos} pts)
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">No quedan más pistas.</p>
      )}
    </div>
  );
}
