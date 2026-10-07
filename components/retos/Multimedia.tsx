"use client";

import { youtubeEmbed } from "@/lib/utils";

// Muestra imagen y/o video (YouTube) del reto, si están definidos en el catálogo.
export function Multimedia({
  imagenUrl,
  videoUrl,
  titulo,
}: {
  imagenUrl?: string | null;
  videoUrl?: string | null;
  titulo: string;
}) {
  const embed = youtubeEmbed(videoUrl);
  if (!imagenUrl && !embed) return null;

  return (
    <div className="space-y-3">
      {imagenUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagenUrl}
          alt={`Imagen ilustrativa del reto: ${titulo}`}
          className="max-h-64 w-full rounded-md border border-border object-contain"
          loading="lazy"
        />
      )}
      {embed && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
          <iframe
            src={embed}
            title={`Video: ${titulo}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
    </div>
  );
}
