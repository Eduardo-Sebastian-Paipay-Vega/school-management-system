---
name: shadcn-ui
description: Guía y directivas maestras para shadcn/ui. Componentes con código fuente en el proyecto (no librerías cerradas), control visual absoluto con Tailwind CSS, utilidades cn (clsx + tailwind-merge), variantes con CVA y personalización de diseño sin aspecto de plantilla.
---

# Habilidad: shadcn/ui

Esta habilidad rige el uso y personalización de **shadcn/ui** ([https://github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui)) en el proyecto.

## 1. Filosofía Central: Código Fuente vs Librería Cerrada
- **No es una dependencia empaquetada (npm package cerrado):** A diferencia de Material UI o Bootstrap, los componentes de shadcn/ui viven dentro del directorio `components/ui/` del proyecto.
- **Control Total:** Eres el dueño del código fuente. Puedes y debes modificar la estructura JSX, estilos de Tailwind, radios de borde y estados visuales para evitar el "aspecto de plantilla genérica".

---

## 2. Configuración y Utilidades Base

### 2.1 Utilidad `cn` (`lib/utils.ts`)
Combina condicionales de clase con resolución de conflictos de Tailwind:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2.2 Gestión de Variantes con `class-variance-authority` (CVA)
Todos los componentes interactivos deben definir variantes claras y escalables:
```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border/40 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

---

## 3. Directivas de Adaptación Visual de Élite
1. **Romper el radio estándar:** No usar el `rounded-md` aburrido por defecto; adoptar radios generosos como `rounded-2xl` o `rounded-3xl` combinados con bordes finos de bajo contraste (`border-white/10` o `border-border/30`).
2. **Texturas y Superficies:** Incorporar fondos con `backdrop-blur-md`, elevación sutil y gradientes de superficie en diálogos, popovers y tarjetas.
3. **Composición Modular:** Extender componentes existentes agregando subcomponentes específicos del dominio en vez de crear monolitos.
