---
name: framer-motion
description: Directivas para animaciones asimétricas, microinteracciones táctiles, transiciones fluidas, layouts orquestados y física natural con Framer Motion (o Motion). Elimina la rigidez estática y transiciones lineales en interfaces web.
---

# Habilidad: Framer Motion

Esta habilidad implementa la orquestación visual y de movimiento con **framer/motion** ([https://github.com/framer/motion](https://github.com/framer/motion)).

## 1. Filosofía de Movimiento Orgánico
- **Erradicar el estatismo:** Ningún componente primario o secundario debe carecer de respuesta ante el usuario.
- **Evitar aceleraciones lineales:** Prohibido el `linear` o `ease-in-out` estándar de CSS sin inercia.
- **Curvas Naturales de Easing:**
  - Suave y responsivo: `cubic-bezier(0.22, 1, 0.36, 1)` (Quart natural).
  - Entrada de alta inercia: `cubic-bezier(0.16, 1, 0.3, 1)` (Expo out).

---

## 2. Patrones Fundamentales de Implementación

### 2.1 Microinteracciones en Componentes (Hover & Tap)
Todo botón o elemento interactivo debe incorporar feedback cinético:
```tsx
import { motion } from "framer-motion";

export const InteractiveCard = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
    whileTap={{ scale: 0.98 }}
    className="rounded-2xl border border-white/10 bg-card p-6 shadow-sm hover:shadow-xl hover:border-white/20 transition-colors"
  >
    {children}
  </motion.div>
);
```

### 2.2 Entradas Asimétricas y Escalonadas (Stagger)
Para Bento Grids, listas y secciones hero:
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
```

### 2.3 Transición de Layout Compartido (`layoutId`)
Para pestañas activas, filtros y modales morphing sin saltos visuales:
```tsx
{isActive && (
  <motion.div
    layoutId="activeTabBadge"
    className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
    transition={{ type: "spring", stiffness: 380, damping: 30 }}
  />
)}
```

### 2.4 Animación Basada en Scroll (`whileInView`)
```tsx
<motion.section
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.25 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
>
  {/* Contenido */}
</motion.section>
```
