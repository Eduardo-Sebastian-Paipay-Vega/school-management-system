# Prácticas de interfaz (fase G2/G4)

## Orden de reutilización

1. Componentes y wrappers existentes: `frontend/modules/shared/`, `frontend/components/`, y el propio módulo del squad. Buscar antes de crear (`grep -r "primereact/<x>" frontend/modules`).
2. Componente PrimeReact 10 verificado en G3.
3. HTML semántico (`<button>`, `<table>`, `<label>`, `<nav>`) cuando PrimeReact no aporta comportamiento (texto, layout, enlaces simples).

Si un patrón PrimeReact se repetirá en varios squads, proponer un wrapper en `modules/shared/` en vez de copiarlo; crearlo solo si el pedido lo cubre.

## Elección por necesidad

| Necesidad | Componente sugerido | Atención |
| --- | --- | --- |
| Tabla con orden/filtro/paginación | `DataTable` + `Column` | `dataKey` estable; `emptyMessage` en español; `loading` real |
| Edición tipo hoja (Squad 3) | `DataTable` con `editMode="cell"` o celdas propias | La navegación por flechas/Enter/Esc y el debounce 400 ms se implementan explícitamente; DataTable no es una hoja de cálculo |
| Nota numérica 0–20 | `InputNumber` (`min`, `max`, `useGrouping={false}`) | No inventar conversión a AD/A/B/C; usar reglas del proyecto |
| Selección de curso/sección/periodo | `Dropdown` | `optionLabel`, `optionValue`, `placeholder`, `filter` si la lista es larga |
| Confirmar acción destructiva | `ConfirmDialog` / `confirmDialog()` | Texto que diga qué se pierde |
| Formulario modal | `Dialog` | `header`, `onHide`, foco inicial, cerrar con Esc |
| Resultado de operación | `Toast` | Basado en la respuesta real, no optimista |
| Estado (asistió, falta, AD/A/B/C) | `Tag` | No depender solo del color: incluir texto |
| Carga | `Skeleton` / `ProgressSpinner` | Mantener dimensiones para evitar saltos |

## Estados obligatorios en lo que se toque

Carga, vacío, error (con acción de reintento si aplica), deshabilitado/solo lectura (permisos y cierre de periodo), guardando/guardado.

## Accesibilidad

- Cada control con `<label htmlFor>` o `aria-label`; botones de solo icono con `aria-label`.
- Foco visible (el tema define `--prime-focus-ring`); no quitar `outline`.
- Orden de tabulación lógico; Dialog devuelve el foco al cerrar.
- Contraste AA con los tokens institucionales; textos en español.

## Responsive

- Probar ~360, ~768 y ~1280 px. DataTable en móvil: `scrollable` horizontal o `responsiveLayout`/vista apilada, nunca columnas aplastadas ilegibles.
- Dialog: `style={{ width: 'min(32rem, 95vw)' }}` o `breakpoints`.
- Usar las utilidades Tailwind del proyecto; no introducir PrimeFlex sin permiso.

## Estilo

- Colores, radios y sombras desde `globals.css`/`tailwind.config.ts`; nada de hex sueltos ni paletas de demo.
- Para cambiar el tema global: editar `scripts/generate-prime-theme.mjs` y regenerar con `npm run theme:prime` (requiere permiso, afecta a todos los squads).
- Ajustes locales con `className` o `pt`, no con selectores globales que afecten otros módulos.
