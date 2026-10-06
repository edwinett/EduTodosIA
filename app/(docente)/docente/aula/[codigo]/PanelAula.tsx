"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EquipoProgreso {
  equipoId: string;
  nombre: string;
  codigo: string;
  integrantes: number;
  retosResueltos: number;
  nodosCompletados: number;
  totalNodos: number;
  intentosTotales: number;
  pistasUsadas: number;
  puntaje: number;
  estado: string;
  ultimaActividad: number | null;
}

interface Datos {
  aula: { codigo: string; nombre: string; estado: string };
  equipos: EquipoProgreso[];
}

export function PanelAula({ codigo }: { codigo: string }) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ultima, setUltima] = useState<Date | null>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/aula/${codigo}`, { cache: "no-store" });
      if (!res.ok) {
        setError("No se pudo cargar el aula.");
        return;
      }
      setDatos(await res.json());
      setUltima(new Date());
      setError(null);
    } catch {
      setError("Error de red.");
    }
  }, [codigo]);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 5000); // progreso en vivo cada 5 s
    return () => clearInterval(id);
  }, [cargar]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!datos) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-lg border border-accent bg-accent/10 px-4 py-2">
          <p className="text-xs text-muted-foreground">Código de aula</p>
          <p className="font-mono text-2xl font-bold tracking-[0.3em]">{datos.aula.codigo}</p>
        </div>
        <Badge variant={datos.aula.estado === "ABIERTA" ? "default" : "secondary"}>
          {datos.aula.estado}
        </Badge>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {ultima ? `Actualizado ${ultima.toLocaleTimeString("es-CO")}` : ""}
        </span>
      </div>

      {datos.equipos.length === 0 && (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Aún no se ha unido ningún equipo. Comparte el código <strong>{datos.aula.codigo}</strong>.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {datos.equipos.map((e) => (
          <Card key={e.equipoId}>
            <CardContent className="space-y-2 py-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{e.nombre}</p>
                <Badge variant={e.estado === "GANADA" ? "default" : "outline"}>{e.estado}</Badge>
              </div>
              <Progress
                value={(e.nodosCompletados / e.totalNodos) * 100}
                aria-label={`${e.nodosCompletados} de ${e.totalNodos} nodos`}
              />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>🧩 Nodos: {e.nodosCompletados}/{e.totalNodos}</span>
                <span>✅ Retos: {e.retosResueltos}</span>
                <span>👥 Integrantes: {e.integrantes}</span>
                <span>💡 Pistas: {e.pistasUsadas}</span>
                <span>🎯 Intentos: {e.intentosTotales}</span>
                <span>⭐ Puntaje: {e.puntaje}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
