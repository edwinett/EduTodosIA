"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useJuego } from "@/lib/juego/store";
import { HUD } from "@/components/juego/HUD";
import { useContenido } from "@/lib/contenido/cliente";
import { todasLasClaves } from "@/lib/juego/reglas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ICONO: Record<string, string> = {
  radio: "📻",
  tv: "📺",
  telefono: "☎️",
  internet: "🌐",
  final: "🔐",
};

export default function MapaPage() {
  const router = useRouter();
  const estado = useJuego();
  const { nodos, cargando } = useContenido();

  useEffect(() => {
    if (!estado.equipoId && !estado.nombreEquipo) router.replace("/lobby");
  }, [estado.equipoId, estado.nombreEquipo, router]);

  const finalDisponible = todasLasClaves(estado);
  const nodosJugables = nodos.filter((n) => n.id !== "final");

  return (
    <div className="min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <HUD />
      <div className="container space-y-6 py-6">
        <div>
          <h1 className="text-2xl font-bold">Mapa de misiones</h1>
          <p className="text-sm text-muted-foreground">
            Reconecta los 4 nodos en el orden que prefieras. Cada nodo te dará una clave parcial.
          </p>
        </div>

        {cargando && (
          <p className="text-sm text-muted-foreground">Cargando contenido…</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {nodosJugables.map((nodo, i) => {
            const prog = estado.nodos[nodo.id];
            const completado = prog?.candadoAbierto;
            return (
              <motion.div
                key={nodo.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={completado ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden>
                          {ICONO[nodo.id]}
                        </span>
                        {nodo.nombre}
                      </CardTitle>
                      <Badge variant={completado ? "default" : "secondary"}>
                        {completado ? "Completado ✓" : "Activo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{nodo.descripcion}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">Dificultad: {nodo.dificultad}</Badge>
                      <Badge variant="outline">⏱ ~{nodo.tiempoSugeridoMin} min</Badge>
                      <Badge variant="outline">{nodo.retos.length} retos</Badge>
                    </div>
                    <Button asChild className="w-full" variant={completado ? "outline" : "default"}>
                      <Link href={`/sala/${nodo.id}`}>
                        {completado ? "Revisar nodo" : "Entrar al nodo"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Caja fuerte final */}
        <Card className={finalDisponible ? "border-accent" : "opacity-70"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                🔐
              </span>
              Caja Fuerte Final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {finalDisponible
                ? "¡Tienes las 4 claves! Introduce el Código Maestro de Restauración."
                : "Reúne las 4 claves parciales para desbloquear la caja fuerte."}
            </p>
            <Button asChild disabled={!finalDisponible} variant="accent" className="w-full">
              <Link href={finalDisponible ? "/final" : "/mapa"} aria-disabled={!finalDisponible}>
                {finalDisponible ? "Abrir la caja fuerte" : "🔒 Bloqueada"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
