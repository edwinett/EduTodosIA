"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sonidoError, sonidoExito } from "@/lib/audio/sonidos";
import { cn } from "@/lib/utils";

const LETRAS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const MONIGOTE = ["😀", "😟", "😣", "😨", "😰", "😵", "💀"];

interface Props {
  retoId: string;
  longitud: number;
  intentosMax?: number;
  onEnviar: (palabra: string) => void;
}

// Ahorcado: el cliente NO conoce la palabra. Pregunta al servidor las posiciones
// de cada letra (/api/reto/ahorcado). Al completarla, envía la palabra a validar.
export function Ahorcado({ retoId, longitud, intentosMax = 6, onEnviar }: Props) {
  const [reveladas, setReveladas] = useState<(string | null)[]>(
    Array.from({ length: longitud }, () => null),
  );
  const [usadas, setUsadas] = useState<Set<string>>(new Set());
  const [errores, setErrores] = useState(0);
  const [cargando, setCargando] = useState(false);

  const perdido = errores >= intentosMax;
  const completo = reveladas.every((c) => c !== null);

  async function probarLetra(letra: string) {
    if (usadas.has(letra) || perdido || completo || cargando) return;
    setCargando(true);
    try {
      const res = await fetch("/api/reto/ahorcado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retoId, letra }),
      });
      const data = (await res.json()) as { posiciones: number[] };
      setUsadas((s) => new Set(s).add(letra));
      if (data.posiciones && data.posiciones.length > 0) {
        setReveladas((prev) => {
          const copia = [...prev];
          for (const p of data.posiciones) copia[p] = letra;
          if (copia.every((c) => c !== null)) {
            sonidoExito();
            setTimeout(() => onEnviar(copia.join("")), 300);
          }
          return copia;
        });
      } else {
        setErrores((e) => e + 1);
        sonidoError();
      }
    } finally {
      setCargando(false);
    }
  }

  function reiniciar() {
    setReveladas(Array.from({ length: longitud }, () => null));
    setUsadas(new Set());
    setErrores(0);
  }

  const cara = MONIGOTE[Math.min(errores, MONIGOTE.length - 1)];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-3xl" aria-label={`Errores ${errores} de ${intentosMax}`}>
          {cara}
        </span>
        <span className="text-xs text-muted-foreground">
          Errores: {errores}/{intentosMax}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5" aria-label="Palabra a adivinar">
        {reveladas.map((c, i) => (
          <span
            key={i}
            className="flex h-10 w-8 items-center justify-center border-b-2 border-foreground/60 font-mono text-xl uppercase"
          >
            {c ?? ""}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1" role="group" aria-label="Teclado">
        {LETRAS.map((l) => (
          <button
            key={l}
            type="button"
            disabled={usadas.has(l) || perdido || completo || cargando}
            onClick={() => probarLetra(l)}
            className={cn(
              "h-8 w-8 rounded border text-sm font-medium",
              usadas.has(l)
                ? "border-border bg-muted text-muted-foreground"
                : "border-input hover:bg-secondary",
            )}
            aria-label={`Letra ${l}`}
          >
            {l}
          </button>
        ))}
      </div>

      {perdido && (
        <div className="space-y-2">
          <p role="alert" className="text-sm text-destructive">
            Te quedaste sin intentos. Puedes reiniciar e intentar de nuevo.
          </p>
          <Button size="sm" variant="outline" onClick={reiniciar}>
            Reiniciar palabra
          </Button>
        </div>
      )}
    </div>
  );
}
