"use client";

import { useEffect, useRef, useState } from "react";
import { formatearTiempo } from "@/lib/utils";
import { AVISOS_SEG, DURACION_PARTIDA_SEG } from "@/lib/juego/reglas";
import { cn } from "@/lib/utils";

interface TimerProps {
  partidaId: string | null;
  inicioMs: number | null;
  onExpirar?: () => void;
}

// Reloj del juego. El tiempo lo decide el SERVIDOR (/api/timer); el cliente solo refleja.
// Si no hay partida persistida, cae a un conteo local basado en inicioMs.
export function Timer({ partidaId, inicioMs, onExpirar }: TimerProps) {
  const [restanteSeg, setRestanteSeg] = useState<number>(DURACION_PARTIDA_SEG);
  const avisadosRef = useRef<Set<number>>(new Set());
  const expiradoRef = useRef(false);

  // Sincroniza con el servidor (autoritativo) cada 15 s.
  useEffect(() => {
    let activo = true;
    async function sincronizar() {
      try {
        const url = partidaId ? `/api/timer?partidaId=${partidaId}` : "/api/timer";
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { restanteSeg: number };
        if (activo && typeof data.restanteSeg === "number") {
          setRestanteSeg(data.restanteSeg);
        }
      } catch {
        // Sin red: usa el conteo local (fallback más abajo).
        if (inicioMs) {
          const transcurrido = Math.floor((Date.now() - inicioMs) / 1000);
          setRestanteSeg(Math.max(0, DURACION_PARTIDA_SEG - transcurrido));
        }
      }
    }
    sincronizar();
    const id = setInterval(sincronizar, 15000);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, [partidaId, inicioMs]);

  // Tic local de 1 s para suavizar la cuenta entre sincronizaciones.
  useEffect(() => {
    const id = setInterval(() => {
      setRestanteSeg((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Avisos y expiración.
  useEffect(() => {
    for (const aviso of AVISOS_SEG) {
      if (restanteSeg === aviso && !avisadosRef.current.has(aviso)) {
        avisadosRef.current.add(aviso);
        if (typeof window !== "undefined") {
          // Aviso accesible por aria-live (ver contenedor).
        }
      }
    }
    if (restanteSeg <= 0 && !expiradoRef.current) {
      expiradoRef.current = true;
      onExpirar?.();
    }
  }, [restanteSeg, onExpirar]);

  const critico = restanteSeg <= 60;
  const alerta = restanteSeg <= 300;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Tiempo restante ${formatearTiempo(restanteSeg * 1000)}`}
      className={cn(
        "rounded-md border px-3 py-1.5 font-mono text-lg tabular-nums",
        critico
          ? "animate-pulse border-destructive bg-destructive/20 text-destructive-foreground"
          : alerta
            ? "border-accent bg-accent/20 text-accent"
            : "border-border bg-card",
      )}
    >
      ⏱ {formatearTiempo(restanteSeg * 1000)}
    </div>
  );
}
