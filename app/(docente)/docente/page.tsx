"use client";

import { useState } from "react";
import Link from "next/link";
import { TablaClasificacion } from "@/components/gamificacion/TablaClasificacion";
import { INSIGNIAS } from "@/data/insignias";
import { Insignia } from "@/components/gamificacion/Insignia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Resumen {
  [retoId: string]: { intentos: number; correctos: number; pistas: number };
}

export default function DocentePage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [consulta, setConsulta] = useState("");
  const [resumen, setResumen] = useState<Resumen | null>(null);

  async function entrar() {
    setError(null);
    const res = await fetch("/api/docente/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAutenticado(true);
    else setError("Clave incorrecta.");
  }

  async function consultarDiagnostico() {
    const params = new URLSearchParams();
    if (/^[a-z0-9]{10,}$/i.test(consulta)) params.set("equipoId", consulta);
    params.set("partidaId", consulta);
    const res = await fetch(`/api/eventos?partidaId=${consulta}`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { resumenPorReto: Resumen };
      setResumen(data.resumenPorReto);
    }
  }

  if (!autenticado) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Panel docente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="pwd">Clave de acceso</Label>
            <Input
              id="pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && entrar()}
              placeholder="••••••"
            />
            <Button className="w-full" onClick={entrar}>
              Ingresar
            </Button>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Clave por defecto en desarrollo: <code>tolima2024</code> (configúrala en <code>.env</code>).
            </p>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Volver</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <div className="container space-y-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">👩‍🏫 Panel docente</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/api/docente/export">⬇️ Exportar CSV</a>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Salir</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ranking">
          <TabsList>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
            <TabsTrigger value="insignias">Insignias</TabsTrigger>
          </TabsList>

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

          <TabsContent value="insignias">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {INSIGNIAS.map((i) => (
                <Insignia key={i.codigo} insignia={i} obtenida />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
