"use client";

import { useState } from "react";
import type { NodoId } from "@/lib/juego/tipos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sonidoExito, sonidoError } from "@/lib/audio/sonidos";
import { cn } from "@/lib/utils";

interface Props {
  nodo: NodoId;
  pista: string;
  onAbierto: (clave: string) => void;
  onError?: () => void;
}

export function CandadoPalabra({ nodo, pista, onAbierto, onError }: Props) {
  const [valor, setValor] = useState("");
  const [estado, setEstado] = useState<"idle" | "error" | "ok">("idle");
  const [cargando, setCargando] = useState(false);

  async function intentar() {
    if (cargando || !valor.trim()) return;
    setCargando(true);
    try {
      const res = await fetch("/api/validar/candado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodo, valor }),
      });
      const data = (await res.json()) as { correcto: boolean; claveParcial: string | null };
      if (data.correcto && data.claveParcial) {
        setEstado("ok");
        sonidoExito();
        onAbierto(data.claveParcial);
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
      <Label htmlFor={`candado-palabra-${nodo}`} className="block">
        🔒 Candado de palabra secreta
      </Label>
      <p className="text-sm text-muted-foreground">{pista}</p>
      <div className="flex gap-2">
        <Input
          id={`candado-palabra-${nodo}`}
          value={valor}
          onChange={(e) => {
            setValor(e.target.value.toUpperCase());
            setEstado("idle");
          }}
          onKeyDown={(e) => e.key === "Enter" && intentar()}
          className={cn(
            "font-mono text-lg uppercase tracking-widest",
            estado === "error" && "border-destructive",
            estado === "ok" && "border-primary",
          )}
          placeholder="PALABRA"
          aria-invalid={estado === "error"}
        />
        <Button onClick={intentar} disabled={!valor.trim() || cargando}>
          Abrir
        </Button>
      </div>
      {estado === "error" && (
        <p role="alert" className="text-sm text-destructive">
          Palabra incorrecta. Revisa el resultado de los retos.
        </p>
      )}
      {estado === "ok" && <p className="text-sm text-primary">¡Candado abierto! 🔓</p>}
    </div>
  );
}
