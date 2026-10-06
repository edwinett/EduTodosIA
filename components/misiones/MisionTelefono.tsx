"use client";

import { MisionNodo } from "@/components/misiones/MisionNodo";
import { getNodo } from "@/data/misiones";

export function MisionTelefono() {
  const nodo = getNodo("telefono");
  if (!nodo) return null;
  return <MisionNodo nodo={nodo} />;
}
