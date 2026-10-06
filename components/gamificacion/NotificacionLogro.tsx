"use client";

import { AnimatePresence, motion } from "framer-motion";
import { INSIGNIAS } from "@/data/insignias";

// Notificación emergente al desbloquear una insignia.
export function NotificacionLogro({
  codigo,
  onCerrar,
}: {
  codigo: string | null;
  onCerrar: () => void;
}) {
  const insignia = INSIGNIAS.find((i) => i.codigo === codigo);

  return (
    <AnimatePresence>
      {insignia && (
        <motion.div
          role="status"
          aria-live="assertive"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
          onClick={onCerrar}
        >
          <div className="flex items-center gap-3 rounded-xl border border-accent bg-card px-5 py-3 shadow-lg">
            <span className="text-3xl" aria-hidden>
              🏅
            </span>
            <div>
              <p className="text-xs uppercase text-accent">¡Insignia desbloqueada!</p>
              <p className="font-semibold">{insignia.nombre}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
