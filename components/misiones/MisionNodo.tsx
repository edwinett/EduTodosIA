"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { NodoPublico, NodoId } from "@/lib/juego/tipos";
import { useJuego } from "@/lib/juego/store";
import { RetoInteractivo } from "@/components/retos/RetoInteractivo";
import { CandadoNumerico } from "@/components/juego/CandadoNumerico";
import { CandadoPalabra } from "@/components/juego/CandadoPalabra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificacionLogro } from "@/components/gamificacion/NotificacionLogro";
import { construirHechos } from "@/lib/juego/hechos";
import { insigniasNuevas } from "@/lib/juego/insignias";

const DIGITOS: Record<string, number> = { radio: 4, tv: 2, telefono: 3 };

export function MisionNodo({ nodo }: { nodo: NodoPublico }) {
  const router = useRouter();
  const estado = useJuego();
  const prog = estado.nodos[nodo.id];
  const [logro, setLogro] = useState<string | null>(null);

  const retosResueltos = Object.values(prog?.retos ?? {}).filter((r) => r.resuelto).length;
  const totalRetos = nodo.retos.length;
  const todosResueltos = retosResueltos === totalRetos;
  const candadoAbierto = prog?.candadoAbierto ?? false;

  function evaluarInsignias() {
    const hechos = construirHechos(estado);
    const nuevas = insigniasNuevas(hechos, estado.insignias);
    if (nuevas.length > 0) {
      estado.agregarInsignias(nuevas);
      setLogro(nuevas[0] ?? null);
    }
  }

  function alAbrirCandado(clave: string) {
    estado.abrirCandado(nodo.id, clave);
    // Espera un tick a que el estado se asiente antes de evaluar insignias.
    setTimeout(evaluarInsignias, 50);
  }

  return (
    <div className="container space-y-6 py-6">
      <NotificacionLogro codigo={logro} onCerrar={() => setLogro(null)} />

      {/* Narrativa de entrada */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Nodo {nodo.nombre}</CardTitle>
            <Badge variant="secondary">{nodo.descripcion}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">{nodo.narrativa}</p>
          <div className="rounded-md border border-border bg-background p-3 text-sm">
            <strong>📜 Hito histórico:</strong> {nodo.hitoHistorico}
          </div>
          <p className="text-xs text-muted-foreground">
            Retos resueltos: {retosResueltos}/{totalRetos}
          </p>
        </CardContent>
      </Card>

      {/* Retos encadenados */}
      <div className="grid gap-4">
        {nodo.retos.map((reto, i) => {
          const retoPrevResuelto = i === 0 || !!prog?.retos[nodo.retos[i - 1]!.id]?.resuelto;
          if (!retoPrevResuelto) {
            return (
              <Card key={reto.id} className="opacity-60">
                <CardHeader>
                  <CardTitle className="text-base">🔒 {reto.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Resuelve el reto anterior para desbloquear este.
                  </p>
                </CardContent>
              </Card>
            );
          }
          return (
            <RetoInteractivo key={reto.id} reto={reto} onResuelto={() => undefined} />
          );
        })}
      </div>

      {/* Candado del nodo */}
      {!candadoAbierto && (
        <section aria-label="Candado del nodo">
          {todosResueltos ? (
            nodo.tipoCandado === "palabra" ? (
              <CandadoPalabra
                nodo={nodo.id}
                pista={nodo.pistaCandado}
                onAbierto={alAbrirCandado}
                onError={() => estado.registrarErrorCandado(nodo.id)}
              />
            ) : (
              <CandadoNumerico
                nodo={nodo.id}
                digitos={DIGITOS[nodo.id] ?? 4}
                pista={nodo.pistaCandado}
                onAbierto={alAbrirCandado}
                onError={() => estado.registrarErrorCandado(nodo.id)}
              />
            )
          ) : (
            <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              🔒 Resuelve los {totalRetos} retos para habilitar el candado del nodo.
            </p>
          )}
        </section>
      )}

      {/* Dato ambiental + salida */}
      {candadoAbierto && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-primary">🔓 ¡Nodo {nodo.nombre} reconectado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
                <strong>🌿 Dato ambiental y territorial (Tolima):</strong> {nodo.datoAmbiental}
              </div>
              <Button onClick={() => router.push("/mapa")}>Volver al mapa de misiones</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export type { NodoId };
