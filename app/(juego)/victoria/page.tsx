"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useJuego } from "@/lib/juego/store";
import { INSIGNIAS } from "@/data/insignias";
import { Insignia } from "@/components/gamificacion/Insignia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatearTiempo } from "@/lib/utils";

export default function VictoriaPage() {
  const estado = useJuego();
  const tiempoMs = estado.inicioMs && estado.finMs ? estado.finMs - estado.inicioMs : 0;

  return (
    <div className="crt-scanlines min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <div className="container space-y-6 py-10 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-primary">
            Red restaurada
          </p>
          <h1 className="text-4xl font-black sm:text-5xl">¡VICTORIA! 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            El equipo <strong>{estado.nombreEquipo}</strong> reconectó el Archivo Nacional de las
            Telecomunicaciones.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-3xl font-bold text-primary">{estado.puntaje}</p>
              <p className="text-xs text-muted-foreground">Puntaje total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="font-mono text-3xl font-bold text-primary">
                {formatearTiempo(tiempoMs)}
              </p>
              <p className="text-xs text-muted-foreground">Tiempo total</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>🏅 Insignias obtenidas ({estado.insignias.length}/12)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {INSIGNIAS.map((i) => (
              <Insignia key={i.codigo} insignia={i} obtenida={estado.insignias.includes(i.codigo)} />
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/ranking">Ver ranking 🏆</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
