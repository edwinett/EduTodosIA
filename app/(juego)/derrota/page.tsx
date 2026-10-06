"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useJuego } from "@/lib/juego/store";
import { useContenido } from "@/lib/contenido/cliente";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DerrotaPage() {
  const router = useRouter();
  const estado = useJuego();
  const { nodos } = useContenido();

  // Nodo activo = primero sin completar.
  const nodoActivo = nodos.find((n) => n.id !== "final" && !estado.nodos[n.id]?.candadoAbierto);

  function reintentarNodo() {
    if (nodoActivo) {
      estado.reiniciarNodo(nodoActivo.id);
      router.push(`/sala/${nodoActivo.id}`);
    } else {
      router.push("/mapa");
    }
  }

  return (
    <div className="crt-scanlines min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <div className="container flex min-h-screen flex-col items-center justify-center gap-6 py-10 text-center">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-destructive animate-flicker">
            Tiempo agotado
          </p>
          <h1 className="text-4xl font-black sm:text-5xl">SEÑAL PERDIDA 📡❌</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            RUPTURA ganó esta ronda… pero la memoria se puede recuperar. Reintenta el nodo activo y
            vuelve a intentarlo.
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Puntaje acumulado: <strong>{estado.puntaje}</strong></p>
            <p>
              Nodos reconectados:{" "}
              <strong>
                {nodos.filter((n) => n.id !== "final" && estado.nodos[n.id]?.candadoAbierto).length}/4
              </strong>
            </p>
            <p>Insignias: <strong>{estado.insignias.length}</strong></p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reintentarNodo}>
            🔁 Reintentar nodo {nodoActivo ? nodoActivo.nombre : ""}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
