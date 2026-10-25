# 03 — Arquitectura frontend

**Proyecto:** `frontend/` · Next.js 15 (App Router), React 19, TypeScript estricto, PrimeReact 10.9.9 en modo *styled* con el tema `unsch-lara.css`, Tailwind 3.4.

## 1. Organización

```text
frontend/
├── app/                       # SOLO enrutamiento: páginas delgadas, layouts y metadata
│   ├── layout.tsx             # raíz: PrimeProvider y estilos globales
│   ├── globals.css            # tokens de diseño (variables CSS)
│   ├── (landing)/             # portal público (S5): sin sesión
│   └── (intranet)/            # intranet: SessionProvider + SessionGate
│       ├── login/, recuperar-clave/, restablecer-clave/, activar-cuenta/, activar-apoderado/
│       └── intranet/<modulo>/page.tsx
├── modules/
│   ├── shared/                # transversal sin lógica de negocio
│   │   ├── api/               # cliente HTTP base y sobre canónico (ADR-005)
│   │   └── prime/             # PrimeProvider y tema
│   ├── intranet/              # login y hub de la intranet
│   ├── landing/               # portal institucional (S5)
│   └── squads/squad_[X]_[modulo]/   # código de cada squad (AGENTS.md §3)
├── components/index.ts        # reexporta componentes compartidos existentes
├── lib/utils.ts               # cn() para clases Tailwind
├── public/                    # emblemas e imágenes
└── tailwind.config.ts         # tokens expuestos como clases
```

## 2. Reglas

1. **Una página no contiene lógica.** `app/**/page.tsx` declara `metadata` e importa la vista del squad desde `@/modules/squads`. Ejemplo real: `app/(intranet)/intranet/calificaciones/page.tsx`.
2. **El código de un squad vive en su carpeta.** No se agregan archivos de un squad en `components/`, `lib/` ni en la carpeta de otro squad.
3. **Se pasa a `shared/` solo lo que ya usan dos módulos.** Una utilidad que "quizá se reutilice" se queda en su squad.
4. **Componentes cliente solo cuando hace falta.** `'use client'` únicamente en componentes con estado, efectos, eventos o APIs del navegador. Layouts y páginas siguen siendo componentes de servidor.
5. **Importaciones:** solo el alias `@/` (`tsconfig.json`). Un squad importa de otro solo su punto público (`@/modules/squads` o `useCoreSession`).
6. **Identidad visual:** solo tokens de `tailwind.config.ts`, `globals.css` y el tema PrimeReact. Toda edición de UI sigue el protocolo `primereact-guardian` (AGENTS.md §5.1).
7. **Sin datos ficticios en vistas operativas.** Una vista sin API muestra un estado vacío o "en construcción", no cifras inventadas (ver P-01 en la auditoría).

### Estructura interna de un squad

Se crean subcarpetas solo cuando contienen archivos:

```text
squad_X_modulo/
├── <Modulo>ModuleView.tsx     # vista principal que importa la página
├── components/                # componentes propios del squad
├── api/                       # llamadas a /api/v1 del módulo, tipadas
├── hooks/                     # estado del módulo
├── types.ts                   # tipos propios (mientras no haya tipos generados)
└── index.ts                   # API pública del squad (opcional)
```

## 3. Rutas

| Ruta | Módulo | Layout | Sesión | Estado |
|---|---|---|---|---|
| `/`, `/admision`, `/contacto`, `/niveles`, `/noticias`, `/por-que-elegirnos`, `/servicios`, `/testimonios` | M13 (S5) | `(landing)` | No | Páginas estáticas |
| `/login` | M1 (S1) | `(intranet)` | No | Conectada al API |
| `/recuperar-clave`, `/restablecer-clave`, `/activar-cuenta`, `/activar-apoderado` | M1/M2 (S1) | `(intranet)` | No (token de un uso) | Conectadas al API |
| `/intranet` | Hub | `(intranet)` | Sí | Hub de módulos |
| `/intranet/usuarios` | M1–M3, M12 (S1) | `(intranet)` | Sí | Conectada al API |
| `/intranet/asistencia` | M4–M7 (S2) | `(intranet)` | Sí | Vista de demostración, sin API |
| `/intranet/calificaciones` | M8 (S3) | `(intranet)` | Sí | Vista de demostración; M8 sin gateway |
| `/intranet/analitica` | M9–M10 (S4) | `(intranet)` | Sí | Vista de demostración con cifras fijas |
| `/intranet/libretas` | M11 (S5) | `(intranet)` | Sí | Vista de demostración |
| `/verificar/<token>` (RF-60) | M11 (S5) | `(landing)` | No | **No creada**: requiere `paths/public.yaml` |
| Kiosco de portería (RF-25) | M5 (S2) | por definir | Por definir | **No creada**: bloqueada por D-15 |

`SessionGate` redirige a `/login` toda ruta bajo `/intranet` sin sesión. La protección real está en el API: ocultar una opción no reemplaza el permiso del endpoint.

## 4. Comunicación con el backend

| Necesidad | Uso |
|---|---|
| Petición autenticada | `const { request } = useCoreSession(); await request<T>('/ruta', init)` — agrega `Bearer`, renueva el token ante `401` y desempaqueta el sobre |
| Descarga autenticada | `useCoreSession().download(path, filename)` |
| Petición pública (login, verificador, portal) | `publicGet` / `publicPost` de `@/modules/shared/api` |
| Avisos en tiempo real | `useCoreSession().subscribeNotifications(listener)` |
| Origen del API | `NEXT_PUBLIC_CORE_API_URL` (se incrusta en el build) |

Prohibido: `fetch` directo al backend desde un squad, otro cliente HTTP, guardar el access token en `localStorage` (vive solo en memoria; el refresh va en cookie `HttpOnly`). Los tipos de respuesta se escriben a mano en `types.ts` del squad hasta que `packages/contracts` genere tipos (ADR-005 §5).

## 5. Calidad

| Verificación | Comando (en `frontend/`) | Estado 2026-10-25 |
|---|---|---|
| Lint | `npm run lint` | 0 errores, 66 advertencias |
| Tipos + build | `npm run build` | Correcto, 22 rutas estáticas |
| Auditor PrimeReact | `py -I .claude/skills/primereact-guardian/scripts/audit_primereact.py frontend` (desde la raíz) | Solo para cambios de UI |
| Pruebas | — | No hay runner (D-11 propone Vitest + Playwright) |

## 6. Cómo agregar un módulo o pantalla

1. Crear la vista en `frontend/modules/squads/squad_X_modulo/<Nombre>.tsx` (o reutilizar la vista existente del squad).
2. Exportarla en `frontend/modules/squads/index.ts`.
3. Crear `frontend/app/(intranet)/intranet/<ruta>/page.tsx` con `metadata` y la importación; nada más.
4. Si consume el API: el endpoint debe existir en `packages/contracts/openapi/` y llamarse con `useCoreSession().request`.
5. Ejecutar `npm run lint`, `npm run build` y, si hay UI, el auditor PrimeReact.
6. Registrar la ruta en la tabla §3 y el RF en la matriz.
