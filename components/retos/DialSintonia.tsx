"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ruidoVHS } from "@/lib/audio/sonidos";
import { cn } from "@/lib/utils";

interface Props {
  min: number;
  max: number;
  paso: number;
  unidad: string;
  objetivo?: number; // solo para calcular la "nitidez" visual/sonora, no revela nada
  tolerancia?: number;
  onCambio: (valor: number) => void;
}

// Dial de sintonía: desliza para buscar la señal nítida. El objetivo se usa solo
// para la retroalimentación sensorial (barras de señal); la validación es en el servidor.
export function DialSintonia({ min, max, paso, unidad, objetivo, tolerancia = 0.2, onCambio }: Props) {
  const [valor, setValor] = useState((min + max) / 2);

  const distancia = objetivo !== undefined ? Math.abs(valor - objetivo) : 10;
  const nitidez = Math.max(0, 1 - distancia / (tolerancia * 12)); // 0..1
  const barras = Math.round(nitidez * 5);

  return (
    <div className="space-y-3">
      <Label htmlFor="dial">Sintoniza la frecuencia ({unidad})</Label>
      <input
        id="dial"
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => {
          const v = Number(e.target.value);
          setValor(v);
          onCambio(v);
          if (Math.random() < 0.3) ruidoVHS(120);
        }}
        className="w-full accent-[hsl(var(--primary))]"
        aria-valuetext={`${valor.toFixed(1)} ${unidad}`}
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xl">
          {valor.toFixed(1)} {unidad}
        </span>
        <div className="flex items-end gap-1" aria-label={`Intensidad de señal ${barras} de 5`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn(
                "w-2 rounded-sm",
                i < barras ? "bg-primary" : "bg-muted",
              )}
              style={{ height: `${(i + 1) * 5 + 6}px` }}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {barras >= 4 ? "Señal nítida ✅" : barras >= 2 ? "Señal con ruido…" : "Mucho ruido 📻"}
      </p>
    </div>
  );
}
