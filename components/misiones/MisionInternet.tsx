"use client";

import { MisionNodo } from "@/components/misiones/MisionNodo";
import { getNodo } from "@/data/misiones";

export function MisionInternet() {
  const nodo = getNodo("internet");
  if (!nodo) return null;
  return <MisionNodo nodo={nodo} />;
}
