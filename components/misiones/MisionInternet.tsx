"use client";

import { MisionNodo } from "@/components/misiones/MisionNodo";
import { useContenido } from "@/lib/contenido/cliente";

export function MisionInternet() {
  const { getNodo } = useContenido();
  const nodo = getNodo("internet");
  if (!nodo) return null;
  return <MisionNodo nodo={nodo} />;
}
