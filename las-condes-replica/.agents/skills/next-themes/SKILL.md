---
name: next-themes
description: Gestión profesional de temas claro y oscuro sin parpadeo (FOUC) con next-themes en Next.js. Sincronización con preferencias del sistema y enlace con variables CSS HSL.
---

# Habilidad: Next Themes

Esta habilidad rige la arquitectura de tematización y cambio de modo claro/oscuro con **pacocoursey/next-themes** ([https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)).

## 1. Filosofía de Temas sin Parpadeo (Zero FOUC)
- **Eliminar el destello blanco/negro al recargar (FOUC):** Inyección de script ligero en el `<head>` antes de la hidratación de React.
- **Sincronización de Preferencias:** Detección automática del media query `prefers-color-scheme` del sistema operativo con fallback a selección explícita del usuario en `localStorage`.

---

## 2. Configuración en Next.js App Router

### 2.1 Proveedor de Tema (`components/theme-provider.tsx`)
```tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### 2.2 Integración en `app/layout.tsx`
```tsx
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 3. Arquitectura de Variables CSS HSL (`globals.css`)
Los colores no deben ser fijos, sino tokens dinámicos dependientes de la clase `.dark`:

```css
@layer base {
  :root {
    --background: 210 20% 98%;
    --foreground: 224 71% 4%;
    --card: 0 0% 100%;
    --card-foreground: 224 71% 4%;
    --border: 220 13% 91%;
    --primary: 28 95% 56%;
    --primary-foreground: 0 0% 100%;
  }

  .dark {
    --background: 225 20% 6%;
    --foreground: 210 20% 95%;
    --card: 225 18% 9%;
    --card-foreground: 210 20% 95%;
    --border: 225 15% 15%;
    --primary: 28 95% 56%;
    --primary-foreground: 0 0% 100%;
  }
}
```

---

## 4. Toggle de Tema Seguro contra Errores de Hidratación
```tsx
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl border border-border/40 hover:bg-accent transition-colors"
      aria-label="Alternar tema"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
```
