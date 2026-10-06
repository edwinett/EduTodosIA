"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJuego } from "@/lib/juego/store";
import { HUD } from "@/components/juego/HUD";
import { getNodo } from "@/data/misiones";
import { MisionNodo } from "@/components/misiones/MisionNodo";

export default function SalaPage() {
  const params = useParams<{ nodo: string }>();
  const router = useRouter();
  const estado = useJuego();
  const nodo = getNodo(params.nodo);

  useEffect(() => {
    if (!estado.nombreEquipo) router.replace("/lobby");
    else if (!nodo || nodo.id === "final") router.replace("/mapa");
  }, [estado.nombreEquipo, nodo, router]);

  if (!nodo || nodo.id === "final") return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <HUD />
      <MisionNodo nodo={nodo} />
    </div>
  );
}
