# Directrices de Diseño: Director de Arte y UI/UX Senior

Este proyecto se rige por estándares de diseño web de autor y frontend craft de élite para erradicar cualquier patrón genérico de IA.

## Reglas Obligatorias de Diseño y Código

1. **Anti-Simetría & Bento Grids**:
   - Prohibido el layout clásico de "Hero centrado + 3 columnas simétricas".
   - Utilizar composiciones asimétricas, Bento Boxes y solapamiento controlado de elementos visuales.
   - Espaciado radical: multiplicar paddings y márgenes estándar por 1.5 siguiendo la escala de 8pt.

2. **Colorimetría & Texturas (HSL)**:
   - Prohibido usar paletas crudas de Tailwind (`blue-500`, etc.).
   - Definir siempre colores mediante variables CSS en formato HSL.
   - Bordes de bajo contraste (`border-white/10` o `border-border/40`). Incorporar mesh gradients y radial blur suaves para profundidad.

3. **Tipografía de Alto Contraste**:
   - Encabezados con Display o Serif de gran personalidad y tracking cerrado (`-0.02em` a `-0.04em`).
   - Cuerpo de texto con Sans-serif legible (Geist o Inter) y tracking expandido en textos en mayúsculas (`tracking-wider text-xs`).

4. **Microinteracciones & Animaciones**:
   - Ningún elemento interactivo estático.
   - Respuestas en `hover`, `active:scale-[0.98]` y `focus`.
   - Animaciones con Framer Motion con curvas de aceleración naturales (`cubic-bezier(0.22, 1, 0.36, 1)`).

5. **Componentes y Accesibilidad**:
   - Componentes modulares con Shadcn UI (código fuente personalizado en el proyecto).
   - Primitivas Radix UI para comportamiento accesible WCAG.
   - Soporte de temas con `next-themes`.
