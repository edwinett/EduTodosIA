"use client";

import { MisionNodo } from "@/components/misiones/MisionNodo";
import { useContenido } from "@/lib/contenido/cliente";

export function MisionTelefono() {
  const { getNodo } = useContenido();
  const nodo = getNodo("telefono");
  if (!nodo) return null;
  return <MisionNodo nodo={nodo} />;
}
