"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EntradaCrucigrama {
  id: string;
  num: number;
  dir: "H" | "V";
  fila: number;
  col: number;
  longitud: number;
  pista: string;
}

interface Props {
  filas: number;
  columnas: number;
  entradas: EntradaCrucigrama[];
  onEnviar: (respuestas: Record<string, string>) => void;
  cargando?: boolean;
}

const clave = (r: number, c: number) => `${r}-${c}`;

function celdasDe(e: EntradaCrucigrama): string[] {
  const out: string[] = [];
  for (let k = 0; k < e.longitud; k++) {
    out.push(e.dir === "H" ? clave(e.fila, e.col + k) : clave(e.fila + k, e.col));
  }
  return out;
}

// Crucigrama: rellena las letras; las palabras (solución) viven solo en el servidor.
export function Crucigrama({ filas, columnas, entradas, onEnviar, cargando }: Props) {
  const [letras, setLetras] = useState<Record<string, string>>({});

  const { activas, numeros } = useMemo(() => {
    const activas = new Set<string>();
    const numeros: Record<string, number> = {};
    for (const e of entradas) {
      for (const k of celdasDe(e)) activas.add(k);
      numeros[clave(e.fila, e.col)] = e.num;
    }
    return { activas, numeros };
  }, [entradas]);

  function enviar() {
    const resp: Record<string, string> = {};
    for (const e of entradas) {
      resp[e.id] = celdasDe(e)
        .map((k) => letras[k] ?? "")
        .join("");
    }
    onEnviar(resp);
  }

  const horizontales = entradas.filter((e) => e.dir === "H");
  const verticales = entradas.filter((e) => e.dir === "V");

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${columnas}, 2rem)` }}
          role="grid"
          aria-label="Cuadrícula del crucigrama"
        >
          {Array.from({ length: filas * columnas }, (_, idx) => {
            const r = Math.floor(idx / columnas);
            const c = idx % columnas;
            const k = clave(r, c);
            if (!activas.has(k)) return <div key={k} className="h-8 w-8 bg-transparent" />;
            return (
              <div key={k} className="relative">
                {numeros[k] !== undefined && (
                  <span className="pointer-events-none absolute left-0 top-0 z-10 px-0.5 text-[9px] text-muted-foreground">
                    {numeros[k]}
                  </span>
                )}
                <input
                  value={letras[k] ?? ""}
                  onChange={(ev) =>
                    setLetras((s) => ({
                      ...s,
                      [k]: ev.target.value.slice(-1).toUpperCase(),
                    }))
                  }
                  maxLength={1}
                  aria-label={`Celda fila ${r + 1} columna ${c + 1}`}
                  className={cn(
                    "h-8 w-8 border border-border bg-background text-center font-mono text-sm uppercase",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="font-semibold">Horizontales</p>
          <ul className="space-y-0.5 text-muted-foreground">
            {horizontales.map((e) => (
              <li key={e.id}>
                <span className="font-mono">{e.num}.</span> {e.pista} ({e.longitud})
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Verticales</p>
          <ul className="space-y-0.5 text-muted-foreground">
            {verticales.map((e) => (
              <li key={e.id}>
                <span className="font-mono">{e.num}.</span> {e.pista} ({e.longitud})
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button onClick={enviar} disabled={cargando}>
        Comprobar crucigrama
      </Button>
    </div>
  );
}
