"use client";

import { MisionNodo } from "@/components/misiones/MisionNodo";
import { getNodo } from "@/data/misiones";

export function MisionRadio() {
  const nodo = getNodo("radio");
  if (!nodo) return null;
  return <MisionNodo nodo={nodo} />;
}
