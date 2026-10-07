import type { NodoPublico } from "@/lib/juego/tipos";
import { RETOS_EXTRA } from "@/data/extras";

// Contenido público de los nodos (SIN soluciones). Fuentes históricas en el README:
// RTVC/Señal Memoria, MinTIC, CRC, Banco de la República.

export const NODOS: NodoPublico[] = [
  // ------------------------------------------------------------------ RADIO
  {
    id: "radio",
    nombre: "Radio",
    descripcion: "Las primeras ondas (décadas de 1920-1940).",
    narrativa:
      "En 1929 Colombia enciende su primera emisora oficial, la HJN. La radio se vuelve escuela, plaza pública y memoria sonora. RUPTURA ha silenciado el dial: sintoniza de nuevo la frecuencia correcta y recupera la clave.",
    hitoHistorico:
      "1929: primera emisora oficial colombiana (HJN). 1947: Radio Sutatenza inicia la radio educativa rural con Acción Cultural Popular.",
    datoAmbiental:
      "La radio comunitaria sigue siendo clave en la educación ambiental rural del Tolima: emisoras locales difunden alertas de clima, cuidado del agua y prácticas agrícolas sostenibles donde internet no llega.",
    dificultad: "facil",
    tiempoSugeridoMin: 10,
    tipoCandado: "numerico",
    pistaCandado: "Cuatro dígitos: el año en que nació la primera emisora oficial.",
    retos: [
      {
        id: "radio-dial",
        nodo: "radio",
        tipo: "dial",
        titulo: "Sintoniza el dial",
        enunciado:
          "Gira el dial hasta la frecuencia donde la señal se escucha nítida (sin ruido). El objetivo está en la banda FM.",
        dificultad: "facil",
        puntos: 100,
        datos: { min: 88.0, max: 108.0, paso: 0.1, unidad: "MHz", tolerancia: 0.2 },
        feedbackEducativo:
          "La FM (frecuencia modulada) ofrece mejor calidad de audio y menos ruido que la AM, por eso domina la radio musical.",
        pistas: [
          { nivel: 1, texto: "La señal objetivo está en la parte alta del dial.", costoPuntos: 50 },
          { nivel: 2, texto: "Entre 98 y 102 MHz el ruido baja mucho.", costoPuntos: 100 },
          { nivel: 3, texto: "Búscala donde las barras de señal se llenan al máximo, en la parte alta del dial.", costoPuntos: 200 },
        ],
      },
      {
        id: "radio-onda",
        nodo: "radio",
        tipo: "longitud-onda",
        titulo: "Longitud de onda",
        enunciado:
          "Una emisora transmite en 600 kHz (AM). Calcula la longitud de onda λ en metros usando λ = c / f, con c = 3×10⁸ m/s. Responde el número entero de metros.",
        dificultad: "media",
        puntos: 150,
        datos: { frecuenciaHz: 600000, c: 300000000 },
        feedbackEducativo:
          "λ = c/f = 3×10⁸ / 6×10⁵ = 500 m. Las ondas AM son largas y rebotan en la ionosfera, por eso llegan lejos de noche.",
        pistas: [
          { nivel: 1, texto: "Convierte 600 kHz a Hz: 600000.", costoPuntos: 50 },
          { nivel: 2, texto: "Divide 300000000 entre 600000.", costoPuntos: 100 },
          { nivel: 3, texto: "Es 3×10⁸ dividido entre 6×10⁵: un número redondo de cientos de metros.", costoPuntos: 200 },
        ],
      },
      {
        id: "radio-morse",
        nodo: "radio",
        tipo: "morse",
        titulo: "Mensaje en código Morse",
        enunciado:
          "Decodifica la palabra transmitida en Morse (tienes la tabla y una alternativa visual con tiempos). Escríbela en mayúsculas.",
        dificultad: "media",
        puntos: 150,
        datos: {
          // T O L I M A
          morse: "- --- .-.. .. -- .-",
        },
        feedbackEducativo:
          "El código Morse (1830s) fue el primer lenguaje digital a distancia: puntos y rayas, un precursor del binario.",
        pistas: [
          { nivel: 1, texto: "Son 6 letras y es un lugar de Colombia.", costoPuntos: 50 },
          { nivel: 2, texto: "Empieza por T (-) y termina en A (.-).", costoPuntos: 100 },
          { nivel: 3, texto: "Es el departamento donde está la Universidad del Tolima.", costoPuntos: 200 },
        ],
      },
      {
        id: "radio-quiz",
        nodo: "radio",
        tipo: "quiz",
        titulo: "Radio Sutatenza",
        enunciado:
          "¿Cuál fue el principal aporte de Radio Sutatenza (1947) a Colombia?",
        dificultad: "facil",
        puntos: 100,
        datos: {
          opciones: [
            "Transmitir fútbol profesional",
            "Alfabetizar y educar a la población campesina rural",
            "Difundir telenovelas",
            "Vender electrodomésticos",
          ],
        },
        feedbackEducativo:
          "Radio Sutatenza y Acción Cultural Popular alfabetizaron a millones de campesinos: fue pionera mundial de la educación a distancia por radio.",
        pistas: [
          { nivel: 1, texto: "Piensa en 'educación rural'.", costoPuntos: 50 },
          { nivel: 2, texto: "Su lema giraba en torno a aprender a leer y escribir.", costoPuntos: 100 },
          { nivel: 3, texto: "Piensa en enseñar a leer y escribir en el campo, no en entretenimiento.", costoPuntos: 200 },
        ],
      },
    ],
  },

  // --------------------------------------------------------------- TELEVISIÓN
  {
    id: "tv",
    nombre: "Televisión",
    descripcion: "La imagen en movimiento (1954-1998).",
    narrativa:
      "El 13 de junio de 1954 Colombia ve su primera emisión de televisión. RUPTURA distorsionó el archivo visual: revela la imagen, elige el estándar correcto y ordena la historia.",
    hitoHistorico:
      "1954: primera emisión de TV. 1979: inicio de la TV a color. 1998: salen al aire los canales privados (Caracol y RCN).",
    datoAmbiental:
      "La TV pública regional (Telecafé, Telecaribe, Teveandina) y documentales ambientales colombianos han divulgado la riqueza natural del país y el cuidado de ecosistemas como los del Tolima.",
    dificultad: "media",
    tiempoSugeridoMin: 12,
    tipoCandado: "numerico",
    pistaCandado: "Dos dígitos: el año (sin el siglo) en que llegó la TV a color.",
    retos: [
      {
        id: "tv-pixelado",
        nodo: "tv",
        tipo: "pixelado",
        titulo: "Revela la imagen",
        enunciado:
          "La imagen está pixelada. Introduce el código de 3 letras que aparece al enfocar la carta de ajuste para revelarla. (Pista: lee las iniciales.)",
        dificultad: "media",
        puntos: 150,
        datos: { iniciales: "Radio Televisión de Colombia" },
        feedbackEducativo:
          "La 'carta de ajuste' calibraba brillo y color del televisor. RTVC es hoy el sistema de medios públicos de Colombia.",
        pistas: [
          { nivel: 1, texto: "Son las iniciales del operador público de medios.", costoPuntos: 50 },
          { nivel: 2, texto: "Radio Televisión de Colombia.", costoPuntos: 100 },
          { nivel: 3, texto: "Son las iniciales de 'Radio Televisión de Colombia'.", costoPuntos: 200 },
        ],
      },
      {
        id: "tv-estandar",
        nodo: "tv",
        tipo: "estandar",
        titulo: "El estándar correcto",
        enunciado:
          "¿Qué estándar analógico de televisión usó históricamente Colombia (igual que EE. UU.)?",
        dificultad: "facil",
        puntos: 100,
        datos: { opciones: ["PAL", "NTSC", "SECAM", "DVB-T"] },
        feedbackEducativo:
          "Colombia adoptó NTSC (525 líneas, 60 Hz), el mismo de EE. UU. Luego migró a TDT con el estándar DVB-T2.",
        pistas: [
          { nivel: 1, texto: "Es el mismo que usaba Estados Unidos.", costoPuntos: 50 },
          { nivel: 2, texto: "Tiene 4 letras y empieza por N.", costoPuntos: 100 },
          { nivel: 3, texto: "Es el estándar de EE. UU.: 4 letras que empiezan por N.", costoPuntos: 200 },
        ],
      },
      {
        id: "tv-cronologia",
        nodo: "tv",
        tipo: "cronologico",
        titulo: "Ordena la historia",
        enunciado:
          "Arrastra los hitos de la TV colombiana del más antiguo al más reciente.",
        dificultad: "media",
        puntos: 150,
        datos: {
          items: [
            { id: "h1954", texto: "Primera emisión de TV (1954)" },
            { id: "h1979", texto: "Televisión a color (1979)" },
            { id: "h1998", texto: "Canales privados Caracol y RCN (1998)" },
          ],
        },
        feedbackEducativo:
          "1954 → 1979 → 1998: de la señal en blanco y negro estatal al color y luego a la competencia privada.",
        pistas: [
          { nivel: 1, texto: "La TV nació en los años 50.", costoPuntos: 50 },
          { nivel: 2, texto: "El color llegó en los 70.", costoPuntos: 100 },
          { nivel: 3, texto: "Primero blanco y negro, luego el color, y de último la competencia privada.", costoPuntos: 200 },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- TELEFONÍA
  {
    id: "telefono",
    nombre: "Telefonía",
    descripcion: "Conectando voces (1885-1994).",
    narrativa:
      "Desde 1885 las centrales telefónicas conectan a Colombia cable a cable. RUPTURA enredó los conmutadores: reconstruye la conexión y marca el indicativo correcto.",
    hitoHistorico:
      "1885: primeras redes telefónicas en Colombia. Siglo XX: centrales manuales con operadoras y marcación por pulsos (disco).",
    datoAmbiental:
      "La brecha digital rural del Tolima limita el acceso a información ambiental: muchas veredas aún dependen de una sola línea o de la señal intermitente para reportar emergencias ambientales.",
    dificultad: "media",
    tiempoSugeridoMin: 12,
    tipoCandado: "numerico",
    pistaCandado: "Tres dígitos: el indicativo telefónico de Ibagué y el Tolima.",
    retos: [
      {
        id: "tel-conmutador",
        nodo: "telefono",
        tipo: "conmutador",
        titulo: "Conmutador manual",
        enunciado:
          "Conecta el abonado A con el abonado correcto según la ficha: 'Para llamar a la Universidad del Tolima conecta la clavija al puerto 8'. Escribe el número de puerto.",
        dificultad: "facil",
        puntos: 100,
        datos: { puertos: [3, 5, 8, 11] },
        feedbackEducativo:
          "Antes de la automatización, las operadoras conectaban físicamente las llamadas con clavijas en un tablero conmutador.",
        pistas: [
          { nivel: 1, texto: "La ficha menciona el puerto directamente.", costoPuntos: 50 },
          { nivel: 2, texto: "Es un número de un solo dígito.", costoPuntos: 100 },
          { nivel: 3, texto: "La ficha menciona explícitamente el puerto para la Universidad.", costoPuntos: 200 },
        ],
      },
      {
        id: "tel-pulsos",
        nodo: "telefono",
        tipo: "pulsos",
        titulo: "Marcación por pulsos",
        enunciado:
          "En el disco, el dígito 0 genera 10 pulsos y cada dígito N genera N pulsos. ¿Cuántos pulsos totales genera marcar el número 203?",
        dificultad: "media",
        puntos: 150,
        datos: { numero: "203" },
        feedbackEducativo:
          "La marcación por pulsos (decádica) abría y cerraba el circuito tantas veces como el dígito; el 0 equivalía a 10 pulsos.",
        pistas: [
          { nivel: 1, texto: "Suma los pulsos de cada dígito: 2, 0(=10), 3.", costoPuntos: 50 },
          { nivel: 2, texto: "2 + 10 + 3.", costoPuntos: 100 },
          { nivel: 3, texto: "Suma 2 + (el 0 vale 10) + 3.", costoPuntos: 200 },
        ],
      },
      {
        id: "tel-t9",
        nodo: "telefono",
        tipo: "t9",
        titulo: "Escritura T9",
        enunciado:
          "En un teclado telefónico (2=ABC, 3=DEF, 4=GHI, 5=JKL, 6=MNO, 7=PQRS, 8=TUV, 9=WXYZ), ¿qué palabra forma la secuencia de teclas 8-3-5-3-7-2? Escríbela en mayúsculas (primera letra de cada tecla).",
        dificultad: "media",
        puntos: 150,
        datos: { teclas: "835372", mapa: { "2": "ABC", "3": "DEF", "4": "GHI", "5": "JKL", "6": "MNO", "7": "PQRS", "8": "TUV", "9": "WXYZ" } },
        feedbackEducativo:
          "El sistema T9 permitía escribir mensajes con solo 9 teclas; fue clave en la era de los SMS.",
        pistas: [
          { nivel: 1, texto: "Toma la primera letra de cada tecla: 8=T, 3=D...", costoPuntos: 50 },
          { nivel: 2, texto: "8→T, 3→D, 5→J, 3→D, 7→P, 2→A... usa la primera letra.", costoPuntos: 100 },
          { nivel: 3, texto: "Toma SIEMPRE la primera letra de cada tecla pulsada, en orden.", costoPuntos: 200 },
        ],
      },
      {
        id: "tel-indicativos",
        nodo: "telefono",
        tipo: "indicativos",
        titulo: "Mapa de indicativos",
        enunciado:
          "Relaciona la ciudad con su indicativo telefónico. ¿Cuál es el indicativo de Ibagué (Tolima)?",
        dificultad: "facil",
        puntos: 100,
        datos: { opciones: ["601 (Bogotá)", "602 (Cali)", "604 (Medellín)", "608 (Ibagué/Tolima)"] },
        feedbackEducativo:
          "Desde 2022 Colombia unificó la marcación a 10 dígitos: 601 Bogotá, 602 Cali, 604 Medellín, 608 Tolima/Eje Cafetero.",
        pistas: [
          { nivel: 1, texto: "Es uno de los indicativos que termina en 8.", costoPuntos: 50 },
          { nivel: 2, texto: "Ibagué comparte indicativo con el Eje Cafetero.", costoPuntos: 100 },
          { nivel: 3, texto: "Es el indicativo que el Tolima comparte con el Eje Cafetero.", costoPuntos: 200 },
        ],
      },
    ],
  },

  // ----------------------------------------------------------------- INTERNET
  {
    id: "internet",
    nombre: "Internet",
    descripcion: "La red de redes (1991-presente).",
    narrativa:
      "En 1994 Colombia establece su primera conexión plena a Internet. RUPTURA corrompió los protocolos: traduce el binario, valida las direcciones y resuelve el dominio para recuperar la última clave.",
    hitoHistorico:
      "1991-1994: la Universidad de Los Andes lidera la primera conexión de Colombia a Internet y la administración del dominio .co.",
    datoAmbiental:
      "Hoy el monitoreo ambiental usa IoT y datos abiertos: sensores de calidad del aire, nivel de ríos y clima en el Tolima envían datos por Internet para la gestión del riesgo y la investigación.",
    dificultad: "dificil",
    tiempoSugeridoMin: 14,
    tipoCandado: "palabra",
    pistaCandado: "La palabra se obtiene al traducir el binario del primer reto.",
    retos: [
      {
        id: "net-binario",
        nodo: "internet",
        tipo: "binario-ascii",
        titulo: "Binario a ASCII",
        enunciado:
          "Traduce esta secuencia binaria (8 bits por carácter) a texto ASCII. Escribe la palabra resultante en mayúsculas.",
        dificultad: "dificil",
        puntos: 200,
        // R E D = 01010010 01000101 01000100
        datos: { binario: "01010010 01000101 01000100" },
        feedbackEducativo:
          "ASCII asigna un número a cada carácter; en binario, 'R'=82, 'E'=69, 'D'=68. Así viaja el texto por la red.",
        pistas: [
          { nivel: 1, texto: "Cada grupo de 8 bits es una letra.", costoPuntos: 50 },
          { nivel: 2, texto: "01010010 = 82 = 'R'.", costoPuntos: 100 },
          { nivel: 3, texto: "Traduce cada byte a decimal y busca su letra ASCII: forma una palabra de 3 letras.", costoPuntos: 200 },
        ],
      },
      {
        id: "net-ip",
        nodo: "internet",
        tipo: "ip-valida",
        titulo: "¿IP pública o privada?",
        enunciado:
          "De estas direcciones, ¿cuál es una IP pública válida (no pertenece a rangos privados 10.x, 172.16-31.x, 192.168.x)?",
        dificultad: "media",
        puntos: 150,
        datos: {
          opciones: ["192.168.1.1", "10.0.0.5", "8.8.8.8", "172.16.4.9"],
        },
        feedbackEducativo:
          "8.8.8.8 es pública (DNS de Google). Los rangos 10/8, 172.16/12 y 192.168/16 son privados (RFC 1918).",
        pistas: [
          { nivel: 1, texto: "Descarta 10.x, 172.16-31.x y 192.168.x.", costoPuntos: 50 },
          { nivel: 2, texto: "Queda una dirección famosa de DNS.", costoPuntos: 100 },
          { nivel: 3, texto: "Descarta los rangos privados; queda el DNS público más famoso de Google.", costoPuntos: 200 },
        ],
      },
      {
        id: "net-dns",
        nodo: "internet",
        tipo: "dns",
        titulo: "Resolución DNS",
        enunciado:
          "¿Qué extensión de dominio de primer nivel (TLD) corresponde a Colombia y fue de las primeras administradas por una universidad del país?",
        dificultad: "facil",
        puntos: 100,
        datos: { opciones: [".com", ".co", ".edu", ".org"] },
        feedbackEducativo:
          "El dominio .co es el TLD de Colombia; su administración la inició la Universidad de Los Andes en los años 90.",
        pistas: [
          { nivel: 1, texto: "Son las dos primeras letras del país.", costoPuntos: 50 },
          { nivel: 2, texto: "Colombia → .co.", costoPuntos: 100 },
          { nivel: 3, texto: "Son las dos primeras letras del nombre del país.", costoPuntos: 200 },
        ],
      },
      {
        id: "net-http",
        nodo: "internet",
        tipo: "http",
        titulo: "Códigos HTTP",
        enunciado:
          "Relaciona el código HTTP con su significado. ¿Qué código indica 'No encontrado'?",
        dificultad: "facil",
        puntos: 100,
        datos: { opciones: ["200 (OK)", "301 (Movido)", "404 (No encontrado)", "500 (Error del servidor)"] },
        feedbackEducativo:
          "404 significa que el recurso no existe; 200 es éxito, 301 redirección, 500 error interno del servidor.",
        pistas: [
          { nivel: 1, texto: "Es el código más famoso de 'página no encontrada'.", costoPuntos: 50 },
          { nivel: 2, texto: "Empieza por 4 (errores del cliente).", costoPuntos: 100 },
          { nivel: 3, texto: "Es el error de 'página no encontrada' que empieza por 4.", costoPuntos: 200 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------- FINAL
  {
    id: "final",
    nombre: "Caja Fuerte Final",
    descripcion: "El Código Maestro de Restauración.",
    narrativa:
      "Tienes las 4 claves. Introdúcelas en orden (Radio, TV, Telefonía, Internet) para abrir la caja fuerte y restaurar el Archivo Nacional de las Telecomunicaciones.",
    hitoHistorico:
      "La memoria de las telecomunicaciones es patrimonio: preservarla es entender cómo nos comunicamos y cómo cerramos la brecha digital.",
    datoAmbiental:
      "Las telecomunicaciones conectan ciencia, territorio y ciudadanía: como futuros licenciados en Ciencias Naturales y Educación Ambiental, son su herramienta para divulgar y defender el ambiente del Tolima.",
    dificultad: "dificil",
    tiempoSugeridoMin: 8,
    tipoCandado: "combinacion",
    pistaCandado: "Introduce las 4 claves parciales en el orden de los nodos.",
    retos: [
      {
        id: "final-reflexion",
        nodo: "final",
        tipo: "reflexion",
        titulo: "Reflexión final",
        enunciado:
          "Antes del código maestro: ¿cuál de estas afirmaciones resume mejor el vínculo entre telecomunicaciones, territorio y educación ambiental?",
        dificultad: "media",
        puntos: 100,
        datos: {
          opciones: [
            "Las telecomunicaciones no tienen relación con el ambiente.",
            "Conectar el territorio permite monitorear, divulgar y proteger el ambiente, y cerrar la brecha digital rural.",
            "Solo sirven para entretenimiento.",
            "Son exclusivas de las grandes ciudades.",
          ],
        },
        feedbackEducativo:
          "Las TIC son infraestructura para la ciencia ciudadana ambiental, la alerta temprana y la equidad territorial.",
        pistas: [
          { nivel: 1, texto: "Piensa en monitoreo ambiental y brecha digital.", costoPuntos: 50 },
          { nivel: 2, texto: "La respuesta integra territorio + ambiente + equidad.", costoPuntos: 100 },
          { nivel: 3, texto: "La correcta integra monitoreo ambiental, divulgación y cierre de la brecha digital.", costoPuntos: 200 },
        ],
      },
    ],
  },
];

// Añade los retos extra (mecánicas nuevas) a cada nodo que corresponda.
for (const nodo of NODOS) {
  const extra = RETOS_EXTRA[nodo.id];
  if (extra) nodo.retos.push(...extra);
}

export const NODOS_JUGABLES = NODOS.filter((n) => n.id !== "final");

export function getNodo(id: string): NodoPublico | undefined {
  return NODOS.find((n) => n.id === id);
}

export function getReto(id: string) {
  for (const nodo of NODOS) {
    const reto = nodo.retos.find((r) => r.id === id);
    if (reto) return reto;
  }
  return undefined;
}
