"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJuego } from "@/lib/juego/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const AVATARES = [
  { id: "satelite", emoji: "🛰️" },
  { id: "antena", emoji: "📡" },
  { id: "radio", emoji: "📻" },
  { id: "tv", emoji: "📺" },
  { id: "modem", emoji: "💾" },
  { id: "telefono", emoji: "☎️" },
];

export default function LobbyPage() {
  const router = useRouter();
  const juego = useJuego();

  const [nombre, setNombre] = useState("");
  const [integrante, setIntegrante] = useState("");
  const [programa, setPrograma] = useState("Ciencias Naturales y Educación Ambiental");
  const [semestre, setSemestre] = useState("3");
  const [avatar, setAvatar] = useState("satelite");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function crear() {
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          avatar,
          programa,
          semestre: Number(semestre),
          integrante: integrante || undefined,
        }),
      });
      if (!res.ok) {
        setError("No se pudo crear el equipo. Revisa el nombre (mín. 2 caracteres).");
        return;
      }
      const data = await res.json();
      juego.reiniciarTodo();
      juego.configurarEquipo({
        equipoId: data.equipoId,
        partidaId: data.partidaId,
        nombreEquipo: data.nombre,
        codigoEquipo: data.codigo,
        avatar: data.avatar,
      });
      juego.iniciarPartida();
      router.push("/mapa");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function unirse() {
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/equipo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, integrante }),
      });
      if (!res.ok) {
        setError("Código no encontrado o datos inválidos.");
        return;
      }
      const data = await res.json();
      juego.reiniciarTodo();
      juego.configurarEquipo({
        equipoId: data.equipoId,
        partidaId: data.partidaId,
        nombreEquipo: data.nombre,
        codigoEquipo: data.codigo,
        avatar: data.avatar,
      });
      juego.iniciarPartida();
      router.push("/mapa");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Sala de equipos</CardTitle>
          <CardDescription>
            Crea un equipo o únete con un código de 6 caracteres. (2 a 4 integrantes.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="crear">
            <TabsList className="w-full">
              <TabsTrigger value="crear" className="flex-1">
                Crear equipo
              </TabsTrigger>
              <TabsTrigger value="unirse" className="flex-1">
                Unirse con código
              </TabsTrigger>
            </TabsList>

            <TabsContent value="crear" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del equipo</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Los Reconectores"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="integrante">Tu nombre (opcional)</Label>
                <Input
                  id="integrante"
                  value={integrante}
                  onChange={(e) => setIntegrante(e.target.value)}
                  placeholder="Ej: Ana Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="programa">Programa</Label>
                  <Input id="programa" value={programa} onChange={(e) => setPrograma(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semestre">Semestre</Label>
                  <Input
                    id="semestre"
                    inputMode="numeric"
                    value={semestre}
                    onChange={(e) => setSemestre(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avatar del equipo</Label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Avatar">
                  {AVATARES.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={avatar === a.id}
                      aria-label={a.id}
                      onClick={() => setAvatar(a.id)}
                      className={`flex h-12 w-12 items-center justify-center rounded-md border text-2xl ${
                        avatar === a.id ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      {a.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={crear} disabled={nombre.trim().length < 2 || cargando}>
                {cargando ? "Creando…" : "Crear equipo e iniciar"}
              </Button>
            </TabsContent>

            <TabsContent value="unirse" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código del equipo</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  className="font-mono text-lg uppercase tracking-[0.3em]"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="integrante2">Tu nombre</Label>
                <Input
                  id="integrante2"
                  value={integrante}
                  onChange={(e) => setIntegrante(e.target.value)}
                  placeholder="Ej: Ana Pérez"
                />
              </div>
              <Button
                className="w-full"
                onClick={unirse}
                disabled={codigo.length !== 6 || integrante.trim().length < 2 || cargando}
              >
                {cargando ? "Uniéndote…" : "Unirse al equipo"}
              </Button>
            </TabsContent>
          </Tabs>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
