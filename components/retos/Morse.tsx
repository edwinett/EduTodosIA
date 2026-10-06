"use client";

import { Button } from "@/components/ui/button";
import { reproducirMorse } from "@/lib/audio/sonidos";
import { Play } from "lucide-react";

// Tabla de referencia Morse (alternativa visual accesible al audio).
const TABLA: [string, string][] = [
  ["A", ".-"], ["B", "-..."], ["C", "-.-."], ["D", "-.."], ["E", "."],
  ["F", "..-."], ["G", "--."], ["H", "...."], ["I", ".."], ["J", ".---"],
  ["K", "-.-"], ["L", ".-.."], ["M", "--"], ["N", "-."], ["O", "---"],
  ["P", ".--."], ["Q", "--.-"], ["R", ".-."], ["S", "..."], ["T", "-"],
  ["U", "..-"], ["V", "...-"], ["W", ".--"], ["X", "-..-"], ["Y", "-.--"], ["Z", "--.."],
];

export function Morse({ morse }: { morse: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => reproducirMorse(morse)}
          aria-label="Reproducir el mensaje en código Morse"
        >
          <Play className="h-4 w-4" /> Reproducir Morse
        </Button>
        <code className="rounded bg-background px-2 py-1 font-mono text-lg tracking-widest">
          {morse}
        </code>
      </div>

      <details className="rounded-md border border-border bg-background p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Ver tabla Morse (alternativa visual con tiempos)
        </summary>
        <p className="mt-2 text-xs text-muted-foreground">
          Punto (.) = 1 unidad de tiempo. Raya (−) = 3 unidades. Espacio entre letras = 3 unidades.
        </p>
        <div className="mt-2 grid grid-cols-3 gap-1 text-sm sm:grid-cols-6">
          {TABLA.map(([letra, codigo]) => (
            <div key={letra} className="flex items-center justify-between rounded bg-card px-2 py-1">
              <span className="font-semibold">{letra}</span>
              <span className="font-mono text-xs">{codigo}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
