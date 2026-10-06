import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormNodo,
  FormReto,
  FormPista,
  FormInsignia,
} from "./formularios";

export const dynamic = "force-dynamic";

export default async function ContenidoPage() {
  const [nodos, insignias] = await Promise.all([
    prisma.nodo.findMany({
      orderBy: { orden: "asc" },
      include: {
        retos: { orderBy: { orden: "asc" }, include: { pistas: { orderBy: { nivel: "asc" } } } },
      },
    }),
    prisma.insignia.findMany({ orderBy: { codigo: "asc" } }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <div className="container space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🛠️ Edición de contenido</h1>
            <p className="text-sm text-muted-foreground">
              CRUD de nodos, retos, pistas e insignias (Server Actions + validación Zod).
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/docente">← Panel</Link>
          </Button>
        </div>

        {/* NODOS */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Nodos y retos</h2>
          {nodos.map((nodo) => (
            <Card key={nodo.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {nodo.nombre} <span className="font-mono text-xs text-muted-foreground">/{nodo.slug}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <details>
                  <summary className="cursor-pointer text-sm font-medium">Editar nodo</summary>
                  <div className="mt-2">
                    <FormNodo nodo={nodo} />
                  </div>
                </details>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Retos ({nodo.retos.length})</p>
                  {nodo.retos.map((reto) => (
                    <details key={reto.id} className="rounded-md bg-background/50 p-2">
                      <summary className="cursor-pointer text-sm">
                        {reto.titulo}{" "}
                        <span className="font-mono text-xs text-muted-foreground">/{reto.slug}</span>
                      </summary>
                      <div className="mt-2 space-y-3">
                        <FormReto nodoId={nodo.id} reto={reto} />
                        <div className="space-y-2 pl-2">
                          <p className="text-xs font-medium text-muted-foreground">Pistas</p>
                          {reto.pistas.map((p) => (
                            <FormPista key={p.id} retoId={reto.id} pista={p} />
                          ))}
                          <FormPista retoId={reto.id} />
                        </div>
                      </div>
                    </details>
                  ))}

                  <details className="rounded-md border border-dashed border-primary/40 p-2">
                    <summary className="cursor-pointer text-sm text-primary">+ Nuevo reto</summary>
                    <div className="mt-2">
                      <FormReto nodoId={nodo.id} />
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          ))}

          <details className="rounded-lg border border-dashed border-primary/40 p-3">
            <summary className="cursor-pointer font-medium text-primary">+ Nuevo nodo</summary>
            <div className="mt-2">
              <FormNodo />
            </div>
          </details>
        </section>

        {/* INSIGNIAS */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Insignias</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {insignias.map((i) => (
              <FormInsignia key={i.id} insignia={i} />
            ))}
          </div>
          <details className="rounded-lg border border-dashed border-primary/40 p-3">
            <summary className="cursor-pointer font-medium text-primary">+ Nueva insignia</summary>
            <div className="mt-2">
              <FormInsignia />
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
