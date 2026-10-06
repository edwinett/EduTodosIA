"use client";

import { Progress } from "@/components/ui/progress";

export function BarraProgreso({ valor, etiqueta }: { valor: number; etiqueta?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, valor)) * 100);
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{etiqueta ?? "Progreso"}</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <Progress value={pct} aria-label={`${etiqueta ?? "Progreso"}: ${pct}%`} />
    </div>
  );
}
