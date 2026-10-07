import type { RetoPublico } from "@/lib/juego/tipos";

// Retos EXTRA (mecánicas nuevas) que se añaden a cada nodo para dar más interactividad
// y extender la partida. Contenido PÚBLICO (sin soluciones; esas viven en el seed).

// --- Generador de sopa de letras (garantiza una cuadrícula válida que contiene las palabras) ---
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function normPalabra(s: string): string {
  return s
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z]/g, "");
}

export function generarSopa(
  palabras: string[],
  size = 10,
): { grid: string[][]; palabras: string[] } {
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
  ];
  const grid: string[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));

  for (const original of palabras) {
    const w = normPalabra(original);
    if (w.length === 0 || w.length > size) continue;
    let colocada = false;
    for (let intento = 0; intento < 400 && !colocada; intento++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)]!;
      const [dr, dc] = dir;
      const maxR = dr ? size - w.length : size - 1;
      const maxC = dc ? size - w.length : size - 1;
      if (maxR < 0 || maxC < 0) continue;
      const r0 = Math.floor(Math.random() * (maxR + 1));
      const c0 = Math.floor(Math.random() * (maxC + 1));
      let cabe = true;
      for (let i = 0; i < w.length; i++) {
        const fila = grid[r0 + dr * i]!;
        const actual = fila[c0 + dc * i]!;
        if (actual !== "" && actual !== w[i]) {
          cabe = false;
          break;
        }
      }
      if (!cabe) continue;
      for (let i = 0; i < w.length; i++) {
        grid[r0 + dr * i]![c0 + dc * i] = w[i]!;
      }
      colocada = true;
    }
  }

  const final = grid.map((row) =>
    row.map((ch) => (ch === "" ? ABC[Math.floor(Math.random() * ABC.length)]! : ch)),
  );
  return { grid: final, palabras };
}

export const RETOS_EXTRA: Record<string, RetoPublico[]> = {
  radio: [
    {
      id: "radio-adivinanza",
      nodo: "radio",
      tipo: "adivinanza",
      titulo: "Adivinanza sonora",
      enunciado:
        "Sin alas vuelo por el aire, sin boca te hablo y canto; llevo noticias y música a quien sabe sintonizarme. ¿Qué soy? (una palabra)",
      dificultad: "facil",
      puntos: 100,
      datos: {},
      feedbackEducativo:
        "La radio fue el primer medio masivo inalámbrico: informó, educó y acompañó a la Colombia del siglo XX.",
      pistas: [
        { nivel: 1, texto: "Es el medio protagonista de este nodo.", costoPuntos: 50 },
        { nivel: 2, texto: "Viaja por ondas y la ajustas girando un dial.", costoPuntos: 100 },
        { nivel: 3, texto: "Piensa en el aparato que 'sintonizas' para oír música y noticias.", costoPuntos: 200 },
      ],
    },
    {
      id: "radio-ahorcado",
      nodo: "radio",
      tipo: "ahorcado",
      titulo: "Ahorcado: educación por ondas",
      enunciado:
        "Adivina la emisora que alfabetizó al campo colombiano desde 1947. Pista: lleva el nombre de un municipio de Boyacá.",
      dificultad: "media",
      puntos: 150,
      datos: { longitud: 9, intentosMax: 6 },
      feedbackEducativo:
        "Radio Sutatenza (ACPO) fue pionera mundial de la educación a distancia por radio.",
      pistas: [
        { nivel: 1, texto: "Comienza con la sílaba 'SU'.", costoPuntos: 50 },
        { nivel: 2, texto: "Es un municipio de Boyacá famoso por su radio educativa.", costoPuntos: 100 },
        { nivel: 3, texto: "Rima con 'potencia' y tiene 9 letras.", costoPuntos: 200 },
      ],
    },
  ],

  tv: [
    {
      id: "tv-rompecabezas",
      nodo: "tv",
      tipo: "rompecabezas",
      titulo: "Arma la carta de ajuste",
      enunciado:
        "Reconstruye la imagen arrastrando las piezas a su lugar correcto (ordena la cuadrícula de 1 a 9).",
      dificultad: "media",
      puntos: 150,
      datos: { filas: 3, columnas: 3 },
      feedbackEducativo:
        "La carta de ajuste permitía calibrar brillo, contraste y color antes de la programación.",
      pistas: [
        { nivel: 1, texto: "Las piezas van en orden de lectura: izquierda a derecha, arriba a abajo.", costoPuntos: 50 },
        { nivel: 2, texto: "La ficha '1' va en la esquina superior izquierda.", costoPuntos: 100 },
        { nivel: 3, texto: "Ordénalas como se numeran: 1-2-3 arriba, 4-5-6 en medio, 7-8-9 abajo.", costoPuntos: 200 },
      ],
    },
    {
      id: "tv-sopa",
      nodo: "tv",
      tipo: "sopa-de-letras",
      titulo: "Sopa de letras: la pantalla chica",
      enunciado: "Encuentra las palabras clave de la televisión colombiana.",
      dificultad: "media",
      puntos: 150,
      datos: generarSopa(["TELEVISION", "COLOR", "SEÑAL", "ANTENA", "CANAL"], 11),
      feedbackEducativo:
        "De la señal en blanco y negro al color (1979) y a los canales privados (1998), la TV marcó la cultura del país.",
      pistas: [
        { nivel: 1, texto: "Las palabras pueden ir en horizontal, vertical o diagonal.", costoPuntos: 50 },
        { nivel: 2, texto: "Haz clic en la primera y la última letra de cada palabra.", costoPuntos: 100 },
        { nivel: 3, texto: "Busca primero la más larga: tiene 10 letras y es el nombre del medio.", costoPuntos: 200 },
      ],
    },
  ],

  telefono: [
    {
      id: "tel-crucigrama",
      nodo: "telefono",
      tipo: "crucigrama",
      titulo: "Crucigrama telefónico",
      enunciado: "Completa el crucigrama con términos de la telefonía clásica.",
      dificultad: "dificil",
      puntos: 200,
      datos: {
        filas: 5,
        columnas: 6,
        entradas: [
          {
            id: "h1",
            num: 1,
            dir: "H",
            fila: 2,
            col: 0,
            longitud: 6,
            pista: "Señales de apertura/cierre del circuito al marcar en disco (plural)",
          },
          {
            id: "v1",
            num: 2,
            dir: "V",
            fila: 0,
            col: 3,
            longitud: 5,
            pista: "Rueda giratoria para marcar números en el teléfono antiguo",
          },
        ],
      },
      feedbackEducativo:
        "La marcación por pulsos (decádica) y el disco fueron el estándar antes del tono (DTMF).",
      pistas: [
        { nivel: 1, texto: "La horizontal (1) la viste en el reto de marcación.", costoPuntos: 50 },
        { nivel: 2, texto: "La vertical (2) gira y tiene agujeros numerados del 0 al 9.", costoPuntos: 100 },
        { nivel: 3, texto: "Ambas palabras se cruzan en la letra 'S'.", costoPuntos: 200 },
      ],
    },
    {
      id: "tel-ahorcado",
      nodo: "telefono",
      tipo: "ahorcado",
      titulo: "Ahorcado: la central",
      enunciado:
        "Adivina el equipo donde la operadora conectaba las llamadas con clavijas y cables.",
      dificultad: "media",
      puntos: 150,
      datos: { longitud: 10, intentosMax: 6 },
      feedbackEducativo:
        "El conmutador manual conectaba físicamente a los abonados antes de la automatización.",
      pistas: [
        { nivel: 1, texto: "Empieza por 'CON'.", costoPuntos: 50 },
        { nivel: 2, texto: "Lo operaba una telefonista con clavijas.", costoPuntos: 100 },
        { nivel: 3, texto: "Deriva del verbo 'conmutar'; tiene 10 letras.", costoPuntos: 200 },
      ],
    },
  ],

  internet: [
    {
      id: "net-adivinanza",
      nodo: "internet",
      tipo: "adivinanza",
      titulo: "Adivinanza digital",
      enunciado:
        "Soy una red que a otras redes une, sin fronteras ni distancia; por mí viajan tus mensajes con enorme vigilancia de datos. ¿Qué soy? (una palabra)",
      dificultad: "media",
      puntos: 150,
      datos: {},
      feedbackEducativo:
        "Internet es una 'red de redes' basada en protocolos abiertos (TCP/IP) que interconecta el mundo.",
      pistas: [
        { nivel: 1, texto: "Es el tema central de este nodo.", costoPuntos: 50 },
        { nivel: 2, texto: "Su nombre significa literalmente 'entre redes'.", costoPuntos: 100 },
        { nivel: 3, texto: "La usas ahora mismo para jugar esto.", costoPuntos: 200 },
      ],
    },
    {
      id: "net-sopa",
      nodo: "internet",
      tipo: "sopa-de-letras",
      titulo: "Sopa de letras: la red",
      enunciado: "Encuentra los términos de Internet escondidos en la cuadrícula.",
      dificultad: "media",
      puntos: 150,
      datos: generarSopa(["RED", "DOMINIO", "SERVIDOR", "ENLACE", "DATOS"], 11),
      feedbackEducativo:
        "Dominios, servidores y enlaces son las piezas que hacen navegable la información en la red.",
      pistas: [
        { nivel: 1, texto: "Pueden ir en horizontal, vertical o diagonal.", costoPuntos: 50 },
        { nivel: 2, texto: "La más corta tiene 3 letras y es sinónimo de 'red'.", costoPuntos: 100 },
        { nivel: 3, texto: "'SERVIDOR' es la más larga: búscala primero.", costoPuntos: 200 },
      ],
    },
  ],
};
