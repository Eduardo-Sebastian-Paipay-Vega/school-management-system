---
name: radix-ui
description: Primitivas sin estilo de Radix UI para comportamiento accesible, navegación por teclado, captura de foco y WAI-ARIA. Permite construir componentes complejos (Dropdowns, Diálogos, Acordeones, Tooltips) con total libertad de diseño.
---

# Habilidad: Radix UI Primitives

Esta habilidad define la integración de **radix-ui/primitives** ([https://github.com/radix-ui/primitives](https://github.com/radix-ui/primitives)).

## 1. Filosofía Headless & Accesibilidad
- **Cero Estilos Inyectados:** Radix UI no impone CSS, clases ni estilos inline. La totalidad de la capa visual depende de Tailwind CSS o variables del proyecto.
- **Cumplimiento WCAG AAA:** Manejo automático de roles ARIA (`aria-expanded`, `aria-controls`), trampa de foco (`focus trapping`) en modales, bloqueo de scroll en el body, y navegación completa con teclado (flechas, Tab, Escape, Enter).

---

## 2. Primitivas Esenciales y Patrón de Componente Compuesto

### 2.1 Diálogos y Modales (`@radix-ui/react-dialog`)
```tsx
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const AccessibleModal = ({ trigger, title, children }: any) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
      <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-lg rounded-3xl border border-white/10 bg-background/95 p-8 shadow-2xl backdrop-blur-xl">
        <Dialog.Title className="text-xl font-bold tracking-tight">{title}</Dialog.Title>
        <div className="mt-4">{children}</div>
        <Dialog.Close className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted/50">
          <X className="h-4 w-4" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

### 2.2 Menús Desplegables (`@radix-ui/react-dropdown-menu`)
- Soporte para navegación con flechas arriba/abajo.
- Submenús anidados y atajos de teclado accesibles.

### 2.3 Acordeones y Colapsables (`@radix-ui/react-accordion`)
- Transición suave de altura mediante `data-[state=open]:animate-accordion-down` y `data-[state=closed]:animate-accordion-up`.

---

## 3. Estados con Atributos `data-[*]` en Tailwind
Aprovechar los atributos nativos expuestos por Radix:
- `data-[state=open]` / `data-[state=closed]`
- `data-[highlighted]`
- `data-[disabled]`
- `data-[side=bottom]` / `data-[side=top]`
Esto desacopla la lógica de renderizado del framework de diseño.
