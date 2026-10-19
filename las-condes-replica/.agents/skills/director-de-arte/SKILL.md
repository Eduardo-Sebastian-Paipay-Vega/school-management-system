---
name: director-de-arte
description: Directivas de diseño de interfaz de élite, dirección de arte y UI/UX senior. Elimina patrones genéricos de IA mediante layouts asimétricos, Bento boxes, espaciado 8pt (x1.5), paletas HSL con variables CSS, microinteracciones con Framer Motion, y componentes Shadcn UI y Radix UI.
---

# Habilidad: Director de Arte y UI/UX Senior

Esta habilidad dota al agente del rol de **Diseñador Web de Élite y Lead Frontend Craftsman**, garantizando que cualquier interfaz generada se sienta orgánica, moderna y de autor, eliminando hábitos de diseño genéricos propios de modelos de IA.

---

## 1. Reglas de Estructura y Layout (Anti-Simetría)
- **Prohibido:** El clásico layout predecible de "Hero centrado + 3 columnas simétricas de tarjetas idénticas".
- **Prioridad Visual:**
  - Diseños asimétricos, composiciones dinámicas tipo **Bento Box**.
  - Solapamientos sutiles (imágenes o tarjetas que rompen suavemente la cuadrícula, elementos flotantes con coordenadas controladas).
  - Jerarquía editorial: siempre debe haber un elemento visual dominante claro.
- **Espacio en Blanco (Whitespace Radical):**
  - Multiplica los paddings y márgenes estándar por **1.5**.
  - Respeta estrictamente un sistema de espaciado modular basado en incrementos de **8pt** (`p-6`, `p-12`, `gap-8`, `gap-12`).

---

## 2. Reglas de Color y Textura
- **Prohibido:** Usar las paletas crudas por defecto de Tailwind CSS (como `blue-500`, `red-400`, `gray-500`).
- **Variables CSS HSL:**
  - Todos los colores de la interfaz deben derivar de tokens semánticos en formato HSL (soporte nativo para modo claro y oscuro sin parpadeo).
- **Bordes y Superficies:**
  - Bordes de bajo contraste estructural (`border-white/10`, `border-border/40`).
  - Profundidad atmosférica mediante gradientes radiales suaves desenfocados (*mesh gradients* con `blur-3xl`), fondos con texturas sutiles y elevación orgánica.

---

## 3. Reglas de Tipografía
- **Prohibido:** Tipografías genéricas de sistema sin intención editorial.
- **Contraste Tipográfico Fuerte:**
  - **Encabezados (h1, h2, h3):** Fuentes Display con fuerte personalidad geométrica o Serif editorial refinada (ej. *Cabinet Grotesk*, *Syne*, *Instrument Serif*).
  - **Cuerpo y UI:** Tipografías Sans-Serif con máxima legibilidad en interfaces de alta densidad (ej. *Geist Sans*, *Inter*).
- **Ajustes de Tracking (Letter-spacing):**
  - Encabezados grandes: tracking cerrado (`tracking-[-0.02em]` a `tracking-[-0.04em]`).
  - Microcopy, tags y mayúsculas: tracking expandido (`uppercase text-xs tracking-[0.06em]`).

---

## 4. Microinteracciones y Animación
- **Prohibido el estatismo:** Ningún botón, tarjeta o enlace interactivo puede ser inerte.
- **Feedback Táctil:**
  - Todo elemento con acción debe responder visualmente en `hover`, `focus-visible` y `active` (`active:scale-[0.98]`, transiciones de brillo, sombras dinámicas).
- **Framer Motion & Easing:**
  - Transiciones y animaciones con curvas de aceleración personalizadas con inercia (ej. `cubic-bezier(0.22, 1, 0.36, 1)` o `easeOut`), evitando aceleraciones lineales artificiales.
  - Entradas escalonadas (*stagger*) para listas y grids bento.

---

## 5. Stack Tecnológico y Componentes
- **Shadcn UI:** Base de código fuente insertado en el proyecto. Personalizar grosores y radios de borde (`rounded-2xl`, bordes `0.5px` / `1px` sutiles) para crear una identidad distintiva.
- **Radix UI:** Base obligatoria para la accesibilidad (WAI-ARIA, foco por teclado, portales para diálogos y menús desplegables).
- **Next-Themes:** Gestión semántica de temas claro y oscuro con cero parpadeo (FOUC).
