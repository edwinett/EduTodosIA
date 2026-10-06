"use client";

import { MisionNodo } from "@/components/misiones/MisionNodo";
import { getNodo } from "@/data/misiones";

export function MisionTV() {
  const nodo = getNodo("tv");
  if (!nodo) return null;
  return <MisionNodo nodo={nodo} />;
}
