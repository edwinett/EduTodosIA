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
  if (tipo === "cronologico") {
    const resp = Array.isArray(respuesta) ? respuesta.map(normalizar) : [];
    const sol = Array.isArray(solucion) ? solucion.map(normalizar) : [];
    return sol.length > 0 && resp.length === sol.length && resp.every((x, i) => x === sol[i]);
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
