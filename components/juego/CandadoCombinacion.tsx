"use client";

import { useState } from "react";
import type { NodoId } from "@/lib/juego/tipos";
import { ListaOrdenable, type ItemOrdenable } from "@/components/juego/ListaOrdenable";
import { Button } from "@/components/ui/button";
import { sonidoExito, sonidoError } from "@/lib/audio/sonidos";

interface Props {
  nodo: NodoId;
  // Fichas (claves) desordenadas que el equipo debe ordenar.
  fichas: ItemOrdenable[];
  pista: string;
  onAbierto: (clave: string) => void;
  onError?: () => void;
}

// Candado de combinación: arrastra las fichas (claves) al orden correcto.
export function CandadoCombinacion({ nodo, fichas, pista, onAbierto, onError }: Props) {
  const [items, setItems] = useState<ItemOrdenable[]>(fichas);
  const [estado, setEstado] = useState<"idle" | "error" | "ok">("idle");
  const [cargando, setCargando] = useState(false);

  async function intentar() {
    if (cargando) return;
    setCargando(true);
    try {
      // El valor enviado es el texto de cada ficha en el orden actual.
      const valor = items.map((i) => i.texto);
      const res = await fetch("/api/validar/candado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodo, valor }),
      });
      const data = (await res.json()) as { correcto: boolean; claveParcial: string | null };
      if (data.correcto) {
        setEstado("ok");
        sonidoExito();
        onAbierto(data.claveParcial ?? valor.join("-"));
      } else {
        setEstado("error");
        sonidoError();
        onError?.();
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <p className="font-medium">🔒 Caja fuerte: ordena las claves</p>
      <p className="text-sm text-muted-foreground">{pista}</p>
      <ListaOrdenable items={items} onCambio={setItems} etiqueta="Ordena las 4 claves" />
      <Button onClick={intentar} disabled={cargando}>
        Introducir código maestro
      </Button>
      {estado === "error" && (
        <p role="alert" className="text-sm text-destructive">
          Combinación incorrecta. Recuerda el orden: Radio, TV, Teléfono, Internet.
        </p>
      )}
      {estado === "ok" && <p className="text-sm text-primary">¡Caja fuerte abierta! 🔓</p>}
    </div>
  );
}
