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
  digitos?: number;
  pista: string;
  onAbierto: (clave: string) => void;
  onError?: () => void;
}

export function CandadoNumerico({ nodo, digitos = 4, pista, onAbierto, onError }: Props) {
  const [valor, setValor] = useState("");
  const [estado, setEstado] = useState<"idle" | "error" | "ok">("idle");
  const [cargando, setCargando] = useState(false);

  async function intentar() {
    if (cargando) return;
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
      <Label htmlFor={`candado-${nodo}`} className="block">
        🔒 Candado numérico ({digitos} dígitos)
      </Label>
      <p className="text-sm text-muted-foreground">{pista}</p>
      <div className="flex gap-2">
        <Input
          id={`candado-${nodo}`}
          inputMode="numeric"
          maxLength={digitos}
          value={valor}
          onChange={(e) => {
            setValor(e.target.value.replace(/\D/g, "").slice(0, digitos));
            setEstado("idle");
          }}
          onKeyDown={(e) => e.key === "Enter" && intentar()}
          className={cn(
            "text-center font-mono text-2xl tracking-[0.5em]",
            estado === "error" && "border-destructive",
            estado === "ok" && "border-primary",
          )}
          placeholder={"0".repeat(digitos)}
          aria-invalid={estado === "error"}
        />
        <Button onClick={intentar} disabled={valor.length < digitos || cargando}>
          Abrir
        </Button>
      </div>
      {estado === "error" && (
        <p role="alert" className="text-sm text-destructive">
          Código incorrecto. Revisa las pistas del nodo.
        </p>
      )}
      {estado === "ok" && <p className="text-sm text-primary">¡Candado abierto! 🔓</p>}
    </div>
  );
}
