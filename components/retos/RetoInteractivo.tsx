"use client";

import { useMemo, useRef, useState } from "react";
import type { RetoPublico } from "@/lib/juego/tipos";
import { useJuego } from "@/lib/juego/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PanelPistas } from "@/components/juego/PanelPistas";
import { DialSintonia } from "@/components/retos/DialSintonia";
import { Morse } from "@/components/retos/Morse";
import { Multimedia } from "@/components/retos/Multimedia";
import { Ahorcado } from "@/components/retos/Ahorcado";
import { Rompecabezas } from "@/components/retos/Rompecabezas";
import { Crucigrama, type EntradaCrucigrama } from "@/components/retos/Crucigrama";
import { SopaDeLetras } from "@/components/retos/SopaDeLetras";
import { CandadoCronologico } from "@/components/juego/CandadoCronologico";
import type { ItemOrdenable } from "@/components/juego/ListaOrdenable";
import { sonidoExito, sonidoError } from "@/lib/audio/sonidos";
import { cn } from "@/lib/utils";

interface Props {
  reto: RetoPublico;
  onResuelto: (info: { puntos: number; primerIntento: boolean }) => void;
}

type Respuesta = string | number | string[] | Record<string, string>;

// Tipos cuyo widget se autoenvía (no muestran el botón genérico "Comprobar respuesta").
const TIPOS_AUTOENVIO = new Set([
  "cronologico",
  "ahorcado",
  "rompecabezas",
  "crucigrama",
  "sopa-de-letras",
]);
const TIPOS_TEXTO = new Set(["t9", "pixelado", "adivinanza"]);

export function RetoInteractivo({ reto, onResuelto }: Props) {
  const estado = useJuego();
  const prog = estado.nodos[reto.nodo]?.retos[reto.id];
  const pistasUsadas = prog?.pistasUsadas ?? 0;
  const yaResuelto = prog?.resuelto ?? false;

  const inicioRef = useRef<number>(Date.now());
  const [respuesta, setRespuesta] = useState<Respuesta>(valorInicial(reto));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const opciones = useMemo(() => {
    const op = reto.datos?.["opciones"];
    return Array.isArray(op) ? (op as string[]) : null;
  }, [reto.datos]);

  async function enviar(valor: Respuesta) {
    if (enviando || yaResuelto) return;
    setEnviando(true);
    setError(false);
    const tiempoMs = Date.now() - inicioRef.current;
    const primerIntento = (prog?.intentos ?? 0) === 0;
    try {
      const res = await fetch("/api/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partidaId: estado.partidaId ?? undefined,
          retoId: reto.id,
          nodo: reto.nodo,
          respuesta: valor,
          tiempoMs,
          pistasUsadas,
        }),
      });
      const data = (await res.json()) as {
        correcto: boolean;
        puntos: number;
        feedbackEducativo: string | null;
      };
      estado.registrarIntento(reto.nodo, reto.id, data.correcto, tiempoMs);
      if (data.correcto) {
        estado.setPuntaje(estado.puntaje + data.puntos);
        setFeedback(data.feedbackEducativo);
        sonidoExito();
        onResuelto({ puntos: data.puntos, primerIntento });
      } else {
        setError(true);
        sonidoError();
      }
    } catch {
      setError(true);
    } finally {
      setEnviando(false);
    }
  }

  function revelarPista() {
    estado.usarPista(reto.nodo, reto.id);
  }

  return (
    <Card className={cn(yaResuelto && "border-primary")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{reto.titulo}</CardTitle>
          <Badge variant={yaResuelto ? "default" : "secondary"}>
            {yaResuelto ? "Resuelto ✓" : `${reto.puntos} pts`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{reto.enunciado}</p>

        <Multimedia imagenUrl={reto.imagenUrl} videoUrl={reto.videoUrl} titulo={reto.titulo} />

        {/* Entrada específica por tipo de reto */}
        {!yaResuelto && (
          <div className="space-y-3">
            {reto.tipo === "dial" && (
              <DialSintonia
                min={Number(reto.datos?.["min"] ?? 88)}
                max={Number(reto.datos?.["max"] ?? 108)}
                paso={Number(reto.datos?.["paso"] ?? 0.1)}
                unidad={String(reto.datos?.["unidad"] ?? "MHz")}
                objetivo={100.7}
                tolerancia={Number(reto.datos?.["tolerancia"] ?? 0.2)}
                onCambio={(v) => setRespuesta(v)}
              />
            )}

            {reto.tipo === "morse" && (
              <>
                <Morse morse={String(reto.datos?.["morse"] ?? "")} />
                <EntradaTexto
                  valor={String(respuesta)}
                  onChange={(v) => setRespuesta(v.toUpperCase())}
                  placeholder="PALABRA"
                />
              </>
            )}

            {reto.tipo === "binario-ascii" && (
              <>
                <code className="block rounded bg-background px-3 py-2 font-mono text-sm">
                  {String(reto.datos?.["binario"] ?? "")}
                </code>
                <EntradaTexto
                  valor={String(respuesta)}
                  onChange={(v) => setRespuesta(v.toUpperCase())}
                  placeholder="TEXTO"
                />
              </>
            )}

            {reto.tipo === "cronologico" && (
              <CandadoCronologico
                itemsIniciales={desordenar(
                  ((reto.datos?.["items"] as { id: string; texto: string }[]) ?? []).map(
                    (i) => ({ id: i.id, texto: i.texto }) as ItemOrdenable,
                  ),
                )}
                cargando={enviando}
                onConfirmar={(ids) => enviar(ids)}
              />
            )}

            {opciones && reto.tipo !== "cronologico" && (
              <Opciones
                opciones={opciones}
                onSeleccionar={(op) => {
                  setRespuesta(op);
                  enviar(op);
                }}
              />
            )}

            {/* Entrada numérica/texto genérica para los tipos restantes */}
            {["longitud-onda", "pulsos", "conmutador"].includes(reto.tipo) && (
              <EntradaNumerica
                valor={respuesta}
                onChange={(v) => setRespuesta(v)}
                onEnviar={() => enviar(respuesta)}
              />
            )}
            {TIPOS_TEXTO.has(reto.tipo) && (
              <EntradaTexto
                valor={String(respuesta)}
                onChange={(v) => setRespuesta(v.toUpperCase())}
                placeholder="RESPUESTA"
              />
            )}

            {reto.tipo === "ahorcado" && (
              <Ahorcado
                retoId={reto.id}
                longitud={Number(reto.datos?.["longitud"] ?? 8)}
                intentosMax={Number(reto.datos?.["intentosMax"] ?? 6)}
                onEnviar={(palabra) => enviar(palabra)}
              />
            )}

            {reto.tipo === "rompecabezas" && (
              <Rompecabezas
                filas={Number(reto.datos?.["filas"] ?? 3)}
                columnas={Number(reto.datos?.["columnas"] ?? 3)}
                imagen={reto.imagenUrl ?? (reto.datos?.["imagen"] as string | undefined)}
                cargando={enviando}
                onEnviar={(orden) => enviar(orden)}
              />
            )}

            {reto.tipo === "crucigrama" && (
              <Crucigrama
                filas={Number(reto.datos?.["filas"] ?? 5)}
                columnas={Number(reto.datos?.["columnas"] ?? 5)}
                entradas={(reto.datos?.["entradas"] as EntradaCrucigrama[]) ?? []}
                cargando={enviando}
                onEnviar={(resp) => enviar(resp)}
              />
            )}

            {reto.tipo === "sopa-de-letras" && (
              <SopaDeLetras
                grid={(reto.datos?.["grid"] as string[][]) ?? []}
                palabras={(reto.datos?.["palabras"] as string[]) ?? []}
                onEnviar={(encontradas) => enviar(encontradas)}
              />
            )}

            {/* Botón enviar para los tipos que no se autoenvían */}
            {!opciones && !TIPOS_AUTOENVIO.has(reto.tipo) && (
              <Button onClick={() => enviar(respuesta)} disabled={enviando}>
                Comprobar respuesta
              </Button>
            )}
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            Respuesta incorrecta. Intenta de nuevo o usa una pista.
          </p>
        )}

        {yaResuelto && feedback && (
          <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
            <strong>💡 ¿Sabías qué?</strong> {feedback}
          </div>
        )}
        {yaResuelto && !feedback && (
          <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
            <strong>💡 ¿Sabías qué?</strong> {reto.feedbackEducativo}
          </div>
        )}

        {!yaResuelto && (
          <PanelPistas pistas={reto.pistas} pistasUsadas={pistasUsadas} onRevelar={revelarPista} />
        )}
      </CardContent>
    </Card>
  );
}

// -------- subcomponentes de entrada --------

function EntradaTexto({
  valor,
  onChange,
  placeholder,
}: {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="font-mono uppercase tracking-wide"
      aria-label="Respuesta"
    />
  );
}

function EntradaNumerica({
  valor,
  onChange,
  onEnviar,
}: {
  valor: Respuesta;
  onChange: (v: number) => void;
  onEnviar: () => void;
}) {
  return (
    <Input
      inputMode="numeric"
      value={typeof valor === "number" ? valor : ""}
      onChange={(e) => onChange(Number(e.target.value.replace(/[^\d.]/g, "")))}
      onKeyDown={(e) => e.key === "Enter" && onEnviar()}
      placeholder="0"
      className="font-mono text-lg"
      aria-label="Respuesta numérica"
    />
  );
}

function Opciones({
  opciones,
  onSeleccionar,
}: {
  opciones: string[];
  onSeleccionar: (op: string) => void;
}) {
  return (
    <div className="grid gap-2" role="group" aria-label="Opciones de respuesta">
      {opciones.map((op) => (
        <Button
          key={op}
          variant="outline"
          className="h-auto justify-start whitespace-normal py-3 text-left"
          onClick={() => onSeleccionar(op)}
        >
          {op}
        </Button>
      ))}
    </div>
  );
}

// -------- utilidades --------

function valorInicial(reto: RetoPublico): Respuesta {
  if (reto.tipo === "dial") return 98;
  if (["longitud-onda", "pulsos", "conmutador"].includes(reto.tipo)) return 0;
  return "";
}

// Baraja determinista-ligera para no mostrar los hitos ya ordenados.
function desordenar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  // Garantiza que no quede exactamente igual al original si hay >1 elemento.
  if (copia.length > 1 && copia.every((v, i) => v === arr[i])) {
    [copia[0], copia[1]] = [copia[1]!, copia[0]!];
  }
  return copia;
}
