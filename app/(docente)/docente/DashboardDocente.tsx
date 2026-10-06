"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { TablaClasificacion } from "@/components/gamificacion/TablaClasificacion";
import { GestorAulas } from "./GestorAulas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Resumen {
  [retoId: string]: { intentos: number; correctos: number; pistas: number };
}

export function DashboardDocente({ nombre }: { nombre: string }) {
  const [consulta, setConsulta] = useState("");
  const [resumen, setResumen] = useState<Resumen | null>(null);

  async function consultarDiagnostico() {
    const res = await fetch(`/api/eventos?partidaId=${consulta}`, { cache: "no-store" });
    if (res.ok) setResumen((await res.json()).resumenPorReto as Resumen);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <div className="container space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">👩‍🏫 Panel docente</h1>
            <p className="text-sm text-muted-foreground">Hola, {nombre}.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/docente/contenido">🛠️ Contenido</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/docente/export">⬇️ CSV</a>
            </Button>
            <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              Salir
            </Button>
          </div>
        </div>

        <Tabs defaultValue="aulas">
          <TabsList>
            <TabsTrigger value="aulas">Modo aula</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
          </TabsList>

          <TabsContent value="aulas">
            <GestorAulas />
          </TabsContent>

          <TabsContent value="ranking">
            <TablaClasificacion polling mostrarFiltros />
          </TabsContent>

          <TabsContent value="diagnostico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progreso por reto de una partida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="ID de partida"
                    value={consulta}
                    onChange={(e) => setConsulta(e.target.value)}
                  />
                  <Button onClick={consultarDiagnostico} disabled={!consulta}>
                    Consultar
                  </Button>
                </div>
                {resumen && Object.keys(resumen).length === 0 && (
                  <p className="text-sm text-muted-foreground">Sin intentos registrados.</p>
                )}
                {resumen && Object.keys(resumen).length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-3 py-2 text-left">Reto</th>
                          <th className="px-3 py-2 text-right">Intentos</th>
                          <th className="px-3 py-2 text-right">Correctos</th>
                          <th className="px-3 py-2 text-right">Pistas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(resumen).map(([reto, r]) => (
                          <tr key={reto} className="border-t border-border">
                            <td className="px-3 py-2 font-mono">{reto}</td>
                            <td className="px-3 py-2 text-right">{r.intentos}</td>
                            <td className="px-3 py-2 text-right">{r.correctos}</td>
                            <td className="px-3 py-2 text-right">{r.pistas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
