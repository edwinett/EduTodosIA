import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PanelAula } from "./PanelAula";

export const dynamic = "force-dynamic";

export default function AulaPage({ params }: { params: { codigo: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <div className="container space-y-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📡 Aula en vivo</h1>
          <Button asChild variant="outline">
            <Link href="/docente">← Panel</Link>
          </Button>
        </div>
        <PanelAula codigo={params.codigo} />
      </div>
    </div>
  );
}
