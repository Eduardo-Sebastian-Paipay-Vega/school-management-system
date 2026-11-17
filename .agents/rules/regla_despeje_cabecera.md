# Regla de Diseño y Despeje de Cabecera Flotante (Floating Header Clearance Rule)

**Sistema de Gestión Escolar — Planteles de Aplicación "Guamán Poma de Ayala" (UNSCH)**  
**Área:** Frontend Next.js / Portal Web y Módulos de Acceso  
**Estado:** OBLIGATORIA  

---

## 1. Principio Fundamental de Despeje (Clearance)

La barra de navegación institucional (`Navbar.tsx` / `twostep-nav`) utiliza posicionamiento fijo flotante:
```css
position: fixed;
top: 0;
inset-inline: 0;
z-index: 50;
```
Debido a que su altura efectiva total varía entre **96px y 120px** (incluyendo el padding superior `pt-3 sm:pt-5`, la barra crema de `min-h-[72px] sm:min-h-[80px]` y los márgenes de respiro):

> [!CRITICAL]
> **Ninguna página, sección hero, cabecera o banner visible puede tener un padding superior inferior a `pt-36` (144px).**  
> Si se utiliza un padding inferior (como `py-20` = 80px), la barra flotante **tapará u ocluirá** los breadcrumbs ("Inicio > ..."), los badges de convocatoria y las primeras líneas del título H1.

---

## 2. Especificación Técnica de Paddings por Dispositivo

Para cualquier subpágina o pantalla con cabecera flotante:

```tsx
/* Regla canónica de padding superior para hero sections y banners superiores */
<section className="relative overflow-hidden bg-brand-dark pt-36 sm:pt-40 lg:pt-44 pb-20 text-white ...">
```

* **Móvil (< 640px):** `pt-36` (144px). Garantiza al menos 36px de espacio limpio entre el borde inferior de la navbar y el primer elemento de texto.
* **Tablet (640px – 1023px):** `pt-40` (160px). Asegura visibilidad perfecta de breadcrumbs y tags.
* **Desktop (≥ 1024px):** `pt-44` (176px). Proporciona aire visual editorial y composición armónica.

---

## 3. Cobertura de Rutas y Botones en la Cabecera

Toda cabecera (`Navbar.tsx`) debe cumplir con:
1. **Acceso directo a todas las rutas públicas del sistema:**
   * `/` (Inicio)
   * `/por-que-elegirnos` (Propuesta / Plan)
   * `/niveles` (Niveles Educativos)
   * `/servicios` (Servicios e Infraestructura)
   * `/noticias` (Noticias y Prensa)
   * `/testimonios` (Testimonios de la Comunidad)
   * `/contacto` (Mesa de Partes y Canales)
   * `/admision` (Admisión Oficial 2027)
   * `/login` (Intranet Escolar / Acceso Institucional)
2. **Interactividad total:** Todos los botones, enlaces y llamadas a la acción deben tener rutas reales enrutadas con Next.js `<Link>`, cerrar el drawer móvil al hacer clic (`onClick={() => setMenuOpen(false)}`) y contar con estados de hover, active y focus visibles.

---

## 4. Uniformidad de Identidad Visual al 100% (Incluyendo Login)

La identidad borgoña institucional (`#4F000B`, `#3A0008`, `#8F1025`) y el fondo de papel marfil (`#FFFCF8`) deben extenderse a las pantallas de acceso institucional (`/login`, `/recuperar-clave`), erradicando plantillas genéricas grises o fondos planos desarticulados de la marca universitaria.
