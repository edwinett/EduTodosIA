// Validadores DINÁMICOS de retos y candados, dirigidos por el `tipo` del reto y la
// `solucion` almacenada en el catálogo (base de datos). Lógica PURA y testeable.
//
// ⚠️ Se usan SOLO en el servidor (API routes), nunca en el cliente: la solución llega
// desde la base de datos y jamás se envía al navegador.

export function normalizar(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita tildes
}

// Tipos cuya respuesta es numérica exacta.
const TIPOS_NUMERICOS = new Set(["longitud-onda", "pulsos", "conmutador"]);

function igualNormalizado(a: unknown, b: unknown): boolean {
  return normalizar(a) === normalizar(b);
}

// Valida la respuesta de un reto según su tipo y la solución del catálogo.
export function validarRespuestaTipo(
  tipo: string,
  solucion: unknown,
  respuesta: unknown,
): boolean {
  // Tipos cuya respuesta es un arreglo ORDENADO (cronología de hitos, piezas de puzzle).
  if (tipo === "cronologico" || tipo === "rompecabezas") {
    const resp = Array.isArray(respuesta) ? respuesta.map(normalizar) : [];
    const sol = Array.isArray(solucion) ? solucion.map(normalizar) : [];
    return sol.length > 0 && resp.length === sol.length && resp.every((x, i) => x === sol[i]);
  }

  // Crucigrama: la solución y la respuesta son mapas { idEntrada: palabra }. Todas deben coincidir.
  if (tipo === "crucigrama") {
    if (!solucion || typeof solucion !== "object" || Array.isArray(solucion)) return false;
    if (!respuesta || typeof respuesta !== "object" || Array.isArray(respuesta)) return false;
    const sol = solucion as Record<string, unknown>;
    const resp = respuesta as Record<string, unknown>;
    const claves = Object.keys(sol);
    return (
      claves.length > 0 &&
      claves.every((k) => igualNormalizado(sol[k], resp[k]))
    );
  }

  // Sopa de letras: conjunto de palabras encontradas (sin importar el orden).
  if (tipo === "sopa-de-letras") {
    const sol = new Set((Array.isArray(solucion) ? solucion : []).map(normalizar));
    const resp = new Set((Array.isArray(respuesta) ? respuesta : []).map(normalizar));
    if (sol.size === 0 || resp.size !== sol.size) return false;
    for (const w of sol) if (!resp.has(w)) return false;
    return true;
  }

  if (tipo === "dial") {
    const n = Number(respuesta);
    if (!Number.isFinite(n)) return false;
    let valor: number;
    let tolerancia = 0.2;
    if (solucion && typeof solucion === "object") {
      const o = solucion as { valor?: unknown; tolerancia?: unknown };
      valor = Number(o.valor);
      if (Number.isFinite(Number(o.tolerancia))) tolerancia = Number(o.tolerancia);
    } else {
      valor = Number(solucion);
    }
    return Number.isFinite(valor) && Math.abs(n - valor) <= tolerancia;
  }

  if (TIPOS_NUMERICOS.has(tipo)) {
    return Number(respuesta) === Number(solucion);
  }

  // Texto / opciones (morse, t9, binario-ascii, pixelado, quiz, estandar, dns, http,
  // indicativos, ip-valida, reflexion, y cualquier tipo nuevo basado en texto).
  if (Array.isArray(solucion)) {
    return solucion.some((s) => igualNormalizado(s, respuesta));
  }
  return igualNormalizado(solucion, respuesta);
}

// Valida la apertura de un candado según su tipo y la clave esperada del catálogo.
// Para el candado de combinación/final, `claveEsperada` y `valor` son arreglos ordenados.
export function validarClaveCandado(
  tipoCandado: string,
  claveEsperada: unknown,
  valor: unknown,
): boolean {
  if (tipoCandado === "combinacion") {
    const esperado = Array.isArray(claveEsperada) ? claveEsperada.map(normalizar) : [];
    const recibido = Array.isArray(valor) ? valor.map(normalizar) : [];
    return esperado.length > 0 && recibido.length === esperado.length && recibido.every((x, i) => x === esperado[i]);
  }
  // numerico | palabra | cronologico
  return igualNormalizado(claveEsperada, valor);
}
