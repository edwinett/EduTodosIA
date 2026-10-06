import Link from "next/link";
import { TablaClasificacion } from "@/components/gamificacion/TablaClasificacion";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Ranking · SEÑAL PERDIDA" };

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <div className="container space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🏆 Tabla de clasificación</h1>
            <p className="text-sm text-muted-foreground">
              Actualización en tiempo real (polling cada 10 s).
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Inicio</Link>
          </Button>
        </div>
        <TablaClasificacion polling mostrarFiltros />
      </div>
    </div>
  );
}
