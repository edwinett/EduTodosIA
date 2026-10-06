import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="crt-scanlines min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <div className="container flex min-h-screen flex-col items-center justify-center py-12 text-center">
        <p className="mb-2 font-mono text-sm uppercase tracking-[0.3em] text-primary animate-flicker">
          Transmisión interrumpida
        </p>
        <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-6xl">
          SEÑAL PERDIDA
        </h1>
        <p className="mb-2 max-w-2xl text-lg text-muted-foreground">
          El Apagón de las Telecomunicaciones en Colombia
        </p>
        <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
          Un virus llamado <strong className="text-destructive">RUPTURA</strong> está borrando el
          Archivo Nacional de las Telecomunicaciones. Reconecta los 4 nodos históricos —Radio,
          Televisión, Telefonía e Internet— y abre la Caja Fuerte Final antes de que se agote el
          tiempo.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/lobby">🎮 Comenzar misión</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/ranking">🏆 Ver ranking</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/docente">👩‍🏫 Panel docente</Link>
          </Button>
        </div>

        <Card className="mt-12 max-w-2xl">
          <CardContent className="grid grid-cols-2 gap-4 py-6 text-left text-sm sm:grid-cols-4">
            <div>
              <p className="font-semibold text-primary">⏱ 45 minutos</p>
              <p className="text-muted-foreground">Partida contrarreloj</p>
            </div>
            <div>
              <p className="font-semibold text-primary">👥 2 a 4</p>
              <p className="text-muted-foreground">Jugadores por equipo</p>
            </div>
            <div>
              <p className="font-semibold text-primary">🧩 4 nodos</p>
              <p className="text-muted-foreground">+ caja fuerte final</p>
            </div>
            <div>
              <p className="font-semibold text-primary">🌿 Tolima</p>
              <p className="text-muted-foreground">Educación ambiental</p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-xs text-muted-foreground">
          Universidad del Tolima · Ciencias Naturales y Educación Ambiental · Ibagué, Colombia
        </p>
      </div>
    </div>
  );
}
