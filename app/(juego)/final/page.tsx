"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJuego } from "@/lib/juego/store";
import { HUD } from "@/components/juego/HUD";
import { MisionFinal } from "@/components/misiones/MisionFinal";

export default function FinalPage() {
  const router = useRouter();
  const estado = useJuego();

  useEffect(() => {
    if (!estado.nombreEquipo) router.replace("/lobby");
  }, [estado.nombreEquipo, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-senal-crt to-background">
      <HUD />
      <MisionFinal />
    </div>
  );
}
