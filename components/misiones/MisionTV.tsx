"use client";

import { MisionNodo } from "@/components/misiones/MisionNodo";
import { useContenido } from "@/lib/contenido/cliente";

export function MisionTV() {
  const { getNodo } = useContenido();
  const nodo = getNodo("tv");
  if (!nodo) return null;
  return <MisionNodo nodo={nodo} />;
}
