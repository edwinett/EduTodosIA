import type { InsigniaDef } from "@/lib/juego/tipos";

// 12 insignias con criterios verificables (ver lib/juego/insignias.ts).
export const INSIGNIAS: InsigniaDef[] = [
  {
    codigo: "primer-contacto",
    nombre: "Primer Contacto",
    descripcion: "Resolviste tu primer reto. La señal vuelve poco a poco.",
    icono: "radio",
    criterio: "Completar el primer reto de cualquier nodo.",
  },
  {
    codigo: "sintonizador",
    nombre: "Sintonizador",
    descripcion: "Completaste el nodo Radio sin usar pistas.",
    icono: "antena",
    criterio: "Terminar el nodo Radio con 0 pistas usadas.",
  },
  {
    codigo: "operador-central",
    nombre: "Operador de Central",
    descripcion: "Dominaste el conmutador y la marcación por pulsos.",
    icono: "telefono",
    criterio: "Completar el nodo Telefonía.",
  },
  {
    codigo: "ingeniero-red",
    nombre: "Ingeniero de Red",
    descripcion: "Reconectaste los protocolos de Internet.",
    icono: "red",
    criterio: "Completar el nodo Internet.",
  },
  {
    codigo: "cronista",
    nombre: "Cronista",
    descripcion: "Ordenaste la historia de la TV sin un solo error.",
    icono: "tv",
    criterio: "Completar el nodo TV con la cronología correcta al primer intento.",
  },
  {
    codigo: "velocista",
    nombre: "Velocista",
    descripcion: "Terminaste los 4 nodos en menos de 30 minutos.",
    icono: "rayo",
    criterio: "Completar los 4 nodos en < 30 min.",
  },
  {
    codigo: "detective-analogico",
    nombre: "Detective Analógico",
    descripcion: "Usaste las 3 pistas de un reto y aun así lo resolviste.",
    icono: "lupa",
    criterio: "Resolver un reto habiendo revelado sus 3 pistas.",
  },
  {
    codigo: "guardian-memoria",
    nombre: "Guardián de la Memoria",
    descripcion: "Abriste todos los candados sin un solo error.",
    icono: "candado",
    criterio: "Completar el juego sin errores en candados.",
  },
  {
    codigo: "eco-logico",
    nombre: "Eco-Lógico",
    descripcion: "Respondiste bien todas las conexiones ambientales del Tolima.",
    icono: "hoja",
    criterio: "Acertar todas las preguntas de conexión ambiental.",
  },
  {
    codigo: "trabajo-equipo",
    nombre: "Trabajo en Equipo",
    descripcion: "Un equipo de 4 integrantes activos durante al menos 15 minutos.",
    icono: "equipo",
    criterio: "4 integrantes activos >= 15 min.",
  },
  {
    codigo: "maestro-codigo",
    nombre: "Maestro del Código",
    descripcion: "Abriste la caja fuerte final al primer intento.",
    icono: "llave",
    criterio: "Abrir la caja fuerte final sin errores.",
  },
  {
    codigo: "tolimense-ilustre",
    nombre: "Tolimense Ilustre",
    descripcion: "Precisión global del 100%. ¡Honor al Tolima!",
    icono: "estrella",
    criterio: "Precisión global = 100%.",
  },
];

export const CODIGOS_INSIGNIA = INSIGNIAS.map((i) => i.codigo);
