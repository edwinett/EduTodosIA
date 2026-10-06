import { PrismaClient } from "@prisma/client";
import { INSIGNIAS } from "../data/insignias";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando insignias...");
  for (const i of INSIGNIAS) {
    await prisma.insignia.upsert({
      where: { codigo: i.codigo },
      update: {
        nombre: i.nombre,
        descripcion: i.descripcion,
        icono: i.icono,
        criterio: i.criterio,
      },
      create: {
        codigo: i.codigo,
        nombre: i.nombre,
        descripcion: i.descripcion,
        icono: i.icono,
        criterio: i.criterio,
      },
    });
  }
  console.log(`   ${INSIGNIAS.length} insignias listas.`);

  // Equipo de demostración para el ranking.
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
