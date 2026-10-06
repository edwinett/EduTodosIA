"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Aula {
  id: string;
  codigo: string;
  nombre: string;
  estado: string;
  _count?: { equipos: number };
}

export function GestorAulas() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    const res = await fetch("/api/aula", { cache: "no-store" });
    if (res.ok) setAulas((await res.json()).aulas ?? []);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear() {
    if (nombre.trim().length < 2) return;
    setCargando(true);
    try {
      const res = await fetch("/api/aula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (res.ok) {
        setNombre("");
        await cargar();
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la sesión de aula (ej: Grupo A — Martes)"
          onKeyDown={(e) => e.key === "Enter" && crear()}
        />
        <Button onClick={crear} disabled={cargando || nombre.trim().length < 2}>
          Crear aula
        </Button>
      </div>

      {aulas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no has creado sesiones de aula.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {aulas.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{a.nombre}</p>
                  <p className="font-mono text-lg tracking-[0.2em] text-accent">{a.codigo}</p>
                  <p className="text-xs text-muted-foreground">
                    {a._count?.equipos ?? 0} equipos · {a.estado}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/docente/aula/${a.codigo}`}>Ver en vivo →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
