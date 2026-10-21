# Versión y modo de PrimeReact (fase G1/G3)

## Detectar lo instalado

1. Versión exacta: `frontend/node_modules/primereact/package.json` → `version`. El rango de `frontend/package.json` (`^10.9.9`) no basta; confirmar también en `frontend/package-lock.json`.
2. Modo: **styled** si se importa un tema CSS (aquí `unsch-lara.css` en `app/layout.tsx`); **unstyled** si el provider usa `unstyled: true` con `pt`. Este repo es styled.
3. Provider: `PrimeReactProvider` de `primereact/api` en `modules/shared/prime/PrimeProvider.tsx`. Opciones globales (locale, ripple, zIndex, pt) se cambian solo con permiso.

## Contrato PrimeReact 10 (el instalado)

- Import por componente: `import { DataTable } from 'primereact/datatable';`, `import { Column } from 'primereact/column';`. Cada ruta debe existir como carpeta en `node_modules/primereact/`.
- Tipos en `primereact/<componente>/<componente>.d.ts` (p. ej. `DataTableProps`, `DropdownChangeEvent`).
- Servicios y utilidades: `primereact/api` (`FilterMatchMode`, `PrimeReactProvider`, `addLocale`, `locale`).
- Imperativos: `Toast` con `useRef<Toast>(null)` y `toast.current?.show(...)`; `confirmDialog` / `ConfirmDialog` de `primereact/confirmdialog`.
- Personalización: `className`, `pt` (PassThrough) y clases utilitarias de Tailwind. Los colores salen del tema generado y de `globals.css`; no hardcodear la paleta azul de Lara.
- Los archivos de v10 incluyen `'use client'`, pero las funciones (callbacks, templates) no se pueden pasar desde un Server Component: el componente que las define debe declarar `'use client'`.

## Nombres que cambian entre ecosistemas (fuente habitual de errores)

| Necesidad | PrimeReact 10 (usar) | PrimeNG 17+/PrimeReact 11/PrimeVue 4 (no usar aquí) |
| --- | --- | --- |
| Selector simple | `Dropdown` (`primereact/dropdown`) | `Select` |
| Fecha | `Calendar` (`primereact/calendar`) | `DatePicker` |
| Interruptor | `InputSwitch` | `ToggleSwitch` |
| Panel lateral | `Sidebar` | `Drawer` |
| Superposición | `OverlayPanel` | `Popover` |
| Pestañas | `TabView` + `TabPanel` | `Tabs`/`TabList`/`Tab` |
| Textarea | `InputTextarea` (`primereact/inputtextarea`) | `Textarea` |
| Chips libres | `Chips` | `InputChips`/`AutoComplete multiple` |

Ante cualquier duda, `ls frontend/node_modules/primereact/` es la verdad.

## PrimeReact 11 (solo para reconocerlo, no para usarlo)

v11 cambia rutas de importación, adopta componentes compuestos y design tokens, y no comparte contrato con v10. Si alguna vez se instala, consultar https://primereact.dev/docs/styled/guides/migration/updating-to-v11 y actualizar esta skill; no migrar como efecto secundario de una tarea de UI.

## Fuentes

- Documentación v10: https://primereact.org (y https://v10.primereact.org si la principal ya muestra v11).
- Plugin oficial/MCP (opcional): https://primereact.dev/docs/styled/guides/ai/plugin — sus metadatos pueden ser de v11; contrastar siempre con los `.d.ts` locales.
- Sin red: `.d.ts` locales + código existente del repo; informar la limitación.
