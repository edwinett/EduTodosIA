import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { INSIGNIAS } from "../data/insignias";
import { NODOS } from "../data/misiones";
import { CLAVES_NODO } from "../lib/juego/soluciones.server";

const prisma = new PrismaClient();

// Representación de solución para el catálogo de autoría (no impulsa la validación,
// que sigue en lib/juego/soluciones.server.ts). Solo para que el docente vea/edite.
const SOLUCION_AUTORIA: Record<string, unknown> = {
  "radio-dial": 100.7,
  "radio-onda": 500,
  "radio-morse": "TOLIMA",
  "radio-quiz": "Alfabetizar y educar a la población campesina rural",
  "tv-pixelado": ["RTC", "RTVC"],
  "tv-estandar": "NTSC",
  "tv-cronologia": ["h1954", "h1979", "h1998"],
  "tel-conmutador": 8,
  "tel-pulsos": 15,
  "tel-t9": "TDJDPA",
  "tel-indicativos": "608 (Ibagué/Tolima)",
  "net-binario": "RED",
  "net-ip": "8.8.8.8",
  "net-dns": ".co",
  "net-http": "404 (No encontrado)",
  "final-reflexion":
    "Conectar el territorio permite monitorear, divulgar y proteger el ambiente, y cerrar la brecha digital rural.",
  // --- Mecánicas nuevas ---
  "radio-adivinanza": ["radio", "la radio"],
  "radio-ahorcado": "SUTATENZA",
  "tv-rompecabezas": ["p0", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
  "tv-sopa": ["TELEVISION", "COLOR", "SEÑAL", "ANTENA", "CANAL"],
  "tel-crucigrama": { h1: "PULSOS", v1: "DISCO" },
  "tel-ahorcado": "CONMUTADOR",
  "net-adivinanza": ["internet", "la red", "red"],
  "net-sopa": ["RED", "DOMINIO", "SERVIDOR", "ENLACE", "DATOS"],
};

async function main() {
  console.log("🌱 Sembrando insignias...");
  for (const i of INSIGNIAS) {
    await prisma.insignia.upsert({
      where: { codigo: i.codigo },
      update: { nombre: i.nombre, descripcion: i.descripcion, icono: i.icono, criterio: i.criterio },
      create: { ...i },
    });
  }
  console.log(`   ${INSIGNIAS.length} insignias listas.`);

  console.log("🌱 Sembrando contenido (nodos, retos, pistas)...");
  for (let idx = 0; idx < NODOS.length; idx++) {
    const n = NODOS[idx]!;
    const clave = (CLAVES_NODO as Record<string, string>)[n.id] ?? "";
    const nodo = await prisma.nodo.upsert({
      where: { slug: n.id },
      update: {
        nombre: n.nombre,
        descripcion: n.descripcion,
        narrativa: n.narrativa,
        hitoHistorico: n.hitoHistorico,
        datoAmbiental: n.datoAmbiental,
        dificultad: n.dificultad,
        tiempoSugeridoMin: n.tiempoSugeridoMin,
        tipoCandado: n.tipoCandado,
        pistaCandado: n.pistaCandado,
        claveParcial: clave,
        orden: idx,
      },
      create: {
        slug: n.id,
        nombre: n.nombre,
        descripcion: n.descripcion,
        narrativa: n.narrativa,
        hitoHistorico: n.hitoHistorico,
        datoAmbiental: n.datoAmbiental,
        dificultad: n.dificultad,
        tiempoSugeridoMin: n.tiempoSugeridoMin,
        tipoCandado: n.tipoCandado,
        pistaCandado: n.pistaCandado,
        claveParcial: clave,
        orden: idx,
      },
    });

    for (let r = 0; r < n.retos.length; r++) {
      const reto = n.retos[r]!;
      const retoDb = await prisma.reto.upsert({
        where: { slug: reto.id },
        update: {
          nodoId: nodo.id,
          tipo: reto.tipo,
          titulo: reto.titulo,
          enunciado: reto.enunciado,
          dificultad: reto.dificultad,
          puntos: reto.puntos,
          datosJson: JSON.stringify(reto.datos ?? {}),
          solucionJson: JSON.stringify(SOLUCION_AUTORIA[reto.id] ?? null),
          feedbackEducativo: reto.feedbackEducativo,
          imagenUrl: reto.imagenUrl ?? null,
          videoUrl: reto.videoUrl ?? null,
          orden: r,
        },
        create: {
          nodoId: nodo.id,
          slug: reto.id,
          tipo: reto.tipo,
          titulo: reto.titulo,
          enunciado: reto.enunciado,
          dificultad: reto.dificultad,
          puntos: reto.puntos,
          datosJson: JSON.stringify(reto.datos ?? {}),
          solucionJson: JSON.stringify(SOLUCION_AUTORIA[reto.id] ?? null),
          feedbackEducativo: reto.feedbackEducativo,
          imagenUrl: reto.imagenUrl ?? null,
          videoUrl: reto.videoUrl ?? null,
          orden: r,
        },
      });

      for (const pista of reto.pistas) {
        await prisma.pista.upsert({
          where: { retoId_nivel: { retoId: retoDb.id, nivel: pista.nivel } },
          update: { texto: pista.texto, costoPuntos: pista.costoPuntos },
          create: {
            retoId: retoDb.id,
            nivel: pista.nivel,
            texto: pista.texto,
            costoPuntos: pista.costoPuntos,
          },
        });
      }
    }
  }
  console.log("   Contenido listo.");

  console.log("🌱 Sembrando cuentas de prueba...");
  const docentePass = await bcrypt.hash("docente123", 10);
  const estudiantePass = await bcrypt.hash("estudiante123", 10);
  await prisma.user.upsert({
    where: { email: "docente@ut.edu.co" },
    update: { passwordHash: docentePass, rol: "DOCENTE" },
    create: {
      name: "Docente Demo",
      email: "docente@ut.edu.co",
      passwordHash: docentePass,
      rol: "DOCENTE",
      universidad: "Universidad del Tolima",
    },
  });
  await prisma.user.upsert({
    where: { email: "estudiante@ut.edu.co" },
    update: { passwordHash: estudiantePass, rol: "ESTUDIANTE" },
    create: {
      name: "Estudiante Demo",
      email: "estudiante@ut.edu.co",
      passwordHash: estudiantePass,
      rol: "ESTUDIANTE",
      universidad: "Universidad del Tolima",
      programa: "Ciencias Naturales y Educación Ambiental",
      semestre: 3,
    },
  });
  console.log("   docente@ut.edu.co / docente123   ·   estudiante@ut.edu.co / estudiante123");

  console.log("🌱 Equipo de demostración...");
  const demo = await prisma.equipo.upsert({
    where: { codigo: "DEMO24" },
    update: {},
    create: {
      nombre: "Los Reconectores",
      codigo: "DEMO24",
      avatar: "satelite",
      programa: "Ciencias Naturales y Educación Ambiental",
      semestre: 3,
      puntajeTotal: 1850,
      tiempoTotal: 26 * 60 * 1000,
    },
  });
  const partidaDemo = await prisma.partida.findFirst({ where: { equipoId: demo.id } });
  if (!partidaDemo) {
    await prisma.partida.create({
      data: {
        equipoId: demo.id,
        estado: "GANADA",
        fin: new Date(),
        puntaje: 1850,
        precision: 92,
        clavesObtenidas: JSON.stringify(["1929", "79", "608", "RED"]),
      },
    });
  }

  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
