"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useJuego } from "@/lib/juego/store";
import { Timer } from "@/components/juego/Timer";
import { InventarioClaves } from "@/components/juego/InventarioClaves";
import { BarraProgreso } from "@/components/gamificacion/BarraProgreso";
import { Button } from "@/components/ui/button";
import { porcentajeProgreso } from "@/lib/juego/reglas";
import { silenciar, estaSilenciado } from "@/lib/audio/sonidos";
import { Volume2, VolumeX, Type } from "lucide-react";

export function HUD() {
  const router = useRouter();
  const estado = useJuego();
  const [mute, setMute] = useState(false);
  const [fuente, setFuente] = useState<"normal" | "grande" | "extra">("normal");

  useEffect(() => {
    setMute(estaSilenciado());
  }, []);

  function alternarMute() {
    const nuevo = !mute;
    setMute(nuevo);
    silenciar(nuevo);
  }

  function alternarFuente() {
    const orden = ["normal", "grande", "extra"] as const;
    const idx = orden.indexOf(fuente);
    const siguiente = orden[(idx + 1) % orden.length]!;
    setFuente(siguiente);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-fuente", siguiente);
    }
  }

  const progreso = porcentajeProgreso(estado);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="container flex flex-col gap-2 py-2">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/mapa")}
            className="text-left"
            aria-label="Volver al mapa de misiones"
          >
            <p className="text-xs text-muted-foreground">SEÑAL PERDIDA</p>
            <p className="font-semibold leading-tight">
              {estado.nombreEquipo ?? "Equipo"}{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {estado.codigoEquipo}
              </span>
            </p>
          </button>

          <div className="flex items-center gap-2">
            <div
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              aria-label={`Puntaje ${estado.puntaje}`}
            >
              ⭐ <span className="font-mono font-semibold">{estado.puntaje}</span>
            </div>
            <Timer
              partidaId={estado.partidaId}
              inicioMs={estado.inicioMs}
              onExpirar={() => {
                if (estado.resultado === "en-curso") {
                  estado.terminar("derrota");
                  router.push("/derrota");
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={alternarMute}
              aria-label={mute ? "Activar sonido" : "Silenciar sonido"}
            >
              {mute ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={alternarFuente}
              aria-label="Cambiar tamaño de fuente"
              title={`Tamaño de fuente: ${fuente}`}
            >
              <Type className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <InventarioClaves claves={estado.claves} />
          <div className="w-full sm:max-w-xs">
            <BarraProgreso valor={progreso} etiqueta="Nodos reconectados" />
          </div>
        </div>
      </div>
    </header>
  );
}
