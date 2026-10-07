"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useJuego } from "@/lib/juego/store";
import { useContenido } from "@/lib/contenido/cliente";
import { RetoInteractivo } from "@/components/retos/RetoInteractivo";
import { CandadoCombinacion } from "@/components/juego/CandadoCombinacion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NODOS_ORDEN } from "@/lib/juego/reglas";
import { construirHechos } from "@/lib/juego/hechos";
import { evaluarInsignias } from "@/lib/juego/insignias";

export function MisionFinal() {
  const router = useRouter();
  const estado = useJuego();
  const { getNodo } = useContenido();
  const nodo = getNodo("final");

  const tieneClaves = NODOS_ORDEN.every((n) => estado.claves[n] !== null);
  const reflexion = nodo?.retos.find((r) => r.id === "final-reflexion");
  const reflexionResuelta = estado.nodos.final?.retos["final-reflexion"]?.resuelto ?? false;

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!tieneClaves) router.replace("/mapa");
  }, [tieneClaves, router]);

  if (!nodo || !tieneClaves) return null;

  const fichas = NODOS_ORDEN.map((n) => ({
    id: n,
    texto: estado.claves[n] ?? "",
  }));

  async function finalizar(claveFinal: string) {
    estado.abrirCandado("final", claveFinal);
    estado.terminar("victoria");

    // Evalúa insignias finales e intenta registrar el resultado en el servidor.
    const hechos = construirHechos({ ...estado, finMs: Date.now() });
    const insignias = evaluarInsignias(hechos);
    estado.agregarInsignias(insignias);

    if (estado.partidaId) {
      setGuardando(true);
      try {
        await fetch("/api/ranking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partidaId: estado.partidaId,
            puntaje: estado.puntaje,
            tiempoTotalMs: hechos.tiempoTotalMs,
            precision: hechos.precisionGlobal,
            estado: "GANADA",
            insignias,
          }),
        });
      } catch {
        // El resultado también queda persistido localmente.
      } finally {
        setGuardando(false);
      }
    }
    router.push("/victoria");
  }

  return (
    <div className="container space-y-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle>🔐 Caja Fuerte Final</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">{nodo.narrativa}</p>
          <div className="rounded-md border border-border bg-background p-3 text-sm">
            {nodo.hitoHistorico}
          </div>
        </CardContent>
      </Card>

      {reflexion && !reflexionResuelta && (
        <RetoInteractivo reto={reflexion} onResuelto={() => undefined} />
      )}

      {reflexionResuelta && (
        <CandadoCombinacion
          nodo="final"
          fichas={fichas}
          pista={nodo.pistaCandado}
          onAbierto={finalizar}
          onError={() => estado.registrarErrorCandado("final")}
        />
      )}

      {guardando && <p className="text-sm text-muted-foreground">Guardando resultado…</p>}

      <Button variant="ghost" onClick={() => router.push("/mapa")}>
        Volver al mapa
      </Button>
    </div>
  );
}
