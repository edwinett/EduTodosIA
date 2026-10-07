"use client";

import { MisionNodo } from "@/components/misiones/MisionNodo";
import { useContenido } from "@/lib/contenido/cliente";

export function MisionRadio() {
  const { getNodo } = useContenido();
  const nodo = getNodo("radio");
  if (!nodo) return null;
  return <MisionNodo nodo={nodo} />;
}
