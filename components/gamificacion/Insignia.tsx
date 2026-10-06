"use client";

import type { InsigniaDef } from "@/lib/juego/tipos";
import { cn } from "@/lib/utils";

const ICONOS: Record<string, string> = {
  radio: "📻",
  antena: "📡",
  telefono: "☎️",
  red: "🌐",
  tv: "📺",
  rayo: "⚡",
  lupa: "🔍",
  candado: "🔐",
  hoja: "🌿",
  equipo: "🤝",
  llave: "🗝️",
  estrella: "⭐",
};

export function Insignia({
  insignia,
  obtenida,
}: {
  insignia: InsigniaDef;
  obtenida: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition",
        obtenida
          ? "border-accent bg-accent/10"
          : "border-border bg-card opacity-45 grayscale",
      )}
      title={insignia.criterio}
      aria-label={`Insignia ${insignia.nombre}: ${obtenida ? "obtenida" : "bloqueada"}. ${insignia.descripcion}`}
    >
      <span className="text-3xl" aria-hidden>
        {ICONOS[insignia.icono] ?? "🏅"}
      </span>
      <span className="text-sm font-semibold leading-tight">{insignia.nombre}</span>
      <span className="text-xs text-muted-foreground">{insignia.descripcion}</span>
    </div>
  );
}
