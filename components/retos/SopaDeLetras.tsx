"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { sonidoExito } from "@/lib/audio/sonidos";

interface Props {
  grid: string[][];
  palabras: string[];
  onEnviar: (encontradas: string[]) => void;
}

const norm = (s: string) =>
  s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const k = (r: number, c: number) => `${r}-${c}`;
const signo = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);

// Sopa de letras: selecciona una palabra haciendo clic en su primera y última letra.
export function SopaDeLetras({ grid, palabras, onEnviar }: Props) {
  const [inicio, setInicio] = useState<{ r: number; c: number } | null>(null);
  const [encontradas, setEncontradas] = useState<string[]>([]);
  const [celdas, setCeldas] = useState<Set<string>>(new Set());

  const objetivo = palabras.map(norm);

  function clic(r: number, c: number) {
    if (!inicio) {
      setInicio({ r, c });
      return;
    }
    const dr = r - inicio.r;
    const dc = c - inicio.c;
    const recto = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    if (!recto) {
      setInicio({ r, c });
      return;
    }
    const pasos = Math.max(Math.abs(dr), Math.abs(dc));
    const sr = signo(dr);
    const sc = signo(dc);
    const ruta: { r: number; c: number }[] = [];
    for (let i = 0; i <= pasos; i++) ruta.push({ r: inicio.r + i * sr, c: inicio.c + i * sc });
    const palabra = norm(ruta.map((p) => grid[p.r]?.[p.c] ?? "").join(""));
    const reversa = palabra.split("").reverse().join("");
    const idx = objetivo.findIndex((w) => w === palabra || w === reversa);
    if (idx >= 0 && !encontradas.includes(palabras[idx]!)) {
      const nuevas = [...encontradas, palabras[idx]!];
      setEncontradas(nuevas);
      setCeldas((s) => {
        const copia = new Set(s);
        ruta.forEach((p) => copia.add(k(p.r, p.c)));
        return copia;
      });
      sonidoExito();
      if (nuevas.length === palabras.length) setTimeout(() => onEnviar(nuevas), 300);
    }
    setInicio(null);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Haz clic en la <strong>primera</strong> y luego en la <strong>última</strong> letra de cada palabra.
      </p>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, 1.75rem)` }}
          role="grid"
          aria-label="Sopa de letras"
        >
          {grid.map((fila, r) =>
            fila.map((letra, c) => {
              const sel = inicio?.r === r && inicio?.c === c;
              const hall = celdas.has(k(r, c));
              return (
                <button
                  key={k(r, c)}
                  type="button"
                  onClick={() => clic(r, c)}
                  aria-label={`Letra ${letra} fila ${r + 1} columna ${c + 1}`}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-sm border text-xs font-bold uppercase",
                    hall
                      ? "border-primary bg-primary/30 text-foreground"
                      : sel
                        ? "border-accent bg-accent/30"
                        : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  {letra}
                </button>
              );
            }),
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {palabras.map((p) => (
          <span
            key={p}
            className={cn(
              "rounded border px-2 py-0.5",
              encontradas.includes(p)
                ? "border-primary bg-primary/10 line-through"
                : "border-border",
            )}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
