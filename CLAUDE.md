# CLAUDE.md — Reglas del repositorio "SEÑAL PERDIDA"

Guía para cualquier agente o persona que modifique este proyecto.

## Principios de código

- **Componentes funcionales con hooks.** Nada de clases de React.
- **TypeScript estricto.** No usar `any`; el proyecto tiene `strict` y `noUncheckedIndexedAccess`.
- **Todo texto visible en español de Colombia, con tildes correctas.**
- **Validación con Zod en los *boundaries*** (API routes, formularios). Los esquemas viven en
  `lib/validacion/esquemas.ts`.

## Seguridad del juego (no romper)

- ⛔ **Nunca validar en el cliente las respuestas de los retos ni las claves de los candados.**
  Las soluciones viven **solo** en `lib/juego/soluciones.server.ts` (sufijo `.server`) y se
  comprueban en `/api/validar` y `/api/validar/candado`. Ese archivo **no debe importarse jamás**
  desde un componente cliente ni desde `data/` o `lib/juego/store.ts`.
- ⏱️ **El timer es autoritativo en el backend** (`/api/timer`). El cliente solo refleja el valor.
- `data/misiones.ts` es contenido **público**: no agregar ahí soluciones, claves ni respuestas.

## Autenticación (Auth.js v5)

- Dos roles: `ESTUDIANTE` y `DOCENTE`. Sesión **JWT** (requerida por el proveedor Credentials).
- `auth.config.ts` es **edge-safe** (sin Prisma ni bcrypt) y lo usa `middleware.ts`.
  `auth.ts` tiene el adaptador Prisma, Credentials (bcrypt) y el enlace mágico (Nodemailer).
- El rol se propaga en los callbacks `jwt`/`session`. No hacer consultas a BD en el runtime edge.
- Proteger rutas nuevas añadiéndolas a `RUTAS_DOCENTE`/`RUTAS_JUEGO` en `auth.config.ts` y al
  `matcher` de `middleware.ts`.
- En Server Actions / route handlers usar `requireUsuario()` / `requireDocente()` (`lib/auth/guards.ts`).

## CRUD de contenido

- Mutaciones vía **Server Actions** (`app/(docente)/docente/contenido/actions.ts`) con validación
  **Zod** y `requireDocente()`. Nunca exponer `claveParcial`/`solucionJson` al cliente.

## Estado

- Estado de juego del cliente: **Zustand** con persistencia (`lib/juego/store.ts`).
- Fases/salas/candados: **XState** (`lib/juego/maquinaEstados.ts`).
- Lógica pura y testeable (puntaje, pistas, insignias, reglas, hechos) en `lib/juego/*`.

## Pruebas

- **Obligatorias** para `lib/juego/*` y `lib/validacion/*` (Vitest, en `tests/unit`).
- Umbral de cobertura **≥ 80%** en esos módulos (configurado en `vitest.config.ts`).
- E2E con Playwright en `tests/e2e`.
- Antes de dar por terminada una tarea: `npm run typecheck && npm run lint && npm run test && npm run build`.

## Base de datos

- Prisma. Dev: SQLite; prod: Postgres (ver README). Sin enums ni arreglos nativos para mantener
  portabilidad; roles/estados son `String` validados por Zod.
- Tras cambiar `schema.prisma`: `npm run db:push` y actualizar `prisma/seed.ts` si aplica.

## Commits

- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`…).
- Mensajes en español.

## Accesibilidad (no regresionar)

- Teclado completo, `aria-label`/`aria-live`, contraste AA, `prefers-reduced-motion`,
  audio silenciable, tamaño de fuente ajustable, alternativa visual al Morse.

## Convenciones de nombres

- Archivos de dominio y componentes en español (coherente con el producto).
- Rutas del App Router en español (`/lobby`, `/mapa`, `/sala/[nodo]`, `/final`, `/victoria`,
  `/derrota`, `/ranking`, `/docente`).
