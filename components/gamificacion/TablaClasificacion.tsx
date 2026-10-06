"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatearTiempo } from "@/lib/utils";

type Orden = "puntaje" | "tiempo" | "precision" | "insignias";

interface Fila {
  equipoId: string;
  nombre: string;
  codigo: string;
  programa: string | null;
  semestre: number | null;
  puntaje: number;
  tiempoMs: number;
  precision: number;
  insignias: number;
  integrantes: number;
  estado: string;
}

const ETIQUETAS_ORDEN: Record<Orden, string> = {
  puntaje: "Puntaje",
  tiempo: "Tiempo",
  precision: "Precisión",
  insignias: "Insignias",
};

export function TablaClasificacion({
  polling = true,
  mostrarFiltros = true,
}: {
  polling?: boolean;
  mostrarFiltros?: boolean;
}) {
  const [orden, setOrden] = useState<Orden>("puntaje");
  const [programa, setPrograma] = useState("");
  const [semestre, setSemestre] = useState("");
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({ orden });
      if (programa) params.set("programa", programa);
      if (semestre) params.set("semestre", semestre);
      const res = await fetch(`/api/ranking?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { filas: Fila[] };
        setFilas(data.filas);
      }
    } finally {
      setCargando(false);
    }
  }, [orden, programa, semestre]);

  useEffect(() => {
    cargar();
    if (!polling) return;
    const id = setInterval(cargar, 10000); // actualización en tiempo real por polling
    return () => clearInterval(id);
  }, [cargar, polling]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Ordenar por:</span>
        {(Object.keys(ETIQUETAS_ORDEN) as Orden[]).map((o) => (
          <Button
            key={o}
            size="sm"
            variant={orden === o ? "default" : "outline"}
            onClick={() => setOrden(o)}
          >
            {ETIQUETAS_ORDEN[o]}
          </Button>
        ))}
        {cargando && <span className="text-xs text-muted-foreground">actualizando…</span>}
      </div>

      {mostrarFiltros && (
        <div className="flex flex-wrap gap-2">
          <input
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            placeholder="Filtrar por programa"
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
            aria-label="Filtrar por programa"
          />
          <input
            className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm"
            placeholder="Semestre"
            inputMode="numeric"
            value={semestre}
            onChange={(e) => setSemestre(e.target.value.replace(/\D/g, ""))}
            aria-label="Filtrar por semestre"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">Tabla de clasificación de equipos</caption>
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">#</th>
              <th scope="col" className="px-3 py-2 text-left">Equipo</th>
              <th scope="col" className="px-3 py-2 text-right">Puntaje</th>
              <th scope="col" className="px-3 py-2 text-right">Tiempo</th>
              <th scope="col" className="px-3 py-2 text-right">Precisión</th>
              <th scope="col" className="px-3 py-2 text-right">Insignias</th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Aún no hay equipos en el ranking.
                </td>
              </tr>
            )}
            {filas.map((f, idx) => (
              <tr key={f.equipoId} className="border-t border-border">
                <td className="px-3 py-2 font-mono">{idx + 1}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{f.nombre}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.codigo} · {f.programa ?? "—"} {f.semestre ? `· Sem ${f.semestre}` : ""}
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-mono">{f.puntaje}</td>
                <td className="px-3 py-2 text-right font-mono">
                  {f.tiempoMs > 0 ? formatearTiempo(f.tiempoMs) : "—"}
                </td>
                <td className="px-3 py-2 text-right font-mono">{f.precision}%</td>
                <td className="px-3 py-2 text-right font-mono">{f.insignias}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
