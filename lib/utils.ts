import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearTiempo(ms: number): string {
  const totalSeg = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

// Convierte una URL de YouTube (watch, youtu.be, shorts o embed) a URL de incrustación.
// Devuelve null si no reconoce un ID de 11 caracteres.
export function youtubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  const patrones = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patrones) {
    const m = url.match(p);
    if (m && m[1]) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  }
  return null;
}
