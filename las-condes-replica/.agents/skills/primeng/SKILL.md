---
name: primeng
description: Guía, instalación bajo demanda y directivas de configuración para PrimeNG y @primeuix/themes en proyectos Angular. Provee autodetección de gestores de paquetes (npm, yarn, pnpm), configuración moderna con providePrimeNG(), presets de temas (Aura, Lara, Nora), integración con Tailwind CSS y resolución de conflictos de entorno (Angular vs Next.js).
---

# Habilidad: PrimeNG & @primeuix/themes

Esta habilidad rige la instalación bajo demanda, configuración y uso de **PrimeNG** y la suite de temas **@primeuix/themes** en aplicaciones basadas en **Angular**.

---

## 1. Validación de Entorno: ¿Cuándo usar PrimeNG?

> [!IMPORTANT]
> **PrimeNG es EXCLUSIVO para Angular.**
> - Si el proyecto es **Angular** (existe `angular.json`): Procede con esta habilidad.
> - Si el proyecto es **Next.js / React** (existe `next.config.ts`, `app/`, o `react` en `package.json`): **NO uses PrimeNG ni ejecutes `ng serve`**. En React/Next.js usa **Shadcn UI** (`@agents/skills/shadcn-ui`) o **PrimeReact** (`primereact`).
> - Si el proyecto es **Vue**: Usa **PrimeVue** (`primevue`).

---

## 2. Instalación On-Demand (Auto-descargable según Gestor de Paquetes)

Cuando el cliente o proyecto Angular requiera PrimeNG, detecta el gestor de paquetes en la raíz del proyecto y ejecuta el comando correspondiente:

### Detección y Comandos:

| Gestor | Archivo de Bloqueo | Comando de Instalación |
| :--- | :--- | :--- |
| **npm** | `package-lock.json` | `npm install primeng @primeuix/themes primeicons` |
| **yarn** | `yarn.lock` | `yarn add primeng @primeuix/themes primeicons` |
| **pnpm** | `pnpm-lock.yaml` | `pnpm add primeng @primeuix/themes primeicons` |
| **bun** | `bun.lockb` | `bun add primeng @primeuix/themes primeicons` |

*Nota: Se incluye `primeicons` por defecto para soporte de iconografía en botones, tablas, selects y menús.*

---

## 3. Configuración Moderna (Angular 18+ / 19+ Standalone)

A partir de PrimeNG v18+, el diseño y temas se gestionan mediante **@primeuix/themes** y la función proveedora `providePrimeNG()`.

### 3.1 Configuración en `app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(), // Requerido para animaciones de overlays y diálogos
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark', // Sincronizado con selector dark mode (Tailwind o manual)
          cssLayer: false
        }
      },
      ripple: true // Habilita efecto visual ripple táctil
    })
  ]
};
```

---

## 4. Presets de Temas Disponibles (@primeuix/themes)

PrimeUI ofrece presets listos para usar con variables CSS automáticas:

1. **Aura** (`@primeuix/themes/aura`): Diseño contemporáneo, limpio y minimalista. *(Recomendado por defecto)*.
2. **Lara** (`@primeuix/themes/lara`): Inspirado en PrimeOne v17, alta densidad y contraste clásico.
3. **Nora** (`@primeuix/themes/nora`): Líneas sobrias y neutras para dashboards empresariales.
4. **Material** (`@primeuix/themes/material`): Guías de Material Design 3.

### 4.1 Personalización de Colores y Tokens con `definePreset`

Si el cliente solicita un color primario de marca específico (ej. esmeralda, índigo, púrpura):

```typescript
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const CustomPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    }
  }
});

// En providePrimeNG:
providePrimeNG({
  theme: {
    preset: CustomPreset
  }
})
```

---

## 5. Estilos e Iconos Globales (`styles.css` / `styles.scss`)

Asegurar que los iconos de PrimeNG estén disponibles importándolos en la hoja global:

```css
/* src/styles.css */
@import "primeicons/primeicons.css";
```

O en `angular.json` bajo la sección `architect.build.options.styles`:
```json
"styles": [
  "node_modules/primeicons/primeicons.css",
  "src/styles.css"
]
```

---

## 6. Uso en Componentes Standalone de Angular

Los componentes se importan de forma granular para garantizar tree-shaking óptimo:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule],
  template: `
    <div class="p-6">
      <p-card header="Gestión de Clientes" subheader="Vista consolidada">
        <p-button 
          label="Nuevo Registro" 
          icon="pi pi-plus" 
          [rounded]="true" 
          severity="primary" 
        />
      </p-card>
    </div>
  `
})
export class DashboardComponent {}
```

---

## 7. Solución de Problemas Comunes

### Error: `This command is not available when running the Angular CLI outside a workspace`
- **Causa:** Se ejecutó `ng serve` o comandos de Angular en un directorio que no contiene `angular.json` (por ejemplo, en un proyecto Next.js / Vite, o fuera de la carpeta del proyecto).
- **Acción:**
  - Si estás en un proyecto Next.js: usa `npm run dev`.
  - Si estás creando un proyecto Angular nuevo: ejecuta `npx -y @angular/cli new nombre-proyecto` e ingresa a dicha carpeta antes de ejecutar `ng serve`.

### Incompatibilidad con Tailwind CSS
- Para evitar que los estilos base de Tailwind pisen los componentes de PrimeNG, habilita `@layer` o configura `cssLayer: { name: 'primeng', order: 'tailwind-base, primeng, tailwind-utilities' }` en `options` del preset.
