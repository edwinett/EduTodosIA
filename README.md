# 📡 SEÑAL PERDIDA · El Apagón de las Telecomunicaciones en Colombia

Escape room educativo jugable en el navegador (escritorio y móvil) para estudiantes de
**tercer semestre de Ciencias Naturales y Educación Ambiental** de la **Universidad del Tolima**
(Ibagué, Colombia).

> Un virus llamado **RUPTURA** está borrando el Archivo Nacional de las Telecomunicaciones.
> El equipo debe reconectar **4 nodos históricos** —Radio, Televisión, Telefonía e Internet—
> resolviendo retos. Cada nodo entrega una **clave parcial**. Las 4 claves abren la
> **Caja Fuerte Final** con el *Código Maestro de Restauración*.

- 🎯 **Público:** 18–22 años · equipos de 2 a 4 · partida de ~45 min.
- 🧩 **Enfoque:** aprendizaje basado en retos + gamificación + educación ambiental y territorio tolimense.
- 🌐 **Idioma:** español de Colombia.

---

## 🚀 Instalación y ejecución

Requisitos: **Node 18+** (probado en Node 22) y npm.

```bash
# 1. Instalar dependencias (genera el cliente Prisma automáticamente)
npm install

# 2. Variables de entorno
cp .env.example .env     # ajusta DOCENTE_PASSWORD, SESSION_SECRET, etc.

# 3. Base de datos de desarrollo (SQLite) + datos iniciales
npm run db:push          # crea el esquema en prisma/dev.db
npm run db:seed          # siembra las 12 insignias y un equipo de demostración

# 4. Arrancar en desarrollo
npm run dev              # http://localhost:3000
```

### Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Genera cliente Prisma + build de producción. |
| `npm start` | Sirve el build de producción. |
| `npm run lint` | ESLint (next/core-web-vitals). |
| `npm run typecheck` | TypeScript estricto sin emitir. |
| `npm run test` | Pruebas unitarias (Vitest). |
| `npm run test:cov` | Pruebas + cobertura (umbral 80% en `lib/juego` y `lib/validacion`). |
| `npm run test:e2e` | Pruebas E2E (Playwright). |
| `npm run db:push` / `db:seed` / `db:studio` | Utilidades de Prisma. |

---

## 🏗️ Arquitectura

Stack: **Next.js 14 (App Router) + TypeScript estricto**, Tailwind CSS, componentes estilo
shadcn/ui, **Zustand** (estado + persistencia), **XState** (máquina de fases/salas/candados),
**Zod** (validación en los *boundaries*), **Prisma** (SQLite dev / Postgres prod),
**Framer Motion**, **dnd-kit** (drag & drop con teclado) y Web Audio API para los efectos.

### Principios clave

- 🔒 **Validación 100% en el servidor.** Las soluciones de los retos y las claves de los candados
  viven **solo** en `lib/juego/soluciones.server.ts` y se comprueban en las *API routes*
  (`/api/validar`, `/api/validar/candado`). El cliente **nunca** conoce las respuestas.
- ⏱️ **Timer autoritativo en backend.** `/api/timer` calcula el tiempo restante a partir de la
  marca de inicio de la partida en la base de datos. El cliente solo refleja y suaviza el conteo.
- ♿ **Accesibilidad WCAG AA** y **mobile-first** (ver sección de accesibilidad).
- 🧪 **Tests obligatorios** para `lib/juego/*` y `lib/validacion/*`.

### Estructura de carpetas

```
app/
  (auth)/            → login/registro (pendiente: Auth.js, ver "Siguientes pasos")
  (juego)/           lobby · mapa · sala/[nodo] · final · victoria · derrota
  (docente)/docente  → panel docente (ranking, diagnóstico, insignias, export CSV)
  ranking/           → tabla pública
  api/               validar · validar/candado · timer · equipo · ranking · insignias · eventos · docente/*
components/
  juego/             Timer, HUD, InventarioClaves, Candado{Numerico,Palabra,Combinacion,Cronologico}, PanelPistas, ListaOrdenable
  misiones/          MisionNodo + MisionRadio/TV/Telefono/Internet/Final
  retos/             RetoInteractivo, DialSintonia, Morse
  gamificacion/      Insignia, TablaClasificacion, BarraProgreso, NotificacionLogro
  ui/                primitivos estilo shadcn (button, card, input, label, badge, progress, tabs)
lib/
  juego/             maquinaEstados.ts (XState), reglas.ts, puntaje.ts, pistas.ts, insignias.ts,
                     hechos.ts, store.ts (Zustand), soluciones.server.ts, tipos.ts
  validacion/        esquemas.ts (Zod)
  audio/             sonidos.ts (Web Audio)
  db/                prisma.ts
data/                misiones.ts (contenido público), insignias.ts
prisma/              schema.prisma, seed.ts
tests/               unit/ (Vitest), e2e/ (Playwright)
```

---

## 🗃️ Modelo de datos (Prisma)

`User`/`Account`/`Session`/`VerificationToken` (Auth.js), `Equipo`, `SesionAula`, `Partida`,
`IntentoReto`, `Insignia`, `InsigniaObtenida` y el catálogo editable `Nodo`/`Reto`/`Pista`
(ver `prisma/schema.prisma`). Para mantener portabilidad **SQLite ⇄ Postgres** no se usan enums
ni arreglos nativos: los roles/estados son `String` validados con Zod y las listas se guardan como
JSON en texto. **El juego lee su contenido del catálogo en base de datos** (`Nodo`/`Reto`/`Pista`),
expuesto sin soluciones por `/api/contenido`; `data/misiones.ts` es ahora solo la **fuente de
siembra** (seed). Intentos y resultados se persisten.

---

## 🎮 Mecánicas

1. **Lobby:** crear/unirse a equipo con código de 6 caracteres (sin O/0, I/1), elegir avatar.
2. **Mapa:** 4 nodos en **orden libre**; cada uno muestra dificultad, tiempo sugerido y estado.
3. **Cada nodo:** narrativa histórica → 3–4 retos encadenados de dificultad creciente → **candado**
   que entrega la **clave parcial** → **dato ambiental/territorial del Tolima**.
4. **Candados reutilizables:** numérico, palabra, combinación (arrastrar) y cronológico (ordenar).
5. **Pistas:** 3 niveles por reto (orientación · método · casi solución) con costo 50/100/200 pts.
6. **Timer:** 45 min globales, avisos a 10/5/1 min; al expirar → pantalla de derrota con reintento.
7. **Puntaje:** `base + bonus por tiempo + bonus sin pistas − penalización por pistas`
   (fórmula documentada en `lib/juego/puntaje.ts`).
8. **Insignias (12):** criterios verificables en `lib/juego/insignias.ts`.
9. **Ranking:** por puntaje/tiempo/precisión/insignias, con filtros por programa/semestre,
   vista pública + vista docente, exportación CSV y actualización por *polling*.

### Claves (referencia docente)

| Nodo | Clave parcial | Origen histórico |
|---|---|---|
| Radio | `1929` | Primera emisora oficial colombiana (HJN). |
| TV | `79` | Televisión a color en 1979. |
| Telefonía | `608` | Indicativo telefónico de Ibagué/Tolima. |
| Internet | `RED` | Resultado de traducir el binario ASCII. |
| **Final** | `1929 · 79 · 608 · RED` | Código Maestro de Restauración. |

---

## ♿ Accesibilidad (WCAG AA)

- Navegación completa por teclado (incluye el drag & drop de dnd-kit con `KeyboardSensor`).
- Alternativa visual al Morse (tabla con tiempos) además del audio.
- Subtítulos/transcripciones y audio **silenciable** desde el HUD.
- Tamaño de fuente ajustable (normal/grande/extra) desde el HUD.
- Contraste alto, `:focus-visible`, `aria-label`/`aria-live`, soporte de `prefers-reduced-motion`.

---

## 📚 Fuentes históricas (verificar y ampliar)

El contenido de los nodos se basa en fuentes públicas que conviene citar en el aula:

- **RTVC – Señal Memoria** (archivo audiovisual y sonoro de Colombia).
- **MinTIC** (Ministerio de Tecnologías de la Información y las Comunicaciones).
- **CRC** (Comisión de Regulación de Comunicaciones) — plan de numeración/indicativos.
- **Banco de la República** — historia económica y social de las comunicaciones.
- Historia de **Radio Sutatenza / Acción Cultural Popular** (educación rural por radio).
- Primera conexión de Colombia a Internet y administración del dominio **.co**
  (Universidad de Los Andes).

> ⚠️ Antes de usar en evaluación formal, un docente debe verificar fechas y matices con las
> fuentes citadas; la historia de las telecomunicaciones tiene varias cronologías según el criterio.

---

## 🔐 Autenticación y roles (Auth.js)

El acceso usa **Auth.js (NextAuth v5)** con dos roles: **ESTUDIANTE** y **DOCENTE**.

- **Dos formas de ingresar:** credenciales (correo + contraseña) o **enlace mágico**
  (en desarrollo el enlace se imprime en la consola del servidor; en producción se configura SMTP
  con `EMAIL_SERVER`/`EMAIL_FROM`).
- **Registro:** `/registro`. Para crear una cuenta DOCENTE se exige el código de invitación
  `CODIGO_INVITACION_DOCENTE` (por defecto `UT-DOCENTE`), así los estudiantes no se auto-asignan docentes.
- **Middleware** (`middleware.ts`) protege las rutas: `/docente/*` requiere rol DOCENTE;
  `/mapa`, `/sala/*`, `/final` y `/juego/*` requieren sesión. La lógica vive en `auth.config.ts`
  (edge-safe) y la configuración completa con adaptador Prisma + bcrypt en `auth.ts` (Node).
- **Cuentas de prueba** (creadas por el seed):
  - Docente: `docente@ut.edu.co` / `docente123`
  - Estudiante: `estudiante@ut.edu.co` / `estudiante123`

## 👩‍🏫 Guía docente

1. Ingresa a `/docente` (requiere rol DOCENTE).
2. **Modo aula:** crea una sesión de aula; obtendrás un **código de 6 caracteres**. Compártelo con
   los estudiantes para que, al crear su equipo, lo peguen en "Código de aula". El dashboard
   `/docente/aula/[codigo]` muestra el **progreso en vivo** de cada equipo (polling cada 5 s):
   nodos completados, retos resueltos, intentos y pistas.
3. **Ranking:** seguimiento por equipo con filtros y **exportación a CSV**.
4. **Diagnóstico:** pega el `ID de partida` para ver intentos, aciertos y pistas por reto.
5. **Edición de contenido** (`/docente/contenido`): **CRUD** de nodos, retos, pistas e insignias
   mediante **Server Actions** con validación **Zod**.

> ✅ El CRUD de `/docente/contenido` edita el **catálogo en base de datos** (`Nodo`/`Reto`/`Pista`/
> `Insignia`) y **el juego lo lee en vivo**: editar un enunciado, una pista, los puntos, la clave de
> un candado o la solución se refleja en la siguiente partida. La validación sigue ocurriendo solo
> en el servidor, ahora con **validadores dinámicos por tipo** (`lib/juego/validadores.ts`) que leen
> la solución del catálogo. Añadir un reto de un **tipo ya soportado** a un nodo núcleo aparece y se
> valida; tipos de reto completamente nuevos requieren además su widget de interfaz (ver más abajo).

Sugerencia de sesión (90 min): 10' encuadre → 45' partida → 20' socialización de datos
ambientales por nodo → 15' reflexión final (brecha digital, territorio y rol como licenciados).

---

## ☁️ Despliegue (Vercel + Neon Postgres)

El `datasource` ya es `postgresql` con `directUrl`.

1. En **Neon** crea un proyecto y copia **dos** cadenas: la *pooled* (tiene `-pooler`) y la *directa*.
2. En **Vercel** importa el repo (framework Next.js, se detecta solo) y define las variables:
   - `DATABASE_URL` = cadena **pooled** de Neon (con `?sslmode=require`).
   - `DIRECT_URL` = cadena **directa** de Neon.
   - `AUTH_SECRET` = `openssl rand -base64 32`.
   - `AUTH_URL` = la URL pública (ej. `https://tu-proyecto.vercel.app`) — opcional con `trustHost`.
   - `CODIGO_INVITACION_DOCENTE` (opcional), `NEXT_PUBLIC_DURACION_PARTIDA_SEG` (opcional).
3. Crea el esquema y siembra contra Neon (una sola vez):
   `DATABASE_URL=<directa> DIRECT_URL=<directa> npx prisma db push && npx prisma db seed`.
4. Despliega. El `build` corre `prisma generate` automáticamente.

> El juego lee el contenido del catálogo en BD **siempre** (no hay bandera para activarlo/desactivarlo).

---

## 🔭 Siguientes pasos (alcance futuro)

Ya implementado y verificado (`build`, `test`, `lint` y **E2E** en verde): motor de juego + 4 nodos +
ranking + insignias + **Auth.js (credenciales + enlace mágico, 2 roles, middleware)** +
**panel docente con CRUD (Server Actions + Zod)** + **modo aula con dashboard en vivo (polling 5 s)** +
**juego conectado al catálogo editable** (lee `Nodo`/`Reto`/`Pista` de la BD vía `/api/contenido`,
validadores dinámicos por tipo en el servidor).

Quedan como mejoras:

- **Widgets para tipos de reto nuevos:** cada `tipo` de reto tiene un componente de interfaz; crear
  un tipo inédito desde el panel requiere añadir su widget en `components/retos/`. Los tipos actuales
  (dial, morse, binario-ascii, cronológico, numérico y opciones) ya se renderizan y validan dinámicamente.
- **Nodos extra:** los 4 nodos núcleo (radio/tv/telefono/internet) siguen siendo el eje que habilita
  la caja fuerte final; nodos adicionales del catálogo se muestran pero no modifican ese requisito.
- **Enlace mágico con SMTP real** en producción (hoy el enlace se imprime en consola en desarrollo).
- Exportación a **PDF** (hoy CSV) y progreso por **WebSocket** (hoy *polling*).
- Muestras de audio reales con **Howler.js** en `/public/audio` (hoy efectos sintetizados).

---

## 🙌 Créditos

Universidad del Tolima · Programa de Ciencias Naturales y Educación Ambiental · Ibagué, Colombia.
Contenido histórico basado en fuentes de RTVC/Señal Memoria, MinTIC, CRC y Banco de la República.
