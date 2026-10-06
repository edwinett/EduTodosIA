"use client";

// Gestor de audio del juego.
// Los efectos (Morse, tono telefónico, ruido VHS, módem) se sintetizan con la
// Web Audio API para que el juego funcione sin archivos binarios y con baja
// conectividad. Howler.js está incluido en el proyecto para reproducir muestras
// de audio reales (voces, música) cuando se agreguen a /public/audio.

let contexto: AudioContext | null = null;
let silenciado = false;

export function silenciar(valor: boolean) {
  silenciado = valor;
}
export function estaSilenciado() {
  return silenciado;
}

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    contexto = new AC();
  }
  return contexto;
}

function tono(frecuencia: number, duracionMs: number, inicioOffset = 0, tipo: OscillatorType = "sine", volumen = 0.15) {
  if (silenciado) return;
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = tipo;
  osc.frequency.value = frecuencia;
  gain.gain.value = volumen;
  osc.connect(gain);
  gain.connect(c.destination);
  const t0 = c.currentTime + inicioOffset / 1000;
  osc.start(t0);
  osc.stop(t0 + duracionMs / 1000);
}

// Reproduce una cadena Morse ("- --- .-.." etc.). Devuelve la duración total (ms).
export function reproducirMorse(morse: string, unidadMs = 120): number {
  let offset = 0;
  for (const simbolo of morse) {
    if (simbolo === ".") {
      tono(600, unidadMs, offset, "sine");
      offset += unidadMs + unidadMs; // símbolo + espacio intra-letra
    } else if (simbolo === "-") {
      tono(600, unidadMs * 3, offset, "sine");
      offset += unidadMs * 3 + unidadMs;
    } else if (simbolo === " ") {
      offset += unidadMs * 3; // espacio entre letras
    }
  }
  return offset;
}

export function tonoTelefonico() {
  tono(425, 400, 0, "sine", 0.12);
}

export function tonoModem() {
  // Pequeña secuencia que evoca el "handshake" del módem.
  tono(1200, 150, 0, "square", 0.08);
  tono(2400, 150, 160, "square", 0.08);
  tono(1800, 250, 320, "sawtooth", 0.08);
}

export function ruidoVHS(duracionMs = 600) {
  if (silenciado) return;
  const c = ctx();
  if (!c) return;
  const bufferSize = Math.floor((c.sampleRate * duracionMs) / 1000);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
  const fuente = c.createBufferSource();
  fuente.buffer = buffer;
  fuente.connect(c.destination);
  fuente.start();
}

export function sonidoExito() {
  tono(660, 120, 0, "triangle", 0.15);
  tono(880, 180, 130, "triangle", 0.15);
}

export function sonidoError() {
  tono(220, 250, 0, "sawtooth", 0.15);
}
