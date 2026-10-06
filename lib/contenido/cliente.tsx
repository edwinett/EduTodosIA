"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { NodoPublico } from "@/lib/juego/tipos";

interface ContenidoCtx {
  nodos: NodoPublico[];
  cargando: boolean;
  error: boolean;
  getNodo: (slug: string) => NodoPublico | undefined;
  getReto: (slug: string) => { reto: NodoPublico["retos"][number]; nodo: NodoPublico } | undefined;
}

const Ctx = createContext<ContenidoCtx | null>(null);

export function ContenidoProvider({ children }: { children: React.ReactNode }) {
  const [nodos, setNodos] = useState<NodoPublico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch("/api/contenido", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch");
        const data = (await res.json()) as { nodos: NodoPublico[] };
        if (activo) setNodos(data.nodos);
      } catch {
        if (activo) setError(true);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const valor: ContenidoCtx = {
    nodos,
    cargando,
    error,
    getNodo: (slug) => nodos.find((n) => n.id === slug),
    getReto: (slug) => {
      for (const nodo of nodos) {
        const reto = nodo.retos.find((r) => r.id === slug);
        if (reto) return { reto, nodo };
      }
      return undefined;
    },
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useContenido(): ContenidoCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useContenido debe usarse dentro de <ContenidoProvider>");
  return ctx;
}
